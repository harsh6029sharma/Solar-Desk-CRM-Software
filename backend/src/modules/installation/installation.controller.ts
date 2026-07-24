import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as installationService from "./installation.service";
import type {
  CreateInstallationInput,
  UpdateInstallationInput,
  UpdateInstallationStatusInput,
} from "./installation.validation";
import asyncHandler from "../../utils/asyncHandler";

export const createInstallation = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const installation = await installationService.createInstallation(
    opportunityId,
    req.user!.orgId,
    req.user!.orgId.slice(0, 6).toUpperCase(),
    req.body as CreateInstallationInput
  );
  res.status(201).json(new ApiResponse(201, installation, "Installation created"));
});

export const getInstallation = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const installation = await installationService.getInstallation(opportunityId, req.user!.orgId);
  res.status(200).json(new ApiResponse(200, installation, "Installation fetched"));
});

export const updateInstallation = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const installation = await installationService.updateInstallation(
    opportunityId,
    req.user!.orgId,
    req.body as UpdateInstallationInput
  );
  res.status(200).json(new ApiResponse(200, installation, "Installation updated"));
});

export const updateInstallationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const { status } = req.body as UpdateInstallationStatusInput;
  const installation = await installationService.updateInstallationStatus(
    opportunityId,
    req.user!.orgId,
    status
  );
  res.status(200).json(new ApiResponse(200, installation, "Installation status updated"));
});