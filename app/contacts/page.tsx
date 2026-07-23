import Link from "next/link";
import { getContact, getContacts } from "@/app/actions/contact";
import { getAccounts } from "@/app/actions/account";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ contactId?: string; q?: string }>;
}) {
  const { contactId, q } = await searchParams;
  const [contacts, accounts] = await Promise.all([
    getContacts({ q }),
    getAccounts(),
  ]);
  const selectedContact = contactId ? await getContact(contactId) : null;
  const accountOptions = accounts.map((account) => ({
    id: account.id,
    name: account.name,
  }));

  return (
    <main className="leads-page">
      <h1>Контакты</h1>
      <div className="leads-layout">
        <section className="leads-list">
          <h2>Список контактов</h2>
          <form className="filters" method="get">
            <input
              type="search"
              name="q"
              placeholder="Поиск по имени"
              defaultValue={q ?? ""}
            />
            <button type="submit">Применить</button>
            {q && <a href="/contacts">Сбросить</a>}
          </form>
          {contacts.length === 0 && (
            <p className="muted">Ничего не найдено по заданным условиям.</p>
          )}
          <ul>
            {contacts.map((contact) => (
              <li key={contact.id}>
                <Link
                  href={`/contacts?contactId=${contact.id}`}
                  className={contact.id === contactId ? "active" : ""}
                >
                  <strong>{contact.name}</strong>
                  <span className="muted">
                    {contact.account?.name ?? "Без компании"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="lead-detail">
          <h2>Новый контакт</h2>
          <ContactForm accounts={accountOptions} />

          {contactId && (
            <>
              <h2>Карточка контакта</h2>
              {selectedContact ? (
                <>
                  <ContactForm
                    contact={{
                      id: selectedContact.id,
                      name: selectedContact.name,
                      email: selectedContact.email,
                      phone: selectedContact.phone,
                      role: selectedContact.role,
                      accountId: selectedContact.accountId,
                    }}
                    accounts={accountOptions}
                  />
                  {selectedContact.account && (
                    <p>
                      Компания:{" "}
                      <Link
                        href={`/accounts?accountId=${selectedContact.account.id}`}
                      >
                        {selectedContact.account.name}
                      </Link>
                    </p>
                  )}
                  <p className="quick-action">
                    <Link
                      href={`/opportunities?prefillContactId=${selectedContact.id}${
                        selectedContact.accountId
                          ? `&prefillAccountId=${selectedContact.accountId}`
                          : ""
                      }`}
                    >
                      + Создать сделку для этого контакта
                    </Link>
                  </p>
                  <h3>Сделки</h3>
                  {selectedContact.opportunities.length === 0 ? (
                    <p className="muted">Нет сделок.</p>
                  ) : (
                    <ul>
                      {selectedContact.opportunities.map((opportunity) => (
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
                <p>Контакт не найден.</p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
