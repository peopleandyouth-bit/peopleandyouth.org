export const CRM_ACTIVITY_TYPES = [
  "NOTE",
  "CALL",
  "EMAIL",
  "MEETING",
  "STAGE_CHANGE",
  "FOLLOW_UP",
  "KYC",
  "NDA",
  "DUE_DILIGENCE",
  "COMMITMENT",
  "INVESTMENT",
  "OTHER",
] as const;

export type CrmActivityType = (typeof CRM_ACTIVITY_TYPES)[number];

export const CRM_ACTIVITY_LABELS: Record<CrmActivityType, string> = {
  NOTE: "Internal Note",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  STAGE_CHANGE: "Stage Change",
  FOLLOW_UP: "Follow-up",
  KYC: "KYC",
  NDA: "NDA",
  DUE_DILIGENCE: "Due Diligence",
  COMMITMENT: "Commitment",
  INVESTMENT: "Investment",
  OTHER: "Other",
};

export function isCrmActivityType(
  value: unknown
): value is CrmActivityType {
  return (
    typeof value === "string" &&
    CRM_ACTIVITY_TYPES.includes(value as CrmActivityType)
  );
}
