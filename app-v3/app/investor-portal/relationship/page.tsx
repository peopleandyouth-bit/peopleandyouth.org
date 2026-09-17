import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireInvestor } from "@/lib/investor-portal-auth";
import { projectProfileForInvestor } from "@/lib/investor-portal-projection";

export const dynamic = "force-dynamic";

type CuratedActivity = {
  id: string;
  occurred_at: string;
  subject: string | null;
  investor_summary: string;
};

const CURATED_ACTIVITY_LABELS: Record<string, string> = {
  MEETING: "Meeting",
  CALL: "Conversation",
  EMAIL: "Communication",
  FOLLOW_UP: "Next step",
  NOTE: "Update",
  COMMITMENT: "Investment discussion",
  DOCUMENT: "Document shared",
};

function categoryOf(activityType: string, details: string | null): string {
  if (details?.includes("[DOCUMENT]")) return "DOCUMENT";
  return activityType;
}

function curatedSummary(
  activityType: string,
  category: string,
  subject: string | null
): string {
  const label = CURATED_ACTIVITY_LABELS[category] ?? "Activity";
  return subject ? `${label} · ${subject}` : label;
}

export default async function InvestorPortalRelationshipPage() {
  const auth = await requireInvestor();

  if (auth.authorized === false) {
    redirect("/investor-login");
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

  const { data: activitiesData } = await supabase
    .from("investor_crm_activities")
    .select("id, activity_type, subject, details, occurred_at, status")
    .eq("investor_id", auth.profile.id)
    .in("activity_type", [
      "MEETING",
      "CALL",
      "EMAIL",
      "COMMITMENT",
      "NOTE",
      "FOLLOW_UP",
    ])
    .order("occurred_at", { ascending: false })
    .limit(20);

  const activities: CuratedActivity[] = (activitiesData ?? [])
    .map((a) => {
      const category = categoryOf(a.activity_type, a.details);
      return {
        id: a.id,
        occurred_at: a.occurred_at,
        subject: a.subject,
        investor_summary: curatedSummary(
          a.activity_type,
          category,
          a.subject
        ),
      };
    })
    .filter(
      (a) =>
        a.subject === null ||
        !a.subject?.toUpperCase().includes("FOLLOW UP OVERDUE")
    );

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Relationship
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          Your relationship with People &amp; Youth.
        </h1>
      </header>

      {/* Current stage */}
      <section className="border-l-2 border-[#c8a56b] pl-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
          Current stage
        </p>
        <p className="mt-2 text-2xl font-light tracking-tight text-[#f5f0e6]">
          {projection.relationship.stage_label}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#f5f0e6]/50">
          {projection.relationship.stage_description}
        </p>
      </section>

      {/* Timeline */}
      <section className="border-t border-[#f5f0e6]/8 pt-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
          Relationship timeline
        </p>

        {activities.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#f5f0e6]/10 px-6 py-12 text-center">
            <p className="text-sm text-[#f5f0e6]/50">
              Your relationship timeline is just beginning.
            </p>
            <p className="mt-2 text-xs leading-5 text-[#f5f0e6]/35">
              As your engagement with People &amp; Youth develops,
              conversations, meetings and shared materials will appear
              here.
            </p>
          </div>
        ) : (
          <ol className="relative mt-8 space-y-8 border-l border-[#f5f0e6]/10 pl-8">
            {activities.map((activity) => (
              <li key={activity.id} className="relative">
                <span className="absolute -left-[37px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border border-[#c8a56b]/60 bg-[#0a1020]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c8a56b]" />
                </span>

                <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5f0e6]/35">
                  {new Date(activity.occurred_at).toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "long", year: "numeric" }
                  )}
                </p>

                <p className="mt-2 text-base font-light text-[#f5f0e6]">
                  {activity.investor_summary}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}