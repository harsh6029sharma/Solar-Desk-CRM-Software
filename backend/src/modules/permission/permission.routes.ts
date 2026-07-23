import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { getAllPermissionsHandler, getPermissionByIdHandler } from "./permission.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("role:read"), getAllPermissionsHandler);
router.get("/:id", authorize("role:read"), getPermissionByIdHandler);

export default router;