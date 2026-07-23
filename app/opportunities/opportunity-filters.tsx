import { OPPORTUNITY_STAGES, OPPORTUNITY_STAGE_LABELS } from "@/lib/opportunity";

export function OpportunityFilters({
  q,
  stage,
}: {
  q?: string;
  stage?: string;
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
      <button type="submit">Применить</button>
      {(q || stage) && <a href="/opportunities">Сбросить</a>}
    </form>
  );
}
