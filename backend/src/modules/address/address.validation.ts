import { z } from "zod";

export const contactIdParamSchema = z.object({
  contactId: z.string().min(1),
});

export const addressIdParamSchema = z.object({
  contactId: z.string().min(1),
  addressId: z.string().min(1),
});

export const createAddressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  country: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  isPrimary: z.boolean().optional(),
});

export const updateAddressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  country: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  pincode: z.string().min(1).optional(),
  isPrimary: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;