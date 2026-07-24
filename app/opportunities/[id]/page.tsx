import Link from "next/link";
import { notFound } from "next/navigation";
import { getOpportunity } from "@/app/actions/opportunity";
import { getAccounts } from "@/app/actions/account";
import { getContacts } from "@/app/actions/contact";
import {
  OPPORTUNITY_STATUS_BADGE_CLASSES,
  OPPORTUNITY_STATUS_LABELS,
  getOpportunityStatus,
  isOpportunityStage,
  isOpportunityStuck,
} from "@/lib/opportunity";
import { OpportunityForm } from "../opportunity-form";
import { StageControl } from "../stage-control";
import { ActivityPanel } from "../activity-panel";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [opportunity, accounts, contacts] = await Promise.all([
    getOpportunity(id),
    getAccounts(),
    getContacts(),
  ]);

  if (!opportunity) {
    notFound();
  }

  const accountOptions = accounts.map((a) => ({ id: a.id, name: a.name }));
  const contactOptions = contacts.map((c) => ({ id: c.id, name: c.name }));

  const status = getOpportunityStatus(opportunity.stage);
  const hasOpenTask = opportunity.activities.some(
    (activity) => activity.type === "task" && activity.done === false,
  );
  const stuck = isOpportunityStuck(hasOpenTask);

  return (
    <main className="leads-page">
      <p className="muted">
        <Link href="/opportunities">← Все сделки</Link>
      </p>
      <h1>
        {opportunity.title}{" "}
        <span className={OPPORTUNITY_STATUS_BADGE_CLASSES[status]}>
          {OPPORTUNITY_STATUS_LABELS[status]}
        </span>
        {stuck && (
          <span className={OPPORTUNITY_STATUS_BADGE_CLASSES.stuck}>
            {OPPORTUNITY_STATUS_LABELS.stuck}
          </span>
        )}
      </h1>
      <div className="detail-layout detail-layout-split">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Карточка сделки</h2>
            <span className="muted">Создана: {formatDate(opportunity.createdAt)}</span>
          </div>
          {(opportunity.account || opportunity.contact || opportunity.lead) && (
            <div className="detail-summary">
              {opportunity.account && (
                <p>
                  Компания:{" "}
                  <Link href={`/accounts/${opportunity.account.id}`}>
                    {opportunity.account.name}
                  </Link>
                </p>
              )}
              {opportunity.contact && (
                <p>
                  Контакт:{" "}
                  <Link href={`/contacts/${opportunity.contact.id}`}>
                    {opportunity.contact.name}
                  </Link>
                </p>
              )}
              {opportunity.lead && (
                <p>
                  Исходный лид:{" "}
                  <Link href={`/leads/${opportunity.lead.id}`}>
                    {opportunity.lead.name}
                  </Link>
                </p>
              )}
            </div>
          )}
          <StageControl
            opportunityId={opportunity.id}
            stage={
              isOpportunityStage(opportunity.stage) ? opportunity.stage : "new"
            }
          />
          <OpportunityForm
            opportunity={{
              id: opportunity.id,
              title: opportunity.title,
              amount: opportunity.amount ? Number(opportunity.amount) : null,
              venue: opportunity.venue,
              timeline: opportunity.timeline,
              format: opportunity.format,
              accountId: opportunity.accountId,
              contactId: opportunity.contactId,
              stage: isOpportunityStage(opportunity.stage)
                ? opportunity.stage
                : undefined,
              closedAt: opportunity.closedAt,
            }}
            accounts={accountOptions}
            contacts={contactOptions}
            layout="horizontal"
          />
        </section>
        <section className="card">
          <h2 className="card-title">Активности</h2>
          <ActivityPanel
            opportunityId={opportunity.id}
            activities={opportunity.activities}
          />
        </section>
      </div>
    </main>
  );
}
