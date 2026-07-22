import { z } from "zod";

const leadSourceEnum = z.enum([
  "WEBSITE",
  "FACEBOOK",
  "GOOGLE_ADS",
  "REFERRAL",
  "WALK_IN",
  "PHONE_CALL",
]);

const leadStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
]);

export const createLeadSchema = z.object({
  contactId: z.string().min(1, "Contact id is required"),
  source: leadSourceEnum,
  budget: z.number().positive().optional(),
  expectedInstallation: z.coerce.date().optional(),
  assignedTo: z.string().min(1, "Assigned user id is required"),
  leadProducts: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().default(1),
      })
    )
    .optional(),
});

export const updateLeadSchema = z.object({
  budget: z.number().positive().optional(),
  expectedInstallation: z.coerce.date().optional(),
  assignedTo: z.string().min(1).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: leadStatusEnum,
});

export const leadQuerySchema = z.object({
  status: leadStatusEnum.optional(),
  assignedTo: z.string().min(1).optional(),
});

export const leadIdParamSchema = z.object({
  id: z.string().min(1, "Lead id is required"),
});