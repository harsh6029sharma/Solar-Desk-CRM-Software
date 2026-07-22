import { z } from "zod";

export const createSiteSurveySchema = z.object({
  roofType: z.string().min(1).optional(),
  roofAreaSqFt: z.number().positive().optional(),
  sanctionedLoadKw: z.number().positive().optional(),
  monthlyBillAverage: z.number().positive().optional(),
  shadowAnalysis: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  surveyPhotosUrl: z.array(z.string().url()).optional(),
});

export const updateSiteSurveySchema = createSiteSurveySchema;

export const opportunityIdParamSchema = z.object({
  opportunityId: z.string().min(1),
});