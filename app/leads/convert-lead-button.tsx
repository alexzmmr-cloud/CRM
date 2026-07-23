"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { convertLead } from "@/app/actions/lead";

export function ConvertLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await convertLead(leadId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="convert-lead">
      {error && <p className="form-error">{error}</p>}
      <button type="button" onClick={handleClick} disabled={isPending}>
        {isPending ? "Конвертация..." : "Конвертировать лида"}
      </button>
    </div>
  );
}
