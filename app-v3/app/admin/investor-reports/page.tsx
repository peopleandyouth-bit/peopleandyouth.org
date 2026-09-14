"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

const DEFAULT_TARGET_RAISE_INR = 50000000;

type Investor = {
  id: string;
  full_name: string | null;
  email: string | null;
  organization: string | null;
  investor_type: string | null;
  proposed_ticket_inr: number | null;
  verification_status: string | null;
  access_level: string | null;
  kyc_completed: boolean | null;
  nda_signed: boolean | null;
  created_at: string | null;
  crm?: {
    stage?: string | null;
    expected_investment_inr?: number | null;
    actual_investment_inr?: number | null;
    probability_percent?: number | null;
    last_contact_date?: string | null;
    next_action?: string | null;
    assigned_admin?: string | null;
  } | null;
};

type Activity = {
  id: string;
  investor_id: string;
  activity_type: string;
  subject: string | null;
  occurred_at: string;
  due_at: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  assigned_admin: string | null;
};

type AuditEvent = {
  id: string;
  investor_id: string | null;
  event_type: string;
  actor_email: string | null;
  actor_role: string | null;
  source: string | null;
  summary: string | null;
  occurred_at: string;
};

type ViewMode = "DAILY" | "WEEKLY" | "MONTHLY";

const VIEW_LABELS: Record<ViewMode, string> = {
  DAILY: "Daily View",
  WEEKLY: "Weekly View",
  MONTHLY: "Monthly View",
};

const VIEW_WINDOW_MS: Record<ViewMode, number> = {
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
  MONTHLY: 30 * 24 * 60 * 60 * 1000,
};

