"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { OPPORTUNITY_STAGES } from "@/lib/opportunity";
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
});

export type OpportunityFilters = {
  q?: string;
  stage?: string;
};

export async function getOpportunities(filters: OpportunityFilters = {}) {
  const { q, stage } = filters;
  return prisma.opportunity.findMany({
    where: {
      AND: [
        q ? { title: { contains: q, mode: "insensitive" } } : {},
        stage ? { stage } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { account: true, contact: true, lead: true },
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

export type OpportunityActionResult =
  | {
      ok: true;
      opportunity: Awaited<ReturnType<typeof prisma.opportunity.create>>;
    }
  | { ok: false; error: string };

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
    return { ok: true, opportunity };
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
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/opportunities");
    return { ok: true, opportunity };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить сделку. Попробуйте ещё раз.",
    };
  }
}

export async function updateOpportunityStage(id: string, stage: string) {
  if (!OPPORTUNITY_STAGES.includes(stage as (typeof OPPORTUNITY_STAGES)[number])) {
    return { ok: false as const, error: "Недопустимая стадия сделки" };
  }
  try {
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: { stage },
    });
    revalidatePath("/opportunities");
    return { ok: true as const, opportunity };
  } catch {
    return {
      ok: false as const,
      error: "Не удалось изменить стадию. Попробуйте ещё раз.",
    };
  }
}
