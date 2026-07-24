import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  contactIdParamSchema,
  createContactSchema,
  updateContactSchema,
  contactQuerySchema,
} from "./contacts.validation";
import * as contactsController from "./contacts.controller";
import addressRouter from "../address/address.routes";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", authorize("contact:create"), validate(createContactSchema, "body"), contactsController.createContact);

router.get("/", authorize("contact:read"), validate(contactQuerySchema, "query"), contactsController.getAllContacts);

router.get(
  "/:id",
  authorize("contact:read"),
  validate(contactIdParamSchema, "params"),
  contactsController.getContactById
);

router.patch(
  "/:id",
  authorize("contact:update"),
  validate(contactIdParamSchema, "params"),
  validate(updateContactSchema, "body"),
  contactsController.updateContact
);

router.delete(
  "/:id",
  authorize("contact:delete"),
  validate(contactIdParamSchema, "params"),
  contactsController.deactivateContact
);

router.use("/:contactId/addresses", addressRouter);

export default router;