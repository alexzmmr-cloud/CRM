"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const contactInputSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя контакта"),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  role: z.string().trim().optional(),
  accountId: z.string().trim().optional(),
});

export async function getContacts() {
  return prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
    include: { account: true },
  });
}

export async function getContact(id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: { account: true, opportunities: true },
  });
}

export type ContactActionResult =
  | { ok: true; contact: Awaited<ReturnType<typeof prisma.contact.create>> }
  | { ok: false; error: string };

export async function createContact(
  formData: FormData,
): Promise<ContactActionResult> {
  const parsed = contactInputSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    role: formData.get("role") || undefined,
    accountId: formData.get("accountId") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const contact = await prisma.contact.create({ data: parsed.data });
    revalidatePath("/contacts");
    return { ok: true, contact };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить контакт. Попробуйте ещё раз.",
    };
  }
}

export async function updateContact(
  id: string,
  formData: FormData,
): Promise<ContactActionResult> {
  const parsed = contactInputSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    role: formData.get("role") || undefined,
    accountId: formData.get("accountId") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const contact = await prisma.contact.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/contacts");
    return { ok: true, contact };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить контакт. Попробуйте ещё раз.",
    };
  }
}
