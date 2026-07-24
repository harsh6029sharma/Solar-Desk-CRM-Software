import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import userRouter from "../modules/user/user.routes"
import leadsRouter from "../modules/leads/leads.routes"
import opportunitiesRouter from "../modules/opportunities/opportunities.routes"
import quotationsRouter from "../modules/quotations/quotations.routes"
import productsRouter from "../modules/product/product.routes"
import installationRouter from "../modules/installation/installation.routes";
import contactsRouter from "../modules/contact/contacts.routes";
import roleRouter from "../modules/role/role.routes";
import taskRouter from "../modules/task/task.routes";
import permissionRouter from "../modules/permission/permission.routes";
import organizationRouter from "../modules/organization/organization.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter)
router.use("/leads", leadsRouter)
router.use("/opportunities", opportunitiesRouter)
router.use("/quotations", quotationsRouter);
router.use("/products", productsRouter)
router.use("/opportunities/:opportunityId/installation", installationRouter);
router.use("/contacts", contactsRouter);
router.use("/roles", roleRouter);
router.use("/opportunities/:opportunityId/tasks", taskRouter);
router.use("/permissions", permissionRouter);
router.use("/organizations", organizationRouter);

export default router;