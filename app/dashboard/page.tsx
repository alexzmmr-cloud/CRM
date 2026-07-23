import { getDashboardKpis } from "@/app/actions/dashboard";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/lead";

export const dynamic = "force-dynamic";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
}

export default async function DashboardPage() {
  const kpis = await getDashboardKpis();

  return (
    <main className="leads-page">
      <h1>Dashboard</h1>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-value">{kpis.leadsCount}</span>
          <span className="kpi-label">Лидов всего</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{kpis.openOpportunitiesCount}</span>
          <span className="kpi-label">Открытых сделок</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">
            {formatAmount(kpis.openOpportunitiesSum)}
          </span>
          <span className="kpi-label">Сумма открытых сделок</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{kpis.overdueTasksCount}</span>
          <span className="kpi-label">Просроченных задач</span>
        </div>
      </div>

      <div className="summary-grid">
        <section>
          <h2>Лиды по статусам</h2>
          <ul>
            {Object.entries(kpis.leadsByStatus).map(([status, count]) => (
              <li key={status}>
                {LEAD_STATUS_LABELS[status as keyof typeof LEAD_STATUS_LABELS]}
                : {count}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Лиды по источникам</h2>
          <ul>
            {Object.entries(kpis.leadsBySource).map(([source, count]) => (
              <li key={source}>
                {LEAD_SOURCE_LABELS[source as keyof typeof LEAD_SOURCE_LABELS]}
                : {count}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
