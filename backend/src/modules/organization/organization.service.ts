import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { UpdateOrganizationInput } from "./organization.validation";

export const getMyOrganization = async (organizationId: string) => {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  return organization;
};

export const updateMyOrganization = async (
  organizationId: string,
  input: UpdateOrganizationInput
) => {
  await getMyOrganization(organizationId);

  if (input.email !== undefined) {
    const existing = await prisma.organization.findFirst({
      where: { email: input.email, NOT: { id: organizationId } },
    });

    if (existing) {
      throw new ApiError(409, "Email already in use by another organization");
    }
  }

  if (input.gstNumber !== undefined) {
    const existing = await prisma.organization.findFirst({
      where: { gstNumber: input.gstNumber, NOT: { id: organizationId } },
    });

    if (existing) {
      throw new ApiError(409, "GST number already in use by another organization");
    }
  }

  if (input.panNumber !== undefined) {
    const existing = await prisma.organization.findFirst({
      where: { panNumber: input.panNumber, NOT: { id: organizationId } },
    });

    if (existing) {
      throw new ApiError(409, "PAN number already in use by another organization");
    }
  }

  const data: Prisma.OrganizationUpdateInput = {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.legalName !== undefined && { legalName: input.legalName }),
    ...(input.email !== undefined && { email: input.email }),
    ...(input.phone !== undefined && { phone: input.phone }),
    ...(input.website !== undefined && { website: input.website }),
    ...(input.gstNumber !== undefined && { gstNumber: input.gstNumber }),
    ...(input.panNumber !== undefined && { panNumber: input.panNumber }),
    ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
  };

  return prisma.organization.update({ where: { id: organizationId }, data });
};