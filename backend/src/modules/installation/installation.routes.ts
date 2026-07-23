import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  opportunityIdParamSchema,
  createInstallationSchema,
  updateInstallationSchema,
  updateInstallationStatusSchema,
} from "./installation.validation";
import * as installationController from "./installation.controller";
import amcRouter from "../amc/amc.routes";
import serviceRequestRouter from "../service-request/service-request.routes";

const router = Router()

router.use(authenticate);
router.use(validate(opportunityIdParamSchema, "params"));

router.post(
  "/",
  authorize("installation:create"),
  validate(createInstallationSchema, "body"),
  installationController.createInstallation
);

router.get("/", authorize("installation:read"), installationController.getInstallation);

router.patch(
  "/",
  authorize("installation:update"),
  validate(updateInstallationSchema, "body"),
  installationController.updateInstallation
);

router.patch(
  "/status",
  authorize("installation:update"),
  validate(updateInstallationStatusSchema, "body"),
  installationController.updateInstallationStatus
);

// nested route
router.use("/amcs", amcRouter);

router.use("/service-requests", serviceRequestRouter);

export default router