import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import type { JwtAccessPayload, JwtRefreshPayload } from "./auth.types";

export const generateAccessToken = (payload: JwtAccessPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (payload: JwtRefreshPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token: string): JwtAccessPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
};