import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

export const getAllPermissions = async () => {
  return prisma.permission.findMany({ orderBy: { name: "asc" } });
};

export const getPermissionById = async (id: string) => {
  const permission = await prisma.permission.findUnique({ where: { id } });

  if (!permission) {
    throw new ApiError(404, "Permission not found");
  }

  return permission;
};