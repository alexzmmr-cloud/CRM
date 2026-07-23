"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  OPPORTUNITY_STAGES,
  OPPORTUNITY_STAGE_LABELS,
  type OpportunityStage,
} from "@/lib/opportunity";
import { createOpportunity, updateOpportunity } from "@/app/actions/opportunity";

type OpportunityFormValues = {
  id?: string;
  title?: string;
  amount?: number | string | null;
  venue?: string | null;
  timeline?: string | null;
  format?: string | null;
  accountId?: string | null;
  contactId?: string | null;
  stage?: OpportunityStage;
};

type Option = { id: string; name: string };

export function OpportunityForm({
  opportunity,
  accounts,
  contacts,
}: {
  opportunity?: OpportunityFormValues;
  accounts: Option[];
  contacts: Option[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(opportunity?.id);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        isEdit && opportunity?.id
          ? await updateOpportunity(opportunity.id, formData)
          : await createOpportunity(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (isEdit) {
        router.refresh();
      } else {
        formRef.current?.reset();
        router.push(`/opportunities?opportunityId=${result.opportunity.id}`);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="lead-form">
      {error && <p className="form-error">{error}</p>}
      <label>
        Название
        <input name="title" defaultValue={opportunity?.title ?? ""} required />
      </label>
      <label>
        Бюджет
        <input
          name="amount"
          type="number"
          step="1"
          defaultValue={opportunity?.amount ?? ""}
        />
      </label>
      <label>
        Площадка
        <input name="venue" defaultValue={opportunity?.venue ?? ""} />
      </label>
      <label>
        Сроки
        <input name="timeline" defaultValue={opportunity?.timeline ?? ""} />
      </label>
      <label>
        Формат
        <input name="format" defaultValue={opportunity?.format ?? ""} />
      </label>
      <label>
        Компания
        <select name="accountId" defaultValue={opportunity?.accountId ?? ""}>
          <option value="">Без компании</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Контакт
        <select name="contactId" defaultValue={opportunity?.contactId ?? ""}>
          <option value="">Без контакта</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name}
            </option>
          ))}
        </select>
      </label>
      {isEdit && (
        <label>
          Стадия
          <select name="stage" defaultValue={opportunity?.stage ?? "new"}>
            {OPPORTUNITY_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {OPPORTUNITY_STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </label>
      )}
      <button type="submit" disabled={isPending}>
        {isEdit ? "Сохранить" : "Создать сделку"}
      </button>
    </form>
  );
}
