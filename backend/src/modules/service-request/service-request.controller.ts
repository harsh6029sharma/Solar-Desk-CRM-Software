import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as serviceRequestService from "./service-request.service";
import type {
  CreateServiceRequestInput,
  UpdateServiceRequestInput,
  UpdateServiceRequestStatusInput,
} from "./service-request.validation";
import asyncHandler from "../../utils/asyncHandler";

export const createServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const serviceRequest = await serviceRequestService.createServiceRequest(
    opportunityId,
    req.user!.orgId,
    req.user!.orgId.slice(0, 6).toUpperCase(), // orgPrefix — swap for actual source
    req.body as CreateServiceRequestInput
  );
  res.status(201).json(new ApiResponse(201, serviceRequest, "Service request created"));
});

export const getAllServiceRequests = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const serviceRequests = await serviceRequestService.getAllServiceRequests(opportunityId, req.user!.orgId);
  res.status(200).json(new ApiResponse(200, serviceRequests, "Service requests fetched"));
});

export const getServiceRequestById = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId, serviceRequestId } = req.params as unknown as {
    opportunityId: string;
    serviceRequestId: string;
  };
  const serviceRequest = await serviceRequestService.getServiceRequestById(
    opportunityId,
    req.user!.orgId,
    serviceRequestId
  );
  res.status(200).json(new ApiResponse(200, serviceRequest, "Service request fetched"));
});

export const updateServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId, serviceRequestId } = req.params as unknown as {
    opportunityId: string;
    serviceRequestId: string;
  };
  const serviceRequest = await serviceRequestService.updateServiceRequest(
    opportunityId,
    req.user!.orgId,
    serviceRequestId,
    req.body as UpdateServiceRequestInput
  );
  res.status(200).json(new ApiResponse(200, serviceRequest, "Service request updated"));
});

export const updateServiceRequestStatus = asyncHandler(async (req: Request, res: Response) => {
  const { opportunityId, serviceRequestId } = req.params as unknown as {
    opportunityId: string;
    serviceRequestId: string;
  };
  const { status } = req.body as UpdateServiceRequestStatusInput;
  const serviceRequest = await serviceRequestService.updateServiceRequestStatus(
    opportunityId,
    req.user!.orgId,
    serviceRequestId,
    status
  );
  res.status(200).json(new ApiResponse(200, serviceRequest, "Service request status updated"));
});