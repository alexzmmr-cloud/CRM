export const OPPORTUNITY_STAGE_META = {
  new: {
    order: 0,
    label: "Новая",
    badgeClass: "badge badge-blue",
    isWon: false,
    isLost: false,
  },
  qualified: {
    order: 1,
    label: "Квалифицирована",
    badgeClass: "badge badge-blue",
    isWon: false,
    isLost: false,
  },
  proposal: {
    order: 2,
    label: "Предложение",
    badgeClass: "badge badge-blue",
    isWon: false,
    isLost: false,
  },
  negotiation: {
    order: 3,
    label: "Переговоры",
    badgeClass: "badge badge-blue",
    isWon: false,
    isLost: false,
  },
  won: {
    order: 4,
    label: "Выиграна",
    badgeClass: "badge badge-green",
    isWon: true,
    isLost: false,
  },
  lost: {
    order: 5,
    label: "Проиграна",
    badgeClass: "badge badge-gray",
    isWon: false,
    isLost: true,
  },
} as const;

export const OPPORTUNITY_STAGES = Object.keys(
  OPPORTUNITY_STAGE_META,
) as OpportunityStage[];

export type OpportunityStage = keyof typeof OPPORTUNITY_STAGE_META;

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> =
  Object.fromEntries(
    Object.entries(OPPORTUNITY_STAGE_META).map(([stage, meta]) => [
      stage,
      meta.label,
    ]),
  ) as Record<OpportunityStage, string>;

export const OPPORTUNITY_STAGE_BADGE_CLASSES: Record<
  OpportunityStage,
  string
> = Object.fromEntries(
  Object.entries(OPPORTUNITY_STAGE_META).map(([stage, meta]) => [
    stage,
    meta.badgeClass,
  ]),
) as Record<OpportunityStage, string>;

export function isOpportunityStage(value: string): value is OpportunityStage {
  return Object.prototype.hasOwnProperty.call(OPPORTUNITY_STAGE_META, value);
}

export const OPEN_OPPORTUNITY_STAGES: OpportunityStage[] =
  OPPORTUNITY_STAGES.filter(
    (stage) =>
      !OPPORTUNITY_STAGE_META[stage].isWon &&
      !OPPORTUNITY_STAGE_META[stage].isLost,
  );

export const OPPORTUNITY_STATUSES = ["open", "won", "lost", "stuck"] as const;

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  open: "Открыта",
  won: "Выиграна",
  lost: "Проиграна",
  stuck: "Зависшая",
};

export const OPPORTUNITY_STATUS_BADGE_CLASSES: Record<
  OpportunityStatus,
  string
> = {
  open: "badge badge-blue",
  won: "badge badge-green",
  lost: "badge badge-gray",
  stuck: "badge badge-red",
};

/**
 * Базовый статус сделки (open/won/lost) — взаимоисключающий, определяется stage.
 * "Зависшая" — независимый флаг (isOpportunityStuck), не входит сюда:
 * зависнуть может сделка в любом базовом статусе (нет незавершённых задач),
 * включая уже выигранную/проигранную (пост-продажные задачи тоже могут повиснуть).
 */
export function getOpportunityStatus(stage: string): "open" | "won" | "lost" {
  const meta = isOpportunityStage(stage) ? OPPORTUNITY_STAGE_META[stage] : null;
  if (meta?.isWon) return "won";
  if (meta?.isLost) return "lost";
  return "open";
}

export function isOpportunityStuck(hasOpenTask: boolean): boolean {
  return !hasOpenTask;
}

export function isOpportunityStatus(value: string): value is OpportunityStatus {
  return (OPPORTUNITY_STATUSES as readonly string[]).includes(value);
}
