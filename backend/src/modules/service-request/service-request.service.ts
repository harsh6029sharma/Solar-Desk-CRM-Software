import { ServiceRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateServiceRequestInput, UpdateServiceRequestInput } from "./service-request.validation";

const generateTicketNumber = (orgPrefix: string) => `SR-${orgPrefix}-${Date.now()}`;

const getInstallationForOpportunity = async (opportunityId: string, organizationId: string) => {
  const installation = await prisma.installation.findFirst({
    where: { opportunityId, organizationId },
  });
  if (!installation) throw new ApiError(404, "Installation not found");
  return installation;
};

const assertAssignedUserExists = async (organizationId: string, assignedToId?: string | undefined) => {
  if (!assignedToId) return;
  const user = await prisma.user.findFirst({ where: { id: assignedToId, organizationId } });
  if (!user) throw new ApiError(404, "Assigned user not found");
};

export const createServiceRequest = async (
  opportunityId: string,
  organizationId: string,
  orgPrefix: string,
  data: CreateServiceRequestInput
) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);
  await assertAssignedUserExists(organizationId, data.assignedToId);

  return prisma.serviceRequest.create({
    data: {
      organizationId,
      installationId: installation.id,
      ticketNumber: generateTicketNumber(orgPrefix),
      title: data.title,
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
    },
  });
};

export const getAllServiceRequests = async (opportunityId: string, organizationId: string) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  return prisma.serviceRequest.findMany({
    where: { installationId: installation.id },
    orderBy: { createdAt: "desc" },
  });
};

export const getServiceRequestById = async (
  opportunityId: string,
  organizationId: string,
  serviceRequestId: string
) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: { id: serviceRequestId, installationId: installation.id },
  });
  if (!serviceRequest) throw new ApiError(404, "Service request not found");
  return serviceRequest;
};

export const updateServiceRequest = async (
  opportunityId: string,
  organizationId: string,
  serviceRequestId: string,
  data: UpdateServiceRequestInput
) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: { id: serviceRequestId, installationId: installation.id },
  });
  if (!serviceRequest) throw new ApiError(404, "Service request not found");

  await assertAssignedUserExists(organizationId, data.assignedToId);

  return prisma.serviceRequest.update({
    where: { id: serviceRequestId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
    },
  });
};

export const updateServiceRequestStatus = async (
  opportunityId: string,
  organizationId: string,
  serviceRequestId: string,
  status: ServiceRequestStatus
) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: { id: serviceRequestId, installationId: installation.id },
  });
  if (!serviceRequest) throw new ApiError(404, "Service request not found");

  return prisma.serviceRequest.update({
    where: { id: serviceRequestId },
    data: {
      status,
      ...(status === "RESOLVED" && { resolvedAt: new Date() }),
    },
  });
};