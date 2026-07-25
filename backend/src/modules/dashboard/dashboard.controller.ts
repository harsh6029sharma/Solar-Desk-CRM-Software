import type { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import asyncHandler from "../../utils/asyncHandler";
import { prisma } from "../../lib/prisma";

export const getDashboardStatsHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.orgId;

  const [
    leadsCount,
    opportunitiesCount,
    tasksCount,
    installationsCount,
    quotationsCount,
    revenueData
  ] = await Promise.all([
    prisma.lead.groupBy({
      by: ["status"],
      where: { organizationId, isActive: true },
      _count: { _all: true },
    }),
    prisma.opportunity.groupBy({
      by: ["stage"],
      where: { organizationId, isActive: true },
      _count: { _all: true },
    }),
    prisma.task.count({
      where: { organizationId, status: { in: ["PENDING", "IN_PROGRESS"] } },
    }),
    prisma.installation.count({
      where: { organizationId, status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
    }),
    prisma.quotation.count({
      where: { organizationId, status: "ACCEPTED" },
    }),
    prisma.quotation.aggregate({
      where: { organizationId, status: "ACCEPTED" },
      _sum: { totalAmount: true },
    }),
  ]);

  const stats = {
    leadsCount: leadsCount.map((l) => ({ status: l.status, count: l._count._all })),
    opportunitiesCount: opportunitiesCount.map((o) => ({ stage: o.stage, count: o._count._all })),
    pendingTasks: tasksCount,
    pendingInstallations: installationsCount,
    acceptedQuotations: quotationsCount,
    totalRevenue: Number(revenueData._sum.totalAmount ?? 0),
  };

  res.status(200).json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
});
