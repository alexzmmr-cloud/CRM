"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadSource,
  type LeadStatus,
} from "@/lib/lead";
import { createLead, updateLead } from "@/app/actions/lead";

type LeadFormValues = {
  id?: string;
  name?: string;
  company?: string | null;
  contact?: string | null;
  note?: string | null;
  source?: LeadSource;
  status?: LeadStatus;
};

export function LeadForm({ lead }: { lead?: LeadFormValues }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(lead?.id);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        isEdit && lead?.id
          ? await updateLead(lead.id, formData)
          : await createLead(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (isEdit) {
        router.refresh();
      } else {
        formRef.current?.reset();
        router.push(`/leads?leadId=${result.lead.id}`);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="lead-form">
      {error && <p className="form-error">{error}</p>}
      <label>
        Имя
        <input name="name" defaultValue={lead?.name ?? ""} required />
      </label>
      <label>
        Компания
        <input name="company" defaultValue={lead?.company ?? ""} />
      </label>
      <label>
        Контакт (email/телефон)
        <input name="contact" defaultValue={lead?.contact ?? ""} />
      </label>
      <label>
        Заметка
        <textarea name="note" defaultValue={lead?.note ?? ""} />
      </label>
      <label>
        Источник
        <select name="source" defaultValue={lead?.source ?? ""} required>
          <option value="" disabled>
            Выберите источник
          </option>
          {LEAD_SOURCES.map((source) => (
            <option key={source} value={source}>
              {LEAD_SOURCE_LABELS[source]}
            </option>
          ))}
        </select>
      </label>
      {isEdit && (
        <label>
          Статус
          <select name="status" defaultValue={lead?.status ?? "new"}>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      )}
      <button type="submit" disabled={isPending}>
        {isEdit ? "Сохранить" : "Создать лида"}
      </button>
    </form>
  );
}
