import { z } from "zod";

const stageEnum = z.enum([
  "QUALIFICATION",
  "SITE_SURVEY",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
]);

export const createOpportunitySchema = z.object({
  leadId: z.string().min(1),
  assignedTo: z.string().min(1),
  stage: stageEnum.optional(),
  expectedRevenue: z.number().positive().optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseDate: z.coerce.date().optional(),
  remarks: z.string().min(1).optional(),
});

export const updateOpportunitySchema = z.object({
  assignedTo: z.string().min(1).optional(),
  expectedRevenue: z.number().positive().optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseDate: z.coerce.date().optional(),
  remarks: z.string().min(1).optional(),
});

export const updateOpportunityStageSchema = z
  .object({
    stage: stageEnum,
    lostReason: z.string().min(1).optional(),
  })
  .refine(
    (data) => data.stage !== "LOST" || !!data.lostReason,
    {
      message: "lostReason is required when stage is LOST",
      path: ["lostReason"],
    }
  );

export const opportunityQuerySchema = z.object({
  stage: stageEnum.optional(),
  assignedTo: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const opportunityIdParamSchema = z.object({
  id: z.string().min(1),
});