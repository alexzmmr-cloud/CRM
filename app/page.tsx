import Link from "next/link";
import {
  getDashboardKpis,
  getOpportunitiesByStage,
} from "@/app/actions/dashboard";
import { StageChart } from "@/app/dashboard/stage-chart";
import { LeadsStatusChart } from "@/app/dashboard/leads-status-chart";

export const dynamic = "force-dynamic";

function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return (
      new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(
        amount / 1_000_000_000,
      ) + " млрд ₽"
    );
  }
  if (abs >= 1_000_000) {
    return (
      new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(
        amount / 1_000_000,
      ) + " млн ₽"
    );
  }
  return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
}

export default async function Home() {
  const [kpis, opportunitiesByStage] = await Promise.all([
    getDashboardKpis(),
    getOpportunitiesByStage(),
  ]);

  return (
    <main className="leads-page">
      <h1>CRM-lite Агентства выставочных стендов</h1>
      <p className="muted">
        Приём и учёт лидов, сделки, контакты и компании —{" "}
        <Link href="/leads">начните с лидов</Link> или откройте полный{" "}
        <Link href="/dashboard">Dashboard</Link>.
      </p>

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
    </main>
  );
}
