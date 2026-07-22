import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as siteSurveyService from "./site-survey.service";
import type {
  createSiteSurveySchema,
  updateSiteSurveySchema,
} from "./site-survey.validation";
import type { z } from "zod";
import asyncHandler from "../../utils/asyncHandler";

export const createSiteSurvey = asyncHandler(
  async (req: Request, res: Response) => {
    const { opportunityId } = req.params as unknown as { opportunityId: string };
    const body = req.body as z.infer<typeof createSiteSurveySchema>;
    const orgId = req.user!.orgId;

    const survey = await siteSurveyService.createSiteSurvey(orgId, opportunityId, body);

    return res.status(201).json(new ApiResponse(201, survey, "Site survey created"));
  }
);

export const getSiteSurvey = asyncHandler(
  async (req: Request, res: Response) => {
    const { opportunityId } = req.params as unknown as { opportunityId: string };
    const orgId = req.user!.orgId;

    const survey = await siteSurveyService.getSiteSurvey(orgId, opportunityId);

    return res.status(200).json(new ApiResponse(200, survey, "Site survey fetched"));
  }
);

export const updateSiteSurvey = asyncHandler(
  async (req: Request, res: Response) => {
    const { opportunityId } = req.params as unknown as { opportunityId: string };
    const body = req.body as z.infer<typeof updateSiteSurveySchema>;
    const orgId = req.user!.orgId;

    const survey = await siteSurveyService.updateSiteSurvey(orgId, opportunityId, body);

    return res.status(200).json(new ApiResponse(200, survey, "Site survey updated"));
  }
);

export const deleteSiteSurvey = asyncHandler(
  async (req: Request, res: Response) => {
    const { opportunityId } = req.params as unknown as { opportunityId: string };
    const orgId = req.user!.orgId;

    await siteSurveyService.deleteSiteSurvey(orgId, opportunityId);

    return res.status(200).json(new ApiResponse(200, null, "Site survey deleted"));
  }
);