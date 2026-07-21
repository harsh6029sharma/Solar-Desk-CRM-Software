import { Router } from "express";
import { login, getMe } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/authenticate";
import { loginSchema } from "./auth.validation";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, getMe);

export default router;