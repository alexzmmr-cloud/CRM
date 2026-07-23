import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "@/lib/lead";

export function LeadFilters({
  q,
  source,
  status,
}: {
  q?: string;
  source?: string;
  status?: string;
}) {
  return (
    <form className="filters" method="get">
      <input
        type="search"
        name="q"
        placeholder="Поиск по имени или компании"
        defaultValue={q ?? ""}
      />
      <select name="source" defaultValue={source ?? ""}>
        <option value="">Все источники</option>
        {LEAD_SOURCES.map((s) => (
          <option key={s} value={s}>
            {LEAD_SOURCE_LABELS[s]}
          </option>
        ))}
      </select>
      <select name="status" defaultValue={status ?? ""}>
        <option value="">Все статусы</option>
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LEAD_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button type="submit">Применить</button>
      {(q || source || status) && <a href="/leads">Сбросить</a>}
    </form>
  );
}
