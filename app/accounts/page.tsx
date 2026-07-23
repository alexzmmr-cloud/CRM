import Link from "next/link";
import { getAccount, getAccounts } from "@/app/actions/account";
import { AccountForm } from "./account-form";

export const dynamic = "force-dynamic";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const { accountId } = await searchParams;
  const accounts = await getAccounts();
  const selectedAccount = accountId ? await getAccount(accountId) : null;

  return (
    <main className="leads-page">
      <h1>Компании</h1>
      <div className="leads-layout">
        <section className="leads-list">
          <h2>Список компаний</h2>
          <ul>
            {accounts.map((account) => (
              <li key={account.id}>
                <Link
                  href={`/accounts?accountId=${account.id}`}
                  className={account.id === accountId ? "active" : ""}
                >
                  <strong>{account.name}</strong>
                  <span className="muted">
                    {account.contacts.length} контактов ·{" "}
                    {account.opportunities.length} сделок
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="lead-detail">
          <h2>Новая компания</h2>
          <AccountForm />

          {accountId && (
            <>
              <h2>Карточка компании</h2>
              {selectedAccount ? (
                <>
                  <AccountForm
                    account={{
                      id: selectedAccount.id,
                      name: selectedAccount.name,
                      website: selectedAccount.website,
                    }}
                  />
                  <h3>Контакты</h3>
                  {selectedAccount.contacts.length === 0 ? (
                    <p className="muted">Нет привязанных контактов.</p>
                  ) : (
                    <ul>
                      {selectedAccount.contacts.map((contact) => (
                        <li key={contact.id}>
                          <Link href={`/contacts?contactId=${contact.id}`}>
                            {contact.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <h3>Сделки</h3>
                  {selectedAccount.opportunities.length === 0 ? (
                    <p className="muted">Нет сделок.</p>
                  ) : (
                    <ul>
                      {selectedAccount.opportunities.map((opportunity) => (
                        <li key={opportunity.id}>
                          <Link
                            href={`/opportunities?opportunityId=${opportunity.id}`}
                          >
                            {opportunity.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p>Компания не найдена.</p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
