import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createSiteSurveySchema,
  updateSiteSurveySchema,
  opportunityIdParamSchema,
} from "./site-survey.validation";
import * as siteSurveyController from "./site-survey.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  "/",
  authorize("survey:create"),
  validate(opportunityIdParamSchema, "params"),
  validate(createSiteSurveySchema),
  siteSurveyController.createSiteSurvey
);

router.get(
  "/",
  authorize("survey:read"),
  validate(opportunityIdParamSchema, "params"),
  siteSurveyController.getSiteSurvey
);

router.patch(
  "/",
  authorize("survey:update"),
  validate(opportunityIdParamSchema, "params"),
  validate(updateSiteSurveySchema),
  siteSurveyController.updateSiteSurvey
);

router.delete(
  "/",
  authorize("survey:delete"),
  validate(opportunityIdParamSchema, "params"),
  siteSurveyController.deleteSiteSurvey
);

export default router;