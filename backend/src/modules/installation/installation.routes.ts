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

export const installationRouter = Router({ mergeParams: true });

installationRouter.use(authenticate);
installationRouter.use(validate(opportunityIdParamSchema, "params"));

installationRouter.post(
  "/",
  authorize("installation:create"),
  validate(createInstallationSchema, "body"),
  installationController.createInstallation
);

installationRouter.get("/", authorize("installation:read"), installationController.getInstallation);

installationRouter.patch(
  "/",
  authorize("installation:update"),
  validate(updateInstallationSchema, "body"),
  installationController.updateInstallation
);

installationRouter.patch(
  "/status",
  authorize("installation:update"),
  validate(updateInstallationStatusSchema, "body"),
  installationController.updateInstallationStatus
);