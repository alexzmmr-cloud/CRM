"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createAccount, updateAccount } from "@/app/actions/account";

type AccountFormValues = {
  id?: string;
  name?: string;
  website?: string | null;
  industry?: string | null;
  phone?: string | null;
};

export function AccountForm({
  account,
  onSuccess,
  layout = "vertical",
}: {
  account?: AccountFormValues;
  onSuccess?: () => void;
  layout?: "vertical" | "horizontal";
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(account?.id);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        isEdit && account?.id
          ? await updateAccount(account.id, formData)
          : await createAccount(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (isEdit) {
        router.refresh();
      } else {
        formRef.current?.reset();
        onSuccess?.();
        router.push(`/accounts/${result.account.id}`);
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className={layout === "horizontal" ? "entity-form-grid" : "lead-form"}
    >
      {error && <p className="form-error">{error}</p>}
      <label>
        Название
        <input name="name" defaultValue={account?.name ?? ""} required />
      </label>
      <label>
        Сайт
        <input name="website" defaultValue={account?.website ?? ""} />
      </label>
      <label>
        Род деятельности
        <input name="industry" defaultValue={account?.industry ?? ""} />
      </label>
      <label>
        Телефон
        <input name="phone" defaultValue={account?.phone ?? ""} />
      </label>
      <button type="submit" disabled={isPending}>
        {isEdit ? "Сохранить" : "Создать компанию"}
      </button>
    </form>
  );
}
