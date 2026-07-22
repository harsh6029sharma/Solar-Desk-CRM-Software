import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import userRouter from "../modules/user/user.routes"
import leadsRouter from "../modules/leads/leads.routes"

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter)
router.use("/leads", leadsRouter)

export default router;