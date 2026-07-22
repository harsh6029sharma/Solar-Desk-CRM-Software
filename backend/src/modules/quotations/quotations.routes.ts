import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createQuotationSchema,
  updateQuotationSchema,
  updateQuotationStatusSchema,
  quotationQuerySchema,
  quotationIdParamSchema,
} from "./quotations.validation";
import * as quotationController from "./quotations.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("quotation:create"),
  validate(createQuotationSchema),
  quotationController.createQuotation
);

router.get(
  "/",
  authorize("quotation:read"),
  validate(quotationQuerySchema, "query"),
  quotationController.getAllQuotations
);

router.get(
  "/:id",
  authorize("quotation:read"),
  validate(quotationIdParamSchema, "params"),
  quotationController.getQuotationById
);

router.patch(
  "/:id",
  authorize("quotation:update"),
  validate(quotationIdParamSchema, "params"),
  validate(updateQuotationSchema),
  quotationController.updateQuotation
);

router.patch(
  "/:id/status",
  authorize("quotation:update"),
  validate(quotationIdParamSchema, "params"),
  validate(updateQuotationStatusSchema),
  quotationController.updateQuotationStatus
);

router.delete(
  "/:id",
  authorize("quotation:delete"),
  validate(quotationIdParamSchema, "params"),
  quotationController.deleteQuotation
);

export default router;