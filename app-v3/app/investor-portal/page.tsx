import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

type InvestorProfile = {
  id: string;
  full_name: string;
  email: string;
  organization: string | null;
  investor_type: string | null;
  proposed_ticket_inr: number | null;
  verification_status: string;
  access_level: string;
  kyc_completed: boolean;
  nda_signed: boolean;
};
type InvestorDocument = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_type: string | null;
  file_size_bytes: number | null;
  access_level: string;
  display_order: number | null;
};

export default async function InvestorPortalPage() {
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
            // Safe for server component compatibility.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/investors");
  }

  await supabase.rpc("link_current_investor");

  const { data: profileData } = await supabase
    .from("investor_profiles")
    .select(
      [
        "id",
        "full_name",
        "email",
        "organization",
        "investor_type",
        "proposed_ticket_inr",
        "verification_status",
        "access_level",
        "kyc_completed",
        "nda_signed",
      ].join(", ")
    )
    .eq("user_id", user.id)
    .eq("verification_status", "VERIFIED")
    .eq("access_level", "APPROVED")
    .maybeSingle();

  const profile = profileData as unknown as InvestorProfile | null;

  if (!profile) {
    redirect("/investors");
  }

  const { data: documentsData } = await supabase
    .from("investor_documents")
    .select(
      [
        "id",
        "title",
        "description",
        "category",
        "file_type",
        "file_size_bytes",
        "access_level",
        "display_order",
      ].join(", ")
    )
    .eq("is_active", true)
    .in("access_level", ["PUBLIC", "APPROVED"])
    .order("display_order", { ascending: true });

  const documents = documentsData as unknown as InvestorDocument[] | null;

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/investors"
            className="text-sm font-semibold tracking-wide"
          >
            PEOPLE &amp; YOUTH
          </Link>

          <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Investor Relations
          </span>
        </div>
      </header>

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Restricted Investor Portal
          </p>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Institutional access to People &amp; Youth.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
            Welcome, {profile.full_name}. This is the secure investor
            environment for institutional materials, fundraising information
            and ongoing investor relations.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Investor
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              {profile.full_name}
            </h2>

            <p className="mt-2 text-sm text-neutral-600">
              {profile.organization || profile.investor_type || "Investor"}
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              {profile.email}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Access
            </p>

            <p className="mt-3 text-xl font-semibold">
              {profile.access_level}
            </p>

            <p className="mt-2 text-sm text-neutral-600">
              Verification: {profile.verification_status}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Investor Readiness
            </p>

            <div className="mt-3 space-y-2 text-sm text-neutral-600">
              <p>
                KYC: {profile.kyc_completed ? "Complete" : "Pending"}
              </p>

              <p>
                NDA: {profile.nda_signed ? "Signed" : "Pending"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-col justify-between gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Secure Data Room
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Investor materials
              </h2>
            </div>

            <p className="text-sm text-neutral-500">
              {documents?.length ?? 0} active document
              {(documents?.length ?? 0) === 1 ? "" : "s"}
            </p>
          </div>

          {!documents || documents.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
              <h3 className="text-lg font-semibold">
                The data room is being prepared.
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                Investor materials will appear here as they are released by
                People &amp; Youth.
              </p>
            </div>
          ) : (
            <div className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
              {documents.map((document) => (
                <article
                  key={document.id}
                  className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                      {document.category || "Investor Material"}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold">
                      {document.title}
                    </h3>

                    {document.description && (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                        {document.description}
                      </p>
                    )}

                    <div className="mt-2 flex gap-3 text-[11px] text-neutral-400">
                      {document.file_type && (
                        <span>{document.file_type.toUpperCase()}</span>
                      )}

                      {document.file_size_bytes && (
                        <span>
                          {(document.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={`/api/investors/document?id=${encodeURIComponent(
                      document.id
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-900 px-5 py-2.5 text-sm font-semibold transition hover:bg-neutral-900 hover:text-white"
                  >
                    Open document
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

