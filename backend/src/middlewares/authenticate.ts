import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../modules/auth/auth.utils";
import asyncHandler from "../utils/asyncHandler";

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      throw new ApiError(401, "Access token missing. Please log in.");
    }

    try {
      const decoded = verifyAccessToken(accessToken);
      req.user = decoded;
    } catch (error) {
      throw new ApiError(401, "Invalid or expired access token.");
    }

    next();
  }
);