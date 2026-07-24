import Link from "next/link";
import { getAccounts } from "@/app/actions/account";
import { CreateAccountButton } from "./create-account-button";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const accounts = await getAccounts({ q });

  return (
    <main className="leads-page list-page">
      <div className="list-header">
        <h1>Компании</h1>
        <CreateAccountButton />
      </div>
      <form className="filters" method="get">
        <input
          type="search"
          name="q"
          placeholder="Поиск по названию"
          defaultValue={q ?? ""}
        />
        <button type="submit">Применить</button>
        {q && <Link href="/accounts">Сбросить</Link>}
      </form>
      {accounts.length === 0 && (
        <p className="muted">Ничего не найдено по заданным условиям.</p>
      )}
      {accounts.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Род деятельности</th>
                <th>Контактное лицо</th>
                <th>Телефон</th>
                <th>Сайт</th>
                <th>Контакты</th>
                <th>Сделки</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <Link href={`/accounts/${account.id}`}>
                      <strong>{account.name}</strong>
                    </Link>
                  </td>
                  <td>
                    <Link href={`/accounts/${account.id}`}>
                      {account.industry || "—"}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/accounts/${account.id}`}>
                      {account.contacts[0]?.name || "—"}
                    </Link>
                  </td>
                  <td className="nowrap">
                    <Link href={`/accounts/${account.id}`}>
                      {account.phone || "—"}
                    </Link>
                  </td>
                  <td className="ellipsis">
                    <Link href={`/accounts/${account.id}`}>
                      {account.website || "—"}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/accounts/${account.id}`}>
                      {account.contacts.length}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/accounts/${account.id}`}>
                      {account.opportunities.length}
                    </Link>
                  </td>
                  <td className="nowrap">
                    <Link href={`/accounts/${account.id}`}>
                      {formatDate(account.createdAt)}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
