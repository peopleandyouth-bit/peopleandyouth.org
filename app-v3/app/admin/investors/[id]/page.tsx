"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const STAGES = [
  "PROSPECT",
  "CONTACTED",
  "INTERESTED",
  "NDA",
  "DUE_DILIGENCE",
  "COMMITMENT",
  "INVESTED",
] as const;

type Stage = (typeof STAGES)[number];

const STAGE_LABELS: Record<Stage, string> = {
  PROSPECT: "Prospect",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  NDA: "NDA",
  DUE_DILIGENCE: "Due Diligence",
  COMMITMENT: "Commitment",
  INVESTED: "Invested",
};

const TYPE_LABELS: Record<string, string> = {
  NOTE: "Note",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  STAGE_CHANGE: "Stage Change",
  FOLLOW_UP: "Follow-up",
  KYC: "KYC",
  NDA: "NDA",
  DUE_DILIGENCE: "Due Diligence",
  COMMITMENT: "Commitment",
  INVESTMENT: "Investment",
  OTHER: "Other",
};

type Investor = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  investor_type: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  geography: string | null;
  proposed_ticket_inr: number | null;
  verification_status: string | null;
  access_level: string | null;
  kyc_completed: boolean | null;
  nda_signed: boolean | null;
  nda_signed_at: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  crm?: {
    stage?: string | null;
    expected_investment_inr?: number | null;
    actual_investment_inr?: number | null;
    probability_percent?: number | null;
    last_contact_date?: string | null;
    next_action?: string | null;
    meeting_notes?: string | null;
    assigned_admin?: string | null;
    updated_at?: string | null;
  } | null;
};

type Activity = {
  id: string;
  investor_id: string;
  activity_type: string;
  subject: string | null;
  details: string | null;
  occurred_at: string;
  due_at: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  assigned_admin: string | null;
  created_at: string;
  updated_at: string;
};

type AuditEvent = {
  id: string;
  event_type: string;
  actor_email: string | null;
  actor_role: string | null;
  summary: string | null;
  source: string | null;
  occurred_at: string;
};

const AUDIT_LABELS: Record<string, string> = {
  ACTIVITY_CREATED: "Activity Created",
  ACTIVITY_COMPLETED: "Activity Completed",
  ACTIVITY_CANCELLED: "Activity Cancelled",
  ACTIVITY_RESCHEDULED: "Activity Rescheduled",
  ACTIVITY_REASSIGNED: "Activity Reassigned",
  ACTIVITY_DETAILS_UPDATED: "Activity Updated",
  STAGE_TRANSITION: "Stage Transition",
  CRM_CAPITAL_UPDATED: "Capital Updated",
  CRM_PROBABILITY_UPDATED: "Probability Updated",
  CRM_NEXT_ACTION_UPDATED: "Next Action Updated",
  CRM_CONTACT_RECORDED: "Contact Recorded",
  INVESTOR_NOTES_UPDATED: "Notes Updated",
};

function formatINR(value: number | null | undefined) {
  if (!value) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactINR(value: number | null | undefined) {
  const amount = Number(value ?? 0);

  if (amount >= 10000000)
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return formatINR(amount);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function daysSince(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 86400000)
  );
}

