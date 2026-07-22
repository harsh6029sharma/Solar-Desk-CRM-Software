import { z } from "zod";

export const createQuotationSchema = z.object({
  opportunityId: z.string().min(1),
  validTill: z.coerce.date().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const updateQuotationSchema = z.object({
  validTill: z.coerce.date().optional(),
});

export const updateQuotationStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]),
});

export const quotationQuerySchema = z.object({
  opportunityId: z.string().min(1).optional(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const quotationIdParamSchema = z.object({
  id: z.string().min(1),
});