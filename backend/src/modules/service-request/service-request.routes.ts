import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  opportunityIdParamSchema,
  serviceRequestIdParamSchema,
  createServiceRequestSchema,
  updateServiceRequestSchema,
  updateServiceRequestStatusSchema,
} from "./service-request.validation";
import * as serviceRequestController from "./service-request.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  "/",
  validate(opportunityIdParamSchema, "params"),
  authorize("service-request:create"),
  validate(createServiceRequestSchema, "body"),
  serviceRequestController.createServiceRequest
);

router.get(
  "/",
  validate(opportunityIdParamSchema, "params"),
  authorize("service-request:read"),
  serviceRequestController.getAllServiceRequests
);

router.get(
  "/:serviceRequestId",
  validate(serviceRequestIdParamSchema, "params"),
  authorize("service-request:read"),
  serviceRequestController.getServiceRequestById
);

router.patch(
  "/:serviceRequestId",
  validate(serviceRequestIdParamSchema, "params"),
  authorize("service-request:update"),
  validate(updateServiceRequestSchema, "body"),
  serviceRequestController.updateServiceRequest
);

router.patch(
  "/:serviceRequestId/status",
  validate(serviceRequestIdParamSchema, "params"),
  authorize("service-request:update"),
  validate(updateServiceRequestStatusSchema, "body"),
  serviceRequestController.updateServiceRequestStatus
);

export default router;