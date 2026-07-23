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

export async function createLead(formData: FormData) {
  const parsed = leadInputSchema.parse({
    name: formData.get("name"),
    company: formData.get("company") || undefined,
    contact: formData.get("contact") || undefined,
    note: formData.get("note") || undefined,
    source: formData.get("source"),
  });

  const lead = await prisma.lead.create({ data: parsed });
  revalidatePath("/leads");
  return lead;
}

export async function updateLead(id: string, formData: FormData) {
  const parsed = leadUpdateSchema.parse({
    name: formData.get("name"),
    company: formData.get("company") || undefined,
    contact: formData.get("contact") || undefined,
    note: formData.get("note") || undefined,
    source: formData.get("source"),
    status: formData.get("status"),
  });

  const lead = await prisma.lead.update({ where: { id }, data: parsed });
  revalidatePath("/leads");
  return lead;
}
