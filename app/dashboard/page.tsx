import Link from "next/link";
import {
  getDashboardKpis,
  getOpportunitiesByStage,
  getRecentLeads,
  getOverdueTasks,
  getStuckDeals,
} from "@/app/actions/dashboard";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, isLeadStatus } from "@/lib/lead";
import { StageChart } from "./stage-chart";
import { LeadsStatusChart } from "./leads-status-chart";

export const dynamic = "force-dynamic";

function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return (
      new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(
        amount / 1_000_000_000,
      ) + " млрд ₽"
    );
  }
  if (abs >= 1_000_000) {
    return (
      new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(
        amount / 1_000_000,
      ) + " млн ₽"
    );
  }
  return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

export default async function DashboardPage() {
  const [kpis, opportunitiesByStage, recentLeads, overdueTasks, stuckDeals] =
    await Promise.all([
      getDashboardKpis(),
      getOpportunitiesByStage(),
      getRecentLeads(),
      getOverdueTasks(),
      getStuckDeals(),
    ]);

  return (
    <main className="leads-page">
      <h1>Dashboard</h1>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <span className="kpi-value">{kpis.leadsCount}</span>
          <span className="kpi-label">Лидов всего</span>
        </div>
        <div className="card kpi-card">
          <span className="kpi-value">{kpis.openOpportunitiesCount}</span>
          <span className="kpi-label">Открытых сделок</span>
        </div>
        <div className="card kpi-card">
          <span
            className={`kpi-value${
              formatAmount(kpis.openOpportunitiesSum).length >= 10
                ? " kpi-value-compact"
                : ""
            }`}
          >
            {formatAmount(kpis.openOpportunitiesSum)}
          </span>
          <span className="kpi-label">Сумма открытых сделок</span>
        </div>
        <div
          className={`card kpi-card${kpis.overdueTasksCount > 0 ? " is-warning" : ""}`}
        >
          <span className="kpi-value">{kpis.overdueTasksCount}</span>
          <span className="kpi-label">Просроченных задач</span>
          {kpis.overdueTasksCount > 0 && (
            <span className="kpi-sub">Требуют внимания</span>
          )}
        </div>
        <Link
          href="/opportunities?status=stuck"
          className={`card kpi-card kpi-card-link${kpis.stuckDealsCount > 0 ? " is-warning" : ""}`}
        >
          <span className="kpi-value">{kpis.stuckDealsCount}</span>
          <span className="kpi-label">Зависших сделок</span>
          {kpis.stuckDealsCount > 0 && (
            <span className="kpi-sub">Нет открытых задач · Посмотреть в списке →</span>
          )}
        </Link>
      </div>

      <div className="summary-grid">
        <section className="card">
          <h2 className="card-title">Лиды по источникам</h2>
          <ul>
            {Object.entries(kpis.leadsBySource).map(([source, count]) => (
              <li key={source}>
                {LEAD_SOURCE_LABELS[source as keyof typeof LEAD_SOURCE_LABELS]}
                : {count}
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 className="card-title">Лиды по статусам</h2>
          <ul>
            {Object.entries(kpis.leadsByStatus).map(([status, count]) => (
              <li key={status}>
                {LEAD_STATUS_LABELS[status as keyof typeof LEAD_STATUS_LABELS]}
                : {count}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="chart-grid">
        <section className="card">
          <h2 className="card-title">Сделки по стадиям</h2>
          <div className="chart-canvas">
            <StageChart data={opportunitiesByStage} />
          </div>
        </section>
        <section className="card">
          <h2 className="card-title">Лиды по статусам</h2>
          <div className="chart-canvas">
            <LeadsStatusChart data={kpis.leadsByStatus} />
          </div>
        </section>
      </div>

      <div className="summary-grid">
        <section className="card">
          <h2 className="card-title">Последние лиды</h2>
          {recentLeads.length === 0 ? (
            <p className="muted">Пока нет лидов.</p>
          ) : (
            <ul>
              {recentLeads.map((lead) => (
                <li key={lead.id}>
                  <Link href={`/leads/${lead.id}`}>{lead.name}</Link>{" "}
                  <span className="muted">
                    (
                    {isLeadStatus(lead.status)
                      ? LEAD_STATUS_LABELS[lead.status]
                      : lead.status}
                    , {formatDate(lead.createdAt)})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="card-title">Просроченные задачи</h2>
          {overdueTasks.length === 0 ? (
            <p className="muted">Просроченных задач нет.</p>
          ) : (
            <ul>
              {overdueTasks.map((task) => (
                <li key={task.id}>
                  <Link href={`/opportunities/${task.opportunityId}`}>
                    {task.opportunity.title}
                  </Link>{" "}
                  <span className="muted">
                    — {task.content}
                    {task.dueDate && ` (до ${formatDate(task.dueDate)})`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="card-title">Зависшие сделки</h2>
          {stuckDeals.length === 0 ? (
            <p className="muted">Зависших сделок нет.</p>
          ) : (
            <ul>
              {stuckDeals.map((opportunity) => (
                <li key={opportunity.id}>
                  <Link href={`/opportunities/${opportunity.id}`}>
                    {opportunity.title}
                  </Link>{" "}
                  <span className="muted">
                    — {opportunity.account?.name ?? "Без компании"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
