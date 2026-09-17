// lib/investor-portal-projection.ts
//
// Phase 15 — Investor portal projection.
//
// The investor portal receives a curated projection of the CRM state. This
// module is the single place where internal fields are stripped and
// investor-facing fields are shaped. Anything the investor should not see is
// removed here, before it ever crosses into the API response.
//
// Never leak: probability_percent, investor_score, assigned_admin,
// next_action (internal), stale signals, priority, risk_level, attention
// reason, notes written by the founder for internal use.

import {
  toInvestorFacingStage,
  type InternalStage,
} from "./investor-facing-stage";

export interface InternalProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  organization: string | null;
  investor_type: string | null;
  geography: string | null;
  proposed_ticket_inr: number | null;
  verification_status: string | null;
  access_level: string | null;
  kyc_completed: boolean | null;
  nda_signed: boolean | null;
  nda_signed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InternalCrmRow {
  stage: string | null;
  expected_investment_inr: number | null;
  actual_investment_inr: number | null;
  last_contact_date: string | null;
}

export interface InvestorFacingProfile {
  full_name: string;
  email: string;
  organization: string | null;
  investor_type: string | null;
  geography: string | null;
  portal_access: {
    verified: boolean;
    approved: boolean;
    kyc_complete: boolean;
    nda_signed: boolean;
  };
  relationship: {
    stage_label: string;
    stage_description: string;
  };
  investment: {
    proposed_ticket_inr: number | null;
    committed_inr: number | null;
    invested_inr: number | null;
    show_investment_section: boolean;
  };
  member_since: string | null;
}

const PORTAL_VISIBLE_STAGES: InternalStage[] = [
  "INTERESTED",
  "NDA",
  "DUE_DILIGENCE",
  "COMMITMENT",
  "INVESTED",
];

export function projectProfileForInvestor(
  profile: InternalProfile,
  crm: InternalCrmRow | null
): InvestorFacingProfile {
  const stage = (crm?.stage ?? "PROSPECT") as InternalStage;
  const relationshipStage = toInvestorFacingStage(stage);

  const committed =
    stage === "COMMITMENT" || stage === "INVESTED"
      ? Number(crm?.expected_investment_inr ?? 0)
      : null;

  const invested =
    stage === "INVESTED"
      ? Number(crm?.actual_investment_inr ?? 0)
      : null;

  return {
    full_name: profile.full_name ?? "Investor",
    email: profile.email ?? "",
    organization: profile.organization,
    investor_type: profile.investor_type,
    geography: profile.geography,
    portal_access: {
      verified: profile.verification_status === "VERIFIED",
      approved: profile.access_level === "APPROVED",
      kyc_complete: profile.kyc_completed === true,
      nda_signed: profile.nda_signed === true,
    },
    relationship: {
      stage_label: relationshipStage.label,
      stage_description: relationshipStage.description,
    },
    investment: {
      proposed_ticket_inr: profile.proposed_ticket_inr,
      committed_inr: committed,
      invested_inr: invested,
      show_investment_section: PORTAL_VISIBLE_STAGES.includes(stage),
    },
    member_since: profile.created_at,
  };
}

export interface InternalDocument {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_type: string | null;
  file_size_bytes: number | null;
  access_level: string | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InvestorFacingDocument {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_type: string | null;
  file_size_bytes: number | null;
  access_level: "PUBLIC" | "APPROVED";
  updated_at: string | null;
}

export function projectDocumentsForInvestor(
  documents: InternalDocument[]
): InvestorFacingDocument[] {
  return documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    category: doc.category ?? "Institutional",
    file_type: doc.file_type,
    file_size_bytes: doc.file_size_bytes,
    access_level:
      doc.access_level === "PUBLIC" ? "PUBLIC" : "APPROVED",
    updated_at: doc.updated_at,
  }));
}