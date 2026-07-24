import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../../config/env";
import type { JwtAccessPayload, JwtRefreshPayload } from "./auth.types";

export const decodeToken = (token: string): { userId: string; jti: string } | null => {
    try {
        const decoded = jwt.decode(token);
        if (decoded && typeof decoded === "object" && "userId" in decoded && "jti" in decoded) {
            return decoded as { userId: string; jti: string };
        }
        return null;
    } catch {
        return null;
    }
};

export const generateAccessToken = (payload: Omit<JwtAccessPayload, "jti">) => {
    const jti = crypto.randomUUID();
    const token = jwt.sign({ ...payload, jti }, env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });
    return { token, jti };
};

export const generateRefreshToken = (payload: Omit<JwtRefreshPayload, "jti">) => {
    const jti = crypto.randomUUID();
    const token = jwt.sign({ ...payload, jti }, env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
    return { token, jti };
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
};