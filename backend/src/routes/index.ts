import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import userRouter from "../modules/user/user.routes"
import leadsRouter from "../modules/leads/leads.routes"
import siteSurveyRouter from "../modules/site-survey/site-survey.routes"
import opportunitiesRouter from "../modules/opportunities/opportunities.routes"

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter)
router.use("/leads", leadsRouter)
router.use("/opportunities", opportunitiesRouter)

export default router;