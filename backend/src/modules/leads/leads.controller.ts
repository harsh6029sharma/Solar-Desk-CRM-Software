import type { Request, Response } from "express";
import type { z } from "zod";
import { ApiResponse } from "../../utils/ApiResponse";

import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  leadQuerySchema,
} from "./leads.validation";
import asyncHandler from "../../utils/asyncHandler";
import { createLead, deactivateLead, getAllLeads, getLeadById, updateLead, updateLeadStatus } from "./leads.service";

export const addLead = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.orgId;
  const body = req.body as z.infer<typeof createLeadSchema>;
  const lead = await createLead(orgId, body);
  res.status(201).json(new ApiResponse(201, lead, "Lead created successfully"));
});

export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.orgId;
  const query = req.query as unknown as z.infer<typeof leadQuerySchema>;
  const leads = await getAllLeads(orgId, query);
  res.status(200).json(new ApiResponse(200, leads, "Leads fetched successfully"));
});

export const getLead = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.orgId;
  const { id } = req.params as unknown as { id: string };
  const lead = await getLeadById(orgId, id);
  res.status(200).json(new ApiResponse(200, lead, "Lead fetched successfully"));
});

export const editLead = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.orgId;
  const { id } = req.params as unknown as { id: string };
  const body = req.body as z.infer<typeof updateLeadSchema>;
  const lead = await updateLead(orgId, id, body);
  res.status(200).json(new ApiResponse(200, lead, "Lead updated successfully"));
});

export const changeLeadStatus = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.orgId;
  const { id } = req.params as unknown as { id: string };
  const { status } = req.body as z.infer<typeof updateLeadStatusSchema>;
  const lead = await updateLeadStatus(orgId, id , status);
  res.status(200).json(new ApiResponse(200, lead, "Lead status updated successfully"));
});

export const removeLead = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user!.orgId;
  const { id } = req.params as unknown as { id: string };
  await deactivateLead(orgId, id);
  res.status(200).json(new ApiResponse(200, null, "Lead deactivated successfully"));
});