import { prisma } from "../../src/lib/prisma";
import { ROLE_LIST } from "../constants/roles";

export async function seedRoles() {
  const roles = await Promise.all(
    ROLE_LIST.map((role) =>
      prisma.role.upsert({
        where: {
          name: role.name,
        },
        update: {},
        create: {
          name: role.name,
          description: role.description,
          isSystem: true,
        },
      })
    )
  );

  return roles;
}