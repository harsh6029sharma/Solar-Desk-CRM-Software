import { prisma } from "../../src/lib/prisma";

export const seedProducts = async () => {
  const organization = await prisma.organization.findFirstOrThrow();

  const solarPanelCategory = await prisma.category.findFirstOrThrow({
    where: { organizationId: organization.id, name: "Solar Panel" },
  });
  const inverterCategory = await prisma.category.findFirstOrThrow({
    where: { organizationId: organization.id, name: "Inverter" },
  });
  const batteryCategory = await prisma.category.findFirstOrThrow({
    where: { organizationId: organization.id, name: "Battery" },
  });

  const waaree = await prisma.manufacturer.findFirstOrThrow({
    where: { organizationId: organization.id, name: "Waaree" },
  });
  const adani = await prisma.manufacturer.findFirstOrThrow({
    where: { organizationId: organization.id, name: "Adani Solar" },
  });
  const luminous = await prisma.manufacturer.findFirstOrThrow({
    where: { organizationId: organization.id, name: "Luminous" },
  });

  const products = [
    {
      name: "550W Mono PERC Panel",
      categoryId: solarPanelCategory.id,
      manufacturerId: waaree.id,
      sku: "SP-550-WAAREE",
      capacity: "550W",
      basePrice: 15000,
      description: "High efficiency monocrystalline panel",
    },
    {
      name: "440W Mono PERC Panel",
      categoryId: solarPanelCategory.id,
      manufacturerId: adani.id,
      sku: "SP-440-ADANI",
      capacity: "440W",
      basePrice: 12500,
      description: "Standard efficiency panel",
    },
    {
      name: "5KW Hybrid Inverter",
      categoryId: inverterCategory.id,
      manufacturerId: luminous.id,
      sku: "INV-5KW-LUMINOUS",
      capacity: "5KW",
      basePrice: 45000,
      description: "Hybrid inverter with battery support",
    },
    {
      name: "10KW String Inverter",
      categoryId: inverterCategory.id,
      manufacturerId: waaree.id,
      sku: "INV-10KW-WAAREE",
      capacity: "10KW",
      basePrice: 78000,
      description: "On-grid string inverter",
    },
    {
      name: "5KWh Lithium Battery",
      categoryId: batteryCategory.id,
      manufacturerId: luminous.id,
      sku: "BAT-5KWH-LUMINOUS",
      capacity: "5KWh",
      basePrice: 120000,
      description: "Lithium-ion battery storage",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        ...product,
        organizationId: organization.id,
      },
    });
  }

  console.log("Products seeded");
};