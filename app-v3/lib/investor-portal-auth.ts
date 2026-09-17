// lib/investor-portal-auth.ts
//
// Phase 15 — Investor session helper.
//
// Resolves the authenticated investor's profile. Enforces that the profile
// exists and is both VERIFIED and APPROVED before returning. Never exposes
// an unverified investor's data.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { InternalProfile } from "./investor-portal-projection";

export type InvestorAuthResult =
  | {
      authorized: true;
      userId: string;
      profile: InternalProfile;
    }
  | {
      authorized: false;
      reason: "UNAUTHENTICATED" | "NOT_AN_INVESTOR" | "NOT_VERIFIED";
      userId?: string;
    };

export type InvestorAuthFailure = Extract<
  InvestorAuthResult,
  { authorized: false }
>;

export function isInvestorAuthFailure(
  result: InvestorAuthResult
): result is InvestorAuthFailure {
  return result.authorized === false;
}

export async function requireInvestor(): Promise<InvestorAuthResult> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server component compatibility.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, reason: "UNAUTHENTICATED" };
  }

  const { data } = await supabase
    .from("investor_profiles")
    .select(
      [
        "id",
        "full_name",
        "email",
        "organization",
        "investor_type",
        "geography",
        "proposed_ticket_inr",
        "verification_status",
        "access_level",
        "kyc_completed",
        "nda_signed",
        "nda_signed_at",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      authorized: false,
      reason: "NOT_AN_INVESTOR",
      userId: user.id,
    };
  }

  const profile = data as unknown as InternalProfile;

  if (
    profile.verification_status !== "VERIFIED" ||
    profile.access_level !== "APPROVED"
  ) {
    return {
      authorized: false,
      reason: "NOT_VERIFIED",
      userId: user.id,
    };
  }

  return {
    authorized: true,
    userId: user.id,
    profile,
  };
}