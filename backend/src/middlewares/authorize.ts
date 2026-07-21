import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const authorize = (...requiredPermissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions ?? [];

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      throw new ApiError(403, "You do not have permission to perform this action.");
    }

    next();
  };
};