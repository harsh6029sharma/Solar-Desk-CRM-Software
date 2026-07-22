// src/modules/users/users.routes.ts (updated)
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { listUsers, registerUser } from "./user.controller";
import { createUserSchema } from "./user.validation";

const router = Router();

router.get("/", authenticate, authorize("user:read"), listUsers);
router.post("/", authenticate, authorize("user:create"), validate(createUserSchema), registerUser);

export default router