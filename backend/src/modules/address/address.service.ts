import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateAddressInput, UpdateAddressInput } from "./address.validation";

const assertContactInOrg = async (contactId: string, organizationId: string) => {
  const contact = await prisma.contact.findFirst({ where: { id: contactId, organizationId } });
  if (!contact) throw new ApiError(404, "Contact not found");
  return contact;
};

export const createAddress = async (
  contactId: string,
  organizationId: string,
  data: CreateAddressInput
) => {
  await assertContactInOrg(contactId, organizationId);

  return prisma.$transaction(async (tx) => {
    if (data.isPrimary) {
      await tx.address.updateMany({
        where: { contactId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return tx.address.create({
      data: {
        organizationId,
        contactId,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        ...(data.line1 !== undefined && { line1: data.line1 }),
        ...(data.line2 !== undefined && { line2: data.line2 }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
      },
    });
  });
};

export const getAllAddresses = async (contactId: string, organizationId: string) => {
  await assertContactInOrg(contactId, organizationId);

  return prisma.address.findMany({
    where: { contactId },
    orderBy: { createdAt: "desc" },
  });
};

export const getAddressById = async (
  contactId: string,
  organizationId: string,
  addressId: string
) => {
  await assertContactInOrg(contactId, organizationId);

  const address = await prisma.address.findFirst({ where: { id: addressId, contactId } });
  if (!address) throw new ApiError(404, "Address not found");
  return address;
};

export const updateAddress = async (
  contactId: string,
  organizationId: string,
  addressId: string,
  data: UpdateAddressInput
) => {
  await assertContactInOrg(contactId, organizationId);

  const address = await prisma.address.findFirst({ where: { id: addressId, contactId } });
  if (!address) throw new ApiError(404, "Address not found");

  return prisma.$transaction(async (tx) => {
    if (data.isPrimary) {
      await tx.address.updateMany({
        where: { contactId, isPrimary: true, id: { not: addressId } },
        data: { isPrimary: false },
      });
    }

    return tx.address.update({
      where: { id: addressId },
      data: {
        ...(data.line1 !== undefined && { line1: data.line1 }),
        ...(data.line2 !== undefined && { line2: data.line2 }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.pincode !== undefined && { pincode: data.pincode }),
        ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
      },
    });
  });
};

export const deleteAddress = async (
  contactId: string,
  organizationId: string,
  addressId: string
) => {
  await assertContactInOrg(contactId, organizationId);

  const address = await prisma.address.findFirst({ where: { id: addressId, contactId } });
  if (!address) throw new ApiError(404, "Address not found");

  await prisma.address.delete({ where: { id: addressId } });
};