import { prisma } from "../../src/lib/prisma";

export const seedManufacturers = async () => {
  const organization = await prisma.organization.findFirstOrThrow();

  const manufacturers = ["Waaree", "Adani Solar", "Luminous", "Growatt"];

  for (const name of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { organizationId_name: { organizationId: organization.id, name } },
      update: {},
      create: { organizationId: organization.id, name },
    });
  }

  console.log("Manufacturers seeded");
};