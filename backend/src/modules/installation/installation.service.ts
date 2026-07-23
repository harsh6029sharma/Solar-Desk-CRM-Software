import { InstallationStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateInstallationInput, UpdateInstallationInput } from "./installation.validation";

const generateInstallationNumber = (orgPrefix: string) =>
    `INST-${orgPrefix}-${Date.now()}`;

const assertOpportunityInOrg = async (opportunityId: string, organizationId: string) => {
    const opportunity = await prisma.opportunity.findFirst({
        where: { id: opportunityId, organizationId },
    });
    if (!opportunity) throw new ApiError(404, "Opportunity not found");
    return opportunity;
};

const assertRelatedRecordsExist = async (
    organizationId: string,
    data: {
        quotationId?: string | undefined;
        contactId?: string | undefined;
        addressId?: string | undefined;
        assignedToId?: string | undefined;
    }
) => {
    if (data.quotationId) {
        const quotation = await prisma.quotation.findFirst({
            where: { id: data.quotationId, organizationId },
        });
        if (!quotation) throw new ApiError(404, "Quotation not found");
    }
    if (data.contactId) {
        const contact = await prisma.contact.findFirst({
            where: { id: data.contactId, organizationId },
        });
        if (!contact) throw new ApiError(404, "Contact not found");
    }
    if (data.addressId) {
        const address = await prisma.address.findFirst({
            where: { id: data.addressId, organizationId },
        });
        if (!address) throw new ApiError(404, "Address not found");
    }
    if (data.assignedToId) {
        const user = await prisma.user.findFirst({
            where: { id: data.assignedToId, organizationId },
        });
        if (!user) throw new ApiError(404, "Assigned user not found");
    }
};

export const createInstallation = async (
    opportunityId: string,
    organizationId: string,
    orgPrefix: string,
    data: CreateInstallationInput
) => {
    await assertOpportunityInOrg(opportunityId, organizationId);

    const existing = await prisma.installation.findUnique({ where: { opportunityId } });
    if (existing) throw new ApiError(409, "Installation already exists for this opportunity");

    const existingForQuotation = await prisma.installation.findUnique({
        where: { quotationId: data.quotationId },
    });
    if (existingForQuotation) throw new ApiError(409, "Installation already exists for this quotation");

    await assertRelatedRecordsExist(organizationId, data);

    return prisma.installation.create({
        data: {
            organizationId,
            opportunityId,
            installationNumber: generateInstallationNumber(orgPrefix),
            quotationId: data.quotationId,
            contactId: data.contactId,
            addressId: data.addressId,
            ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
            ...(data.scheduledDate !== undefined && { scheduledDate: data.scheduledDate }),
            ...(data.remarks !== undefined && { remarks: data.remarks }),
        },
    });
};

export const getInstallation = async (opportunityId: string, organizationId: string) => {
    await assertOpportunityInOrg(opportunityId, organizationId);

    const installation = await prisma.installation.findUnique({ where: { opportunityId } });
    if (!installation) throw new ApiError(404, "Installation not found");
    return installation;
};

export const updateInstallation = async (
    opportunityId: string,
    organizationId: string,
    data: UpdateInstallationInput
) => {
    await assertOpportunityInOrg(opportunityId, organizationId);
    const installation = await prisma.installation.findUnique({ where: { opportunityId } });
    if (!installation) throw new ApiError(404, "Installation not found");

    await assertRelatedRecordsExist(organizationId, data);

    return prisma.installation.update({
        where: { opportunityId },
        data: {
            ...(data.contactId !== undefined && { contactId: data.contactId }),
            ...(data.addressId !== undefined && { addressId: data.addressId }),
            ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
            ...(data.scheduledDate !== undefined && { scheduledDate: data.scheduledDate }),
            ...(data.startedAt !== undefined && { startedAt: data.startedAt }),
            ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
            ...(data.remarks !== undefined && { remarks: data.remarks }),
        },
    });
};

export const updateInstallationStatus = async (
    opportunityId: string,
    organizationId: string,
    status: InstallationStatus
) => {
    await assertOpportunityInOrg(opportunityId, organizationId);
    const installation = await prisma.installation.findUnique({ where: { opportunityId } });
    if (!installation) throw new ApiError(404, "Installation not found");

    return prisma.installation.update({
        where: { opportunityId },
        data: {
            status,
            ...(status === "IN_PROGRESS" && !installation.startedAt && { startedAt: new Date() }),
            ...(status === "COMPLETED" && { completedAt: new Date() }),
        },
    });
};