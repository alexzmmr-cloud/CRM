export const LEAD_SOURCES = [
  "site",
  "email",
  "phone",
  "referral",
  "manual",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  site: "Сайт",
  email: "Почта",
  phone: "Телефон",
  referral: "Рекомендация",
  manual: "Ручной ввод",
};

export function isLeadSource(value: string): value is LeadSource {
  return (LEAD_SOURCES as readonly string[]).includes(value);
}

export const LEAD_STATUSES = ["new", "converted", "disqualified"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новый",
  converted: "Конвертирован",
  disqualified: "Отклонён",
};

export const LEAD_STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  new: "badge badge-blue",
  converted: "badge badge-green",
  disqualified: "badge badge-gray",
};

export function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

/**
 * Lead.contact хранит email или телефон одной строкой (без разделения полей).
 * Формат определяется по наличию "@" — та же эвристика, что использует convert lead.
 */
export function splitLeadContact(contact: string | null): {
  email: string | null;
  phone: string | null;
} {
  const trimmed = contact?.trim();
  if (!trimmed) return { email: null, phone: null };
  const isEmail = trimmed.includes("@");
  return {
    email: isEmail ? trimmed : null,
    phone: isEmail ? null : trimmed,
  };
}
