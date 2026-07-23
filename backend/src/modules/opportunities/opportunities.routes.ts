import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import siteSurveyRouter from "../site-survey/site-survey.routes";
import { validate } from "../../middlewares/validate";
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  updateOpportunityStageSchema,
  opportunityQuerySchema,
  opportunityIdParamSchema,
} from "./opportunities.validation";
import * as opportunityController from "./opportunities.controller";
import installationRouter from "../installation/installation.routes";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("opportunity:create"),
  validate(createOpportunitySchema),
  opportunityController.createOpportunity
);

router.get(
  "/",
  authorize("opportunity:read"),
  validate(opportunityQuerySchema, "query"),
  opportunityController.getAllOpportunities
);

router.get(
  "/:id",
  authorize("opportunity:read"),
  validate(opportunityIdParamSchema, "params"),
  opportunityController.getOpportunityById
);

router.patch(
  "/:id",
  authorize("opportunity:update"),
  validate(opportunityIdParamSchema, "params"),
  validate(updateOpportunitySchema),
  opportunityController.updateOpportunity
);

router.patch(
  "/:id/stage",
  authorize("opportunity:update"),
  validate(opportunityIdParamSchema, "params"),
  validate(updateOpportunityStageSchema),
  opportunityController.updateOpportunityStage
);

router.delete(
  "/:id",
  authorize("opportunity:delete"),
  validate(opportunityIdParamSchema, "params"),
  opportunityController.deactivateOpportunity
);

router.use("/:opportunityId/survey", siteSurveyRouter);

router.use("/:opportunityId/installation", installationRouter);

export default router;