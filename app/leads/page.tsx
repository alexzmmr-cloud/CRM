import Link from "next/link";
import { getLead, getLeads } from "@/app/actions/lead";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_BADGE_CLASSES,
  LEAD_STATUS_LABELS,
  isLeadSource,
  isLeadStatus,
} from "@/lib/lead";
import { LeadForm } from "./lead-form";
import { LeadFilters } from "./lead-filters";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    leadId?: string;
    q?: string;
    source?: string;
    status?: string;
  }>;
}) {
  const { leadId, q, source, status } = await searchParams;
  const leads = await getLeads({ q, source, status });
  const selectedLead = leadId ? await getLead(leadId) : null;

  return (
    <main className="leads-page">
      <h1>Лиды</h1>
      <div className="leads-layout">
        <section className="leads-list">
          <h2>Список лидов</h2>
          <LeadFilters q={q} source={source} status={status} />
          {leads.length === 0 && (
            <p className="muted">Ничего не найдено по заданным условиям.</p>
          )}
          <ul>
            {leads.map((lead) => {
              const leadStatus = isLeadStatus(lead.status)
                ? lead.status
                : "new";
              const leadSource = isLeadSource(lead.source)
                ? lead.source
                : null;
              return (
                <li key={lead.id}>
                  <Link
                    href={`/leads?leadId=${lead.id}`}
                    className={lead.id === leadId ? "active" : ""}
                  >
                    <strong>{lead.name}</strong>
                    <span className={LEAD_STATUS_BADGE_CLASSES[leadStatus]}>
                      {LEAD_STATUS_LABELS[leadStatus]}
                    </span>
                    <span className="muted">
                      {leadSource ? LEAD_SOURCE_LABELS[leadSource] : lead.source}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="lead-detail">
          <h2>Новый лид</h2>
          <LeadForm />

          {leadId && (
            <>
              <h2>Карточка лида</h2>
              {selectedLead ? (
                <>
                  <LeadForm
                    lead={{
                      id: selectedLead.id,
                      name: selectedLead.name,
                      company: selectedLead.company,
                      contact: selectedLead.contact,
                      note: selectedLead.note,
                      source: isLeadSource(selectedLead.source)
                        ? selectedLead.source
                        : undefined,
                      status: isLeadStatus(selectedLead.status)
                        ? selectedLead.status
                        : undefined,
                    }}
                  />
                  {selectedLead.opportunity && (
                    <p>
                      Связанная сделка:{" "}
                      <Link
                        href={`/opportunities?opportunityId=${selectedLead.opportunity.id}`}
                      >
                        {selectedLead.opportunity.title}
                      </Link>
                    </p>
                  )}
                </>
              ) : (
                <p>Лид не найден.</p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
