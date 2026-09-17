import { redirect } from "next/navigation";
import { requireInvestor } from "@/lib/investor-portal-auth";

export const dynamic = "force-dynamic";

function formatINR(value: number | null | undefined) {
  if (!value) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function statusChip(value: boolean, on: string, off: string) {
  return value ? on : off;
}

export default async function InvestorPortalProfilePage() {
  const auth = await requireInvestor();

  if (auth.authorized === false) {
    redirect("/investor-login");
  }

  const profile = auth.profile;

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Profile
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          Your profile.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          Institutional details as recorded by People &amp; Youth. If
          anything needs updating, please contact Investor Relations.
        </p>
      </header>

      <section className="border-t border-[#f5f0e6]/8 pt-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
          Identity
        </p>

        <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <Field label="Full name" value={profile.full_name ?? "—"} />
          <Field label="Email" value={profile.email ?? "—"} />
          <Field label="Organisation" value={profile.organization} />
          <Field label="Investor type" value={profile.investor_type} />
          <Field label="Geography" value={profile.geography} />
          <Field
            label="Proposed ticket"
            value={formatINR(profile.proposed_ticket_inr)}
          />
        </dl>
      </section>

      <section className="border-t border-[#f5f0e6]/8 pt-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
          Verification
        </p>

        <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <Field
            label="Investor verification"
            value={statusChip(
              profile.verification_status === "VERIFIED",
              "Verified",
              "In progress"
            )}
          />
          <Field
            label="Portal access"
            value={statusChip(
              profile.access_level === "APPROVED",
              "Approved",
              "Pending"
            )}
          />
          <Field
            label="KYC"
            value={statusChip(
              profile.kyc_completed === true,
              "Complete",
              "Pending"
            )}
          />
          <Field
            label="NDA"
            value={statusChip(
              profile.nda_signed === true,
              "Signed",
              "Pending"
            )}
          />
        </dl>
      </section>

      <section className="border-t border-[#f5f0e6]/8 pt-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
          Membership
        </p>
        <p className="mt-4 text-sm leading-6 text-[#f5f0e6]/55">
          Your relationship with People &amp; Youth began on{" "}
          {profile.created_at
            ? new Date(profile.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "—"}
          .
        </p>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-[#f5f0e6]/35">
        {label}
      </dt>
      <dd className="mt-2 text-base font-light text-[#f5f0e6]">
        {value || "—"}
      </dd>
    </div>
  );
}