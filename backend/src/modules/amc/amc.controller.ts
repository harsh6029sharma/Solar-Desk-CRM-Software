import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as amcService from "./amc.service";
import type { CreateAmcInput, UpdateAmcInput, UpdateAmcStatusInput } from "./amc.validation";
import asyncHandler from "../../utils/asyncHandler";

export const createAmc = asyncHandler(async (req: Request, res: Response) => {
    const { opportunityId } = req.params as unknown as { opportunityId: string };
    const amc = await amcService.createAmc(
        opportunityId,
        req.user!.orgId,
        req.user!.orgId.slice(0, 6).toUpperCase(),
        req.body as CreateAmcInput
    );
    res.status(201).json(new ApiResponse(201, amc, "AMC created"));
});

export const getAllAmcs = asyncHandler(async (req: Request, res: Response) => {
    const { opportunityId } = req.params as unknown as { opportunityId: string };
    const amcs = await amcService.getAllAmcs(opportunityId, req.user!.orgId);
    res.status(200).json(new ApiResponse(200, amcs, "AMCs fetched"));
});

export const getAmcById = asyncHandler(async (req: Request, res: Response) => {
    const { opportunityId, amcId } = req.params as unknown as { opportunityId: string; amcId: string };
    const amc = await amcService.getAmcById(opportunityId, req.user!.orgId, amcId);
    res.status(200).json(new ApiResponse(200, amc, "AMC fetched"));
});

export const updateAmc = asyncHandler(async (req: Request, res: Response) => {
    const { opportunityId, amcId } = req.params as unknown as { opportunityId: string; amcId: string };
    const amc = await amcService.updateAmc(opportunityId, req.user!.orgId, amcId, req.body as UpdateAmcInput);
    res.status(200).json(new ApiResponse(200, amc, "AMC updated"));
});

export const updateAmcStatus = asyncHandler(async (req: Request, res: Response) => {
    const { opportunityId, amcId } = req.params as unknown as { opportunityId: string; amcId: string };
    const { status } = req.body as UpdateAmcStatusInput;
    const amc = await amcService.updateAmcStatus(opportunityId, req.user!.orgId, amcId, status);
    res.status(200).json(new ApiResponse(200, amc, "AMC status updated"));
});