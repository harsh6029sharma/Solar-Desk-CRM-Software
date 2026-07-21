import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "./auth.utils";
import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../lib/prisma";
import type { JwtAccessPayload } from "./auth.types";


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

    const roles = user.roles.map((ur) => ur.role.name);

    const permissions = [
        ...new Set(
            user.roles.flatMap((ur) =>
                ur.role.rolePermissions.map((rp) => rp.permission.name)
            )
        ),
    ];

    const payload: JwtAccessPayload = {
        userId: user.id,
        orgId: user.organizationId,
        roles,
        permissions,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user.id });
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });

    const { password: _password, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
};

// get current user service
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