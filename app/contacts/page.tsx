import Link from "next/link";
import { getContacts } from "@/app/actions/contact";
import { getAccounts } from "@/app/actions/account";
import { CreateContactButton } from "./create-contact-button";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [contacts, accounts] = await Promise.all([
    getContacts({ q }),
    getAccounts(),
  ]);
  const accountOptions = accounts.map((account) => ({
    id: account.id,
    name: account.name,
  }));

  return (
    <main className="leads-page list-page">
      <div className="list-header">
        <h1>Контакты</h1>
        <CreateContactButton accounts={accountOptions} />
      </div>
      <form className="filters" method="get">
        <input
          type="search"
          name="q"
          placeholder="Поиск по имени"
          defaultValue={q ?? ""}
        />
        <button type="submit">Применить</button>
        {q && <Link href="/contacts">Сбросить</Link>}
      </form>
      {contacts.length === 0 && (
        <p className="muted">Ничего не найдено по заданным условиям.</p>
      )}
      {contacts.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Компания</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <Link href={`/contacts/${contact.id}`}>
                      <strong>{contact.name}</strong>
                    </Link>
                  </td>
                  <td className="ellipsis">
                    <Link href={`/contacts/${contact.id}`}>
                      {contact.account?.name ?? "Без компании"}
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
                  <td className="nowrap">
                    <Link href={`/contacts/${contact.id}`}>
                      {formatDate(contact.createdAt)}
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
