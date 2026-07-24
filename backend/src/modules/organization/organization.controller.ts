import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as organizationService from "./organization.service";
import type { UpdateOrganizationInput } from "./organization.validation";
import asyncHandler from "../../utils/asyncHandler";

export const getMyOrganizationHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const organization = await organizationService.getMyOrganization(organizationId);
  res.status(200).json(new ApiResponse(200, organization, "Organization fetched"));
});

export const updateMyOrganizationHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const organization = await organizationService.updateMyOrganization(
    organizationId,
    req.body as UpdateOrganizationInput
  );
  res.status(200).json(new ApiResponse(200, organization, "Organization updated"));
});