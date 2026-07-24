import Link from "next/link";
import { getOpportunities } from "@/app/actions/opportunity";
import { getAccounts } from "@/app/actions/account";
import { getContacts } from "@/app/actions/contact";
import {
  OPPORTUNITY_STAGE_BADGE_CLASSES,
  OPPORTUNITY_STAGE_LABELS,
  OPPORTUNITY_STATUS_BADGE_CLASSES,
  OPPORTUNITY_STATUS_LABELS,
  getOpportunityStatus,
  isOpportunityStage,
  isOpportunityStuck,
} from "@/lib/opportunity";
import { OpportunityFilters } from "./opportunity-filters";
import { CreateOpportunityButton } from "./create-opportunity-button";

export const dynamic = "force-dynamic";

function formatAmount(amount: unknown): string {
  if (amount === null || amount === undefined) return "—";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("ru-RU").format(numeric) + " ₽";
}

function formatDate(date: Date | null): string {
  return date ? date.toLocaleDateString("ru-RU") : "—";
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    stage?: string;
    status?: string;
  }>;
}) {
  const { q, stage: stageFilter, status: statusFilter } = await searchParams;
  const [opportunities, accounts, contacts] = await Promise.all([
    getOpportunities({ q, stage: stageFilter, status: statusFilter }),
    getAccounts(),
    getContacts(),
  ]);

  const accountOptions = accounts.map((account) => ({
    id: account.id,
    name: account.name,
  }));
  const contactOptions = contacts.map((contact) => ({
    id: contact.id,
    name: contact.name,
  }));

  return (
    <main className="leads-page list-page">
      <div className="list-header">
        <h1>Сделки</h1>
        <CreateOpportunityButton
          accounts={accountOptions}
          contacts={contactOptions}
        />
      </div>
      <OpportunityFilters q={q} stage={stageFilter} status={statusFilter} />
      {opportunities.length === 0 && (
        <p className="muted">Ничего не найдено по заданным условиям.</p>
      )}
      {opportunities.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Компания</th>
                <th>Контакт</th>
                <th>Сумма</th>
                <th>Стадия</th>
                <th>Статус</th>
                <th>Создана</th>
                <th>Закрыта</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opportunity) => {
                const stage = isOpportunityStage(opportunity.stage)
                  ? opportunity.stage
                  : "new";
                const status = getOpportunityStatus(opportunity.stage);
                const stuck = isOpportunityStuck(
                  opportunity.activities.length > 0,
                );
                return (
                  <tr key={opportunity.id}>
                    <td>
                      <Link href={`/opportunities/${opportunity.id}`}>
                        <strong>{opportunity.title}</strong>
                      </Link>
                    </td>
                    <td className="ellipsis">
                      <Link href={`/opportunities/${opportunity.id}`}>
                        {opportunity.account?.name ?? "Без компании"}
                      </Link>
                    </td>
                    <td className="ellipsis">
                      <Link href={`/opportunities/${opportunity.id}`}>
                        {opportunity.contact?.name ?? "Без контакта"}
                      </Link>
                    </td>
                    <td className="nowrap">
                      <Link href={`/opportunities/${opportunity.id}`}>
                        {formatAmount(opportunity.amount)}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/opportunities/${opportunity.id}`}>
                        <span className={OPPORTUNITY_STAGE_BADGE_CLASSES[stage]}>
                          {OPPORTUNITY_STAGE_LABELS[stage]}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <Link href={`/opportunities/${opportunity.id}`}>
                        <span className={OPPORTUNITY_STATUS_BADGE_CLASSES[status]}>
                          {OPPORTUNITY_STATUS_LABELS[status]}
                        </span>
                        {stuck && (
                          <>
                            {" "}
                            <span className={OPPORTUNITY_STATUS_BADGE_CLASSES.stuck}>
                              {OPPORTUNITY_STATUS_LABELS.stuck}
                            </span>
                          </>
                        )}
                      </Link>
                    </td>
                    <td className="nowrap">
                      <Link href={`/opportunities/${opportunity.id}`}>
                        {formatDate(opportunity.createdAt)}
                      </Link>
                    </td>
                    <td className="nowrap">
                      <Link href={`/opportunities/${opportunity.id}`}>
                        {formatDate(opportunity.closedAt)}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
