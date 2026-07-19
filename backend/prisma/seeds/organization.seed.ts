import { prisma } from "../../src/lib/prisma";

export async function seedOrganization() {
  const organization = await prisma.organization.upsert({
    where: {
      email: "admin@solardesk.com",
    },
    update: {},
    create: {
      name: "Solar Desk CRM",
      legalName: "Solar Desk CRM Private Limited",
      email: "admin@solardesk.com",
      phone: "+911234567890",
      website: "https://solardeskcrm.com",
      isActive: true,
    },
  });

  return organization;
}