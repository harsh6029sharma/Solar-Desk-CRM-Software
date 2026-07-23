import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import userRouter from "../modules/user/user.routes"
import leadsRouter from "../modules/leads/leads.routes"
import opportunitiesRouter from "../modules/opportunities/opportunities.routes"
import quotationsRouter from "../modules/quotations/quotations.routes"
import productsRouter from "../modules/product/product.routes"

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter)
router.use("/leads", leadsRouter)
router.use("/opportunities", opportunitiesRouter)
router.use("/quotations", quotationsRouter);
router.use("/products", productsRouter)

export default router;