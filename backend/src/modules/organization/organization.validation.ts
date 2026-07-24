import { z } from "zod";

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  legalName: z.string().optional(),
  email: z.email().optional(),
  phone: z.string().optional(),
  website: z.url().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  logoUrl: z.url().optional(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;