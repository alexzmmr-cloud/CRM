"use client";

import { useState } from "react";
import { Modal } from "@/app/modal";
import { LeadForm } from "./lead-form";

export function CreateLeadButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn-primary" onClick={() => setIsOpen(true)}>
        + Новый лид
      </button>
      {isOpen && (
        <Modal title="Новый лид" onClose={() => setIsOpen(false)}>
          <LeadForm onSuccess={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  );
}
