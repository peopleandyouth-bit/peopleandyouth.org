import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";
import { projectProfileForInvestor } from "@/lib/investor-portal-projection";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireInvestor();

  if (isInvestorAuthFailure(auth)) {
    return NextResponse.json(
      { error: "Investor portal access required." },
      { status: auth.reason === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Read-only path.
        },
      },
    }
  );

  const { data: crmRow } = await supabase
    .from("investor_crm_logs")
    .select(
      "stage, expected_investment_inr, actual_investment_inr, last_contact_date"
    )
    .eq("investor_id", auth.profile.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const projection = projectProfileForInvestor(
    auth.profile,
    crmRow
      ? {
          stage: crmRow.stage,
          expected_investment_inr: crmRow.expected_investment_inr,
          actual_investment_inr: crmRow.actual_investment_inr,
          last_contact_date: crmRow.last_contact_date,
        }
      : null
  );

  return NextResponse.json({
    success: true,
    profile: projection,
  });
}