import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { getDashboardStatsHandler } from "./dashboard.controller";

const router = Router();

router.use(authenticate);

router.get("/stats", getDashboardStatsHandler);

export default router;
