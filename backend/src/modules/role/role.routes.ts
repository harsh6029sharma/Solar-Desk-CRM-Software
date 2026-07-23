import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createRoleSchema,
  updateRoleSchema,
  setRolePermissionsSchema,
  roleIdParamSchema,
} from "./role.validation";
import {
  createRoleHandler,
  getAllRolesHandler,
  getRoleByIdHandler,
  updateRoleHandler,
  deleteRoleHandler,
  setRolePermissionsHandler,
} from "./role.controller";

const router = Router();

router.use(authenticate);

router.post("/", authorize("role:create"), validate(createRoleSchema, "body"), createRoleHandler);

router.get("/", authorize("role:read"), getAllRolesHandler);

router.get(
  "/:id",
  authorize("role:read"),
  validate(roleIdParamSchema, "params"),
  getRoleByIdHandler
);

router.patch(
  "/:id",
  authorize("role:update"),
  validate(roleIdParamSchema, "params"),
  validate(updateRoleSchema, "body"),
  updateRoleHandler
);

router.delete(
  "/:id",
  authorize("role:delete"),
  validate(roleIdParamSchema, "params"),
  deleteRoleHandler
);

router.patch(
  "/:id/permissions",
  authorize("role:update"),
  validate(roleIdParamSchema, "params"),
  validate(setRolePermissionsSchema, "body"),
  setRolePermissionsHandler
);

export default router;