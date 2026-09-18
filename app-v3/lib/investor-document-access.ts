// lib/investor-document-access.ts
//
// Phase 15 Layer 3 — Document access determination.
//
// Single source of truth for which documents an investor can see.
// The documents API calls this; the investor portal page calls this.
// Never duplicate access logic elsewhere.

import type { SupabaseClient } from "@supabase/supabase-js";

export type AccessLevel =
  | "PUBLIC"
  | "REGISTERED"
  | "VERIFIED"
  | "APPROVED"
  | "DD_APPROVED"
  | "INVESTOR_SPECIFIC";

export interface InvestorAccessState {
  investorId: string;
  verificationStatus: string | null;
  accessLevel: string | null;
  hasDdAccess: boolean;
}

/*
 * Load the investor's access state, including whether they have been
 * explicitly granted DD access by the founder.
 */
export async function loadInvestorAccessState(
  supabase: SupabaseClient,
  investorId: string,
  verificationStatus: string | null,
  accessLevel: string | null
): Promise<InvestorAccessState> {
  const { data, error } = await supabase
    .from("investor_dd_access")
    .select("id")
    .eq("investor_id", investorId)
    .maybeSingle();

  if (error) {
    console.error("[doc-access] DD lookup failed:", error);
  }

  return {
    investorId,
    verificationStatus,
    accessLevel,
    hasDdAccess: Boolean(data),
  };
}

/*
 * Return the list of access levels the investor is eligible to see.
 *
 * Ordering matters: an investor with DD access sees APPROVED docs
 * AND DD_APPROVED docs. An investor without DD access sees only
 * APPROVED.
 *
 * INVESTOR_SPECIFIC documents are filtered separately by investor id.
 */
export function eligibleAccessLevels(
  state: InvestorAccessState
): AccessLevel[] {
  const levels: AccessLevel[] = ["PUBLIC"];

  const verified = state.verificationStatus === "VERIFIED";
  const approved = state.accessLevel === "APPROVED";

  if (verified) {
    levels.push("VERIFIED");
  }

  if (verified && approved) {
    levels.push("APPROVED");
  }

  if (verified && approved && state.hasDdAccess) {
    levels.push("DD_APPROVED");
  }

  return levels;
}

/*
 * Determine if a specific document is visible to this investor.
 *
 * The investor must be able to see the document's access level, OR
 * the document must be INVESTOR_SPECIFIC and belong to this investor.
 */
export function canSeeDocument(
  document: {
    access_level: string | null;
    investor_id?: string | null;
  },
  state: InvestorAccessState
): boolean {
  const level = (document.access_level ??
    "APPROVED") as AccessLevel;

  if (level === "INVESTOR_SPECIFIC") {
    return document.investor_id === state.investorId;
  }

  const allowed = eligibleAccessLevels(state);
  return allowed.includes(level);
}