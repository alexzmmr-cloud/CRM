"use client";

import { useState } from "react";
import { Modal } from "@/app/modal";
import { AccountForm } from "./account-form";

export function CreateAccountButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn-primary" onClick={() => setIsOpen(true)}>
        + Новая компания
      </button>
      {isOpen && (
        <Modal title="Новая компания" onClose={() => setIsOpen(false)}>
          <AccountForm onSuccess={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  );
}
