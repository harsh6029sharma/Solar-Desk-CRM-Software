import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  addLead,
  listLeads,
  getLead,
  editLead,
  changeLeadStatus,
  removeLead,
} from "./leads.controller";
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  leadQuerySchema,
  leadIdParamSchema,
} from "./leads.validation";

const router = Router();

router.get("/", authenticate, authorize("lead:read"), validate(leadQuerySchema, "query"), listLeads);
router.post("/", authenticate, authorize("lead:create"), validate(createLeadSchema), addLead);
router.get("/:id", authenticate, authorize("lead:read"), validate(leadIdParamSchema, "params"), getLead);
router.patch(
  "/:id",
  authenticate,
  authorize("lead:update"),
  validate(leadIdParamSchema, "params"),
  validate(updateLeadSchema),
  editLead
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("lead:update"),
  validate(leadIdParamSchema, "params"),
  validate(updateLeadStatusSchema),
  changeLeadStatus
);
router.delete("/:id", authenticate, authorize("lead:delete"), validate(leadIdParamSchema, "params"), removeLead);

export const leadsRouter = router;