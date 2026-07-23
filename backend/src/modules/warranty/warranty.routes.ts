import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  opportunityIdParamSchema,
  createWarrantySchema,
  updateWarrantySchema,
  updateWarrantyStatusSchema,
} from "./warranty.validation";
import * as warrantyController from "./warranty.controller";

export const warrantyRouter = Router({ mergeParams: true });

warrantyRouter.use(authenticate);
warrantyRouter.use(validate(opportunityIdParamSchema, "params"));

warrantyRouter.post(
  "/",
  authorize("warranty:create"),
  validate(createWarrantySchema, "body"),
  warrantyController.createWarranty
);

warrantyRouter.get("/", authorize("warranty:read"), warrantyController.getWarranty);

warrantyRouter.patch(
  "/",
  authorize("warranty:update"),
  validate(updateWarrantySchema, "body"),
  warrantyController.updateWarranty
);

warrantyRouter.patch(
  "/status",
  authorize("warranty:update"),
  validate(updateWarrantyStatusSchema, "body"),
  warrantyController.updateWarrantyStatus
);