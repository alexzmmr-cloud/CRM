import { prisma } from "@/lib/prisma";
import {
  OPEN_OPPORTUNITY_STAGES,
  OPPORTUNITY_STAGES,
  NO_OPEN_TASK_WHERE,
} from "@/lib/opportunity";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/lead";

export async function getDashboardKpis() {
  const [
    leadsCount,
    openOpportunities,
    overdueTasksCount,
    stuckDealsCount,
    leadsByStatusRaw,
    leadsBySourceRaw,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.opportunity.findMany({
      where: { stage: { in: OPEN_OPPORTUNITY_STAGES } },
      select: { amount: true },
    }),
    prisma.activity.count({
      where: { type: "task", done: false, dueDate: { lt: new Date() } },
    }),
    prisma.opportunity.count({ where: NO_OPEN_TASK_WHERE }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["source"], _count: { _all: true } }),
  ]);

  const openOpportunitiesSum = openOpportunities.reduce(
    (sum, { amount }) => sum + (amount ? Number(amount) : 0),
    0,
  );

  const leadsByStatus = Object.fromEntries(
    LEAD_STATUSES.map((status) => [
      status,
      leadsByStatusRaw.find((row) => row.status === status)?._count._all ?? 0,
    ]),
  ) as Record<(typeof LEAD_STATUSES)[number], number>;

  const leadsBySource = Object.fromEntries(
    LEAD_SOURCES.map((source) => [
      source,
      leadsBySourceRaw.find((row) => row.source === source)?._count._all ?? 0,
    ]),
  ) as Record<(typeof LEAD_SOURCES)[number], number>;

  return {
    leadsCount,
    openOpportunitiesCount: openOpportunities.length,
    openOpportunitiesSum,
    overdueTasksCount,
    stuckDealsCount,
    leadsByStatus,
    leadsBySource,
  };
}

export async function getOpportunitiesByStage() {
  const rows = await prisma.opportunity.groupBy({
    by: ["stage"],
    _count: { _all: true },
  });

  return Object.fromEntries(
    OPPORTUNITY_STAGES.map((stage) => [
      stage,
      rows.find((row) => row.stage === stage)?._count._all ?? 0,
    ]),
  ) as Record<(typeof OPPORTUNITY_STAGES)[number], number>;
}

export async function getRecentLeads(limit = 5) {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getOverdueTasks(limit = 5) {
  return prisma.activity.findMany({
    where: { type: "task", done: false, dueDate: { lt: new Date() } },
    orderBy: { dueDate: "asc" },
    take: limit,
    include: { opportunity: true },
  });
}

export async function getStuckDeals(limit = 5) {
  return prisma.opportunity.findMany({
    where: NO_OPEN_TASK_WHERE,
    orderBy: { updatedAt: "asc" },
    take: limit,
    include: { account: true },
  });
}
