import { z } from "zod";

export const opportunityIdParamSchema = z.object({
  opportunityId: z.string().min(1),
});

export const createInstallationSchema = z.object({
  quotationId: z.string().min(1),
  contactId: z.string().min(1),
  addressId: z.string().min(1),
  assignedToId: z.string().min(1).optional(),
  scheduledDate: z.coerce.date().optional(),
  remarks: z.string().optional(),
});

export const updateInstallationSchema = z.object({
  contactId: z.string().min(1).optional(),
  addressId: z.string().min(1).optional(),
  assignedToId: z.string().min(1).optional(),
  scheduledDate: z.coerce.date().optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  remarks: z.string().optional(),
});

export const updateInstallationStatusSchema = z
  .object({
    status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  })
  .strict();

export type CreateInstallationInput = z.infer<typeof createInstallationSchema>;
export type UpdateInstallationInput = z.infer<typeof updateInstallationSchema>;
export type UpdateInstallationStatusInput = z.infer<typeof updateInstallationStatusSchema>;