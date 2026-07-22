import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

export const createLead = async (
  orgId: string,
  data: {
    contactId: string;
    source: string;
    budget?: number | undefined;
    expectedInstallation?: Date | undefined;
    assignedTo: string;
    leadProducts?: { productId: string; quantity: number }[] | undefined;
  }
) => {
  const createData: Prisma.LeadUncheckedCreateInput = {
    organizationId: orgId,
    contactId: data.contactId,
    source: data.source as any,
    assignedTo: data.assignedTo,
    ...(data.budget !== undefined && { budget: data.budget }),
    ...(data.expectedInstallation !== undefined && {
      expectedInstallation: data.expectedInstallation,
    }),
    ...(data.leadProducts && {
      leadProducts: {
        create: data.leadProducts.map((lp) => ({
          productId: lp.productId,
          quantity: lp.quantity,
        })),
      },
    }),
  };

  return prisma.lead.create({
    data: createData,
    include: {
      contact: true,
      user: { select: { id: true, firstName: true, lastName: true } },
      leadProducts: { include: { product: true } },
    },
  });
};

export const getAllLeads = async (
  orgId: string,
  filters: { status?: string | undefined; assignedTo?: string | undefined }
) => {
  const where: Prisma.LeadWhereInput = {
    organizationId: orgId,
    isActive: true,
    ...(filters.status !== undefined && { status: filters.status as any }),
    ...(filters.assignedTo !== undefined && { assignedTo: filters.assignedTo }),
  };

  return prisma.lead.findMany({
    where,
    include: {
      contact: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getLeadById = async (orgId: string, leadId: string) => {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId: orgId },
    include: {
      contact: true,
      user: { select: { id: true, firstName: true, lastName: true } },
      leadProducts: { include: { product: true } },
    },
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  return lead;
};

export const updateLead = async (
  orgId: string,
  leadId: string,
  data: {
    budget?: number | undefined;
    expectedInstallation?: Date | undefined;
    assignedTo?: string | undefined;
  }
) => {
  const existing = await prisma.lead.findFirst({ where: { id: leadId, organizationId: orgId } });
  if (!existing) {
    throw new ApiError(404, "Lead not found");
  }

  const updateData: Prisma.LeadUncheckedUpdateInput = {
    ...(data.budget !== undefined && { budget: data.budget }),
    ...(data.expectedInstallation !== undefined && {
      expectedInstallation: data.expectedInstallation,
    }),
    ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
  };

  return prisma.lead.update({
    where: { id: leadId },
    data: updateData,
    include: {
      contact: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

export const updateLeadStatus = async (orgId: string, leadId: string, status: string) => {
  const existing = await prisma.lead.findFirst({ where: { id: leadId, organizationId: orgId } });
  if (!existing) {
    throw new ApiError(404, "Lead not found");
  }

  return prisma.lead.update({
    where: { id: leadId },
    data: { status: status as any },
  });
};

export const deactivateLead = async (orgId: string, leadId: string) => {
  const existing = await prisma.lead.findFirst({ where: { id: leadId, organizationId: orgId } });
  if (!existing) {
    throw new ApiError(404, "Lead not found");
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { isActive: false },
  });
};