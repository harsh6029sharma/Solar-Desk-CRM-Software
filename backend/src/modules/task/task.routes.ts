import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  taskParamsSchema,
  taskIdParamsSchema,
} from "./task.validation";
import {
  createTaskHandler,
  getAllTasksHandler,
  getTaskByIdHandler,
  updateTaskHandler,
  updateTaskStatusHandler,
  deleteTaskHandler,
} from "./task.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  "/",
  authorize("task:create"),
  validate(taskParamsSchema, "params"),
  validate(createTaskSchema, "body"),
  createTaskHandler
);

router.get(
  "/",
  authorize("task:read"),
  validate(taskParamsSchema, "params"),
  validate(taskQuerySchema, "query"),
  getAllTasksHandler
);

router.get(
  "/:id",
  authorize("task:read"),
  validate(taskIdParamsSchema, "params"),
  getTaskByIdHandler
);

router.patch(
  "/:id",
  authorize("task:update"),
  validate(taskIdParamsSchema, "params"),
  validate(updateTaskSchema, "body"),
  updateTaskHandler
);

router.patch(
  "/:id/status",
  authorize("task:update"),
  validate(taskIdParamsSchema, "params"),
  validate(updateTaskStatusSchema, "body"),
  updateTaskStatusHandler
);

router.delete(
  "/:id",
  authorize("task:delete"),
  validate(taskIdParamsSchema, "params"),
  deleteTaskHandler
);

export default router;