"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  OPPORTUNITY_STAGES,
  OPPORTUNITY_STAGE_META,
  OPEN_OPPORTUNITY_STAGES,
  isOpportunityStatus,
  type OpportunityStatus,
} from "@/lib/opportunity";
import { revalidatePath } from "next/cache";

const opportunityInputSchema = z.object({
  title: z.string().trim().min(1, "Укажите название сделки"),
  amount: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || Number.isFinite(value), {
      message: "Бюджет должен быть числом",
    }),
  venue: z.string().trim().optional(),
  timeline: z.string().trim().optional(),
  format: z.string().trim().optional(),
  accountId: z.string().trim().optional(),
  contactId: z.string().trim().optional(),
});

const opportunityUpdateSchema = opportunityInputSchema.extend({
  stage: z.enum(OPPORTUNITY_STAGES),
  lostReason: z.string().trim().optional(),
});

export type OpportunityFilters = {
  q?: string;
  stage?: string;
  status?: string;
};

function statusWhereClause(status?: string) {
  if (!status || !isOpportunityStatus(status)) return {};
  switch (status as OpportunityStatus) {
    case "won":
      return { stage: "won" };
    case "lost":
      return { stage: "lost" };
    case "open":
      return { stage: { in: OPEN_OPPORTUNITY_STAGES } };
    case "stuck":
      return { activities: { none: { type: "task", done: false } } };
  }
}

export async function getOpportunities(filters: OpportunityFilters = {}) {
  const { q, stage, status } = filters;
  return prisma.opportunity.findMany({
    where: {
      AND: [
        q ? { title: { contains: q, mode: "insensitive" } } : {},
        stage ? { stage } : {},
        statusWhereClause(status),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      account: true,
      contact: true,
      lead: true,
      activities: { where: { type: "task", done: false }, select: { id: true } },
    },
  });
}

export async function getOpportunity(id: string) {
  return prisma.opportunity.findUnique({
    where: { id },
    include: {
      account: true,
      contact: true,
      lead: true,
      activities: { orderBy: { createdAt: "desc" } },
    },
  });
}

type SerializedOpportunity = Omit<
  Awaited<ReturnType<typeof prisma.opportunity.create>>,
  "amount"
> & { amount: number | null };

export type OpportunityActionResult =
  | {
      ok: true;
      opportunity: SerializedOpportunity;
    }
  | { ok: false; error: string };

function serializeOpportunity(
  opportunity: Awaited<ReturnType<typeof prisma.opportunity.create>>,
): SerializedOpportunity {
  return {
    ...opportunity,
    amount: opportunity.amount ? Number(opportunity.amount) : null,
  };
}

export async function createOpportunity(
  formData: FormData,
): Promise<OpportunityActionResult> {
  const parsed = opportunityInputSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount") || undefined,
    venue: formData.get("venue") || undefined,
    timeline: formData.get("timeline") || undefined,
    format: formData.get("format") || undefined,
    accountId: formData.get("accountId") || undefined,
    contactId: formData.get("contactId") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const opportunity = await prisma.opportunity.create({ data: parsed.data });
    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${opportunity.id}`);
    return { ok: true, opportunity: serializeOpportunity(opportunity) };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить сделку. Попробуйте ещё раз.",
    };
  }
}

export async function updateOpportunity(
  id: string,
  formData: FormData,
): Promise<OpportunityActionResult> {
  const parsed = opportunityUpdateSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount") || undefined,
    venue: formData.get("venue") || undefined,
    timeline: formData.get("timeline") || undefined,
    format: formData.get("format") || undefined,
    accountId: formData.get("accountId") || undefined,
    contactId: formData.get("contactId") || undefined,
    stage: formData.get("stage"),
    lostReason: formData.get("lostReason") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { lostReason, ...data } = parsed.data;

  const current = await prisma.opportunity.findUnique({ where: { id } });
  if (!current) {
    return { ok: false, error: "Сделка не найдена" };
  }
  const isEnteringStage = current.stage !== data.stage;

  if (
    isEnteringStage &&
    data.stage === "won" &&
    (data.amount === undefined || !data.contactId)
  ) {
    return {
      ok: false,
      error:
        "Для перехода в «Выиграна» нужно заполнить бюджет и указать контакт",
    };
  }

  const trimmedReason = lostReason?.trim();
  if (isEnteringStage && data.stage === "lost" && !trimmedReason) {
    return {
      ok: false,
      error: "Для перехода в «Проиграна» укажите причину расторжения",
    };
  }

  const closedAt = isEnteringStage
    ? OPPORTUNITY_STAGE_META[data.stage].isWon || OPPORTUNITY_STAGE_META[data.stage].isLost
      ? new Date()
      : null
    : undefined;

  try {
    const opportunity = await prisma.$transaction(async (tx) => {
      const updated = await tx.opportunity.update({
        where: { id },
        data: closedAt !== undefined ? { ...data, closedAt } : data,
      });
      if (isEnteringStage && data.stage === "lost" && trimmedReason) {
        await tx.activity.create({
          data: {
            type: "note",
            content: `Причина расторжения: ${trimmedReason}`,
            opportunityId: id,
          },
        });
      }
      return updated;
    });
    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${opportunity.id}`);
    return { ok: true, opportunity: serializeOpportunity(opportunity) };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить сделку. Попробуйте ещё раз.",
    };
  }
}

export async function updateOpportunityStage(
  id: string,
  stage: string,
  lostReason?: string,
) {
  if (!OPPORTUNITY_STAGES.includes(stage as (typeof OPPORTUNITY_STAGES)[number])) {
    return { ok: false as const, error: "Недопустимая стадия сделки" };
  }

  const current = await prisma.opportunity.findUnique({ where: { id } });
  if (!current) {
    return { ok: false as const, error: "Сделка не найдена" };
  }
  const isEnteringStage = current.stage !== stage;

  if (
    isEnteringStage &&
    stage === "won" &&
    (current.amount === null || !current.contactId)
  ) {
    return {
      ok: false as const,
      error:
        "Для перехода в «Выиграна» нужно заполнить бюджет и указать контакт",
    };
  }

  const trimmedReason = lostReason?.trim();
  if (isEnteringStage && stage === "lost" && !trimmedReason) {
    return {
      ok: false as const,
      error: "Для перехода в «Проиграна» укажите причину расторжения",
    };
  }

  const typedStage = stage as (typeof OPPORTUNITY_STAGES)[number];
  const closedAt = isEnteringStage
    ? OPPORTUNITY_STAGE_META[typedStage].isWon || OPPORTUNITY_STAGE_META[typedStage].isLost
      ? new Date()
      : null
    : undefined;

  try {
    const opportunity = await prisma.$transaction(async (tx) => {
      const updated = await tx.opportunity.update({
        where: { id },
        data: closedAt !== undefined ? { stage, closedAt } : { stage },
      });
      if (isEnteringStage && stage === "lost" && trimmedReason) {
        await tx.activity.create({
          data: {
            type: "note",
            content: `Причина расторжения: ${trimmedReason}`,
            opportunityId: id,
          },
        });
      }
      return updated;
    });
    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${opportunity.id}`);
    return { ok: true as const, opportunity: serializeOpportunity(opportunity) };
  } catch {
    return {
      ok: false as const,
      error: "Не удалось изменить стадию. Попробуйте ещё раз.",
    };
  }
}
