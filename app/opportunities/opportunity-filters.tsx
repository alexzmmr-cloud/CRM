import Link from "next/link";
import {
  OPPORTUNITY_STAGES,
  OPPORTUNITY_STAGE_LABELS,
  OPPORTUNITY_STATUSES,
  OPPORTUNITY_STATUS_LABELS,
} from "@/lib/opportunity";

export function OpportunityFilters({
  q,
  stage,
  status,
}: {
  q?: string;
  stage?: string;
  status?: string;
}) {
  return (
    <form className="filters" method="get">
      <input
        type="search"
        name="q"
        placeholder="Поиск по названию"
        defaultValue={q ?? ""}
      />
      <select name="stage" defaultValue={stage ?? ""}>
        <option value="">Все стадии</option>
        {OPPORTUNITY_STAGES.map((s) => (
          <option key={s} value={s}>
            {OPPORTUNITY_STAGE_LABELS[s]}
          </option>
        ))}
      </select>
      <select name="status" defaultValue={status ?? ""}>
        <option value="">Все статусы</option>
        {OPPORTUNITY_STATUSES.map((s) => (
          <option key={s} value={s}>
            {OPPORTUNITY_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button type="submit">Применить</button>
      {(q || stage || status) && <Link href="/opportunities">Сбросить</Link>}
    </form>
  );
}
