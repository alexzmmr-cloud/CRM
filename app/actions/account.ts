"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const accountInputSchema = z.object({
  name: z.string().trim().min(1, "Укажите название компании"),
  website: z.string().trim().optional(),
});

export async function getAccounts() {
  return prisma.account.findMany({
    orderBy: { createdAt: "desc" },
    include: { contacts: true, opportunities: true },
  });
}

export async function getAccount(id: string) {
  return prisma.account.findUnique({
    where: { id },
    include: { contacts: true, opportunities: true },
  });
}

export type AccountActionResult =
  | { ok: true; account: Awaited<ReturnType<typeof prisma.account.create>> }
  | { ok: false; error: string };

export async function createAccount(
  formData: FormData,
): Promise<AccountActionResult> {
  const parsed = accountInputSchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const account = await prisma.account.create({ data: parsed.data });
    revalidatePath("/accounts");
    return { ok: true, account };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить компанию. Попробуйте ещё раз.",
    };
  }
}

export async function updateAccount(
  id: string,
  formData: FormData,
): Promise<AccountActionResult> {
  const parsed = accountInputSchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const account = await prisma.account.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/accounts");
    return { ok: true, account };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить компанию. Попробуйте ещё раз.",
    };
  }
}
