import { z } from "zod";

export const opportunityIdParamSchema = z.object({
  opportunityId: z.string().min(1),
});

export const amcIdParamSchema = z.object({
  opportunityId: z.string().min(1),
  amcId: z.string().min(1),
});

export const createAmcSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  amount: z.number().positive(),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"]),
  remarks: z.string().optional(),
});

export const updateAmcSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  amount: z.number().positive().optional(),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"]).optional(),
  remarks: z.string().optional(),
});

export const updateAmcStatusSchema = z
  .object({
    status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]),
  })
  .strict();

export type CreateAmcInput = z.infer<typeof createAmcSchema>;
export type UpdateAmcInput = z.infer<typeof updateAmcSchema>;
export type UpdateAmcStatusInput = z.infer<typeof updateAmcStatusSchema>;