import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";
import {
  extractMeetings,
  type InternalActivity,
} from "@/lib/investor-portal-meetings";

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

  const { data, error } = await supabase
    .from("investor_crm_activities")
    .select(
      "id, activity_type, subject, details, occurred_at, due_at, status, assigned_admin"
    )
    .eq("investor_id", auth.profile.id)
    .eq("activity_type", "MEETING")
    .order("occurred_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Investor portal meetings error:", error);
    return NextResponse.json(
      { error: "Unable to load meetings." },
      { status: 500 }
    );
  }

  const meetings = extractMeetings(
    (data ?? []) as InternalActivity[]
  );

  return NextResponse.json({
    success: true,
    meetings,
  });
}