function initials(name: string | null | undefined) {
  if (!name) return "IN";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function displayText(value: string | null | undefined) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function InvestorProfilePage() {
  const params = useParams();
  const investorId = typeof params?.id === "string" ? params.id : "";

  const [investor, setInvestor] = useState<Investor | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [activeSection, setActiveSection] = useState<
    "overview" | "history" | "notes" | "audit" | "documents"
  >("overview");

  const loadAll = useCallback(async () => {
    if (!investorId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setNotFound(false);

    try {
      const [
        crmResponse,
        activityResponse,
        auditResponse,
      ] = await Promise.all([
        fetch("/api/admin/investor-crm", { cache: "no-store" }),
        fetch(
          `/api/admin/investor-crm/activities?investor_id=${encodeURIComponent(
            investorId
          )}`,
          { cache: "no-store" }
        ),
        fetch(
          `/api/admin/investor-audit?investor_id=${encodeURIComponent(
            investorId
          )}&limit=20`,
          { cache: "no-store" }
        ),
      ]);

      if (!crmResponse.ok) {
        throw new Error("Unable to load investor.");
      }

      const crmData = await crmResponse.json();

      const match: Investor | undefined = (
        crmData.investors as Investor[]
      )?.find((inv) => inv.id === investorId);

      if (!match) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setInvestor(match);

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivities(activityData.activities ?? []);
      }

      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setAuditEvents(auditData.events ?? []);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load investor profile."
      );
    } finally {
      setLoading(false);
    }
  }, [investorId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const sortedActivities = useMemo(() => {
    return [...activities].sort(
      (a, b) =>
        new Date(b.occurred_at).getTime() -
        new Date(a.occurred_at).getTime()
    );
  }, [activities]);

  const openActivities = useMemo(
    () => activities.filter((a) => a.status === "OPEN"),
    [activities]
  );

  const completedActivities = useMemo(
    () => activities.filter((a) => a.status === "COMPLETED"),
    [activities]
  );

  const stage = (investor?.crm?.stage ?? "PROSPECT") as Stage;
  const stageIndex = STAGES.indexOf(stage);

  const expected = Number(
    investor?.crm?.expected_investment_inr ??
      investor?.proposed_ticket_inr ??
      0
  );

  const actual = Number(
    investor?.crm?.actual_investment_inr ?? 0
  );

  const probability = Number(
    investor?.crm?.probability_percent ?? 10
  );

  const weighted = Math.round(expected * (probability / 100));

  const lastContactDays = daysSince(
    investor?.crm?.last_contact_date
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070a12] text-white">
        <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
          <div className="h-8 w-64 animate-pulse rounded bg-white/[0.03]" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-3xl bg-white/[0.025]"
              />
            ))}
          </div>
          <div className="mt-8 h-[400px] animate-pulse rounded-3xl bg-white/[0.02]" />
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#070a12] text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl text-white/40">
            ⌕
          </div>

          <h1 className="mt-6 text-2xl font-semibold">
            Investor not found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
            The investor you requested does not exist or may have
            been removed. Return to the pipeline to view all
            investors.
          </p>

          <a
            href="/admin/investor-pipeline"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Back to pipeline
          </a>
        </div>
      </main>
    );
  }

  if (error || !investor) {
    return (
      <main className="min-h-screen bg-[#070a12] text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.06] text-2xl text-red-300">
            ⚠
          </div>

          <h1 className="mt-6 text-2xl font-semibold">
            Unable to load investor
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
            {error || "An unknown error occurred."}
          </p>

          <button
            onClick={() => void loadAll()}
            className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.08] text-lg font-semibold text-cyan-200">
                {initials(investor.full_name)}
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                    Investor Profile
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/55">
                    {STAGE_LABELS[stage]}
                  </span>

                  {investor.verification_status && (
                    <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-300">
                      {investor.verification_status}
                    </span>
                  )}

                  {investor.access_level && (
                    <span className="rounded-full border border-violet-300/15 bg-violet-300/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-violet-300">
                      {investor.access_level}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {investor.full_name ||
                    investor.organization ||
                    investor.email ||
                    "Investor"}
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-white/45">
                  {investor.organization && (
                    <>
                      {investor.organization}
                      {" · "}
                    </>
                  )}
                  {investor.investor_type || "Investor"}
                  {investor.geography && ` · ${investor.geography}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void loadAll()}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Refresh
              </button>

              <a
                href="/admin/investor-pipeline"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Pipeline
              </a>

              <a
                href="/admin/investor-crm"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Open CRM
              </a>
            </div>
          </div>
        </header>

        {/* STAGE PROGRESS */}
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Relationship Stage
            </h2>

            <span className="text-xs text-white/40">
              {stageIndex + 1} of {STAGES.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {STAGES.map((s, index) => {
              const reached = index <= stageIndex;
              const current = index === stageIndex;

              return (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <div className="flex-1">
                    <div
                      className={`h-1.5 rounded-full transition ${
                        reached
                          ? current
                            ? "bg-cyan-300"
                            : "bg-cyan-300/50"
                          : "bg-white/[0.06]"
                      }`}
                    />

                    <div
                      className={`mt-2 text-[10px] font-semibold uppercase tracking-wider transition ${
                        current
                          ? "text-cyan-300"
                          : reached
                            ? "text-white/55"
                            : "text-white/25"
                      }`}
                    >
                      {STAGE_LABELS[s]}
                    </div>
                  </div>

                  {index < STAGES.length - 1 && (
                    <span className="text-white/15">·</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CAPITAL + RELATIONSHIP METRICS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Expected"
            value={compactINR(expected)}
            detail="Target ticket"
            tone="cyan"
          />
          <MetricCard
            label="Weighted"
            value={compactINR(weighted)}
            detail={`${probability}% probability`}
            tone="violet"
          />
          <MetricCard
            label="Actual"
            value={compactINR(actual)}
            detail="Recorded investment"
            tone="green"
          />
          <MetricCard
            label="Last Contact"
            value={
              lastContactDays === null
                ? "Never"
                : `${lastContactDays}d ago`
            }
            detail={
              investor.crm?.last_contact_date
                ? formatDate(investor.crm.last_contact_date)
                : "No record"
            }
            tone={
              lastContactDays === null || lastContactDays >= 14
                ? "red"
                : lastContactDays >= 7
                  ? "amber"
                  : "green"
            }
          />
        </section>

        {/* TABS */}
        <section className="mb-6 flex flex-wrap gap-2">
          {(
            [
              { value: "overview", label: "Overview" },
              { value: "history", label: "Activity History" },
              { value: "notes", label: "Notes" },
              { value: "documents", label: "Documents" },
              { value: "audit", label: "Audit Trail" },
            ] as const
          ).map((tab) => {
            const active = activeSection === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveSection(tab.value)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "border-cyan-300/40 bg-cyan-300/[0.08] text-cyan-200"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </section>

        {/* TAB CONTENT */}
        {activeSection === "overview" && (
          <section className="grid gap-6 lg:grid-cols-3">
            <Panel title="Contact Information" span="lg:col-span-1">
              <Detail label="Email" value={investor.email} />
              <Detail label="Phone" value={investor.phone} />
              <Detail
                label="Organisation"
                value={investor.organization}
              />
              <Detail
                label="Investor Type"
                value={investor.investor_type}
              />
              <Detail label="Geography" value={investor.geography} />

              {investor.linkedin_url && (
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
                  <span className="text-xs text-white/35">
                    LinkedIn
                  </span>
                  <a
                    href={investor.linkedin_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="max-w-[65%] truncate text-right text-xs text-cyan-300 underline hover:text-cyan-200"
                  >
                    {investor.linkedin_url}
                  </a>
                </div>
              )}

              {investor.website_url && (
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
                  <span className="text-xs text-white/35">
                    Website
                  </span>
                  <a
                    href={investor.website_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="max-w-[65%] truncate text-right text-xs text-cyan-300 underline hover:text-cyan-200"
                  >
                    {investor.website_url}
                  </a>
                </div>
              )}
            </Panel>

            <Panel title="Qualification & Access" span="lg:col-span-1">
              <Detail
                label="Verification"
                value={investor.verification_status || "PENDING"}
              />
              <Detail
                label="Access Level"
                value={investor.access_level || "REGISTERED"}
              />
              <Detail
                label="KYC"
                value={
                  investor.kyc_completed ? "Completed" : "Pending"
                }
              />
              <Detail
                label="NDA"
                value={
                  investor.nda_signed ? "Signed" : "Not signed"
                }
              />

              {investor.nda_signed_at && (
                <Detail
                  label="NDA signed at"
                  value={formatDate(investor.nda_signed_at)}
                />
              )}

              <Detail
                label="Registered"
                value={formatDate(investor.created_at)}
              />
              <Detail
                label="Last updated"
                value={formatDate(investor.updated_at)}
              />
            </Panel>

            <Panel title="Relationship & Capital" span="lg:col-span-1">
              <Detail
                label="Stage"
                value={STAGE_LABELS[stage]}
              />
              <Detail
                label="Expected Investment"
                value={formatINR(expected)}
              />
              <Detail
                label="Actual Investment"
                value={formatINR(actual)}
              />
              <Detail
                label="Probability"
                value={`${probability}%`}
              />
              <Detail
                label="Weighted"
                value={formatINR(weighted)}
              />
              <Detail
                label="Assigned Admin"
                value={investor.crm?.assigned_admin || "—"}
              />

              <div className="border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
                <div className="text-xs text-white/35">
                  Next action
                </div>
                <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-white/65">
                  {investor.crm?.next_action ||
                    "No next action recorded."}
                </p>
              </div>
            </Panel>

            <Panel
              title="Operational Snapshot"
              span="lg:col-span-3"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Open Actions
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-cyan-300">
                    {openActivities.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Completed
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-emerald-300">
                    {completedActivities.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Total Activities
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white/80">
                    {activities.length}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/admin/investor-operations"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Open Operations
                </a>
                <a
                  href="/admin/investor-intelligence"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Intelligence
                </a>
                <a
                  href="/admin/investor-audit"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Full Audit
                </a>
              </div>
            </Panel>
          </section>
        )}

        {activeSection === "history" && (
          <Panel title="Activity History">
            {sortedActivities.length === 0 ? (
              <EmptyState
                message="No activities recorded for this investor yet."
                hint="Activities appear here as they are created from the CRM composer or Operations queue."
              />
            ) : (
              <div className="relative mt-4">
                <div className="absolute bottom-4 left-[15px] top-4 w-px bg-white/10" />

                <div className="space-y-4">
                  {sortedActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="relative flex gap-4"
                    >
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0a0e18] text-[10px] text-cyan-300">
                        {activity.activity_type[0] || "•"}
                      </div>

                      <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium text-white/85">
                              {activity.subject ||
                                TYPE_LABELS[
                                  activity.activity_type
                                ] ||
                                "Activity"}
                            </div>

                            <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-cyan-300/60">
                              {TYPE_LABELS[
                                activity.activity_type
                              ] ?? activity.activity_type}
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                              activity.status === "COMPLETED"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : activity.status === "OPEN"
                                  ? "bg-amber-400/10 text-amber-300"
                                  : "bg-white/10 text-white/35"
                            }`}
                          >
                            {activity.status}
                          </span>
                        </div>

                        {activity.details && (
                          <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-white/45">
                            {activity.details}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-white/30">
                          <span>
                            {formatDateTime(activity.occurred_at)}
                          </span>

                          {activity.assigned_admin && (
                            <span>
                              Owner: {activity.assigned_admin}
                            </span>
                          )}

                          {activity.due_at && (
                            <span>
                              Due: {formatDateTime(activity.due_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        )}

        {activeSection === "notes" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <Panel title="Investor Profile Notes">
              {investor.notes ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-white/65">
                  {investor.notes}
                </p>
              ) : (
                <EmptyState
                  message="No investor profile notes recorded."
                  hint="Profile notes are captured during the initial application and investor review."
                />
              )}
            </Panel>

            <Panel title="Relationship Notes">
              {investor.crm?.meeting_notes ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-white/65">
                  {investor.crm.meeting_notes}
                </p>
              ) : (
                <EmptyState
                  message="No relationship notes recorded."
                  hint="Meeting notes are captured in the CRM composer under the Follow-up section."
                />
              )}
            </Panel>
          </section>
        )}

        {activeSection === "documents" && (
          <Panel title="Documents Accessed">
            <EmptyState
              message="Document access history will appear here."
              hint="Investor document interactions are tracked through the Data Room. This view is reserved for Phase 7 (Document Intelligence)."
            />
          </Panel>
        )}

        {activeSection === "audit" && (
          <Panel title="Recent Audit Events">
            {auditEvents.length === 0 ? (
              <EmptyState
                message="No audit events recorded for this investor."
                hint="Audit events are written whenever the CRM record, relationship stage, or an associated activity changes."
              />
            ) : (
              <>
                <div className="space-y-2">
                  {auditEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                          {AUDIT_LABELS[event.event_type] ??
                            event.event_type}
                        </span>

                        <span className="text-[10px] text-white/35">
                          {formatDateTime(event.occurred_at)}
                        </span>
                      </div>

                      {event.summary && (
                        <p className="mt-1 text-xs text-white/65">
                          {event.summary}
                        </p>
                      )}

                      <p className="mt-1 text-[10px] text-white/30">
                        {event.actor_email ?? "unknown actor"}
                        {event.actor_role
                          ? ` · ${event.actor_role}`
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <a
                    href={`/admin/investor-audit`}
                    className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    Open full audit trail →
                  </a>
                </div>
              </>
            )}
          </Panel>
        )}
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "cyan" | "violet" | "green" | "amber" | "red";
}) {
  const tones = {
    cyan: {
      text: "text-cyan-300",
      dot: "bg-cyan-300",
      glow: "shadow-cyan-500/10",
    },
    violet: {
      text: "text-violet-300",
      dot: "bg-violet-300",
      glow: "shadow-violet-500/10",
    },
    green: {
      text: "text-emerald-300",
      dot: "bg-emerald-300",
      glow: "shadow-emerald-500/10",
    },
    amber: {
      text: "text-amber-300",
      dot: "bg-amber-300",
      glow: "shadow-amber-500/10",
    },
    red: {
      text: "text-red-300",
      dot: "bg-red-300",
      glow: "shadow-red-500/10",
    },
  };

  const selected = tones[tone];

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl ${selected.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
          {label}
        </span>

        <span
          className={`h-2 w-2 rounded-full ${selected.dot} shadow-[0_0_12px_currentColor]`}
        />
      </div>

      <div className={`mt-5 text-2xl font-semibold ${selected.text}`}>
        {value}
      </div>

      <div className="mt-2 truncate text-xs text-white/35">
        {detail}
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  span,
}: {
  title: string;
  children: React.ReactNode;
  span?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 ${
        span ?? ""
      }`}
    >
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-white/35">{label}</span>

      <span className="max-w-[65%] truncate text-right text-xs text-white/75">
        {value || "—"}
      </span>
    </div>
  );
}

function EmptyState({
  message,
  hint,
}: {
  message: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg text-white/25">
        ◇
      </div>

      <p className="mt-4 text-sm text-white/60">{message}</p>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/30">
        {hint}
      </p>
    </div>
  );
}