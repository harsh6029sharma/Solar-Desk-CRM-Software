import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateProductInput, UpdateProductInput, ProductQueryInput } from "./product.validation";

export const createProduct = async (organizationId: string, input: CreateProductInput) => {
  const existingSku = await prisma.product.findUnique({
    where: { sku: input.sku },
  });

  if (existingSku) {
    throw new ApiError(409, "SKU already exists");
  }

  const data: Prisma.ProductCreateInput = {
    name: input.name,
    sku: input.sku,
    capacity: input.capacity,
    organization: { connect: { id: organizationId } },
    category: { connect: { id: input.categoryId } },
    manufacturer: { connect: { id: input.manufacturerId } },
    ...(input.basePrice !== undefined && { basePrice: input.basePrice }),
    ...(input.description !== undefined && { description: input.description }),
  };

  return prisma.product.create({ data });
};

export const getAllProducts = async (organizationId: string, query: ProductQueryInput) => {
  const { categoryId, manufacturerId, isActive, search, page, limit } = query;

  const where: Prisma.ProductWhereInput = {
    organizationId,
    ...(categoryId !== undefined && { categoryId }),
    ...(manufacturerId !== undefined && { manufacturerId }),
    ...(isActive !== undefined && { isActive }),
    ...(search !== undefined && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, limit };
};

export const getProductById = async (organizationId: string, id: string) => {
  const product = await prisma.product.findFirst({
    where: { id, organizationId },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return product;
};

export const updateProduct = async (organizationId: string, id: string, input: UpdateProductInput) => {
  await getProductById(organizationId, id);

  if (input.sku !== undefined) {
    const existingSku = await prisma.product.findFirst({
      where: { sku: input.sku, NOT: { id } },
    });

    if (existingSku) {
      throw new ApiError(409, "SKU already exists");
    }
  }

  const data: Prisma.ProductUpdateInput = {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.sku !== undefined && { sku: input.sku }),
    ...(input.capacity !== undefined && { capacity: input.capacity }),
    ...(input.basePrice !== undefined && { basePrice: input.basePrice }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.categoryId !== undefined && { category: { connect: { id: input.categoryId } } }),
    ...(input.manufacturerId !== undefined && {
      manufacturer: { connect: { id: input.manufacturerId } },
    }),
  };

  return prisma.product.update({ where: { id }, data });
};

export const deactivateProduct = async (organizationId: string, id: string) => {
  await getProductById(organizationId, id);

  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
};