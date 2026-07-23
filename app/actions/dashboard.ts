import { prisma } from "@/lib/prisma";
import { OPEN_OPPORTUNITY_STAGES } from "@/lib/opportunity";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/lead";

export async function getDashboardKpis() {
  const [
    leadsCount,
    openOpportunities,
    overdueTasksCount,
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
    leadsByStatus,
    leadsBySource,
  };
}
