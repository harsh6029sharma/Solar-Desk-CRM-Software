import asyncHandler from "../../utils/asyncHandler";
import { createUser, getAllUsers } from "./user.service";
import { createUserSchema } from "./user.validation";
import type { z } from "zod";
import type { Request,Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";


export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.orgId;
  const body = req.body as z.infer<typeof createUserSchema>;
  const user = await createUser(orgId, body);
  res.status(201).json(new ApiResponse(201, user, "Employee created successfully"));
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.orgId;
  const users = await getAllUsers(orgId);
  res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});