import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as addressService from "./address.service";
import type { CreateAddressInput, UpdateAddressInput } from "./address.validation";
import asyncHandler from "../../utils/asyncHandler";

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const { contactId } = req.params as unknown as { contactId: string };
  const address = await addressService.createAddress(contactId, req.user!.orgId, req.body as CreateAddressInput);
  res.status(201).json(new ApiResponse(201, address, "Address created"));
});

export const getAllAddresses = asyncHandler(async (req: Request, res: Response) => {
  const { contactId } = req.params as unknown as { contactId: string };
  const addresses = await addressService.getAllAddresses(contactId, req.user!.orgId);
  res.status(200).json(new ApiResponse(200, addresses, "Addresses fetched"));
});

export const getAddressById = asyncHandler(async (req: Request, res: Response) => {
  const { contactId, addressId } = req.params as unknown as { contactId: string; addressId: string };
  const address = await addressService.getAddressById(contactId, req.user!.orgId, addressId);
  res.status(200).json(new ApiResponse(200, address, "Address fetched"));
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const { contactId, addressId } = req.params as unknown as { contactId: string; addressId: string };
  const address = await addressService.updateAddress(
    contactId,
    req.user!.orgId,
    addressId,
    req.body as UpdateAddressInput
  );
  res.status(200).json(new ApiResponse(200, address, "Address updated"));
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const { contactId, addressId } = req.params as unknown as { contactId: string; addressId: string };
  await addressService.deleteAddress(contactId, req.user!.orgId, addressId);
  res.status(200).json(new ApiResponse(200, null, "Address deleted"));
});