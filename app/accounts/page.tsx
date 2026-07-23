import Link from "next/link";
import { getAccount, getAccounts } from "@/app/actions/account";
import { AccountForm } from "./account-form";

export const dynamic = "force-dynamic";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; q?: string }>;
}) {
  const { accountId, q } = await searchParams;
  const accounts = await getAccounts({ q });
  const effectiveAccountId = accountId ?? accounts[0]?.id ?? null;
  const selectedAccount = effectiveAccountId
    ? await getAccount(effectiveAccountId)
    : null;

  return (
    <main className="leads-page">
      <h1>Компании</h1>
      <div className="leads-layout">
        <section className="leads-list">
          <h2>Список компаний</h2>
          <form className="filters" method="get">
            <input
              type="search"
              name="q"
              placeholder="Поиск по названию"
              defaultValue={q ?? ""}
            />
            <button type="submit">Применить</button>
            {q && <a href="/accounts">Сбросить</a>}
          </form>
          {accounts.length === 0 && (
            <p className="muted">Ничего не найдено по заданным условиям.</p>
          )}
          <ul>
            {accounts.map((account) => (
              <li key={account.id}>
                <Link
                  href={`/accounts?accountId=${account.id}`}
                  className={account.id === effectiveAccountId ? "active" : ""}
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

        <section className="leads-detail">
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
              <p className="quick-action">
                <Link
                  href={`/opportunities?prefillAccountId=${selectedAccount.id}`}
                >
                  + Создать сделку для этой компании
                </Link>
              </p>
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
            <p className="muted">Нет компаний для отображения.</p>
          )}
        </section>

        <section className="leads-create">
          <h2>Новая компания</h2>
          <AccountForm />
        </section>
      </div>
    </main>
  );
}
