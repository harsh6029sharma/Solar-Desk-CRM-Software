import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updateRoleSchema = createRoleSchema.partial();

export const setRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().min(1)),
});

export const roleIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type SetRolePermissionsInput = z.infer<typeof setRolePermissionsSchema>;