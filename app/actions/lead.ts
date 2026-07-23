"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/lead";
import { revalidatePath } from "next/cache";

const leadInputSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя лида"),
  company: z.string().trim().optional(),
  contact: z.string().trim().optional(),
  note: z.string().trim().optional(),
  source: z.enum(LEAD_SOURCES),
});

const leadUpdateSchema = leadInputSchema.extend({
  status: z.enum(LEAD_STATUSES),
});

export async function getLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { opportunity: true },
  });
}

export async function getLead(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: { opportunity: { include: { account: true, contact: true } } },
  });
}

export type LeadActionResult =
  | { ok: true; lead: Awaited<ReturnType<typeof prisma.lead.create>> }
  | { ok: false; error: string };

export async function createLead(
  formData: FormData,
): Promise<LeadActionResult> {
  const parsed = leadInputSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company") || undefined,
    contact: formData.get("contact") || undefined,
    note: formData.get("note") || undefined,
    source: formData.get("source"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const lead = await prisma.lead.create({ data: parsed.data });
    revalidatePath("/leads");
    return { ok: true, lead };
  } catch {
    return { ok: false, error: "Не удалось сохранить лида. Попробуйте ещё раз." };
  }
}

export async function updateLead(
  id: string,
  formData: FormData,
): Promise<LeadActionResult> {
  const parsed = leadUpdateSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company") || undefined,
    contact: formData.get("contact") || undefined,
    note: formData.get("note") || undefined,
    source: formData.get("source"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const lead = await prisma.lead.update({ where: { id }, data: parsed.data });
    revalidatePath("/leads");
    return { ok: true, lead };
  } catch {
    return { ok: false, error: "Не удалось сохранить лида. Попробуйте ещё раз." };
  }
}
