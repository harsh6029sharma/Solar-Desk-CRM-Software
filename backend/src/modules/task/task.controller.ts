import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as taskService from "./task.service";
import type { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, TaskQueryInput } from "./task.validation";
import asyncHandler from "../../utils/asyncHandler";

export const createTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const task = await taskService.createTask(organizationId, opportunityId, req.body as CreateTaskInput);
  res.status(201).json(new ApiResponse(201, task, "Task created"));
});

export const getAllTasksHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const { opportunityId } = req.params as unknown as { opportunityId: string };
  const query = req.query as unknown as TaskQueryInput;
  const tasks = await taskService.getAllTasks(organizationId, opportunityId, query);
  res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched"));
});

export const getTaskByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const { opportunityId, id } = req.params as unknown as { opportunityId: string; id: string };
  const task = await taskService.getTaskById(organizationId, opportunityId, id);
  res.status(200).json(new ApiResponse(200, task, "Task fetched"));
});

export const updateTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const { opportunityId, id } = req.params as unknown as { opportunityId: string; id: string };
  const task = await taskService.updateTask(organizationId, opportunityId, id, req.body as UpdateTaskInput);
  res.status(200).json(new ApiResponse(200, task, "Task updated"));
});

export const updateTaskStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const { opportunityId, id } = req.params as unknown as { opportunityId: string; id: string };
  const task = await taskService.updateTaskStatus(
    organizationId,
    opportunityId,
    id,
    req.body as UpdateTaskStatusInput
  );
  res.status(200).json(new ApiResponse(200, task, "Task status updated"));
});

export const deleteTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;
  const { opportunityId, id } = req.params as unknown as { opportunityId: string; id: string };
  await taskService.deleteTask(organizationId, opportunityId, id);
  res.status(200).json(new ApiResponse(200, null, "Task deleted"));
});