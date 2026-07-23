import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateContactInput, UpdateContactInput, ContactQueryInput } from "./contacts.validation";

const assertNoDuplicate = async (
  organizationId: string,
  phone: string | undefined,
  email: string | undefined,
  excludeId?: string
) => {
  if (phone) {
    const existingPhone = await prisma.contact.findFirst({
      where: { organizationId, phone, ...(excludeId && { id: { not: excludeId } }) },
    });
    if (existingPhone) throw new ApiError(409, "Contact with this phone already exists");
  }
  if (email) {
    const existingEmail = await prisma.contact.findFirst({
      where: { organizationId, email, ...(excludeId && { id: { not: excludeId } }) },
    });
    if (existingEmail) throw new ApiError(409, "Contact with this email already exists");
  }
};

export const createContact = async (organizationId: string, data: CreateContactInput) => {
  await assertNoDuplicate(organizationId, data.phone, data.email);

  return prisma.contact.create({
    data: {
      organizationId,
      firstName: data.firstName,
      phone: data.phone,
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email }),
    },
  });
};

export const getAllContacts = async (organizationId: string, query: ContactQueryInput) => {
  return prisma.contact.findMany({
    where: {
      organizationId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { phone: { contains: query.search } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getContactById = async (organizationId: string, id: string) => {
  const contact = await prisma.contact.findFirst({ where: { id, organizationId } });
  if (!contact) throw new ApiError(404, "Contact not found");
  return contact;
};

export const updateContact = async (organizationId: string, id: string, data: UpdateContactInput) => {
  const contact = await prisma.contact.findFirst({ where: { id, organizationId } });
  if (!contact) throw new ApiError(404, "Contact not found");

  await assertNoDuplicate(organizationId, data.phone, data.email, id);

  return prisma.contact.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.email !== undefined && { email: data.email }),
    },
  });
};

export const deactivateContact = async (organizationId: string, id: string) => {
  const contact = await prisma.contact.findFirst({ where: { id, organizationId } });
  if (!contact) throw new ApiError(404, "Contact not found");

  return prisma.contact.update({ where: { id }, data: { isActive: false } });
};