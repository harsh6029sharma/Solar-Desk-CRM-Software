import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateRoleInput, UpdateRoleInput, SetRolePermissionsInput } from "./role.validation";

export const createRole = async (input: CreateRoleInput) => {
  const existing = await prisma.role.findUnique({ where: { name: input.name } });

  if (existing) {
    throw new ApiError(409, "Role name already exists");
  }

  const data: Prisma.RoleCreateInput = {
    name: input.name,
    isSystem: false,
    ...(input.description !== undefined && { description: input.description }),
  };

  return prisma.role.create({ data });
};

export const getAllRoles = async () => {
  return prisma.role.findMany({
    include: {
      rolePermissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  });
};

export const getRoleById = async (id: string) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
  });

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  return role;
};

export const updateRole = async (id: string, input: UpdateRoleInput) => {
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  if (role.isSystem) {
    throw new ApiError(400, "System roles cannot be modified");
  }

  if (input.name !== undefined) {
    const existing = await prisma.role.findFirst({
      where: { name: input.name, NOT: { id } },
    });

    if (existing) {
      throw new ApiError(409, "Role name already exists");
    }
  }

  const data: Prisma.RoleUpdateInput = {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
  };

  return prisma.role.update({ where: { id }, data });
};

export const deleteRole = async (id: string) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  if (role.isSystem) {
    throw new ApiError(400, "System roles cannot be deleted");
  }

  if (role._count.users > 0) {
    throw new ApiError(400, "Cannot delete a role that is still assigned to users");
  }

  await prisma.role.delete({ where: { id } });
};

export const setRolePermissions = async (id: string, input: SetRolePermissionsInput) => {
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  if (input.permissionIds.length > 0) {
    const foundCount = await prisma.permission.count({
      where: { id: { in: input.permissionIds } },
    });

    if (foundCount !== input.permissionIds.length) {
      throw new ApiError(400, "One or more permissionIds are invalid");
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId: id } });

    if (input.permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: input.permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      });
    }

    return tx.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } },
    });
  });
};