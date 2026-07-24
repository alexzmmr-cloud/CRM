import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead } from "@/app/actions/lead";
import { isLeadSource, isLeadStatus } from "@/lib/lead";
import { LeadForm } from "../lead-form";
import { ConvertLeadButton } from "../convert-lead-button";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLead(id);

  if (!lead) {
    notFound();
  }

  return (
    <main className="leads-page">
      <p className="muted">
        <Link href="/leads">← Все лиды</Link>
      </p>
      <h1>{lead.name}</h1>
      <div className="detail-layout">
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Карточка лида</h2>
            <span className="muted">Создан: {formatDate(lead.createdAt)}</span>
          </div>
          <LeadForm
            lead={{
              id: lead.id,
              name: lead.name,
              company: lead.company,
              contact: lead.contact,
              note: lead.note,
              source: isLeadSource(lead.source) ? lead.source : undefined,
              status: isLeadStatus(lead.status) ? lead.status : undefined,
            }}
            layout="horizontal"
          />
          {lead.opportunity ? (
            <p>
              Связанная сделка:{" "}
              <Link href={`/opportunities/${lead.opportunity.id}`}>
                {lead.opportunity.title}
              </Link>
            </p>
          ) : (
            lead.status !== "disqualified" && (
              <ConvertLeadButton leadId={lead.id} />
            )
          )}
        </section>
      </div>
    </main>
  );
}
