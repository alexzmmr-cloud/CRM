"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  OPPORTUNITY_STAGES,
  OPPORTUNITY_STAGE_LABELS,
  type OpportunityStage,
} from "@/lib/opportunity";
import { updateOpportunityStage } from "@/app/actions/opportunity";

export function StageControl({
  opportunityId,
  stage,
}: {
  opportunityId: string;
  stage: OpportunityStage;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextStage = event.target.value;
    setError(null);
    startTransition(async () => {
      const result = await updateOpportunityStage(opportunityId, nextStage);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="stage-control">
      {error && <p className="form-error">{error}</p>}
      <label>
        Быстрая смена стадии
        <select value={stage} onChange={handleChange} disabled={isPending}>
          {OPPORTUNITY_STAGES.map((s) => (
            <option key={s} value={s}>
              {OPPORTUNITY_STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
