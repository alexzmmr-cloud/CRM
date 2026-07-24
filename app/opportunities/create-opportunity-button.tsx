"use client";

import { useState } from "react";
import { Modal } from "@/app/modal";
import { OpportunityForm } from "./opportunity-form";

type Option = { id: string; name: string };

export function CreateOpportunityButton({
  accounts,
  contacts,
  prefillAccountId,
  prefillContactId,
  label = "+ Новая сделка",
}: {
  accounts: Option[];
  contacts: Option[];
  prefillAccountId?: string;
  prefillContactId?: string;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn-primary" onClick={() => setIsOpen(true)}>
        {label}
      </button>
      {isOpen && (
        <Modal title="Новая сделка" onClose={() => setIsOpen(false)}>
          <OpportunityForm
            opportunity={
              prefillAccountId || prefillContactId
                ? { accountId: prefillAccountId, contactId: prefillContactId }
                : undefined
            }
            accounts={accounts}
            contacts={contacts}
            onSuccess={() => setIsOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
