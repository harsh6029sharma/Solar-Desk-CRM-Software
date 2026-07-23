import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdParamSchema,
} from "./product.validation";
import {
  createProductHandler,
  getAllProductsHandler,
  getProductByIdHandler,
  updateProductHandler,
  deactivateProductHandler,
} from "./product.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("product:create"),
  validate(createProductSchema, "body"),
  createProductHandler
);

router.get(
  "/",
  authorize("product:read"),
  validate(productQuerySchema, "query"),
  getAllProductsHandler
);

router.get(
  "/:id",
  authorize("product:read"),
  validate(productIdParamSchema, "params"),
  getProductByIdHandler
);

router.patch(
  "/:id",
  authorize("product:update"),
  validate(productIdParamSchema, "params"),
  validate(updateProductSchema, "body"),
  updateProductHandler
);

router.delete(
  "/:id",
  authorize("product:delete"),
  validate(productIdParamSchema, "params"),
  deactivateProductHandler
);

export default router