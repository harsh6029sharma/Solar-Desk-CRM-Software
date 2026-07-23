import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as roleService from "./role.service";
import type { CreateRoleInput, UpdateRoleInput, SetRolePermissionsInput } from "./role.validation";
import asyncHandler from "../../utils/asyncHandler";

export const createRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.createRole(req.body as CreateRoleInput);
  res.status(201).json(new ApiResponse(201, role, "Role created"));
});

export const getAllRolesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await roleService.getAllRoles();
  res.status(200).json(new ApiResponse(200, roles, "Roles fetched"));
});

export const getRoleByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const role = await roleService.getRoleById(id);
  res.status(200).json(new ApiResponse(200, role, "Role fetched"));
});

export const updateRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const role = await roleService.updateRole(id, req.body as UpdateRoleInput);
  res.status(200).json(new ApiResponse(200, role, "Role updated"));
});

export const deleteRoleHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  await roleService.deleteRole(id);
  res.status(200).json(new ApiResponse(200, null, "Role deleted"));
});

export const setRolePermissionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const role = await roleService.setRolePermissions(id, req.body as SetRolePermissionsInput);
  res.status(200).json(new ApiResponse(200, role, "Role permissions updated"));
});