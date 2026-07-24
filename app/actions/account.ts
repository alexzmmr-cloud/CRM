"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { formValues } from "@/lib/form";
import { revalidatePath } from "next/cache";

const ACCOUNT_FORM_KEYS = ["name", "website", "industry", "phone"] as const;

const accountInputSchema = z.object({
  name: z.string().trim().min(1, "Укажите название компании"),
  website: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export type AccountFilters = {
  q?: string;
};

export async function getAccounts(filters: AccountFilters = {}) {
  const { q } = filters;
  return prisma.account.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
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
  const parsed = accountInputSchema.safeParse(
    formValues(formData, ACCOUNT_FORM_KEYS),
  );

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const account = await prisma.account.create({ data: parsed.data });
    revalidatePath("/accounts");
    revalidatePath(`/accounts/${account.id}`);
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
  const parsed = accountInputSchema.safeParse(
    formValues(formData, ACCOUNT_FORM_KEYS),
  );

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const account = await prisma.account.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/accounts");
    revalidatePath(`/accounts/${account.id}`);
    return { ok: true, account };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить компанию. Попробуйте ещё раз.",
    };
  }
}
