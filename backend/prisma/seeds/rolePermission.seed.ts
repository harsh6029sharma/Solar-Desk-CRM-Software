import { prisma } from "../../src/lib/prisma";
import { ROLE_PERMISSIONS } from "../constants/rolePermissions";

export async function seedRolePermissions() {
  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    });

    if (!role) {
      throw new Error(`Role '${roleName}' not found.`);
    }

    for (const permissionName of permissions) {
      const permission = await prisma.permission.findUnique({
        where: {
          name: permissionName,
        },
      });

      if (!permission) {
        throw new Error(`Permission '${permissionName}' not found.`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
}