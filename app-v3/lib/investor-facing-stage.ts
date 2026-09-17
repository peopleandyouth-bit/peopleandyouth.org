// lib/investor-facing-stage.ts
//
// Phase 15 — Investor-facing stage mapping.
//
// The internal CRM pipeline stages carry operational meaning (probability,
// priority, dwell time). The investor sees a curated projection of the same
// reality, expressed in relationship language.
//
// Rule: the internal column is NEVER shown to the investor. Only the
// investor-facing label travels through the portal API.

export const INVESTOR_FACING_STAGES = {
  PROSPECT: {
    label: "Relationship initiated",
    description: "We have received your interest and look forward to speaking with you.",
  },
  CONTACTED: {
    label: "In conversation",
    description: "We are in active conversation and getting to know your priorities.",
  },
  INTERESTED: {
    label: "Exploring partnership",
    description: "We are exploring a potential partnership together.",
  },
  NDA: {
    label: "Confidential review",
    description: "We are working together under confidentiality to exchange details.",
  },
  DUE_DILIGENCE: {
    label: "Due diligence",
    description: "You are reviewing the institutional, operational and financial materials.",
  },
  COMMITMENT: {
    label: "Investment process",
    description: "We are working through the investment process together.",
  },
  INVESTED: {
    label: "Investor",
    description: "Welcome to People & Youth as an institutional investor.",
  },
} as const;

export type InternalStage = keyof typeof INVESTOR_FACING_STAGES;

export function toInvestorFacingStage(
  internalStage: string | null | undefined
): { label: string; description: string } {
  const key = (internalStage ?? "PROSPECT") as InternalStage;
  const entry = INVESTOR_FACING_STAGES[key];
  return entry ?? INVESTOR_FACING_STAGES.PROSPECT;
}

export function isInternalStage(value: unknown): value is InternalStage {
  return (
    typeof value === "string" &&
    value in INVESTOR_FACING_STAGES
  );
}