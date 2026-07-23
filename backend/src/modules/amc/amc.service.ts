import { AmcStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateAmcInput, UpdateAmcInput } from "./amc.validation";

const generateAmcNumber = (orgPrefix: string) => `AMC-${orgPrefix}-${Date.now()}`;

const getInstallationForOpportunity = async (opportunityId: string, organizationId: string) => {
  const installation = await prisma.installation.findFirst({
    where: { opportunityId, organizationId },
  });
  if (!installation) throw new ApiError(404, "Installation not found");
  return installation;
};

export const createAmc = async (
  opportunityId: string,
  organizationId: string,
  orgPrefix: string,
  data: CreateAmcInput
) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  if (data.endDate <= data.startDate) {
    throw new ApiError(400, "endDate must be after startDate");
  }

  return prisma.amc.create({
    data: {
      organizationId,
      installationId: installation.id,
      amcNumber: generateAmcNumber(orgPrefix),
      startDate: data.startDate,
      endDate: data.endDate,
      amount: data.amount,
      frequency: data.frequency,
      ...(data.remarks !== undefined && { remarks: data.remarks }),
    },
  });
};

export const getAllAmcs = async (opportunityId: string, organizationId: string) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  return prisma.amc.findMany({
    where: { installationId: installation.id },
    orderBy: { createdAt: "desc" },
  });
};

export const getAmcById = async (opportunityId: string, organizationId: string, amcId: string) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  const amc = await prisma.amc.findFirst({
    where: { id: amcId, installationId: installation.id },
  });
  if (!amc) throw new ApiError(404, "AMC not found");
  return amc;
};

export const updateAmc = async (
  opportunityId: string,
  organizationId: string,
  amcId: string,
  data: UpdateAmcInput
) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  const amc = await prisma.amc.findFirst({
    where: { id: amcId, installationId: installation.id },
  });
  if (!amc) throw new ApiError(404, "AMC not found");

  const nextStart = data.startDate ?? amc.startDate;
  const nextEnd = data.endDate ?? amc.endDate;
  if (nextEnd <= nextStart) {
    throw new ApiError(400, "endDate must be after startDate");
  }

  return prisma.amc.update({
    where: { id: amcId },
    data: {
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.frequency !== undefined && { frequency: data.frequency }),
      ...(data.remarks !== undefined && { remarks: data.remarks }),
    },
  });
};

export const updateAmcStatus = async (
  opportunityId: string,
  organizationId: string,
  amcId: string,
  status: AmcStatus
) => {
  const installation = await getInstallationForOpportunity(opportunityId, organizationId);

  const amc = await prisma.amc.findFirst({
    where: { id: amcId, installationId: installation.id },
  });
  if (!amc) throw new ApiError(404, "AMC not found");

  return prisma.amc.update({
    where: { id: amcId },
    data: { status },
  });
};