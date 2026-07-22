import { Prisma, OpportunityStage } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

type CreateOpportunityInput = {
    leadId: string;
    assignedTo: string;
    stage?: string | undefined;
    expectedRevenue?: number | undefined;
    probability?: number | undefined;
    expectedCloseDate?: Date | undefined;
    remarks?: string | undefined;
};

export const createOpportunity = async (
    organizationId: string,
    input: CreateOpportunityInput
) => {
    const existing = await prisma.opportunity.findUnique({
        where: { leadId: input.leadId },
    });

    if (existing) {
        throw new ApiError(409, "Opportunity already exists for this lead");
    }

    const data: Prisma.OpportunityCreateInput = {
        organization: { connect: { id: organizationId } },
        lead: { connect: { id: input.leadId } },
        assignedUser: { connect: { id: input.assignedTo } },
        ...(input.stage !== undefined && { stage: input.stage as OpportunityStage }),
        ...(input.expectedRevenue !== undefined && { expectedRevenue: input.expectedRevenue }),
        ...(input.probability !== undefined && { probability: input.probability }),
        ...(input.expectedCloseDate !== undefined && { expectedCloseDate: input.expectedCloseDate }),
        ...(input.remarks !== undefined && { remarks: input.remarks }),
    };

    return prisma.opportunity.create({ data });
};

type OpportunityFilters = {
    stage?: string | undefined;
    assignedTo?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
};

export const getAllOpportunities = async (
    organizationId: string,
    filters: OpportunityFilters
) => {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const where: Prisma.OpportunityWhereInput = {
        organizationId,
        isActive: true,
        ...(filters.stage !== undefined && { stage: filters.stage as OpportunityStage }),
        ...(filters.assignedTo !== undefined && { assignedTo: filters.assignedTo }),
    };

    const [opportunities, total] = await Promise.all([
        prisma.opportunity.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.opportunity.count({ where }),
    ]);

    return { opportunities, total, page, limit };
};

export const getOpportunityById = async (
    organizationId: string,
    id: string
) => {
    const opportunity = await prisma.opportunity.findFirst({
        where: { id, organizationId },
    });

    if (!opportunity) {
        throw new ApiError(404, "Opportunity not found");
    }

    return opportunity;
};

type UpdateOpportunityInput = {
    assignedTo?: string | undefined;
    expectedRevenue?: number | undefined;
    probability?: number | undefined;
    expectedCloseDate?: Date | undefined;
    remarks?: string | undefined;
};

export const updateOpportunity = async (
    organizationId: string,
    id: string,
    input: UpdateOpportunityInput
) => {
    await getOpportunityById(organizationId, id);

    const data: Prisma.OpportunityUpdateInput = {
        ...(input.assignedTo !== undefined && { assignedUser: { connect: { id: input.assignedTo } } }),
        ...(input.expectedRevenue !== undefined && { expectedRevenue: input.expectedRevenue }),
        ...(input.probability !== undefined && { probability: input.probability }),
        ...(input.expectedCloseDate !== undefined && { expectedCloseDate: input.expectedCloseDate }),
        ...(input.remarks !== undefined && { remarks: input.remarks }),
    };

    return prisma.opportunity.update({ where: { id }, data });
};

export const updateOpportunityStage = async (
    organizationId: string,
    id: string,
    stage: string,
    lostReason?: string | undefined
) => {
    await getOpportunityById(organizationId, id);

    const data: Prisma.OpportunityUpdateInput = {
        stage: stage as OpportunityStage,
        ...(lostReason !== undefined && { lostReason }),
    };

    return prisma.opportunity.update({ where: { id }, data });
};

export const deactivateOpportunity = async (
    organizationId: string,
    id: string
) => {
    await getOpportunityById(organizationId, id);

    return prisma.opportunity.update({
        where: { id },
        data: { isActive: false },
    });
};