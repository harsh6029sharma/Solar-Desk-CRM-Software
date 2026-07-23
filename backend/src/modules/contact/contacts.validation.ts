import { z } from "zod";

export const contactIdParamSchema = z.object({
  id: z.string().min(1),
});

export const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string().min(1),
  email: z.email().optional(),
});

export const updateContactSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  phone: z.string().min(1).optional(),
  email: z.email().optional(),
});

export const contactQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactQueryInput = z.infer<typeof contactQuerySchema>;