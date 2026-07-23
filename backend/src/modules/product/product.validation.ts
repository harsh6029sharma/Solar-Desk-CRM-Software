import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  manufacturerId: z.string().min(1),
  sku: z.string().min(1),
  capacity: z.string().min(1),
  basePrice: z.number().positive().optional(),
  description: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  categoryId: z.string().min(1).optional(),
  manufacturerId: z.string().min(1).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 20)),
});

export const productIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;