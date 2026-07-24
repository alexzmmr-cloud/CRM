import Link from "next/link";
import { notFound } from "next/navigation";
import { getContact, getContacts } from "@/app/actions/contact";
import { getAccounts } from "@/app/actions/account";
import { CreateOpportunityButton } from "@/app/opportunities/create-opportunity-button";
import {
  OPPORTUNITY_STAGE_BADGE_CLASSES,
  OPPORTUNITY_STAGE_LABELS,
  isOpportunityStage,
} from "@/lib/opportunity";
import { ContactForm } from "../contact-form";

export const dynamic = "force-dynamic";

function formatAmount(amount: unknown): string {
  if (amount === null || amount === undefined) return "—";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("ru-RU").format(numeric) + " ₽";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contact, accounts, contacts] = await Promise.all([
    getContact(id),
    getAccounts(),
    getContacts(),
  ]);

  if (!contact) {
    notFound();
  }

  const accountOptions = accounts.map((a) => ({ id: a.id, name: a.name }));
  const contactOptions = contacts.map((c) => ({ id: c.id, name: c.name }));

  return (
    <main className="leads-page">
      <p className="muted">
        <Link href="/contacts">← Все контакты</Link>
      </p>
      <h1>{contact.name}</h1>
      <div className="detail-layout">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Карточка контакта</h2>
            <span className="muted">Создан: {formatDate(contact.createdAt)}</span>
          </div>
          <ContactForm
            contact={{
              id: contact.id,
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              role: contact.role,
              accountId: contact.accountId,
            }}
            accounts={accountOptions}
            layout="horizontal"
          />
          {contact.account && (
            <p>
              Компания:{" "}
              <Link href={`/accounts/${contact.account.id}`}>
                {contact.account.name}
              </Link>
            </p>
          )}
          <div className="quick-action">
            <CreateOpportunityButton
              accounts={accountOptions}
              contacts={contactOptions}
              prefillAccountId={contact.accountId ?? undefined}
              prefillContactId={contact.id}
              label="+ Создать сделку для этого контакта"
            />
          </div>
          <h3>Сделки</h3>
          {contact.opportunities.length === 0 ? (
            <p className="muted">Нет сделок.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Стадия</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {contact.opportunities.map((opportunity) => {
                    const stage = isOpportunityStage(opportunity.stage)
                      ? opportunity.stage
                      : "new";
                    return (
                      <tr key={opportunity.id}>
                        <td>
                          <Link href={`/opportunities/${opportunity.id}`}>
                            {opportunity.title}
                          </Link>
                        </td>
                        <td>
                          <Link href={`/opportunities/${opportunity.id}`}>
                            <span className={OPPORTUNITY_STAGE_BADGE_CLASSES[stage]}>
                              {OPPORTUNITY_STAGE_LABELS[stage]}
                            </span>
                          </Link>
                        </td>
                        <td className="nowrap">
                          <Link href={`/opportunities/${opportunity.id}`}>
                            {formatAmount(opportunity.amount)}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
