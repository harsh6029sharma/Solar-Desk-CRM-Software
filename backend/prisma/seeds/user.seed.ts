import bcrypt from "bcrypt";

import { prisma } from "../../src/lib/prisma";

export async function seedUser() {
  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  const organization = await prisma.organization.findUnique({
    where: {
      email: "admin@solardesk.com",
    },
  });

  if (!organization) {
    throw new Error("Organization not found.");
  }

  const user = await prisma.user.upsert({
    where: {
      email: "admin@solardesk.com",
    },
    update: {},
    create: {
      organizationId: organization.id,
      firstName: "System",
      lastName: "Admin",
      email: "admin@solardesk.com",
      password: hashedPassword,
      isVerified: true,
      isActive: true,
    },
  });

  return user;
}