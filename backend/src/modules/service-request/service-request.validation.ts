import { z } from "zod";

export const opportunityIdParamSchema = z.object({
  opportunityId: z.string().min(1),
});

export const serviceRequestIdParamSchema = z.object({
  opportunityId: z.string().min(1),
  serviceRequestId: z.string().min(1),
});

export const createServiceRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assignedToId: z.string().min(1).optional(),
});

export const updateServiceRequestSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assignedToId: z.string().min(1).optional(),
});

export const updateServiceRequestStatusSchema = z
  .object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  })
  .strict();

export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
export type UpdateServiceRequestInput = z.infer<typeof updateServiceRequestSchema>;
export type UpdateServiceRequestStatusInput = z.infer<typeof updateServiceRequestStatusSchema>;