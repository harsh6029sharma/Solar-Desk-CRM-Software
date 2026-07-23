import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as contactsService from "./contacts.service";
import type { CreateContactInput, UpdateContactInput, ContactQueryInput } from "./contacts.validation";
import asyncHandler from "../../utils/asyncHandler";

export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactsService.createContact(req.user!.orgId, req.body as CreateContactInput);
  res.status(201).json(new ApiResponse(201, contact, "Contact created"));
});

export const getAllContacts = asyncHandler(async (req: Request, res: Response) => {
  const contacts = await contactsService.getAllContacts(req.user!.orgId, req.query as unknown as ContactQueryInput);
  res.status(200).json(new ApiResponse(200, contacts, "Contacts fetched"));
});

export const getContactById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const contact = await contactsService.getContactById(req.user!.orgId, id);
  res.status(200).json(new ApiResponse(200, contact, "Contact fetched"));
});

export const updateContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const contact = await contactsService.updateContact(req.user!.orgId, id, req.body as UpdateContactInput);
  res.status(200).json(new ApiResponse(200, contact, "Contact updated"));
});

export const deactivateContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const contact = await contactsService.deactivateContact(req.user!.orgId, id);
  res.status(200).json(new ApiResponse(200, contact, "Contact deactivated"));
});