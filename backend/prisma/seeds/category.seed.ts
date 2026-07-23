import { prisma } from "../../src/lib/prisma";

export const seedCategories = async () => {
  const organization = await prisma.organization.findFirstOrThrow();

  const categories = ["Solar Panel", "Inverter", "Battery", "EV Charger"];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { organizationId_name: { organizationId: organization.id, name } },
      update: {},
      create: { organizationId: organization.id, name },
    });
  }

  console.log("Categories seeded");
};