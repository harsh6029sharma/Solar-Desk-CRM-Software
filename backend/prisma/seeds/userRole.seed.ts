import { prisma } from "../../src/lib/prisma";

import { ROLES } from "../constants/roles";

export async function seedUserRole() {
  const user = await prisma.user.findUnique({
    where: {
      email: "admin@solardesk.com",
    },
  });

  if (!user) {
    throw new Error("Admin user not found.");
  }

  const role = await prisma.role.findUnique({
    where: {
      name: ROLES.SUPER_ADMIN,
    },
  });

  if (!role) {
    throw new Error("Super Admin role not found.");
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: role.id,
    },
  });
}