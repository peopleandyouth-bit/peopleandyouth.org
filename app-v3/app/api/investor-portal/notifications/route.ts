import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";

export const dynamic = "force-dynamic";

type NotificationCategory = "ACTION" | "RELATIONSHIP" | "INSTITUTION";

interface InvestorNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  occurred_at: string;
  href: string | null;
}

/*
 * Notifications are derived from current portal state. They are not
 * persisted — the investor sees a live snapshot of what matters now:
 *
 *   ACTION      - next steps they need to act on
 *   RELATIONSHIP - upcoming meetings or recent activity
 *   INSTITUTION - new published updates
 */
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

  const [
    { data: nextSteps },
    { data: meetings },
    { data: documents },
    { data: updates },
    { data: acknowledgements },
  ] = await Promise.all([
    supabase
      .from("investor_crm_activities")
      .select("id, subject, due_at")
      .eq("investor_id", auth.profile.id)
      .eq("activity_type", "FOLLOW_UP")
      .eq("status", "OPEN")
      .order("due_at", { ascending: true })
      .limit(5),
    supabase
      .from("investor_crm_activities")
      .select("id, subject, due_at")
      .eq("investor_id", auth.profile.id)
      .eq("activity_type", "MEETING")
      .order("occurred_at", { ascending: false })
      .limit(5),
    supabase
      .from("investor_documents")
      .select("id, title, created_at")
      .eq("is_active", true)
      .in("access_level", ["PUBLIC", "APPROVED"])
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("public_publications_feed")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("investor_document_acknowledgements")
      .select("id, document_id, acknowledged_at")
      .eq("investor_id", auth.profile.id)
      .order("acknowledged_at", { ascending: false })
      .limit(20),
  ]);

  const acknowledgedIds = new Set(
    (acknowledgements ?? []).map((a) => a.document_id)
  );

  const now = Date.now();
  const notifications: InvestorNotification[] = [];

  // ACTION — overdue and upcoming next steps
  for (const step of nextSteps ?? []) {
    if (step.due_at && new Date(step.due_at).getTime() < now) {
      notifications.push({
        id: `overdue:${step.id}`,
        category: "ACTION",
        title: "Next step overdue",
        body: step.subject ?? "Please review your pending actions.",
        occurred_at: step.due_at ?? new Date().toISOString(),
        href: "/investor-portal/next-steps",
      });
    }
  }

  // ACTION — new documents not yet acknowledged
  for (const doc of documents ?? []) {
    if (!acknowledgedIds.has(doc.id)) {
      notifications.push({
        id: `document:${doc.id}`,
        category: "ACTION",
        title: "New document available",
        body: doc.title,
        occurred_at: doc.created_at ?? new Date().toISOString(),
        href: "/investor-portal/documents",
      });
    }
  }

  // RELATIONSHIP — upcoming meetings
  for (const meeting of meetings ?? []) {
    if (
      meeting.due_at &&
      new Date(meeting.due_at).getTime() >= now
    ) {
      notifications.push({
        id: `meeting:${meeting.id}`,
        category: "RELATIONSHIP",
        title: "Upcoming meeting",
        body: meeting.subject ?? "Investor discussion",
        occurred_at: meeting.due_at,
        href: "/investor-portal/meetings",
      });
    }
  }

  // INSTITUTION — recent updates
  for (const update of updates ?? []) {
    notifications.push({
      id: `update:${update.id}`,
      category: "INSTITUTION",
      title: "New institutional update",
      body: update.title ?? "A new update is available.",
      occurred_at: update.created_at ?? new Date().toISOString(),
      href: "/investor-portal/updates",
    });
  }

  notifications.sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() -
      new Date(a.occurred_at).getTime()
  );

  const unreadCount = notifications.filter((n) => {
    const cutoff = now - 7 * 86400000;
    return new Date(n.occurred_at).getTime() >= cutoff;
  }).length;

  return NextResponse.json({
    success: true,
    notifications,
    unread_count: unreadCount,
  });
}