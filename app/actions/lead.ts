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

export type LeadFilters = {
  q?: string;
  source?: string;
  status?: string;
};

export async function getLeads(filters: LeadFilters = {}) {
  const { q, source, status } = filters;
  return prisma.lead.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { company: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        source ? { source } : {},
        status ? { status } : {},
      ],
    },
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

export type ConvertLeadResult =
  | {
      ok: true;
      opportunity: Awaited<ReturnType<typeof prisma.opportunity.create>>;
    }
  | { ok: false; error: string };

export async function convertLead(id: string): Promise<ConvertLeadResult> {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { opportunity: true },
  });

  if (!lead) {
    return { ok: false, error: "Лид не найден." };
  }

  if (lead.status === "converted" && lead.opportunity) {
    return { ok: true, opportunity: lead.opportunity };
  }

  const contactValue = lead.contact?.trim();
  const isEmail = contactValue?.includes("@") ?? false;

  try {
    const opportunity = await prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: { name: lead.company?.trim() || lead.name },
      });
      const contact = await tx.contact.create({
        data: {
          name: lead.name,
          email: isEmail ? contactValue : undefined,
          phone: !isEmail ? contactValue : undefined,
          accountId: account.id,
        },
      });
      const createdOpportunity = await tx.opportunity.create({
        data: {
          title: `Сделка: ${lead.name}`,
          accountId: account.id,
          contactId: contact.id,
          leadId: lead.id,
        },
      });
      await tx.lead.update({
        where: { id: lead.id },
        data: { status: "converted" },
      });
      return createdOpportunity;
    });

    revalidatePath("/leads");
    revalidatePath(`/leads/${lead.id}`);
    revalidatePath("/accounts");
    revalidatePath("/contacts");
    revalidatePath("/opportunities");
    return { ok: true, opportunity };
  } catch {
    return {
      ok: false,
      error: "Не удалось конвертировать лида. Попробуйте ещё раз.",
    };
  }
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
    revalidatePath(`/leads/${lead.id}`);
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
    revalidatePath(`/leads/${lead.id}`);
    return { ok: true, lead };
  } catch {
    return { ok: false, error: "Не удалось сохранить лида. Попробуйте ещё раз." };
  }
}
