import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as productService from "./product.service";
import type { CreateProductInput, UpdateProductInput, ProductQueryInput } from "./product.validation";
import asyncHandler from "../../utils/asyncHandler";

export const createProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const product = await productService.createProduct(organizationId, req.body as CreateProductInput);
  res.status(201).json(new ApiResponse(201, product, "Product created"));
});

export const getAllProductsHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const query = req.query as unknown as ProductQueryInput;
  const result = await productService.getAllProducts(organizationId, query);
  res.status(200).json(new ApiResponse(200, result, "Products fetched"));
});

export const getProductByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const { id } = req.params as unknown as { id: string };
  const product = await productService.getProductById(organizationId, id);
  res.status(200).json(new ApiResponse(200, product, "Product fetched"));
});

export const updateProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const { id } = req.params as unknown as { id: string };
  const product = await productService.updateProduct(organizationId, id, req.body as UpdateProductInput);
  res.status(200).json(new ApiResponse(200, product, "Product updated"));
});

export const deactivateProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const { id } = req.params as unknown as { id: string };
  const product = await productService.deactivateProduct(organizationId, id);
  res.status(200).json(new ApiResponse(200, product, "Product deactivated"));
});