import bcrypt from "bcrypt";
import { ApiError } from "../../utils/ApiError";
import { env } from "../../config/env"; // adjust to your actual env config path
import { prisma } from "../../lib/prisma";

export const createUser = async (
  organizationId: string,
  data: { firstName: string; lastName: string; email: string; password: string; roleId: string }
) => {
  const existing = await prisma.user.findFirst({
    where: { email: data.email, organizationId },
  });
  if (existing) {
    throw new ApiError(409, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      organizationId,
      roles: {
        create: { roleId: data.roleId },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      roles: {
        select: { role: { select: { id: true, name: true } } },
      },
    },
  });

  return user;
};

export const getAllUsers = async (organizationId: string) => {
  return prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      lastLoginAt: true,
      roles: {
        select: {
          role: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });
};