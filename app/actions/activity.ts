"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const noteInputSchema = z.object({
  opportunityId: z.string().trim().min(1),
  content: z.string().trim().min(1, "Укажите текст заметки"),
});

const taskInputSchema = z.object({
  opportunityId: z.string().trim().min(1),
  content: z.string().trim().min(1, "Укажите текст задачи"),
  dueDate: z.string().trim().min(1, "Укажите срок задачи"),
});

export type ActivityActionResult =
  | { ok: true; activity: Awaited<ReturnType<typeof prisma.activity.create>> }
  | { ok: false; error: string };

export async function addNote(
  formData: FormData,
): Promise<ActivityActionResult> {
  const parsed = noteInputSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const activity = await prisma.activity.create({
      data: {
        type: "note",
        content: parsed.data.content,
        opportunityId: parsed.data.opportunityId,
      },
    });
    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${activity.opportunityId}`);
    return { ok: true, activity };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить заметку. Попробуйте ещё раз.",
    };
  }
}

export async function addTask(
  formData: FormData,
): Promise<ActivityActionResult> {
  const parsed = taskInputSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    content: formData.get("content"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const activity = await prisma.activity.create({
      data: {
        type: "task",
        content: parsed.data.content,
        dueDate: new Date(parsed.data.dueDate),
        done: false,
        opportunityId: parsed.data.opportunityId,
      },
    });
    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${activity.opportunityId}`);
    return { ok: true, activity };
  } catch {
    return {
      ok: false,
      error: "Не удалось сохранить задачу. Попробуйте ещё раз.",
    };
  }
}

export async function setTaskDone(id: string, done: boolean) {
  try {
    const activity = await prisma.activity.update({
      where: { id },
      data: { done },
    });
    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${activity.opportunityId}`);
    return { ok: true as const, activity };
  } catch {
    return {
      ok: false as const,
      error: "Не удалось изменить статус задачи. Попробуйте ещё раз.",
    };
  }
}
