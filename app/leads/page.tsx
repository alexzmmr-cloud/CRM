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

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const { leadId } = await searchParams;
  const leads = await getLeads();
  const selectedLead = leadId ? await getLead(leadId) : null;

  return (
    <main className="leads-page">
      <h1>Лиды</h1>
      <div className="leads-layout">
        <section className="leads-list">
          <h2>Список лидов</h2>
          <ul>
            {leads.map((lead) => {
              const status = isLeadStatus(lead.status) ? lead.status : "new";
              const source = isLeadSource(lead.source) ? lead.source : null;
              return (
                <li key={lead.id}>
                  <Link
                    href={`/leads?leadId=${lead.id}`}
                    className={lead.id === leadId ? "active" : ""}
                  >
                    <strong>{lead.name}</strong>
                    <span className={LEAD_STATUS_BADGE_CLASSES[status]}>
                      {LEAD_STATUS_LABELS[status]}
                    </span>
                    <span className="muted">
                      {source ? LEAD_SOURCE_LABELS[source] : lead.source}
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
