import { Router } from "express";
import { login, getMe } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { loginSchema } from "./auth.validation";
import { authorize } from "../../middlewares/authorize";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, getMe);
router.post("/leads", authenticate, authorize("lead:create"));

export default router;