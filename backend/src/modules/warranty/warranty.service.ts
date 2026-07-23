import { WarrantyStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateWarrantyInput, UpdateWarrantyInput } from "./warranty.validation";

const generateWarrantyNumber = (orgPrefix: string) => `WAR-${orgPrefix}-${Date.now()}`;

const getInstallationForOpportunity = async (opportunityId: string, organizationId: string) => {
  const installation = await prisma.installation.findFirst({
    where: { opportunityId, organizationId },
  });
  if (!installation) throw new ApiError(404, "Installation not found");
  return installation;
};

export const createWarranty = async (
  opportunityId: string,
  organizationId: string,
  orgPrefix: string,
  data: CreateWarrantyInput
) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  const existing = await prisma.warranty.findUnique({
    where: { installationId: installation.id },
  });
  if (existing) throw new ApiError(409, "Warranty already exists for this installation");

  if (data.endDate <= data.startDate) {
    throw new ApiError(400, "endDate must be after startDate");
  }

  return prisma.warranty.create({
    data: {
      organizationId,
      installationId: installation.id,
      warrantyNumber: generateWarrantyNumber(orgPrefix),
      startDate: data.startDate,
      endDate: data.endDate,
      ...(data.terms !== undefined && { terms: data.terms }),
    },
  });
};

export const getWarranty = async (opportunityId: string, organizationId: string) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  const warranty = await prisma.warranty.findUnique({
    where: { installationId: installation.id },
  });
  if (!warranty) throw new ApiError(404, "Warranty not found");
  return warranty;
};

export const updateWarranty = async (
  opportunityId: string,
  organizationId: string,
  data: UpdateWarrantyInput
) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  const warranty = await prisma.warranty.findUnique({
    where: { installationId: installation.id },
  });
  if (!warranty) throw new ApiError(404, "Warranty not found");

  const nextStart = data.startDate ?? warranty.startDate;
  const nextEnd = data.endDate ?? warranty.endDate;
  if (nextEnd <= nextStart) {
    throw new ApiError(400, "endDate must be after startDate");
  }

  return prisma.warranty.update({
    where: { installationId: installation.id },
    data: {
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      ...(data.terms !== undefined && { terms: data.terms }),
    },
  });
};

export const updateWarrantyStatus = async (
  opportunityId: string,
  organizationId: string,
  status: WarrantyStatus
) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  const warranty = await prisma.warranty.findUnique({
    where: { installationId: installation.id },
  });
  if (!warranty) throw new ApiError(404, "Warranty not found");

  return prisma.warranty.update({
    where: { installationId: installation.id },
    data: { status },
  });
};