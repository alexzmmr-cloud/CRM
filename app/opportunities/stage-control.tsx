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
  const [pendingLostReason, setPendingLostReason] = useState(false);
  const [lostReason, setLostReason] = useState("");

  function submitStage(nextStage: string, reason?: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateOpportunityStage(
        opportunityId,
        nextStage,
        reason,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPendingLostReason(false);
      setLostReason("");
      router.refresh();
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextStage = event.target.value;
    if (nextStage === "lost") {
      setError(null);
      setPendingLostReason(true);
      return;
    }
    submitStage(nextStage);
  }

  function handleConfirmLostReason(event: React.FormEvent) {
    event.preventDefault();
    submitStage("lost", lostReason);
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
      {pendingLostReason && (
        <form onSubmit={handleConfirmLostReason} className="stage-lost-reason">
          <label>
            Причина расторжения
            <input
              value={lostReason}
              onChange={(event) => setLostReason(event.target.value)}
              autoFocus
              required
            />
          </label>
          <button type="submit" disabled={isPending}>
            Подтвердить переход в «Проиграна»
          </button>
          <button
            type="button"
            onClick={() => {
              setPendingLostReason(false);
              setLostReason("");
            }}
            disabled={isPending}
          >
            Отмена
          </button>
        </form>
      )}
    </div>
  );
}
