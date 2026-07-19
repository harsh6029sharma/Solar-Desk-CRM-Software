-- CreateEnum
CREATE TYPE "InstallationStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WarrantyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'VOID');

-- CreateEnum
CREATE TYPE "AmcStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AmcFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ServiceRequestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "Installation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "installationNumber" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "status" "InstallationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warranty" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "warrantyNumber" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "WarrantyStatus" NOT NULL DEFAULT 'ACTIVE',
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amc" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "amcNumber" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "frequency" "AmcFrequency" NOT NULL,
    "status" "AmcStatus" NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "ticketNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "ServiceRequestPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Installation_installationNumber_key" ON "Installation"("installationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_opportunityId_key" ON "Installation"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_quotationId_key" ON "Installation"("quotationId");

-- CreateIndex
CREATE INDEX "Installation_organizationId_idx" ON "Installation"("organizationId");

-- CreateIndex
CREATE INDEX "Installation_assignedToId_idx" ON "Installation"("assignedToId");

-- CreateIndex
CREATE INDEX "Installation_contactId_idx" ON "Installation"("contactId");

-- CreateIndex
CREATE INDEX "Installation_status_idx" ON "Installation"("status");

-- CreateIndex
CREATE INDEX "Installation_scheduledDate_idx" ON "Installation"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "Warranty_installationId_key" ON "Warranty"("installationId");

-- CreateIndex
CREATE UNIQUE INDEX "Warranty_warrantyNumber_key" ON "Warranty"("warrantyNumber");

-- CreateIndex
CREATE INDEX "Warranty_organizationId_idx" ON "Warranty"("organizationId");

-- CreateIndex
CREATE INDEX "Warranty_status_idx" ON "Warranty"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Amc_amcNumber_key" ON "Amc"("amcNumber");

-- CreateIndex
CREATE INDEX "Amc_organizationId_idx" ON "Amc"("organizationId");

-- CreateIndex
CREATE INDEX "Amc_installationId_idx" ON "Amc"("installationId");

-- CreateIndex
CREATE INDEX "Amc_status_idx" ON "Amc"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_ticketNumber_key" ON "ServiceRequest"("ticketNumber");

-- CreateIndex
CREATE INDEX "ServiceRequest_organizationId_idx" ON "ServiceRequest"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceRequest_installationId_idx" ON "ServiceRequest"("installationId");

-- CreateIndex
CREATE INDEX "ServiceRequest_assignedToId_idx" ON "ServiceRequest"("assignedToId");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_idx" ON "ServiceRequest"("status");

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "Installation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amc" ADD CONSTRAINT "Amc_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amc" ADD CONSTRAINT "Amc_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "Installation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "Installation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
