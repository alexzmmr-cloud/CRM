"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  OPPORTUNITY_STAGES,
  OPPORTUNITY_STAGE_META,
  OPEN_OPPORTUNITY_STAGES,
  NO_OPEN_TASK_WHERE,
  isOpportunityStatus,
  type OpportunityStatus,
} from "@/lib/opportunity";
import { formValues } from "@/lib/form";
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

const OPPORTUNITY_FORM_KEYS = [
  "title",
  "amount",
  "venue",
  "timeline",
  "format",
  "accountId",
  "contactId",
] as const;
const OPPORTUNITY_UPDATE_FORM_KEYS = [
  ...OPPORTUNITY_FORM_KEYS,
  "stage",
  "lostReason",
] as const;

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
      return NO_OPEN_TASK_WHERE;
  }
}

export async function getOpportunities(filters: OpportunityFilters = {}) {
  const { q, stage, status } = filters;
  return prisma.opportunity.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { account: { name: { contains: q, mode: "insensitive" } } },
                { contact: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
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
  const parsed = opportunityInputSchema.safeParse(
    formValues(formData, OPPORTUNITY_FORM_KEYS),
  );

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

type StageTransitionCheck =
  | { ok: true; closedAt: Date | null | undefined }
  | { ok: false; error: string };

function checkStageTransition(
  currentStage: string,
  nextStage: (typeof OPPORTUNITY_STAGES)[number],
  {
    amount,
    contactId,
    lostReason,
  }: { amount: number | null | undefined; contactId: string | null | undefined; lostReason?: string },
): StageTransitionCheck {
  const isEnteringStage = currentStage !== nextStage;
  if (!isEnteringStage) {
    return { ok: true, closedAt: undefined };
  }

  if (nextStage === "won" && ((amount ?? undefined) === undefined || !contactId)) {
    return {
      ok: false,
      error:
        "Для перехода в «Выиграна» нужно заполнить бюджет и указать контакт",
    };
  }

  if (nextStage === "lost" && !lostReason?.trim()) {
    return {
      ok: false,
      error: "Для перехода в «Проиграна» укажите причину расторжения",
    };
  }

  const meta = OPPORTUNITY_STAGE_META[nextStage];
  return { ok: true, closedAt: meta.isWon || meta.isLost ? new Date() : null };
}

async function applyStageTransition(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  id: string,
  data: Record<string, unknown>,
  closedAt: Date | null | undefined,
  isEnteringLost: boolean,
  trimmedReason?: string,
) {
  const updated = await tx.opportunity.update({
    where: { id },
    data: closedAt !== undefined ? { ...data, closedAt } : data,
  });
  if (isEnteringLost && trimmedReason) {
    await tx.activity.create({
      data: {
        type: "note",
        content: `Причина расторжения: ${trimmedReason}`,
        opportunityId: id,
      },
    });
  }
  return updated;
}

export async function updateOpportunity(
  id: string,
  formData: FormData,
): Promise<OpportunityActionResult> {
  const parsed = opportunityUpdateSchema.safeParse(
    formValues(formData, OPPORTUNITY_UPDATE_FORM_KEYS),
  );

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { lostReason, ...data } = parsed.data;

  const current = await prisma.opportunity.findUnique({ where: { id } });
  if (!current) {
    return { ok: false, error: "Сделка не найдена" };
  }

  const check = checkStageTransition(current.stage, data.stage, {
    amount: data.amount,
    contactId: data.contactId,
    lostReason,
  });
  if (!check.ok) {
    return { ok: false, error: check.error };
  }

  try {
    const opportunity = await prisma.$transaction((tx) =>
      applyStageTransition(
        tx,
        id,
        data,
        check.closedAt,
        current.stage !== data.stage && data.stage === "lost",
        lostReason?.trim(),
      ),
    );
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

const stageOnlySchema = z.enum(OPPORTUNITY_STAGES);

export async function updateOpportunityStage(
  id: string,
  stage: string,
  lostReason?: string,
) {
  const parsedStage = stageOnlySchema.safeParse(stage);
  if (!parsedStage.success) {
    return { ok: false as const, error: "Недопустимая стадия сделки" };
  }
  const typedStage = parsedStage.data;

  const current = await prisma.opportunity.findUnique({ where: { id } });
  if (!current) {
    return { ok: false as const, error: "Сделка не найдена" };
  }

  const check = checkStageTransition(current.stage, typedStage, {
    amount: current.amount === null ? null : Number(current.amount),
    contactId: current.contactId,
    lostReason,
  });
  if (!check.ok) {
    return { ok: false as const, error: check.error };
  }

  try {
    const opportunity = await prisma.$transaction((tx) =>
      applyStageTransition(
        tx,
        id,
        { stage: typedStage },
        check.closedAt,
        current.stage !== typedStage && typedStage === "lost",
        lostReason?.trim(),
      ),
    );
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
