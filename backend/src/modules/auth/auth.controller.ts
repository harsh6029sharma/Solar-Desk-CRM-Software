import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import {
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshAccessToken,
} from "./auth.service";
import asyncHandler from "../../utils/asyncHandler";
import { decodeToken } from "./auth.utils";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser(email, password);

  res
    .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  return res.status(200).json(new ApiResponse(200, { user }, "Login successful"));
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user!.userId);
  return res.status(200).json(new ApiResponse(200, user, "Current user fetched"));
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const decoded = decodeToken(refreshToken);
    if (decoded) {
      await logoutUser(decoded.userId, decoded.jti);
    }
  }

  res.clearCookie("accessToken").clearCookie("refreshToken");

  return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing.");
  }

  const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(
    refreshToken
  );

  res
    .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  return res.status(200).json(new ApiResponse(200, null, "Token refreshed"));
});