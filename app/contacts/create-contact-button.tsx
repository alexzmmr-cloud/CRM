"use client";

import { useState } from "react";
import { Modal } from "@/app/modal";
import { ContactForm } from "./contact-form";

type AccountOption = { id: string; name: string };

export function CreateContactButton({
  accounts,
  prefillAccountId,
  label = "+ Новый контакт",
}: {
  accounts: AccountOption[];
  prefillAccountId?: string;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn-primary" onClick={() => setIsOpen(true)}>
        {label}
      </button>
      {isOpen && (
        <Modal title="Новый контакт" onClose={() => setIsOpen(false)}>
          <ContactForm
            accounts={accounts}
            contact={prefillAccountId ? { accountId: prefillAccountId } : undefined}
            onSuccess={() => setIsOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
