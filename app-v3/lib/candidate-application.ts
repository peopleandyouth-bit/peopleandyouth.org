// lib/candidate-application.ts
//
// Phase 16 — Candidate application domain model.
//
// The 9-stage hiring workflow an application moves through. Stages are
// ordered; status transitions are unidirectional in the happy path but
// can revert (for example, from INTERVIEW back to SCREENING if a new
// concern emerges). Every transition writes to the audit log.

export const APPLICATION_STATUSES = [
  "APPLICATION_SUBMITTED",
  "INITIAL_SCREENING",
  "SKILL_ASSESSMENT",
  "HR_INTERACTION",
  "DOMAIN_INTERVIEW",
  "LEADERSHIP_INTERVIEW",
  "REFERENCE_VERIFICATION",
  "FINAL_DECISION",
  "OFFER_AND_ONBOARDING",
  "REJECTED",
  "WITHDRAWN",
  "ARCHIVED",
] as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUSES)[number];

export const HAPPY_PATH_STAGES: ApplicationStatus[] = [
  "APPLICATION_SUBMITTED",
  "INITIAL_SCREENING",
  "SKILL_ASSESSMENT",
  "HR_INTERACTION",
  "DOMAIN_INTERVIEW",
  "LEADERSHIP_INTERVIEW",
  "REFERENCE_VERIFICATION",
  "FINAL_DECISION",
  "OFFER_AND_ONBOARDING",
];

export const TERMINAL_STATUSES: ApplicationStatus[] = [
  "OFFER_AND_ONBOARDING",
  "REJECTED",
  "WITHDRAWN",
  "ARCHIVED",
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLICATION_SUBMITTED: "Application Submitted",
  INITIAL_SCREENING: "Initial Screening",
  SKILL_ASSESSMENT: "Skill Assessment",
  HR_INTERACTION: "HR Interaction",
  DOMAIN_INTERVIEW: "Domain Interview",
  LEADERSHIP_INTERVIEW: "Leadership Interview",
  REFERENCE_VERIFICATION: "Reference Verification",
  FINAL_DECISION: "Final Decision",
  OFFER_AND_ONBOARDING: "Offer & Onboarding",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  ARCHIVED: "Archived",
};

export const STATUS_DESCRIPTIONS: Record<ApplicationStatus, string> = {
  APPLICATION_SUBMITTED: "Candidate has submitted their profile.",
  INITIAL_SCREENING: "Recruitment board reviewing credentials.",
  SKILL_ASSESSMENT: "Practical or technical evaluation in progress.",
  HR_INTERACTION: "Culture and institutional alignment discussion.",
  DOMAIN_INTERVIEW: "In-depth review with Division Chiefs.",
  LEADERSHIP_INTERVIEW: "Strategic alignment with Executive Board.",
  REFERENCE_VERIFICATION: "Background and reference checks.",
  FINAL_DECISION: "Awaiting confirmation by the Institutional Board.",
  OFFER_AND_ONBOARDING: "Offer issued. Onboarding in progress.",
  REJECTED: "Application not progressed at this time.",
  WITHDRAWN: "Candidate withdrew their application.",
  ARCHIVED: "Closed and archived.",
};

export function isApplicationStatus(
  value: unknown
): value is ApplicationStatus {
  return (
    typeof value === "string" &&
    (APPLICATION_STATUSES as readonly string[]).includes(value)
  );
}

export function isTerminalStatus(
  status: ApplicationStatus
): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Generate a candidate ID and application ID.
 *
 * Candidate ID format: PY-CAND-2026-XXXXXX
 * Application ID format: PY-APP-2026-XXXX
 *
 * Uses crypto.randomUUID for randomness rather than Math.random so
 * collisions are negligible even at scale.
 */
export function generateIds(): {
  candidateId: string;
  applicationId: string;
} {
  const year = new Date().getFullYear();

  const candidateSuffix = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();

  const applicationSuffix = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 4)
    .toUpperCase();

  return {
    candidateId: `PY-CAND-${year}-${candidateSuffix}`,
    applicationId: `PY-APP-${year}-${applicationSuffix}`,
  };
}