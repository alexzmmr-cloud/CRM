"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createContact, updateContact } from "@/app/actions/contact";

type ContactFormValues = {
  id?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  accountId?: string | null;
};

type AccountOption = { id: string; name: string };

export function ContactForm({
  contact,
  accounts,
}: {
  contact?: ContactFormValues;
  accounts: AccountOption[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(contact?.id);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        isEdit && contact?.id
          ? await updateContact(contact.id, formData)
          : await createContact(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (isEdit) {
        router.refresh();
      } else {
        formRef.current?.reset();
        router.push(`/contacts?contactId=${result.contact.id}`);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="lead-form">
      {error && <p className="form-error">{error}</p>}
      <label>
        Имя
        <input name="name" defaultValue={contact?.name ?? ""} required />
      </label>
      <label>
        Email
        <input name="email" defaultValue={contact?.email ?? ""} />
      </label>
      <label>
        Телефон
        <input name="phone" defaultValue={contact?.phone ?? ""} />
      </label>
      <label>
        Должность
        <input name="role" defaultValue={contact?.role ?? ""} />
      </label>
      <label>
        Компания
        <select name="accountId" defaultValue={contact?.accountId ?? ""}>
          <option value="">Без компании</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={isPending}>
        {isEdit ? "Сохранить" : "Создать контакт"}
      </button>
    </form>
  );
}
