import { prisma } from "../src/lib/prisma";

import { seedOrganization } from "./seeds/organization.seed";
import { seedRoles } from "./seeds/role.seed";
import { seedPermissions } from "./seeds/permission.seed";
import { seedRolePermissions } from "./seeds/rolePermission.seed";
import { seedUser } from "./seeds/user.seed";
import { seedUserRole } from "./seeds/userRole.seed";
import { seedContact } from "./seeds/seed.contact";

async function main() {
  await seedOrganization();

  await seedRoles();

  await seedPermissions();

  await seedRolePermissions();

  await seedUser();

  await seedUserRole();

  await seedContact()
}

main()
  .then(async () => {
    console.log("Database seeded successfully.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Database seeding failed.");
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });