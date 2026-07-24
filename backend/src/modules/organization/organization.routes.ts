import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { updateOrganizationSchema } from "./organization.validation";
import { getMyOrganizationHandler, updateMyOrganizationHandler } from "./organization.controller";

const router = Router();

router.use(authenticate);

router.get("/me", authorize("organization:read"), getMyOrganizationHandler);

router.patch(
  "/me",
  authorize("organization:update"),
  validate(updateOrganizationSchema, "body"),
  updateMyOrganizationHandler
);

export default router;