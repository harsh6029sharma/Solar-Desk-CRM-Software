import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as opportunityService from "./opportunities.service";
import {
  type createOpportunitySchema,
  type updateOpportunitySchema,
  updateOpportunityStageSchema,
  type opportunityQuerySchema,
} from "./opportunities.validation";
import type { z } from "zod";
import asyncHandler from "../../utils/asyncHandler";

export const createOpportunity = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as z.infer<typeof createOpportunitySchema>;
    const orgId = req.user!.orgId;

    const opportunity = await opportunityService.createOpportunity(orgId, body);

    return res
      .status(201)
      .json(new ApiResponse(201, opportunity, "Opportunity created"));
  }
);

export const getAllOpportunities = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as z.infer<typeof opportunityQuerySchema>;
    const orgId = req.user!.orgId;

    const result = await opportunityService.getAllOpportunities(orgId, query);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Opportunities fetched"));
  }
);

export const getOpportunityById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: string };
    const orgId = req.user!.orgId;

    const opportunity = await opportunityService.getOpportunityById(orgId, id);

    return res
      .status(200)
      .json(new ApiResponse(200, opportunity, "Opportunity fetched"));
  }
);

export const updateOpportunity = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: string };
    const body = req.body as z.infer<typeof updateOpportunitySchema>;
    const orgId = req.user!.orgId;

    const opportunity = await opportunityService.updateOpportunity(
      orgId,
      id,
      body
    );

    return res
      .status(200)
      .json(new ApiResponse(200, opportunity, "Opportunity updated"));
  }
);

export const updateOpportunityStage = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: string };
    const { stage, lostReason } = req.body as z.infer<
      typeof updateOpportunityStageSchema
    >;
    const orgId = req.user!.orgId;

    const opportunity = await opportunityService.updateOpportunityStage(
      orgId,
      id,
      stage,
      lostReason
    );

    return res
      .status(200)
      .json(new ApiResponse(200, opportunity, "Opportunity stage updated"));
  }
);

export const deactivateOpportunity = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: string };
    const orgId = req.user!.orgId;

    await opportunityService.deactivateOpportunity(orgId, id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Opportunity deactivated"));
  }
);