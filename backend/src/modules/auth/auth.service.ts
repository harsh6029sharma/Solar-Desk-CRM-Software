import bcrypt from "bcrypt";

import { redisClient } from "../../config/redis";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "./auth.utils";
import type { JwtAccessPayload } from "./auth.types";

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const refreshKey = (userId: string, jti: string) => `refresh:${userId}:${jti}`;

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            roles: {
                include: {
                    role: {
                        include: {
                            rolePermissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        throw new ApiError(401, "Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password.");
    }

    const roles = user.roles.map((ur) => ur.role.name);

    const permissions = [
        ...new Set(
            user.roles.flatMap((ur) =>
                ur.role.rolePermissions.map((rp) => rp.permission.name)
            )
        ),
    ];

    const accessPayload: Omit<JwtAccessPayload, "jti"> = {
        userId: user.id,
        orgId: user.organizationId,
        roles,
        permissions,
    };

    const { token: accessToken, jti: accessJti } = generateAccessToken(accessPayload);
    const { token: refreshToken, jti: refreshJti } = generateRefreshToken({
        userId: user.id,
    });

    // whitelist refresh token in redis
    await redisClient.set(
        refreshKey(user.id, refreshJti),
        "1",
        "EX",
        REFRESH_TTL_SECONDS
    );

    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });

    const { password: _password, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken, accessJti, refreshJti };
};

export const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            organizationId: true,
            lastLoginAt: true,
            createdAt: true,
            organization: {
                select: {
                    id: true,
                    name: true,
                },
            },
            roles: {
                select: {
                    role: {
                        select: {
                            id: true,
                            name: true,
                            rolePermissions: {
                                select: {
                                    permission: {
                                        select: {
                                            id: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    return user;
};

export const logoutUser = async (userId: string, refreshJti: string): Promise<void> => {
    await redisClient.del(refreshKey(userId, refreshJti));
};

export const refreshAccessToken = async (refreshToken: string) => {
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token.");
    }

    const exists = await redisClient.exists(refreshKey(decoded.userId, decoded.jti));
    if (!exists) {
        // reuse of a rotated/revoked token — possible theft, kill all sessions for this user
        const keys = await redisClient.keys(`refresh:${decoded.userId}:*`);
        if (keys.length) await redisClient.del(...keys);
        throw new ApiError(401, "Refresh token invalid, please login again.");
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
            roles: {
                include: {
                    role: {
                        include: {
                            rolePermissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        throw new ApiError(401, "User not found.");
    }

    // rotate: delete old refresh token, issue new pair
    await redisClient.del(refreshKey(decoded.userId, decoded.jti));

    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = [
        ...new Set(
            user.roles.flatMap((ur) =>
                ur.role.rolePermissions.map((rp) => rp.permission.name)
            )
        ),
    ];

    const { token: accessToken } = generateAccessToken({
        userId: user.id,
        orgId: user.organizationId,
        roles,
        permissions,
    });
    const { token: newRefreshToken, jti: newRefreshJti } = generateRefreshToken({
        userId: user.id,
    });

    await redisClient.set(
        refreshKey(user.id, newRefreshJti),
        "1",
        "EX",
        REFRESH_TTL_SECONDS
    );

    return { accessToken, refreshToken: newRefreshToken };
};