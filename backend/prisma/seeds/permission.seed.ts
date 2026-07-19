import { prisma } from "../../src/lib/prisma";
import { PERMISSIONS } from "../constants/permissions";

export async function seedPermissions() {
  const permissions = await Promise.all(
    PERMISSIONS.map((permissionName) =>
      prisma.permission.upsert({
        where: {
          name: permissionName,
        },
        update: {},
        create: {
          name: permissionName,
          isSystem: true,
        },
      })
    )
  );

  return permissions;
}