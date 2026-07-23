export const OPPORTUNITY_STAGES = [
  "new",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> = {
  new: "Новая",
  qualified: "Квалифицирована",
  proposal: "Предложение",
  negotiation: "Переговоры",
  won: "Выиграна",
  lost: "Проиграна",
};

export const OPPORTUNITY_STAGE_BADGE_CLASSES: Record<
  OpportunityStage,
  string
> = {
  new: "badge badge-blue",
  qualified: "badge badge-blue",
  proposal: "badge badge-blue",
  negotiation: "badge badge-blue",
  won: "badge badge-green",
  lost: "badge badge-gray",
};

export function isOpportunityStage(value: string): value is OpportunityStage {
  return (OPPORTUNITY_STAGES as readonly string[]).includes(value);
}

export const OPEN_OPPORTUNITY_STAGES: OpportunityStage[] = [
  "new",
  "qualified",
  "proposal",
  "negotiation",
];
