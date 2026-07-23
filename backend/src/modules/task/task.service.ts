import { Prisma, TaskStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, TaskQueryInput } from "./task.validation";

const getOpportunityOrThrow = async (organizationId: string, opportunityId: string) => {
  const opportunity = await prisma.opportunity.findFirst({
    where: { id: opportunityId, organizationId },
  });

  if (!opportunity) {
    throw new ApiError(404, "Opportunity not found");
  }

  return opportunity;
};

export const createTask = async (
  organizationId: string,
  opportunityId: string,
  input: CreateTaskInput
) => {
  await getOpportunityOrThrow(organizationId, opportunityId);

  const assignedUser = await prisma.user.findFirst({
    where: { id: input.assignedTo, organizationId },
  });

  if (!assignedUser) {
    throw new ApiError(400, "assignedTo must be a valid user in this organization");
  }

  const data: Prisma.TaskCreateInput = {
    title: input.title,
    organization: { connect: { id: organizationId } },
    opportunity: { connect: { id: opportunityId } },
    assignedUser: { connect: { id: input.assignedTo } },
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
  };

  return prisma.task.create({ data });
};

export const getAllTasks = async (
  organizationId: string,
  opportunityId: string,
  query: TaskQueryInput
) => {
  await getOpportunityOrThrow(organizationId, opportunityId);

  const where: Prisma.TaskWhereInput = {
    organizationId,
    opportunityId,
    ...(query.status !== undefined && { status: query.status }),
    ...(query.assignedTo !== undefined && { assignedTo: query.assignedTo }),
    ...(query.priority !== undefined && { priority: query.priority }),
  };

  return prisma.task.findMany({ where, orderBy: { createdAt: "desc" } });
};

export const getTaskById = async (organizationId: string, opportunityId: string, id: string) => {
  const task = await prisma.task.findFirst({
    where: { id, organizationId, opportunityId },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return task;
};

export const updateTask = async (
  organizationId: string,
  opportunityId: string,
  id: string,
  input: UpdateTaskInput
) => {
  await getTaskById(organizationId, opportunityId, id);

  if (input.assignedTo !== undefined) {
    const assignedUser = await prisma.user.findFirst({
      where: { id: input.assignedTo, organizationId },
    });

    if (!assignedUser) {
      throw new ApiError(400, "assignedTo must be a valid user in this organization");
    }
  }

  const data: Prisma.TaskUpdateInput = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
    ...(input.assignedTo !== undefined && { assignedUser: { connect: { id: input.assignedTo } } }),
  };

  return prisma.task.update({ where: { id }, data });
};

export const updateTaskStatus = async (
  organizationId: string,
  opportunityId: string,
  id: string,
  input: UpdateTaskStatusInput
) => {
  await getTaskById(organizationId, opportunityId, id);

  const status = input.status as TaskStatus;

  return prisma.task.update({
    where: { id },
    data: {
      status,
      ...(status === "COMPLETED" ? { completedAt: new Date() } : { completedAt: null }),
    },
  });
};

export const deleteTask = async (organizationId: string, opportunityId: string, id: string) => {
  await getTaskById(organizationId, opportunityId, id);
  await prisma.task.delete({ where: { id } });
};