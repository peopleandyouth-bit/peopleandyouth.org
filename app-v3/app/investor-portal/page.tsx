import Link from "next/link";
import { redirect } from "next/navigation";
import { requireInvestor } from "@/lib/investor-portal-auth";
import { projectProfileForInvestor } from "@/lib/investor-portal-projection";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function InvestorPortalPage() {
  const auth = await requireInvestor();

  if (auth.authorized === false) {
    if (auth.reason === "UNAUTHENTICATED") {
      redirect("/investor-login");
    }
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

  const { count: documentCount } = await supabase
    .from("investor_documents")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .in("access_level", ["PUBLIC", "APPROVED"]);

  const firstName =
    projection.full_name.split(" ")[0] || projection.full_name;

  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);

  return (
    <div className="space-y-12">
      {/* Greeting */}
      <section>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          {greeting}
        </p>
        <h1 className="mt-3 text-4xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-5xl">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          Here is what is happening in your relationship with People &amp;
          Youth.
        </p>
      </section>

      {/* Relationship status */}
      <section className="border-l-2 border-[#c8a56b] pl-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
          Your relationship
        </p>
        <p className="mt-2 text-2xl font-light tracking-tight text-[#f5f0e6] sm:text-3xl">
          {projection.relationship.stage_label}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#f5f0e6]/50">
          {projection.relationship.stage_description}
        </p>
      </section>

      {/* Summary tiles */}
      <section className="grid gap-6 sm:grid-cols-3">
        <div className="border-t border-[#f5f0e6]/8 pt-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5f0e6]/40">
            Documents
          </p>
          <p className="mt-2 text-3xl font-light text-[#f5f0e6]">
            {documentCount ?? 0}
          </p>
          <p className="mt-1 text-xs text-[#f5f0e6]/40">
            Available in your private room
          </p>
          <Link
            href="/investor-portal/documents"
            className="mt-4 inline-block text-xs tracking-wider text-[#c8a56b] transition hover:text-[#d8b57b]"
          >
            View documents →
          </Link>
        </div>

        <div className="border-t border-[#f5f0e6]/8 pt-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5f0e6]/40">
            Verification
          </p>
          <p className="mt-2 text-3xl font-light text-[#f5f0e6]">
            {projection.portal_access.verified &&
            projection.portal_access.approved
              ? "Complete"
              : "In progress"}
          </p>
          <p className="mt-1 text-xs text-[#f5f0e6]/40">
            {projection.portal_access.kyc_complete
              ? "KYC · complete"
              : "KYC · pending"}
          </p>
        </div>

        <div className="border-t border-[#f5f0e6]/8 pt-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5f0e6]/40">
            Member since
          </p>
          <p className="mt-2 text-3xl font-light text-[#f5f0e6]">
            {projection.member_since
              ? new Date(projection.member_since).toLocaleDateString(
                  "en-IN",
                  { month: "short", year: "numeric" }
                )
              : "—"}
          </p>
          <p className="mt-1 text-xs text-[#f5f0e6]/40">
            Relationship with People &amp; Youth
          </p>
        </div>
      </section>

      {/* Investment section — only when appropriate */}
      {projection.investment.show_investment_section && (
        <section className="border-t border-[#f5f0e6]/8 pt-8">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
            Investment
          </p>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {projection.investment.committed_inr !== null && (
              <div>
                <p className="text-xs tracking-wider text-[#f5f0e6]/40">
                  Committed
                </p>
                <p className="mt-2 text-2xl font-light text-[#f5f0e6]">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(
                    projection.investment.committed_inr
                  )}
                </p>
              </div>
            )}

            {projection.investment.invested_inr !== null && (
              <div>
                <p className="text-xs tracking-wider text-[#f5f0e6]/40">
                  Invested
                </p>
                <p className="mt-2 text-2xl font-light text-[#f5f0e6]">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(
                    projection.investment.invested_inr
                  )}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* What next */}
      <section className="border-t border-[#f5f0e6]/8 pt-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
          What comes next
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f5f0e6]/60">
          Your relationship with People &amp; Youth is a private, long-lived
          engagement. New materials will appear in your documents section
          as they become available. When there is a next conversation to
          schedule, you will see it here and receive an email from Investor
          Relations.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/investor-portal/documents"
            className="rounded-lg border border-[#c8a56b]/40 px-5 py-2.5 text-xs tracking-wider text-[#c8a56b] transition hover:bg-[#c8a56b]/10"
          >
            Open documents
          </Link>
          <Link
            href="/investor-portal/profile"
            className="rounded-lg border border-[#f5f0e6]/10 px-5 py-2.5 text-xs tracking-wider text-[#f5f0e6]/60 transition hover:bg-[#f5f0e6]/[0.04] hover:text-[#f5f0e6]"
          >
            View profile
          </Link>
        </div>
      </section>
    </div>
  );
}