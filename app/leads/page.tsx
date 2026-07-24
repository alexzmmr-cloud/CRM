import Link from "next/link";
import { getLeads } from "@/app/actions/lead";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_BADGE_CLASSES,
  LEAD_STATUS_LABELS,
  isLeadSource,
  isLeadStatus,
  splitLeadContact,
} from "@/lib/lead";
import { LeadFilters } from "./lead-filters";
import { CreateLeadButton } from "./create-lead-button";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    source?: string;
    status?: string;
  }>;
}) {
  const { q, source, status } = await searchParams;
  const leads = await getLeads({ q, source, status });

  return (
    <main className="leads-page list-page">
      <div className="list-header">
        <h1>Лиды</h1>
        <CreateLeadButton />
      </div>
      <LeadFilters q={q} source={source} status={status} />
      {leads.length === 0 && (
        <p className="muted">Ничего не найдено по заданным условиям.</p>
      )}
      {leads.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Компания</th>
                <th>Источник</th>
                <th>Статус</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const leadStatus = isLeadStatus(lead.status)
                  ? lead.status
                  : "new";
                const leadSource = isLeadSource(lead.source)
                  ? lead.source
                  : null;
                const { email, phone } = splitLeadContact(lead.contact);
                return (
                  <tr key={lead.id}>
                    <td>
                      <Link href={`/leads/${lead.id}`}>
                        <strong>{lead.name}</strong>
                      </Link>
                    </td>
                    <td className="ellipsis">
                      <Link href={`/leads/${lead.id}`}>
                        {lead.company || "—"}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/leads/${lead.id}`}>
                        {leadSource
                          ? LEAD_SOURCE_LABELS[leadSource]
                          : lead.source}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/leads/${lead.id}`}>
                        <span className={LEAD_STATUS_BADGE_CLASSES[leadStatus]}>
                          {LEAD_STATUS_LABELS[leadStatus]}
                        </span>
                      </Link>
                    </td>
                    <td className="ellipsis">
                      <Link href={`/leads/${lead.id}`}>{email || "—"}</Link>
                    </td>
                    <td className="nowrap">
                      <Link href={`/leads/${lead.id}`}>{phone || "—"}</Link>
                    </td>
                    <td className="nowrap">
                      <Link href={`/leads/${lead.id}`}>
                        {formatDate(lead.createdAt)}
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
