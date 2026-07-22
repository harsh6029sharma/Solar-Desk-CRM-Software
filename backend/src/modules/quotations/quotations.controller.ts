import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as quotationService from "./quotations.service";
import type {
  createQuotationSchema,
  updateQuotationSchema,
  updateQuotationStatusSchema,
  quotationQuerySchema,
} from "./quotations.validation";
import type { z } from "zod";
import asyncHandler from "../../utils/asyncHandler";

export const createQuotation = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as z.infer<typeof createQuotationSchema>;
    const orgId = req.user!.orgId;

    const quotation = await quotationService.createQuotation(orgId, body);

    return res.status(201).json(new ApiResponse(201, quotation, "Quotation created"));
  }
);

export const getAllQuotations = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as z.infer<typeof quotationQuerySchema>;
    const orgId = req.user!.orgId;

    const result = await quotationService.getAllQuotations(orgId, query);

    return res.status(200).json(new ApiResponse(200, result, "Quotations fetched"));
  }
);

export const getQuotationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: string };
    const orgId = req.user!.orgId;

    const quotation = await quotationService.getQuotationById(orgId, id);

    return res.status(200).json(new ApiResponse(200, quotation, "Quotation fetched"));
  }
);

export const updateQuotation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: string };
    const body = req.body as z.infer<typeof updateQuotationSchema>;
    const orgId = req.user!.orgId;

    const quotation = await quotationService.updateQuotation(orgId, id, body);

    return res.status(200).json(new ApiResponse(200, quotation, "Quotation updated"));
  }
);

export const updateQuotationStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: string };
    const { status } = req.body as z.infer<typeof updateQuotationStatusSchema>;
    const orgId = req.user!.orgId;

    const quotation = await quotationService.updateQuotationStatus(orgId, id, status);

    return res.status(200).json(new ApiResponse(200, quotation, "Quotation status updated"));
  }
);

export const deleteQuotation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: string };
    const orgId = req.user!.orgId;

    await quotationService.deleteQuotation(orgId, id);

    return res.status(200).json(new ApiResponse(200, null, "Quotation deleted"));
  }
);