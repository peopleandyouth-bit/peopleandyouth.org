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

const STALE_THRESHOLDS: Record<Stage, number> = {
  PROSPECT: 14,
  CONTACTED: 10,
  INTERESTED: 7,
  NDA: 10,
  DUE_DILIGENCE: 7,
  COMMITMENT: 5,
  INVESTED: 30,
};

const HIGH_VALUE_THRESHOLD = 500000;

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
  details: string | null;
  occurred_at: string;
  due_at: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  assigned_admin: string | null;
};

type Recommendation = {
  id: string;
  investor: Investor;
  title: string;
  rationale: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  actionLabel: string;
  actionHref: string;
  metric?: string;
};

function compactINR(value: number | null | undefined) {
  const amount = Number(value ?? 0);

  if (amount >= 10000000)
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
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

function daysSince(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 86400000)
  );
}

function investorDisplayName(investor: Investor) {
  return (
    investor.full_name ||
    investor.organization ||
    investor.email ||
    "Investor"
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

type PanelKey =
  | "FOLLOW_UP"
  | "DORMANCY"
  | "PRIORITY"
  | "PIPELINE"
  | "RISK"
  | "COMMITMENT"
  | "MANAGEMENT";

const PANEL_META: Record<
  PanelKey,
  {
    step: string;
    title: string;
    description: string;
    tone: "cyan" | "violet" | "emerald" | "amber" | "red" | "sky" | "green";
  }
> = {
  FOLLOW_UP: {
    step: "9B.1",
    title: "Follow-up Recommendations",
    description:
      "Relationships where the engagement cadence has lapsed and a concrete touchpoint is recommended.",
    tone: "cyan",
  },
  DORMANCY: {
    step: "9B.2",
    title: "Dormancy Detection",
    description:
      "Investors beyond twice their stage staleness threshold — a prolonged silence risk.",
    tone: "red",
  },
  PRIORITY: {
    step: "9B.3",
    title: "Priority Recalculation",
    description:
      "Top movers ranked by recomputed priority score across capital, engagement and urgency.",
    tone: "violet",
  },
  PIPELINE: {
    step: "9B.4",
    title: "Pipeline Alerts",
    description:
      "Stage congestion — where average dwell time indicates a bottleneck.",
    tone: "amber",
  },
  RISK: {
    step: "9B.5",
    title: "Risk Alerts",
    description:
      "Overdue actions, missing next steps, incomplete KYC or NDA on advanced stages.",
    tone: "red",
  },
  COMMITMENT: {
    step: "9B.6",
    title: "Commitment Alerts",
    description:
      "Commitment-stage investors with declining engagement or unresolved documentation.",
    tone: "emerald",
  },
  MANAGEMENT: {
    step: "9B.7",
    title: "Management Alerts",
    description:
      "Aggregated items requiring founder-level escalation across the portfolio.",
    tone: "green",
  },
};

export default function InvestorAutomationPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activePanel, setActivePanel] =
    useState<PanelKey>("FOLLOW_UP");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [crmRes, activitiesRes] = await Promise.all([
        fetch("/api/admin/investor-crm", { cache: "no-store" }),
        fetch("/api/admin/investor-crm/activities", {
          cache: "no-store",
        }),
      ]);

      if (!crmRes.ok) throw new Error("Unable to load investor CRM.");
      if (!activitiesRes.ok)
        throw new Error("Unable to load activities.");

      const crmData = await crmRes.json();
      const activityData = await activitiesRes.json();

      setInvestors(crmData.investors ?? []);
      setActivities(activityData.activities ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load automation panel."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const activitiesByInvestor = useMemo(() => {
    const map = new Map<string, Activity[]>();

    for (const activity of activities) {
      const list = map.get(activity.investor_id) ?? [];
      list.push(activity);
      map.set(activity.investor_id, list);
    }

    return map;
  }, [activities]);

  /*
   * Compute a single recommendation set per panel.
   */
  const panels = useMemo(() => {
    const now = Date.now();

    const followUp: Recommendation[] = [];
    const dormancy: Recommendation[] = [];
    const priority: Recommendation[] = [];
    const pipeline: Recommendation[] = [];
    const risk: Recommendation[] = [];
    const commitment: Recommendation[] = [];
    const management: Recommendation[] = [];

    // Per-stage aggregation for pipeline alerts
    const stageDwell: Record<
      string,
      { count: number; total: number }
    > = {};

    for (const investor of investors) {
      const stage = (investor.crm?.stage ?? "PROSPECT") as Stage;
      const investorActivities =
        activitiesByInvestor.get(investor.id) ?? [];

      const expectedInr = Number(
        investor.crm?.expected_investment_inr ??
          investor.proposed_ticket_inr ??
          0
      );
      const probability = Number(
        investor.crm?.probability_percent ?? 10
      );

      const daysContact = daysSince(
        investor.crm?.last_contact_date
      );

      const openActions = investorActivities.filter(
        (a) => a.status === "OPEN"
      );
      const overdueActions = openActions.filter(
        (a) =>
          a.due_at && new Date(a.due_at).getTime() < now
      );

      const staleThreshold = STALE_THRESHOLDS[stage];

      // ---- 9B.1 Follow-up recommendations ----
      if (
        daysContact !== null &&
        daysContact >= staleThreshold &&
        stage !== "INVESTED"
      ) {
        followUp.push({
          id: `followup:${investor.id}`,
          investor,
          title: `Re-engage ${investorDisplayName(investor)}`,
          rationale: `No contact for ${daysContact} days; ${STAGE_LABELS[stage]} threshold is ${staleThreshold}.`,
          severity: daysContact >= staleThreshold * 2 ? "HIGH" : "MEDIUM",
          actionLabel: "Open profile",
          actionHref: `/admin/investors/${investor.id}`,
          metric: `${daysContact}d`,
        });
      }

      // ---- 9B.2 Dormancy detection ----
      if (
        stage !== "INVESTED" &&
        (daysContact === null || daysContact >= staleThreshold * 2)
      ) {
        dormancy.push({
          id: `dormancy:${investor.id}`,
          investor,
          title: `Dormant relationship: ${investorDisplayName(investor)}`,
          rationale:
            daysContact === null
              ? "No recorded contact since registration."
              : `${daysContact} days without contact — double the stage threshold.`,
          severity: "HIGH",
          actionLabel: "Open profile",
          actionHref: `/admin/investors/${investor.id}`,
          metric: daysContact === null ? "Never" : `${daysContact}d`,
        });
      }

      // ---- 9B.3 Priority recalculation ----
      const priorityScore =
        Math.min(60, expectedInr / 100000) +
        Math.min(30, (expectedInr * probability) / 100000 / 100) +
        (daysContact === null
          ? 8
          : Math.min(12, daysContact / 3)) +
        overdueActions.length * 4 +
        (investor.crm?.next_action ? 0 : 6) +
        probability / 4;

      if (priorityScore >= 25) {
        priority.push({
          id: `priority:${investor.id}`,
          investor,
          title: `${investorDisplayName(investor)} — priority ${Math.round(
            priorityScore
          )}`,
          rationale: `${compactINR(
            expectedInr
          )} expected at ${probability}% probability. Stage: ${
            STAGE_LABELS[stage]
          }.`,
          severity:
            priorityScore >= 60
              ? "HIGH"
              : priorityScore >= 40
                ? "MEDIUM"
                : "LOW",
          actionLabel: "Open profile",
          actionHref: `/admin/investors/${investor.id}`,
          metric: String(Math.round(priorityScore)),
        });
      }

      // Stage dwell accumulation for 9B.4
      if (stage !== "INVESTED") {
        const bucket = (stageDwell[stage] = stageDwell[stage] ?? {
          count: 0,
          total: 0,
        });
        bucket.count += 1;
        bucket.total += daysContact ?? 0;
      }

      // ---- 9B.5 Risk alerts ----
      if (overdueActions.length > 0) {
        risk.push({
          id: `risk-overdue:${investor.id}`,
          investor,
          title: `Overdue action${overdueActions.length === 1 ? "" : "s"} — ${investorDisplayName(
            investor
          )}`,
          rationale: `${overdueActions.length} open action${
            overdueActions.length === 1 ? "" : "s"
          } past due.`,
          severity: "HIGH",
          actionLabel: "Open operations",
          actionHref: "/admin/investor-operations",
          metric: String(overdueActions.length),
        });
      }

      if (
        !investor.crm?.next_action &&
        stage !== "PROSPECT" &&
        stage !== "INVESTED"
      ) {
        risk.push({
          id: `risk-next:${investor.id}`,
          investor,
          title: `Missing next action — ${investorDisplayName(
            investor
          )}`,
          rationale: `Stage ${STAGE_LABELS[stage]} without a defined next step.`,
          severity: "MEDIUM",
          actionLabel: "Open CRM",
          actionHref: "/admin/investor-crm",
        });
      }

      if (
        !investor.kyc_completed &&
        ["DUE_DILIGENCE", "COMMITMENT"].includes(stage)
      ) {
        risk.push({
          id: `risk-kyc:${investor.id}`,
          investor,
          title: `KYC incomplete — ${investorDisplayName(investor)}`,
          rationale: `Advanced stage (${STAGE_LABELS[stage]}) without completed KYC.`,
          severity: "MEDIUM",
          actionLabel: "Open profile",
          actionHref: `/admin/investors/${investor.id}`,
        });
      }

      if (
        !investor.nda_signed &&
        ["NDA", "DUE_DILIGENCE", "COMMITMENT"].includes(stage)
      ) {
        risk.push({
          id: `risk-nda:${investor.id}`,
          investor,
          title: `NDA incomplete — ${investorDisplayName(investor)}`,
          rationale: `Stage ${STAGE_LABELS[stage]} without signed NDA.`,
          severity: "MEDIUM",
          actionLabel: "Open profile",
          actionHref: `/admin/investors/${investor.id}`,
        });
      }

      // ---- 9B.6 Commitment alerts ----
      if (stage === "COMMITMENT") {
        const hasCommitmentActivity = investorActivities.some(
          (a) => a.activity_type === "COMMITMENT"
        );

        if (!hasCommitmentActivity) {
          commitment.push({
            id: `commitment-doc:${investor.id}`,
            investor,
            title: `Commitment not recorded — ${investorDisplayName(
              investor
            )}`,
            rationale:
              "Investor is in COMMITMENT stage without a recorded commitment activity.",
            severity: "HIGH",
            actionLabel: "Open CRM",
            actionHref: "/admin/investor-crm",
          });
        } else if (
          daysContact === null ||
          daysContact >= STALE_THRESHOLDS.COMMITMENT
        ) {
          commitment.push({
            id: `commitment-stale:${investor.id}`,
            investor,
            title: `Commitment going cold — ${investorDisplayName(
              investor
            )}`,
            rationale:
              daysContact === null
                ? "No recent contact since entering commitment stage."
                : `${daysContact} days since last contact in commitment stage.`,
            severity: "HIGH",
            actionLabel: "Open profile",
            actionHref: `/admin/investors/${investor.id}`,
            metric: daysContact === null ? "Never" : `${daysContact}d`,
          });
        }
      }

      // ---- 9B.7 Management alerts ----
      const isHighValue = expectedInr >= HIGH_VALUE_THRESHOLD;

      if (
        isHighValue &&
        (daysContact === null || daysContact >= 7)
      ) {
        management.push({
          id: `mgmt-hv:${investor.id}`,
          investor,
          title: `High-value attention — ${investorDisplayName(
            investor
          )}`,
          rationale: `${compactINR(
            expectedInr
          )} opportunity without recent senior engagement.`,
          severity: "HIGH",
          actionLabel: "Open profile",
          actionHref: `/admin/investors/${investor.id}`,
          metric: compactINR(expectedInr),
        });
      }

      if (
        probability < 40 &&
        isHighValue &&
        stage !== "PROSPECT" &&
        stage !== "INVESTED"
      ) {
        management.push({
          id: `mgmt-prob:${investor.id}`,
          investor,
          title: `Probability risk — ${investorDisplayName(investor)}`,
          rationale: `${probability}% probability on ${compactINR(
            expectedInr
          )} at ${STAGE_LABELS[stage]}.`,
          severity: "MEDIUM",
          actionLabel: "Open profile",
          actionHref: `/admin/investors/${investor.id}`,
        });
      }
    }

    // 9B.4 Pipeline alerts — build from stageDwell aggregates
    for (const [stage, bucket] of Object.entries(stageDwell)) {
      if (bucket.count === 0) continue;
      const avgDays = bucket.total / bucket.count;
      const threshold = STALE_THRESHOLDS[stage as Stage];

      if (avgDays >= threshold * 1.5) {
        pipeline.push({
          id: `pipeline:${stage}`,
          investor: {
            id: "",
            full_name: STAGE_LABELS[stage as Stage],
            email: null,
            organization: null,
            investor_type: null,
            proposed_ticket_inr: null,
            verification_status: null,
            access_level: null,
            kyc_completed: null,
            nda_signed: null,
            crm: null,
          },
          title: `${STAGE_LABELS[stage as Stage]} congestion`,
          rationale: `${bucket.count} investor${
            bucket.count === 1 ? "" : "s"
          } averaging ${Math.round(
            avgDays
          )} days in stage (threshold ${threshold}).`,
          severity:
            avgDays >= threshold * 2 ? "HIGH" : "MEDIUM",
          actionLabel: "Open pipeline",
          actionHref: "/admin/investor-pipeline",
          metric: `${Math.round(avgDays)}d`,
        });
      }
    }

    const sortBySeverityThenMetric = (
      a: Recommendation,
      b: Recommendation
    ) => {
      const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const diff = rank[b.severity] - rank[a.severity];
      if (diff !== 0) return diff;
      return a.title.localeCompare(b.title);
    };

    return {
      FOLLOW_UP: followUp.sort(sortBySeverityThenMetric),
      DORMANCY: dormancy.sort(sortBySeverityThenMetric),
      PRIORITY: priority.sort(sortBySeverityThenMetric),
      PIPELINE: pipeline.sort(sortBySeverityThenMetric),
      RISK: risk.sort(sortBySeverityThenMetric),
      COMMITMENT: commitment.sort(sortBySeverityThenMetric),
      MANAGEMENT: management.sort(sortBySeverityThenMetric),
    } as Record<PanelKey, Recommendation[]>;
  }, [investors, activitiesByInvestor]);

  const totals = useMemo(() => {
    return {
      FOLLOW_UP: panels.FOLLOW_UP.length,
      DORMANCY: panels.DORMANCY.length,
      PRIORITY: panels.PRIORITY.length,
      PIPELINE: panels.PIPELINE.length,
      RISK: panels.RISK.length,
      COMMITMENT: panels.COMMITMENT.length,
      MANAGEMENT: panels.MANAGEMENT.length,
    };
  }, [panels]);

  const overallTotal = useMemo(() => {
    return Object.values(totals).reduce((sum, n) => sum + n, 0);
  }, [totals]);

  const activeRecommendations = panels[activePanel];
  const activeMeta = PANEL_META[activePanel];

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1700px] px-6 py-8 lg:px-10">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300">
                  Automated Intelligence
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Investor Intelligence Recommendations
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Live recomputation of institutional recommendations across
                follow-up, dormancy, priority, pipeline, risk, commitment
                and management layers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => void loadAll()}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <a
                href="/admin/investor-events"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Event Stream
              </a>

              <a
                href="/admin/investor-executive"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Executive
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* OVERALL SUMMARY */}
        <section className="mb-6 rounded-3xl border border-violet-300/15 bg-violet-300/[0.04] p-6 shadow-2xl shadow-violet-500/5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                Live Recommendations
              </div>
              <div className="mt-2 text-4xl font-semibold text-violet-100">
                {overallTotal}
              </div>
              <div className="mt-1 text-xs text-white/45">
                Across {Object.values(totals).filter((n) => n > 0).length}{" "}
                active layers
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-right sm:grid-cols-4">
              {Object.entries(totals).map(([key, count]) => (
                <div
                  key={key}
                  className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 text-left"
                >
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-white/35">
                    {PANEL_META[key as PanelKey].step}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white/80">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PANEL SELECTOR */}
        <section className="mb-6 flex flex-wrap gap-2">
          {(Object.keys(PANEL_META) as PanelKey[]).map((key) => {
            const meta = PANEL_META[key];
            const active = activePanel === key;
            const count = totals[key];

            return (
              <button
                key={key}
                onClick={() => setActivePanel(key)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "border-violet-300/40 bg-violet-300/[0.1] text-violet-200"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                  {meta.step}
                </span>
                <span>{meta.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    count > 0
                      ? active
                        ? "bg-violet-300/20 text-violet-100"
                        : "bg-white/[0.08] text-white/60"
                      : "bg-white/[0.04] text-white/30"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </section>

        {/* ACTIVE PANEL */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                  {activeMeta.step}
                </div>
                <h2 className="mt-1 text-lg font-semibold">
                  {activeMeta.title}
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-white/40">
                  {activeMeta.description}
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/55">
                {activeRecommendations.length} item
                {activeRecommendations.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-white/[0.025]"
                />
              ))}
            </div>
          ) : activeRecommendations.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] text-xl text-emerald-300">
                ✓
              </div>
              <p className="mt-5 text-sm font-semibold text-white/70">
                No recommendations in this layer
              </p>
              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/30">
                The current CRM state does not trigger any recommendation
                for this category.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {activeRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-white/[0.02]"
                >
                  <span
                    className={`h-10 w-1 shrink-0 rounded-full ${
                      rec.severity === "HIGH"
                        ? "bg-red-300"
                        : rec.severity === "MEDIUM"
                          ? "bg-amber-300"
                          : "bg-cyan-300"
                    }`}
                  />

                  {rec.investor.id ? (
                    <a
                      href={`/admin/investors/${rec.investor.id}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-300/[0.06] text-xs font-semibold text-violet-200 transition hover:border-violet-300/40"
                    >
                      {initials(rec.investor.full_name)}
                    </a>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] text-xs font-semibold text-amber-200">
                      ⚡
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white/85">
                        {rec.title}
                      </span>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          rec.severity === "HIGH"
                            ? "border-red-300/20 bg-red-300/[0.08] text-red-300"
                            : rec.severity === "MEDIUM"
                              ? "border-amber-300/20 bg-amber-300/[0.08] text-amber-300"
                              : "border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-300"
                        }`}
                      >
                        {rec.severity}
                      </span>

                      {rec.metric && (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold text-white/50">
                          {rec.metric}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-white/45">
                      {rec.rationale}
                    </p>

                    {rec.investor.id && (
                      <div className="mt-1 text-[10px] text-white/30">
                        {rec.investor.organization ||
                          rec.investor.investor_type ||
                          rec.investor.email ||
                          "—"}
                      </div>
                    )}
                  </div>

                  <a
                    href={rec.actionHref}
                    className="shrink-0 rounded-lg border border-violet-300/20 bg-violet-300/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-violet-200 transition hover:bg-violet-300/[0.12]"
                  >
                    {rec.actionLabel}
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER LINK */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/admin/investor-executive"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            Executive Dashboard
          </a>
          <a
            href="/admin/investor-events"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            Event Stream
          </a>
          <a
            href="/admin/investor-operations"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            Operations
          </a>
        </div>

        {/* FOOTER NOTICE */}
        <p className="mt-6 text-[10px] leading-5 text-white/25">
          9B recommendations are computed live from CRM state. Nothing
          is persisted. Scheduled execution of these recommendations
          (auto-reminders, dormancy scans, executive summaries) ships
          in 9C.
        </p>
      </div>
    </main>
  );
}