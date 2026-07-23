import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as warrantyService from "./warranty.service";
import type {
  CreateWarrantyInput,
  UpdateWarrantyInput,
  UpdateWarrantyStatusInput,
} from "./warranty.validation";
import asyncHandler from "../../utils/asyncHandler";

export const createWarranty = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const warranty = await warrantyService.createWarranty(
    opportunityId,
    req.user!.orgId,
    req.user!.orgId.slice(0, 6).toUpperCase(), // orgPrefix — swap for actual source used in Quotation/Installation
    req.body as CreateWarrantyInput
  );
  res.status(201).json(new ApiResponse(201, warranty, "Warranty created"));
});

export const getWarranty = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const warranty = await warrantyService.getWarranty(opportunityId, req.user!.orgId);
  res.status(200).json(new ApiResponse(200, warranty, "Warranty fetched"));
});

export const updateWarranty = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const warranty = await warrantyService.updateWarranty(
    opportunityId,
    req.user!.orgId,
    req.body as UpdateWarrantyInput
  );
  res.status(200).json(new ApiResponse(200, warranty, "Warranty updated"));
});

export const updateWarrantyStatus = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const { status } = req.body as UpdateWarrantyStatusInput;
  const warranty = await warrantyService.updateWarrantyStatus(opportunityId, req.user!.orgId, status);
  res.status(200).json(new ApiResponse(200, warranty, "Warranty status updated"));
});