import type { Request, Response } from "express";
import { getCurrentUser, loginUser } from "./auth.service";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "./auth.constants";
import asyncHandler from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

// login controller
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser(email, password);

  res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Login successful"));
});


// get current user controller
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const user = await getCurrentUser(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully."));
});