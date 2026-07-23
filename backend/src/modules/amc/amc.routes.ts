import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  opportunityIdParamSchema,
  amcIdParamSchema,
  createAmcSchema,
  updateAmcSchema,
  updateAmcStatusSchema,
} from "./amc.validation";
import * as amcController from "./amc.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  "/",
  validate(opportunityIdParamSchema, "params"),
  authorize("amc:create"),
  validate(createAmcSchema, "body"),
  amcController.createAmc
);

router.get(
  "/",
  validate(opportunityIdParamSchema, "params"),
  authorize("amc:read"),
  amcController.getAllAmcs
);

router.get(
  "/:amcId",
  validate(amcIdParamSchema, "params"),
  authorize("amc:read"),
  amcController.getAmcById
);

router.patch(
  "/:amcId",
  validate(amcIdParamSchema, "params"),
  authorize("amc:update"),
  validate(updateAmcSchema, "body"),
  amcController.updateAmc
);

router.patch(
  "/:amcId/status",
  validate(amcIdParamSchema, "params"),
  authorize("amc:update"),
  validate(updateAmcStatusSchema, "body"),
  amcController.updateAmcStatus
);

export default router;