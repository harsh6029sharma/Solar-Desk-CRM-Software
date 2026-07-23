import { z } from "zod";

export const opportunityIdParamSchema = z.object({
  opportunityId: z.string().min(1),
});

export const createWarrantySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  terms: z.string().optional(),
});

export const updateWarrantySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  terms: z.string().optional(),
});

export const updateWarrantyStatusSchema = z
  .object({
    status: z.enum(["ACTIVE", "EXPIRED", "VOID"]),
  })
  .strict();

export type CreateWarrantyInput = z.infer<typeof createWarrantySchema>;
export type UpdateWarrantyInput = z.infer<typeof updateWarrantySchema>;
export type UpdateWarrantyStatusInput = z.infer<typeof updateWarrantyStatusSchema>;