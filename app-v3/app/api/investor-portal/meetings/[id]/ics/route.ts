import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";
import {
  extractMeetings,
  buildIcsEvent,
  type InternalActivity,
} from "@/lib/investor-portal-meetings";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireInvestor();

  if (isInvestorAuthFailure(auth)) {
    return NextResponse.json(
      { error: "Investor portal access required." },
      { status: auth.reason === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  const { id } = await context.params;

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
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Meeting not found." },
      { status: 404 }
    );
  }

  const meetings = extractMeetings([
    data as InternalActivity,
  ]);

  const meeting = meetings[0];

  if (!meeting) {
    return NextResponse.json(
      { error: "Meeting could not be rendered." },
      { status: 404 }
    );
  }

  const ics = buildIcsEvent(meeting);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="people-and-youth-meeting-${meeting.id.slice(0, 8)}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}