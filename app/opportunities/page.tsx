import Link from "next/link";
import { getOpportunities, getOpportunity } from "@/app/actions/opportunity";
import { getAccounts } from "@/app/actions/account";
import { getContacts } from "@/app/actions/contact";
import {
  OPPORTUNITY_STAGE_BADGE_CLASSES,
  OPPORTUNITY_STAGE_LABELS,
  isOpportunityStage,
} from "@/lib/opportunity";
import { OpportunityForm } from "./opportunity-form";
import { OpportunityFilters } from "./opportunity-filters";
import { StageControl } from "./stage-control";
import { ActivityPanel } from "./activity-panel";

export const dynamic = "force-dynamic";

function formatAmount(amount: unknown): string {
  if (amount === null || amount === undefined) return "—";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("ru-RU").format(numeric) + " ₽";
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    opportunityId?: string;
    q?: string;
    stage?: string;
    prefillAccountId?: string;
    prefillContactId?: string;
  }>;
}) {
  const {
    opportunityId,
    q,
    stage: stageFilter,
    prefillAccountId,
    prefillContactId,
  } = await searchParams;
  const [opportunities, accounts, contacts] = await Promise.all([
    getOpportunities({ q, stage: stageFilter }),
    getAccounts(),
    getContacts(),
  ]);
  const effectiveOpportunityId = opportunityId ?? opportunities[0]?.id ?? null;
  const selectedOpportunity = effectiveOpportunityId
    ? await getOpportunity(effectiveOpportunityId)
    : null;

  const accountOptions = accounts.map((account) => ({
    id: account.id,
    name: account.name,
  }));
  const contactOptions = contacts.map((contact) => ({
    id: contact.id,
    name: contact.name,
  }));

  return (
    <main className="leads-page">
      <h1>Сделки</h1>
      <div className="leads-layout">
        <section className="leads-list">
          <h2>Список сделок</h2>
          <OpportunityFilters q={q} stage={stageFilter} />
          {opportunities.length === 0 && (
            <p className="muted">Ничего не найдено по заданным условиям.</p>
          )}
          <ul>
            {opportunities.map((opportunity) => {
              const stage = isOpportunityStage(opportunity.stage)
                ? opportunity.stage
                : "new";
              return (
                <li key={opportunity.id}>
                  <Link
                    href={`/opportunities?opportunityId=${opportunity.id}`}
                    className={
                      opportunity.id === effectiveOpportunityId ? "active" : ""
                    }
                  >
                    <strong>{opportunity.title}</strong>
                    <span className={OPPORTUNITY_STAGE_BADGE_CLASSES[stage]}>
                      {OPPORTUNITY_STAGE_LABELS[stage]}
                    </span>
                    <span className="muted">
                      {formatAmount(opportunity.amount)} ·{" "}
                      {opportunity.account?.name ?? "Без компании"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="leads-detail">
          <h2>Карточка сделки</h2>
          {selectedOpportunity ? (
            <>
              <StageControl
                opportunityId={selectedOpportunity.id}
                stage={
                  isOpportunityStage(selectedOpportunity.stage)
                    ? selectedOpportunity.stage
                    : "new"
                }
              />
              <OpportunityForm
                opportunity={{
                  id: selectedOpportunity.id,
                  title: selectedOpportunity.title,
                  amount: selectedOpportunity.amount
                    ? Number(selectedOpportunity.amount)
                    : null,
                  venue: selectedOpportunity.venue,
                  timeline: selectedOpportunity.timeline,
                  format: selectedOpportunity.format,
                  accountId: selectedOpportunity.accountId,
                  contactId: selectedOpportunity.contactId,
                  stage: isOpportunityStage(selectedOpportunity.stage)
                    ? selectedOpportunity.stage
                    : undefined,
                }}
                accounts={accountOptions}
                contacts={contactOptions}
              />
              {selectedOpportunity.account && (
                <p>
                  Компания:{" "}
                  <Link
                    href={`/accounts?accountId=${selectedOpportunity.account.id}`}
                  >
                    {selectedOpportunity.account.name}
                  </Link>
                </p>
              )}
              {selectedOpportunity.contact && (
                <p>
                  Контакт:{" "}
                  <Link
                    href={`/contacts?contactId=${selectedOpportunity.contact.id}`}
                  >
                    {selectedOpportunity.contact.name}
                  </Link>
                </p>
              )}
              {selectedOpportunity.lead && (
                <p>
                  Исходный лид:{" "}
                  <Link href={`/leads?leadId=${selectedOpportunity.lead.id}`}>
                    {selectedOpportunity.lead.name}
                  </Link>
                </p>
              )}
              <h3>Активности</h3>
              <ActivityPanel
                opportunityId={selectedOpportunity.id}
                activities={selectedOpportunity.activities}
              />
            </>
          ) : (
            <p className="muted">Нет сделок для отображения.</p>
          )}
        </section>

        <section className="leads-create">
          <h2>Новая сделка</h2>
          <OpportunityForm
            opportunity={
              prefillAccountId || prefillContactId
                ? { accountId: prefillAccountId, contactId: prefillContactId }
                : undefined
            }
            accounts={accountOptions}
            contacts={contactOptions}
          />
        </section>
      </div>
    </main>
  );
}
