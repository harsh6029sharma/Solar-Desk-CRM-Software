import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { login, me, logout, refresh } from "./auth.controller";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, me);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;