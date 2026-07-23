import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as permissionService from "./permission.service";
import asyncHandler from "../../utils/asyncHandler";

export const getAllPermissionsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const permissions = await permissionService.getAllPermissions();
  res.status(200).json(new ApiResponse(200, permissions, "Permissions fetched"));
});

export const getPermissionByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const permission = await permissionService.getPermissionById(id);
  res.status(200).json(new ApiResponse(200, permission, "Permission fetched"));
});