function compactINR(value: number | null | undefined) {
  const amount = Number(value ?? 0);
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

function formatINR(value: number | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

function investorDisplayName(investor: Investor) {
  return (
    investor.full_name ||
    investor.organization ||
    investor.email ||
    "Investor"
  );
}

function withinWindow(
  value: string | null | undefined,
  windowMs: number
) {
  if (!value) return false;

  const date = new Date(value).getTime();

  if (Number.isNaN(date)) return false;

  return Date.now() - date <= windowMs;
}

export default function InvestorReportsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [view, setView] = useState<ViewMode>("WEEKLY");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [crmRes, activityRes, auditRes] = await Promise.all([
        fetch("/api/admin/investor-crm", { cache: "no-store" }),
        fetch("/api/admin/investor-crm/activities", {
          cache: "no-store",
        }),
        fetch("/api/admin/investor-audit?limit=1000", {
          cache: "no-store",
        }),
      ]);

      if (!crmRes.ok) throw new Error("Unable to load investors.");
      if (!activityRes.ok) throw new Error("Unable to load activities.");
      if (!auditRes.ok) throw new Error("Unable to load audit trail.");

      const crmData = await crmRes.json();
      const activityData = await activityRes.json();
      const auditData = await auditRes.json();

      setInvestors(crmData.investors ?? []);
      setActivities(activityData.activities ?? []);
      setAuditEvents(auditData.events ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const windowMs = VIEW_WINDOW_MS[view];

  // ---------------- 10C.4 Fundraising report ----------------
  const fundraisingReport = useMemo(() => {
    let total = 0;
    let weighted = 0;
    let committed = 0;
    let invested = 0;

    const byStage: Record<Stage, { count: number; value: number }> = {
      PROSPECT: { count: 0, value: 0 },
      CONTACTED: { count: 0, value: 0 },
      INTERESTED: { count: 0, value: 0 },
      NDA: { count: 0, value: 0 },
      DUE_DILIGENCE: { count: 0, value: 0 },
      COMMITMENT: { count: 0, value: 0 },
      INVESTED: { count: 0, value: 0 },
    };

    for (const inv of investors) {
      const stage = (inv.crm?.stage ?? "PROSPECT") as Stage;
      const expected = Number(
        inv.crm?.expected_investment_inr ??
          inv.proposed_ticket_inr ??
          0
      );
      const probability = Number(
        inv.crm?.probability_percent ?? 10
      );
      const actual = Number(inv.crm?.actual_investment_inr ?? 0);

      total += expected;
      weighted += expected * (probability / 100);

      if (stage === "COMMITMENT") committed += expected;
      if (stage === "INVESTED") invested += actual;

      byStage[stage].count += 1;
      byStage[stage].value += expected;
    }

    const remaining = Math.max(
      0,
      DEFAULT_TARGET_RAISE_INR - committed - invested
    );
    const coverage =
      DEFAULT_TARGET_RAISE_INR > 0
        ? (weighted / DEFAULT_TARGET_RAISE_INR) * 100
        : 0;

    return {
      total,
      weighted,
      committed,
      invested,
      remaining,
      coverage,
      byStage,
    };
  }, [investors]);

  // ---------------- 10C.5 Investor roster ----------------
  const investorRoster = useMemo(() => {
    return [...investors]
      .map((inv) => ({
        investor: inv,
        stage: (inv.crm?.stage ?? "PROSPECT") as Stage,
        expected: Number(
          inv.crm?.expected_investment_inr ??
            inv.proposed_ticket_inr ??
            0
        ),
        probability: Number(inv.crm?.probability_percent ?? 10),
      }))
      .sort((a, b) => b.expected - a.expected);
  }, [investors]);

  // ---------------- 10C.6 Activity summary ----------------
  const activitySummary = useMemo(() => {
    const inWindow = activities.filter((a) =>
      withinWindow(a.occurred_at, windowMs)
    );

    const counts: Record<string, number> = {};
    let open = 0;
    let completed = 0;
    let overdue = 0;

    const now = Date.now();

    for (const a of inWindow) {
      counts[a.activity_type] = (counts[a.activity_type] ?? 0) + 1;

      if (a.status === "OPEN") {
        open += 1;
        if (a.due_at && new Date(a.due_at).getTime() < now) {
          overdue += 1;
        }
      } else if (a.status === "COMPLETED") {
        completed += 1;
      }
    }

    return {
      total: inWindow.length,
      counts,
      open,
      completed,
      overdue,
    };
  }, [activities, windowMs]);

  // ---------------- 10C.7 Audit summary ----------------
  const auditSummary = useMemo(() => {
    const inWindow = auditEvents.filter((e) =>
      withinWindow(e.occurred_at, windowMs)
    );

    const counts: Record<string, number> = {};
    const actors = new Set<string>();

    for (const e of inWindow) {
      counts[e.event_type] = (counts[e.event_type] ?? 0) + 1;
      if (e.actor_email) actors.add(e.actor_email);
    }

    return {
      total: inWindow.length,
      counts,
      actors: Array.from(actors),
    };
  }, [auditEvents, windowMs]);

  // ---------------- 10C.1 / 10C.2 / 10C.3 Snapshot ----------------
  const snapshotReport = useMemo(() => {
    const newInvestors = investors.filter((i) =>
      withinWindow(i.created_at, windowMs)
    ).length;

    const activitiesInWindow = activities.filter((a) =>
      withinWindow(a.occurred_at, windowMs)
    ).length;

    const auditInWindow = auditEvents.filter((e) =>
      withinWindow(e.occurred_at, windowMs)
    ).length;

    return {
      newInvestors,
      activitiesInWindow,
      auditInWindow,
    };
  }, [investors, activities, auditEvents, windowMs]);

  // ---------------- Report builders ----------------
  function buildFundraisingText(): string {
    const lines: string[] = [];

    lines.push(`PEOPLE & YOUTH — FUNDRAISING REPORT`);
    lines.push(
      `Generated: ${new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date())}`
    );
    lines.push("");
    lines.push("CAPITAL FORMATION SUMMARY");
    lines.push(
      `Target raise: ${formatINR(DEFAULT_TARGET_RAISE_INR)}`
    );
    lines.push(`Total pipeline: ${formatINR(fundraisingReport.total)}`);
    lines.push(
      `Weighted pipeline: ${formatINR(fundraisingReport.weighted)}`
    );
    lines.push(
      `Proposed commitments: ${formatINR(fundraisingReport.committed)}`
    );
    lines.push(
      `Confirmed commitments: ${formatINR(fundraisingReport.invested)}`
    );
    lines.push(`Remaining: ${formatINR(fundraisingReport.remaining)}`);
    lines.push(
      `Coverage: ${fundraisingReport.coverage.toFixed(0)}% of target`
    );
    lines.push("");
    lines.push("PIPELINE BY STAGE");
    for (const stage of STAGES) {
      const row = fundraisingReport.byStage[stage];
      lines.push(
        `  ${STAGE_LABELS[stage].padEnd(16)} ${String(row.count).padStart(3)} investors · ${formatINR(row.value)}`
      );
    }

    return lines.join("\n");
  }

  function buildInvestorText(): string {
    const lines: string[] = [];

    lines.push(`PEOPLE & YOUTH — INVESTOR REPORT`);
    lines.push(
      `Generated: ${new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date())}`
    );
    lines.push(`Total investors: ${investorRoster.length}`);
    lines.push("");
    lines.push("INVESTOR ROSTER (by expected ticket, descending)");
    lines.push("");

    for (const entry of investorRoster) {
      lines.push(`${investorDisplayName(entry.investor)}`);
      lines.push(
        `  Stage: ${STAGE_LABELS[entry.stage]} · Probability: ${entry.probability}% · Expected: ${formatINR(entry.expected)}`
      );
      if (entry.investor.organization) {
        lines.push(`  Organisation: ${entry.investor.organization}`);
      }
      if (entry.investor.investor_type) {
        lines.push(`  Type: ${entry.investor.investor_type}`);
      }
      if (entry.investor.email) {
        lines.push(`  Email: ${entry.investor.email}`);
      }
      lines.push(
        `  Verification: ${entry.investor.verification_status ?? "PENDING"} · KYC: ${
          entry.investor.kyc_completed ? "Completed" : "Pending"
        } · NDA: ${entry.investor.nda_signed ? "Signed" : "Pending"}`
      );
      if (entry.investor.crm?.next_action) {
        lines.push(
          `  Next action: ${entry.investor.crm.next_action}`
        );
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  function buildActivityText(): string {
    const lines: string[] = [];

    lines.push(`PEOPLE & YOUTH — ACTIVITY REPORT (${VIEW_LABELS[view]})`);
    lines.push(
      `Generated: ${new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date())}`
    );
    lines.push("");
    lines.push(`Total activities in window: ${activitySummary.total}`);
    lines.push(`Open: ${activitySummary.open}`);
    lines.push(`Completed: ${activitySummary.completed}`);
    lines.push(`Overdue: ${activitySummary.overdue}`);
    lines.push("");
    lines.push("ACTIVITY BREAKDOWN BY TYPE");

    const sorted = Object.entries(activitySummary.counts).sort(
      (a, b) => b[1] - a[1]
    );

    if (sorted.length === 0) {
      lines.push("  No activities recorded in this window.");
    } else {
      for (const [type, count] of sorted) {
        lines.push(`  ${type.padEnd(16)} ${count}`);
      }
    }

    return lines.join("\n");
  }

  function buildAuditText(): string {
    const lines: string[] = [];

    lines.push(`PEOPLE & YOUTH — AUDIT REPORT (${VIEW_LABELS[view]})`);
    lines.push(
      `Generated: ${new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date())}`
    );
    lines.push("");
    lines.push(
      `Total audit events in window: ${auditSummary.total}`
    );
    lines.push("");
    lines.push("EVENT BREAKDOWN BY TYPE");

    const sorted = Object.entries(auditSummary.counts).sort(
      (a, b) => b[1] - a[1]
    );

    if (sorted.length === 0) {
      lines.push("  No audit events recorded in this window.");
    } else {
      for (const [type, count] of sorted) {
        lines.push(`  ${type.padEnd(28)} ${count}`);
      }
    }

    lines.push("");
    lines.push("ACTORS");
    if (auditSummary.actors.length === 0) {
      lines.push("  No actor records.");
    } else {
      for (const actor of auditSummary.actors) {
        lines.push(`  ${actor}`);
      }
    }

    return lines.join("\n");
  }

  function buildSnapshotText(): string {
    const lines: string[] = [];

    lines.push(`PEOPLE & YOUTH — ${VIEW_LABELS[view].toUpperCase()}`);
    lines.push(
      `Generated: ${new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date())}`
    );
    lines.push("");
    lines.push("WINDOW SNAPSHOT");
    lines.push(`New investor registrations: ${snapshotReport.newInvestors}`);
    lines.push(
      `Activities recorded: ${snapshotReport.activitiesInWindow}`
    );
    lines.push(
      `Audit events recorded: ${snapshotReport.auditInWindow}`
    );
    lines.push("");
    lines.push("CURRENT STATE");
    lines.push(`Total investors: ${investors.length}`);
    lines.push(
      `Total pipeline: ${formatINR(fundraisingReport.total)}`
    );
    lines.push(
      `Weighted pipeline: ${formatINR(fundraisingReport.weighted)}`
    );
    lines.push(
      `Coverage: ${fundraisingReport.coverage.toFixed(0)}% of target`
    );
    lines.push(
      `Open actions: ${activitySummary.open} (${activitySummary.overdue} overdue)`
    );

    return lines.join("\n");
  }

  async function copyReport(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Clipboard write failed:", err);
    }
  }

  const reportCards = [
    {
      key: "snapshot",
      step: `10C.${view === "DAILY" ? "1" : view === "WEEKLY" ? "2" : "3"}`,
      title: VIEW_LABELS[view],
      description:
        "Snapshot of new registrations, activities, audit events and current state for the selected window.",
      text: buildSnapshotText,
      tone: "sky",
    },
    {
      key: "fundraising",
      step: "10C.4",
      title: "Fundraising Report",
      description:
        "Capital formation summary: target, pipeline, weighted, committed, confirmed, remaining and per-stage distribution.",
      text: buildFundraisingText,
      tone: "emerald",
    },
    {
      key: "investor",
      step: "10C.5",
      title: "Investor Report",
      description:
        "Full investor roster with stage, probability, expected ticket, verification and next action.",
      text: buildInvestorText,
      tone: "violet",
    },
    {
      key: "activity",
      step: "10C.6",
      title: "Activity Report",
      description:
        "CRM activity summary for the selected window: totals, statuses, and per-type breakdown.",
      text: buildActivityText,
      tone: "cyan",
    },
    {
      key: "audit",
      step: "10C.7",
      title: "Audit Report",
      description:
        "Institutional audit summary for the selected window: totals, per-event breakdown and participating actors.",
      text: buildAuditText,
      tone: "amber",
    },
  ];

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1700px] px-6 py-8 lg:px-10">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">
                  Executive Reporting
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Investor Reports
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Copyable institutional reports for fundraising,
                investor roster, activity summary, audit summary and
                time-window snapshots.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={view}
                onChange={(e) =>
                  setView(e.target.value as ViewMode)
                }
                className="rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm text-white/70 outline-none focus:border-amber-300/40"
              >
                <option value="DAILY" className="bg-[#0c111d]">
                  Daily View
                </option>
                <option value="WEEKLY" className="bg-[#0c111d]">
                  Weekly View
                </option>
                <option value="MONTHLY" className="bg-[#0c111d]">
                  Monthly View
                </option>
              </select>

              <button
                onClick={() => void loadAll()}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <a
                href="/admin/investor-analytics"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Analytics
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* WINDOW SNAPSHOT KPI BAR */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI
            label={`New Investors (${view.toLowerCase()})`}
            value={String(snapshotReport.newInvestors)}
            detail="Registrations in window"
            tone="sky"
          />
          <KPI
            label={`Activities (${view.toLowerCase()})`}
            value={String(snapshotReport.activitiesInWindow)}
            detail={`${activitySummary.open} open`}
            tone="cyan"
          />
          <KPI
            label={`Audit Events (${view.toLowerCase()})`}
            value={String(snapshotReport.auditInWindow)}
            detail="Institutional mutations"
            tone="amber"
          />
          <KPI
            label="Raise Coverage"
            value={`${fundraisingReport.coverage.toFixed(0)}%`}
            detail={compactINR(fundraisingReport.weighted)}
            tone={
              fundraisingReport.coverage >= 100
                ? "emerald"
                : fundraisingReport.coverage >= 60
                  ? "amber"
                  : "red"
            }
          />
        </section>

        {/* REPORT CARDS */}
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-3xl bg-white/[0.025]"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {reportCards.map((card) => {
              const text = card.text();
              const copied = copiedKey === card.key;

              return (
                <section
                  key={card.key}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20"
                >
                  <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                          {card.step}
                        </span>
                        <h2 className="text-lg font-semibold">
                          {card.title}
                        </h2>
                      </div>
                      <p className="mt-2 max-w-3xl text-xs leading-5 text-white/40">
                        {card.description}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        void copyReport(card.key, text)
                      }
                      className={`shrink-0 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                        copied
                          ? "border-emerald-300/30 bg-emerald-300/[0.1] text-emerald-200"
                          : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {copied ? "✓ Copied" : "Copy report"}
                    </button>
                  </div>

                  <div className="px-6 py-5">
                    <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/[0.06] bg-black/40 px-4 py-4 font-mono text-[11px] leading-6 text-white/70">
                      {text}
                    </pre>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* FOOTER NOTICE */}
        <p className="mt-8 text-[10px] leading-5 text-white/25">
          Reports are generated live in the browser from the current CRM
          state, activity log and audit trail. Nothing is persisted. Use
          Copy report to export a plain-text snapshot for email, board
          decks or investor updates.
        </p>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function KPI({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "sky" | "cyan" | "amber" | "emerald" | "red";
}) {
  const tones = {
    sky: { text: "text-sky-300", dot: "bg-sky-300" },
    cyan: { text: "text-cyan-300", dot: "bg-cyan-300" },
    amber: { text: "text-amber-300", dot: "bg-amber-300" },
    emerald: { text: "text-emerald-300", dot: "bg-emerald-300" },
    red: { text: "text-red-300", dot: "bg-red-300" },
  };

  const selected = tones[tone];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
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

      <div className="mt-2 text-xs text-white/35">{detail}</div>
    </div>
  );
}