import Link from "next/link";
import {
  getDashboardKpis,
  getOpportunitiesByStage,
  getRecentLeads,
  getOverdueTasks,
} from "@/app/actions/dashboard";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, isLeadStatus } from "@/lib/lead";
import { StageChart } from "./stage-chart";
import { LeadsStatusChart } from "./leads-status-chart";

export const dynamic = "force-dynamic";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

export default async function DashboardPage() {
  const [kpis, opportunitiesByStage, recentLeads, overdueTasks] =
    await Promise.all([
      getDashboardKpis(),
      getOpportunitiesByStage(),
      getRecentLeads(),
      getOverdueTasks(),
    ]);

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
      </div>

      <div className="chart-grid">
        <section>
          <h2>Сделки по стадиям</h2>
          <div className="chart-canvas">
            <StageChart data={opportunitiesByStage} />
          </div>
        </section>
        <section>
          <h2>Лиды по статусам</h2>
          <div className="chart-canvas">
            <LeadsStatusChart data={kpis.leadsByStatus} />
          </div>
        </section>
      </div>

      <div className="summary-grid">
        <section>
          <h2>Последние лиды</h2>
          {recentLeads.length === 0 ? (
            <p className="muted">Пока нет лидов.</p>
          ) : (
            <ul>
              {recentLeads.map((lead) => (
                <li key={lead.id}>
                  <Link href={`/leads?leadId=${lead.id}`}>{lead.name}</Link>{" "}
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
        <section>
          <h2>Просроченные задачи</h2>
          {overdueTasks.length === 0 ? (
            <p className="muted">Просроченных задач нет.</p>
          ) : (
            <ul>
              {overdueTasks.map((task) => (
                <li key={task.id}>
                  <Link href={`/opportunities?opportunityId=${task.opportunityId}`}>
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
      </div>
    </main>
  );
}
