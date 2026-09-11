"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Investor = {
  id?: string;
  investor_id?: string;
  full_name?: string;
  name?: string;
  email?: string;
  organization?: string;
  investor_type?: string;
  verification_status?: string;
  access_level?: string;
  kyc_completed?: boolean;
  nda_signed?: boolean;
  stage?: string;
  expected_investment_inr?: number;
  actual_investment_inr?: number;
  probability_percent?: number;
  next_action?: string;
  last_contact_date?: string;
  assigned_admin?: string;
};

type Activity = {
  id?: string;
  investor_id?: string;
  activity_type?: string;
  subject?: string;
  details?: string;
  occurred_at?: string;
  due_at?: string;
  status?: string;
  assigned_admin?: string;
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function compactMoney(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return money(value);
}

function normalizeInvestorRows(payload: any): Investor[] {
  const rows =
    payload?.investors ??
    payload?.data ??
    payload?.rows ??
    payload?.records ??
    [];

  if (!Array.isArray(rows)) return [];

  return rows.map((row: any) => ({
    ...row,
    id: row.id ?? row.investor_id,
    investor_id: row.investor_id ?? row.id,
    full_name: row.full_name ?? row.name ?? "Unnamed Investor",
    expected_investment_inr: Number(row.expected_investment_inr ?? 0),
    actual_investment_inr: Number(row.actual_investment_inr ?? 0),
    probability_percent: Number(row.probability_percent ?? 0),
  }));
}

function normalizeActivityRows(payload: any): Activity[] {
  const rows =
    payload?.activities ??
    payload?.data ??
    payload?.rows ??
    payload?.records ??
    [];

  if (!Array.isArray(rows)) return [];

  return rows;
}

function titleCase(value?: string) {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

function statusClass(value?: string) {
  const v = value?.toUpperCase();

  if (v === "APPROVED" || v === "VERIFIED" || v === "COMPLETED") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (v === "PENDING" || v === "OPEN") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-white/10 bg-white/[0.04] text-white/60";
}

export default function InvestorRelationsDashboard() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [crmResponse, activityResponse] = await Promise.all([
          fetch("/api/admin/investor-crm", { cache: "no-store" }),
          fetch("/api/admin/investor-crm/activities", { cache: "no-store" }),
        ]);

        if (crmResponse.status === 401 || activityResponse.status === 401) {
          throw new Error("Unauthorized");
        }

        if (!crmResponse.ok) {
          throw new Error("Unable to load Investor CRM data.");
        }

        const crmPayload = await crmResponse.json();

        let activityPayload: any = {};
        if (activityResponse.ok) {
          activityPayload = await activityResponse.json();
        }

        if (cancelled) return;

        setInvestors(normalizeInvestorRows(crmPayload));
        setActivities(normalizeActivityRows(activityPayload));
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load Investor Relations.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = investors.length;

    const pending = investors.filter(
      (x) => x.verification_status?.toUpperCase() === "PENDING"
    ).length;

    const verified = investors.filter(
      (x) =>
        x.verification_status?.toUpperCase() === "VERIFIED" ||
        x.verification_status?.toUpperCase() === "APPROVED"
    ).length;

    const approved = investors.filter(
      (x) => x.verification_status?.toUpperCase() === "APPROVED"
    ).length;

    const pipeline = investors.reduce(
      (sum, x) => sum + Number(x.expected_investment_inr || 0),
      0
    );

    const weighted = investors.reduce(
      (sum, x) =>
        sum +
        Number(x.expected_investment_inr || 0) *
          (Number(x.probability_percent || 0) / 100),
      0
    );

    const invested = investors.reduce(
      (sum, x) => sum + Number(x.actual_investment_inr || 0),
      0
    );

    const openActivities = activities.filter(
      (x) => x.status?.toUpperCase() === "OPEN"
    );

    const now = Date.now();

    const overdue = openActivities.filter(
      (x) => x.due_at && new Date(x.due_at).getTime() < now
    );

    const emails = activities.filter(
      (x) => x.activity_type?.toUpperCase() === "EMAIL"
    );

    const meetings = activities.filter(
      (x) => x.activity_type?.toUpperCase() === "MEETING"
    );

    const kycComplete = investors.filter((x) => x.kyc_completed).length;
    const ndaSigned = investors.filter((x) => x.nda_signed).length;

    return {
      total,
      pending,
      verified,
      approved,
      pipeline,
      weighted,
      invested,
      openFollowups: openActivities.length,
      overdue: overdue.length,
      emails: emails.length,
      meetings: meetings.length,
      kycComplete,
      ndaSigned,
    };
  }, [investors, activities]);

  const filteredInvestors = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return investors;

    return investors.filter((investor) =>
      [
        investor.full_name,
        investor.organization,
        investor.email,
        investor.investor_type,
        investor.stage,
        investor.assigned_admin,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [investors, search]);

  const attentionInvestors = useMemo(() => {
    return [...investors]
      .filter((x) => {
        const verification = x.verification_status?.toUpperCase();

        return (
          verification === "PENDING" ||
          !x.kyc_completed ||
          !x.nda_signed ||
          Boolean(x.next_action)
        );
      })
      .sort(
        (a, b) =>
          Number(b.expected_investment_inr || 0) -
          Number(a.expected_investment_inr || 0)
      )
      .slice(0, 6);
  }, [investors]);

  const recentActivities = useMemo(() => {
    return [...activities]
      .sort(
        (a, b) =>
          new Date(b.occurred_at || 0).getTime() -
          new Date(a.occurred_at || 0).getTime()
      )
      .slice(0, 8);
  }, [activities]);

  return (
    <main className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10">
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/[0.10] via-violet-500/[0.08] to-transparent p-7 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Investor Relations
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Executive Command Dashboard
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
                The institutional operating layer for investor pipeline,
                relationships, capital, follow-ups, communications and
                diligence.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/investor-crm"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/75 transition hover:bg-white/[0.09] hover:text-white"
              >
                CRM
              </Link>

              <Link
                href="/admin/investor-operations"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/75 transition hover:bg-white/[0.09] hover:text-white"
              >
                Operations
              </Link>

              <Link
                href="/admin/investor-intelligence"
                className="rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-200 transition hover:bg-violet-400/15"
              >
                Intelligence
              </Link>

              <Link
                href="/admin/investor-communications"
                className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/15"
              >
                Communications
              </Link>

              <Link
                href="/admin/investors"
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/75 transition hover:bg-white/[0.09] hover:text-white"
              >
                Data Room
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/50">
            Loading Investor Relations command data…
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Total Investors", metrics.total, "Institutional relationships"],
                ["Pending Applications", metrics.pending, "Awaiting review"],
                ["Verified / Approved", metrics.verified, "Qualified relationships"],
                ["Open Follow-ups", metrics.openFollowups, "Operational actions"],
              ].map(([label, value, description]) => (
                <div
                  key={label as string}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                    {label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold">
                    {value as number}
                  </p>
                  <p className="mt-2 text-xs text-white/40">
                    {description as string}
                  </p>
                </div>
              ))}
            </section>

            <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Pipeline", compactMoney(metrics.pipeline), "Expected capital"],
                ["Weighted Pipeline", compactMoney(metrics.weighted), "Probability adjusted"],
                ["Invested Capital", compactMoney(metrics.invested), "Recorded actual investment"],
                ["Overdue Actions", metrics.overdue, "Require immediate attention"],
              ].map(([label, value, description]) => (
                <div
                  key={label as string}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                    {label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold">
                    {value as any}
                  </p>
                  <p className="mt-2 text-xs text-white/40">
                    {description as string}
                  </p>
                </div>
              ))}
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/70">
                      Attention Required
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      Investor relationship queue
                    </h2>
                  </div>

                  <Link
                    href="/admin/investor-intelligence"
                    className="text-sm text-cyan-300 hover:text-cyan-200"
                  >
                    Open Intelligence →
                  </Link>
                </div>

                <div className="mt-5 space-y-3">
                  {attentionInvestors.length === 0 ? (
                    <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-5 text-sm text-emerald-200">
                      No immediate investor attention items detected.
                    </div>
                  ) : (
                    attentionInvestors.map((investor, index) => (
                      <div
                        key={investor.id || investor.investor_id || index}
                        className="rounded-2xl border border-white/8 bg-black/20 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium">
                              {investor.full_name || "Unnamed Investor"}
                            </p>

                            <p className="mt-1 text-xs text-white/40">
                              {investor.organization || investor.email || "No organisation"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] ${statusClass(
                                investor.verification_status
                              )}`}
                            >
                              {titleCase(investor.verification_status)}
                            </span>

                            {investor.stage && (
                              <span className="rounded-full border border-violet-400/15 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-200">
                                {titleCase(investor.stage)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                          <div>
                            <span className="text-white/30">Pipeline</span>
                            <p className="mt-1 text-white/75">
                              {compactMoney(
                                Number(investor.expected_investment_inr || 0)
                              )}
                            </p>
                          </div>

                          <div>
                            <span className="text-white/30">KYC</span>
                            <p className="mt-1 text-white/75">
                              {investor.kyc_completed ? "Complete" : "Pending"}
                            </p>
                          </div>

                          <div>
                            <span className="text-white/30">NDA</span>
                            <p className="mt-1 text-white/75">
                              {investor.nda_signed ? "Signed" : "Pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-violet-300/70">
                  Relationship Health
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Institutional readiness
                </h2>

                <div className="mt-6 space-y-5">
                  {[
                    ["Verified / Approved", metrics.verified, metrics.total],
                    ["KYC Complete", metrics.kycComplete, metrics.total],
                    ["NDA Signed", metrics.ndaSigned, metrics.total],
                  ].map(([label, value, total]) => {
                    const percentage =
                      Number(total) > 0
                        ? Math.round((Number(value) / Number(total)) * 100)
                        : 0;

                    return (
                      <div key={label as string}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-white/65">
                            {label as string}
                          </span>
                          <span className="text-white/40">
                            {value as number}/{total as number}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="mt-1 text-right text-[11px] text-white/30">
                          {percentage}%
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-white/30">
                      Emails
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {metrics.emails}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-white/30">
                      Meetings
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {metrics.meetings}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                    Investor Universe
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Executive relationship view
                  </h2>
                </div>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search investor, organisation, stage…"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-400/40 md:max-w-sm"
                />
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-xs uppercase tracking-wider text-white/30">
                      <th className="px-3 py-3 font-medium">Investor</th>
                      <th className="px-3 py-3 font-medium">Stage</th>
                      <th className="px-3 py-3 font-medium">Pipeline</th>
                      <th className="px-3 py-3 font-medium">Probability</th>
                      <th className="px-3 py-3 font-medium">KYC</th>
                      <th className="px-3 py-3 font-medium">NDA</th>
                      <th className="px-3 py-3 font-medium">Owner</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInvestors.map((investor, index) => (
                      <tr
                        key={investor.id || investor.investor_id || index}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-3 py-4">
                          <p className="font-medium text-white/90">
                            {investor.full_name || "Unnamed Investor"}
                          </p>
                          <p className="mt-1 text-xs text-white/35">
                            {investor.organization || investor.email || "—"}
                          </p>
                        </td>

                        <td className="px-3 py-4">
                          <span className="rounded-full border border-violet-400/15 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-200">
                            {titleCase(investor.stage)}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-white/75">
                          {compactMoney(
                            Number(investor.expected_investment_inr || 0)
                          )}
                        </td>

                        <td className="px-3 py-4 text-white/60">
                          {Number(investor.probability_percent || 0)}%
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] ${
                              investor.kyc_completed
                                ? statusClass("COMPLETED")
                                : statusClass("OPEN")
                            }`}
                          >
                            {investor.kyc_completed ? "Complete" : "Pending"}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] ${
                              investor.nda_signed
                                ? statusClass("COMPLETED")
                                : statusClass("OPEN")
                            }`}
                          >
                            {investor.nda_signed ? "Signed" : "Pending"}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-white/50">
                          {investor.assigned_admin || "Unassigned"}
                        </td>
                      </tr>
                    ))}

                    {filteredInvestors.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-3 py-10 text-center text-sm text-white/35"
                        >
                          No investors match the current search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                    Activity Stream
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Recent investor activity
                  </h2>
                </div>

                <Link
                  href="/admin/investor-operations"
                  className="text-sm text-cyan-300 hover:text-cyan-200"
                >
                  Open Operations →
                </Link>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {recentActivities.length === 0 ? (
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-5 text-sm text-white/40 lg:col-span-2">
                    No CRM activities recorded yet.
                  </div>
                ) : (
                  recentActivities.map((activity, index) => (
                    <div
                      key={activity.id || index}
                      className="rounded-2xl border border-white/8 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-white/85">
                            {activity.subject ||
                              titleCase(activity.activity_type) ||
                              "Investor activity"}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/40">
                            {activity.details || "No additional details."}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[10px] ${statusClass(
                            activity.status
                          )}`}
                        >
                          {titleCase(activity.status)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/30">
                        <span>{titleCase(activity.activity_type)}</span>

                        {activity.occurred_at && (
                          <span>
                            {new Date(activity.occurred_at).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        )}

                        {activity.assigned_admin && (
                          <span>{activity.assigned_admin}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
