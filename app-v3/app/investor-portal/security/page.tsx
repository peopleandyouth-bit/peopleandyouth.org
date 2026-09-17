import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireInvestor } from "@/lib/investor-portal-auth";

export const dynamic = "force-dynamic";

export default async function InvestorPortalSecurityPage() {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const createdAt = user?.created_at;
  const lastSignIn = user?.last_sign_in_at;

  const daysSinceCreated = createdAt
    ? Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / 86400000
      )
    : null;

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Security
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          Your account security.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          Account security information for your investor relationship with
          People &amp; Youth.
        </p>
      </header>

      <section className="border-t border-[#f5f0e6]/8 pt-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
          Account
        </p>

        <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-[#f5f0e6]/35">
              Email
            </dt>
            <dd className="mt-2 flex items-center gap-2 text-base font-light text-[#f5f0e6]">
              {user?.email ?? "—"}
              {user?.email_confirmed_at && (
                <span className="rounded-full border border-[#c8a56b]/40 px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#c8a56b]">
                  Verified
                </span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-[#f5f0e6]/35">
              Account created
            </dt>
            <dd className="mt-2 text-base font-light text-[#f5f0e6]">
              {createdAt
                ? new Date(createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
              {daysSinceCreated !== null && (
                <span className="ml-2 text-xs text-[#f5f0e6]/40">
                  ({daysSinceCreated} days ago)
                </span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-[#f5f0e6]/35">
              Last sign-in
            </dt>
            <dd className="mt-2 text-base font-light text-[#f5f0e6]">
              {lastSignIn
                ? new Date(lastSignIn).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="border-t border-[#f5f0e6]/8 pt-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
          Recommendations
        </p>

        <ul className="mt-6 space-y-4 text-sm leading-6 text-[#f5f0e6]/55">
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8a56b]" />
            Use a strong, unique password that you do not use anywhere else.
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8a56b]" />
            If you suspect any unusual activity, please{" "}
            <a
              href="mailto:contact@peopleandyouth.org"
              className="text-[#c8a56b] underline decoration-[#c8a56b]/40 underline-offset-4"
            >
              contact Investor Relations
            </a>{" "}
            immediately.
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8a56b]" />
            Session-based two-factor authentication is planned as part of
            the institutional security roadmap.
          </li>
        </ul>
      </section>

      <section className="border-t border-[#f5f0e6]/8 pt-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
          Contact
        </p>
        <p className="mt-4 text-sm leading-6 text-[#f5f0e6]/55">
          For any questions about your account, email{" "}
          <a
            href="mailto:contact@peopleandyouth.org"
            className="text-[#c8a56b] underline decoration-[#c8a56b]/40 underline-offset-4"
          >
            contact@peopleandyouth.org
          </a>
          .
        </p>
      </section>
    </div>
  );
}