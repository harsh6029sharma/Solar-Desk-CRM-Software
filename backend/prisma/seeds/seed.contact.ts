import { prisma } from "../../src/lib/prisma";

export async function seedContact() {
  const org = await prisma.organization.findFirst();
  if (!org) throw new Error("No organization found — seed org first");

  const contact = await prisma.contact.upsert({
    where: {
      organizationId_phone: {
        organizationId: org.id,
        phone: "9876543210",
      },
    },
    update: {},
    create: {
      firstName: "Amit",
      lastName: "Verma",
      phone: "9876543210",
      organizationId: org.id,
    },
  });

  console.log("Contact ready:", contact.id);
  return contact;
}