import { Prisma, QuotationStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

type QuotationItemInput = {
    productId: string;
    quantity: number;
};

type CreateQuotationInput = {
    opportunityId: string;
    validTill?: Date | undefined;
    items: QuotationItemInput[];
};

const generateQuotationNumber = (organizationId: string) => {
    const orgPrefix = organizationId.slice(-6).toUpperCase();
    return `QUO-${orgPrefix}-${Date.now()}`;
};

export const createQuotation = async (
    organizationId: string,
    input: CreateQuotationInput
) => {
    const opportunity = await prisma.opportunity.findFirst({
        where: { id: input.opportunityId, organizationId },
    });

    if (!opportunity) {
        throw new ApiError(404, "Opportunity not found");
    }

    const productIds = input.items.map((item) => item.productId);

    const products = await prisma.product.findMany({
        where: { id: { in: productIds }, organizationId },
    });

    if (products.length !== productIds.length) {
        throw new ApiError(400, "One or more products not found");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    const itemsData = input.items.map((item) => {
        const product = productMap.get(item.productId)!;

        if (product.basePrice === null) {
            throw new ApiError(400, `Product "${product.name}" has no base price set`);
        }

        const unitPriceSnapshot = product.basePrice;
        const totalPrice = unitPriceSnapshot.mul(item.quantity);

        return {
            productId: item.productId,
            quantity: item.quantity,
            unitPriceSnapshot,
            productNameSnapshot: product.name,
            totalPrice,
        };
    });

    const totalAmount = itemsData.reduce(
        (sum, item) => sum.add(item.totalPrice),
        itemsData[0]!.totalPrice.sub(itemsData[0]!.totalPrice)
    );

    const data: Prisma.QuotationCreateInput = {
        organization: { connect: { id: organizationId } },
        opportunity: { connect: { id: input.opportunityId } },
        quotationNumber: generateQuotationNumber(organizationId),
        totalAmount,
        ...(input.validTill !== undefined && { validTill: input.validTill }),
        items: { create: itemsData },
    };

    return prisma.$transaction(async (tx) => {
        return tx.quotation.create({
            data,
            include: { items: true },
        });
    });
};

type QuotationFilters = {
    opportunityId?: string | undefined;
    status?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
};

export const getAllQuotations = async (
    organizationId: string,
    filters: QuotationFilters
) => {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const where: Prisma.QuotationWhereInput = {
        organizationId,
        ...(filters.opportunityId !== undefined && { opportunityId: filters.opportunityId }),
        ...(filters.status !== undefined && { status: filters.status as QuotationStatus }),
    };

    const [quotations, total] = await Promise.all([
        prisma.quotation.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { items: true },
        }),
        prisma.quotation.count({ where }),
    ]);

    return { quotations, total, page, limit };
};

export const getQuotationById = async (
    organizationId: string,
    id: string
) => {
    const quotation = await prisma.quotation.findFirst({
        where: { id, organizationId },
        include: { items: true },
    });

    if (!quotation) {
        throw new ApiError(404, "Quotation not found");
    }

    return quotation;
};

export const updateQuotation = async (
    organizationId: string,
    id: string,
    input: { validTill?: Date | undefined }
) => {
    await getQuotationById(organizationId, id);

    const data: Prisma.QuotationUpdateInput = {
        ...(input.validTill !== undefined && { validTill: input.validTill }),
    };

    return prisma.quotation.update({ where: { id }, data });
};

export const updateQuotationStatus = async (
    organizationId: string,
    id: string,
    status: string
) => {
    await getQuotationById(organizationId, id);

    return prisma.quotation.update({
        where: { id },
        data: { status: status as QuotationStatus },
    });
};

export const deleteQuotation = async (
    organizationId: string,
    id: string
) => {
    await getQuotationById(organizationId, id);

    return prisma.quotation.delete({ where: { id } });
};