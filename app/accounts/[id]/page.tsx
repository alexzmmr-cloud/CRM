import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccount, getAccounts } from "@/app/actions/account";
import { getContacts } from "@/app/actions/contact";
import { CreateOpportunityButton } from "@/app/opportunities/create-opportunity-button";
import { CreateContactButton } from "@/app/contacts/create-contact-button";
import {
  OPPORTUNITY_STAGE_BADGE_CLASSES,
  OPPORTUNITY_STAGE_LABELS,
  isOpportunityStage,
} from "@/lib/opportunity";
import { AccountForm } from "../account-form";

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

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [account, accounts, contacts] = await Promise.all([
    getAccount(id),
    getAccounts(),
    getContacts(),
  ]);

  if (!account) {
    notFound();
  }

  const accountOptions = accounts.map((a) => ({ id: a.id, name: a.name }));
  const contactOptions = contacts.map((c) => ({ id: c.id, name: c.name }));

  return (
    <main className="leads-page">
      <p className="muted">
        <Link href="/accounts">← Все компании</Link>
      </p>
      <h1>{account.name}</h1>
      <div className="detail-layout">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Карточка компании</h2>
            <span className="muted">Создана: {formatDate(account.createdAt)}</span>
          </div>
          <AccountForm
            account={{
              id: account.id,
              name: account.name,
              website: account.website,
              industry: account.industry,
              phone: account.phone,
            }}
            layout="horizontal"
          />
          <div className="quick-action">
            <CreateOpportunityButton
              accounts={accountOptions}
              contacts={contactOptions}
              prefillAccountId={account.id}
              label="+ Создать сделку для этой компании"
            />
          </div>
          <h3>Контакты</h3>
          <div className="quick-action">
            <CreateContactButton
              accounts={accountOptions}
              prefillAccountId={account.id}
              label="+ Создать контакт для этой компании"
            />
          </div>
          {account.contacts.length === 0 ? (
            <p className="muted">Нет привязанных контактов.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Должность</th>
                    <th>Email</th>
                    <th>Телефон</th>
                  </tr>
                </thead>
                <tbody>
                  {account.contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>
                        <Link href={`/contacts/${contact.id}`}>
                          {contact.name}
                        </Link>
                      </td>
                      <td>
                        <Link href={`/contacts/${contact.id}`}>
                          {contact.role || "—"}
                        </Link>
                      </td>
                      <td className="ellipsis">
                        <Link href={`/contacts/${contact.id}`}>
                          {contact.email || "—"}
                        </Link>
                      </td>
                      <td className="nowrap">
                        <Link href={`/contacts/${contact.id}`}>
                          {contact.phone || "—"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <h3>Сделки</h3>
          {account.opportunities.length === 0 ? (
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
                  {account.opportunities.map((opportunity) => {
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
