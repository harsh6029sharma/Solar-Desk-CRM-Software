import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  contactIdParamSchema,
  addressIdParamSchema,
  createAddressSchema,
  updateAddressSchema,
} from "./address.validation";
import * as addressController from "./address.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  "/",
  validate(contactIdParamSchema, "params"),
  authorize("address:create"),
  validate(createAddressSchema, "body"),
  addressController.createAddress
);

router.get(
  "/",
  validate(contactIdParamSchema, "params"),
  authorize("address:read"),
  addressController.getAllAddresses
);

router.get(
  "/:addressId",
  validate(addressIdParamSchema, "params"),
  authorize("address:read"),
  addressController.getAddressById
);

router.patch(
  "/:addressId",
  validate(addressIdParamSchema, "params"),
  authorize("address:update"),
  validate(updateAddressSchema, "body"),
  addressController.updateAddress
);

router.delete(
  "/:addressId",
  validate(addressIdParamSchema, "params"),
  authorize("address:delete"),
  addressController.deleteAddress
);

export default router;