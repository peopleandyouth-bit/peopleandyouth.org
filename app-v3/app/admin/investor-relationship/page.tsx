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

type Strength = "STRONG" | "HEALTHY" | "WATCH" | "DORMANT";

const STRENGTH_TONES: Record<
  Strength,
  { text: string; bg: string; border: string; dot: string; label: string }
> = {
  STRONG: {
    text: "text-emerald-300",
    bg: "bg-emerald-300/[0.07]",
    border: "border-emerald-300/20",
    dot: "bg-emerald-300",
    label: "Strong",
  },
  HEALTHY: {
    text: "text-cyan-300",
    bg: "bg-cyan-300/[0.07]",
    border: "border-cyan-300/20",
    dot: "bg-cyan-300",
    label: "Healthy",
  },
  WATCH: {
    text: "text-amber-300",
    bg: "bg-amber-300/[0.07]",
    border: "border-amber-300/20",
    dot: "bg-amber-300",
    label: "Watch",
  },
  DORMANT: {
    text: "text-red-300",
    bg: "bg-red-300/[0.07]",
    border: "border-red-300/20",
    dot: "bg-red-300",
    label: "Dormant",
  },
};

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

type ObjectionCategory =
  | "VALUATION"
  | "TIMING"
  | "TEAM"
  | "MARKET"
  | "STRUCTURE"
  | "OTHER";

type ObjectionSeverity = "LOW" | "MEDIUM" | "HIGH";

type Objection = {
  category: ObjectionCategory;
  severity: ObjectionSeverity;
  excerpt: string;
  occurredAt: string;
};

type Signal =
  | "RECENT_MEETING"
  | "RECENT_CALL"
  | "RECENT_EMAIL"
  | "ACTIVE_COMMITMENT"
  | "HIGH_PROBABILITY"
  | "DOCUMENTS_DISCUSSED"
  | "OVERDUE_ACTION"
  | "MISSING_NEXT_ACTION"
  | "PROLONGED_SILENCE"
  | "STALLED_STAGE";

const SIGNAL_LABELS: Record<Signal, string> = {
  RECENT_MEETING: "Recent meeting",
  RECENT_CALL: "Recent call",
  RECENT_EMAIL: "Recent email",
  ACTIVE_COMMITMENT: "Active commitment",
  HIGH_PROBABILITY: "High probability",
  DOCUMENTS_DISCUSSED: "Documents discussed",
  OVERDUE_ACTION: "Overdue action",
  MISSING_NEXT_ACTION: "Missing next action",
  PROLONGED_SILENCE: "Prolonged silence",
  STALLED_STAGE: "Stalled stage",
};

const POSITIVE_SIGNALS: Signal[] = [
  "RECENT_MEETING",
  "RECENT_CALL",
  "RECENT_EMAIL",
  "ACTIVE_COMMITMENT",
  "HIGH_PROBABILITY",
  "DOCUMENTS_DISCUSSED",
];

const NEGATIVE_SIGNALS: Signal[] = [
  "OVERDUE_ACTION",
  "MISSING_NEXT_ACTION",
  "PROLONGED_SILENCE",
  "STALLED_STAGE",
];

const STALE_THRESHOLDS: Record<Stage, number> = {
  PROSPECT: 14,
  CONTACTED: 10,
  INTERESTED: 7,
  NDA: 10,
  DUE_DILIGENCE: 7,
  COMMITMENT: 5,
  INVESTED: 30,
};

type Insight = {
  investor: Investor;
  stage: Stage;
  expectedInr: number;
  probability: number;
  weightedInr: number;
  daysSinceContact: number | null;
  lastContactDate: string | null;
  engagementScore: number;
  strength: Strength;
  recencyComponent: number;
  frequencyComponent: number;
  highTouchComponent: number;
  stageComponent: number;
  totalActivities: number;
  activitiesLast30: number;
  activitiesLast90: number;
  openActions: number;
  overdueActions: number;
  objections: Objection[];
  positiveSignals: Signal[];
  negativeSignals: Signal[];
  priorityScore: number;
  followUpDue: boolean;
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

function daysBetween(a: string, b: string) {
  const dateA = new Date(a).getTime();
  const dateB = new Date(b).getTime();

  if (Number.isNaN(dateA) || Number.isNaN(dateB)) return Infinity;

  return Math.abs(Math.floor((dateA - dateB) / 86400000));
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

function investorDisplayName(investor: Investor) {
  return (
    investor.full_name ||
    investor.organization ||
    investor.email ||
    "Investor"
  );
}

/*
 * Parse [OBJECTION] blocks from activity details.
 *
 * Composer writes objections as NOTE activities whose details begin
 * with "[OBJECTION]\nCategory: X\nSeverity: Y\n<optional context>".
 */
function parseObjections(activities: Activity[]): Objection[] {
  const objections: Objection[] = [];

  for (const activity of activities) {
    if (activity.activity_type !== "NOTE") continue;
    if (!activity.details) continue;

    const details = activity.details;

    if (!details.includes("[OBJECTION]")) continue;

    const categoryMatch = details.match(
      /Category:\s*([A-Z_]+)/
    );
    const severityMatch = details.match(
      /Severity:\s*(LOW|MEDIUM|HIGH)/
    );

    if (!categoryMatch) continue;

    const validCategories: ObjectionCategory[] = [
      "VALUATION",
      "TIMING",
      "TEAM",
      "MARKET",
      "STRUCTURE",
      "OTHER",
    ];

    const category = (
      validCategories.includes(
        categoryMatch[1] as ObjectionCategory
      )
        ? categoryMatch[1]
        : "OTHER"
    ) as ObjectionCategory;

    const severity = (
      severityMatch?.[1] ?? "MEDIUM"
    ) as ObjectionSeverity;

    const afterHeader = details
      .split("\n")
      .slice(3)
      .join(" ")
      .trim();

    objections.push({
      category,
      severity,
      excerpt:
        afterHeader.slice(0, 140) ||
        activity.subject ||
        "Objection recorded",
      occurredAt: activity.occurred_at,
    });
  }

  return objections.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() -
      new Date(a.occurredAt).getTime()
  );
}

function computeInsight(
  investor: Investor,
  activities: Activity[]
): Insight {
  const stage = (investor.crm?.stage ?? "PROSPECT") as Stage;
  const expectedInr = Number(
    investor.crm?.expected_investment_inr ??
      investor.proposed_ticket_inr ??
      0
  );
  const probability = Number(
    investor.crm?.probability_percent ?? 10
  );
  const weightedInr = Math.round(
    expectedInr * (probability / 100)
  );

  const lastContactDate = investor.crm?.last_contact_date ?? null;
  const daysSinceContact = daysSince(lastContactDate);

  const now = Date.now();

  const totalActivities = activities.length;

  const activitiesLast30 = activities.filter(
    (a) =>
      now - new Date(a.occurred_at).getTime() <= 30 * 86400000
  ).length;

  const activitiesLast90 = activities.filter(
    (a) =>
      now - new Date(a.occurred_at).getTime() <= 90 * 86400000
  ).length;

  const highTouch = activities.filter(
    (a) =>
      ["MEETING", "CALL", "EMAIL"].includes(a.activity_type) &&
      now - new Date(a.occurred_at).getTime() <= 90 * 86400000
  ).length;

  const openActions = activities.filter(
    (a) => a.status === "OPEN"
  ).length;

  const overdueActions = activities.filter(
    (a) =>
      a.status === "OPEN" &&
      a.due_at &&
      new Date(a.due_at).getTime() < now
  ).length;

  /*
   * 6C.1 — Engagement score (0–100)
   *
   * Recency       0–40
   * Frequency     0–30
   * High-touch    0–15
   * Stage depth   0–15
   */
  let recencyComponent = 0;

  if (daysSinceContact !== null) {
    if (daysSinceContact <= 3) recencyComponent = 40;
    else if (daysSinceContact <= 7) recencyComponent = 30;
    else if (daysSinceContact <= 14) recencyComponent = 20;
    else if (daysSinceContact <= 30) recencyComponent = 10;
    else recencyComponent = 0;
  }

  let frequencyComponent = 0;

  if (activitiesLast90 >= 12) frequencyComponent = 30;
  else if (activitiesLast90 >= 8) frequencyComponent = 25;
  else if (activitiesLast90 >= 5) frequencyComponent = 20;
  else if (activitiesLast90 >= 3) frequencyComponent = 14;
  else if (activitiesLast90 >= 1) frequencyComponent = 8;
  else frequencyComponent = 0;

  let highTouchComponent = 0;

  if (highTouch >= 5) highTouchComponent = 15;
  else if (highTouch >= 3) highTouchComponent = 11;
  else if (highTouch >= 1) highTouchComponent = 6;
  else highTouchComponent = 0;

  const stageIndex = STAGES.indexOf(stage);

  let stageComponent = 0;

  if (stage === "INVESTED") stageComponent = 15;
  else if (stage === "COMMITMENT") stageComponent = 14;
  else if (stage === "DUE_DILIGENCE") stageComponent = 12;
  else if (stage === "NDA") stageComponent = 10;
  else if (stage === "INTERESTED") stageComponent = 8;
  else if (stage === "CONTACTED") stageComponent = 5;
  else stageComponent = 2;

  const engagementScore = Math.max(
    0,
    Math.min(
      100,
      recencyComponent +
        frequencyComponent +
        highTouchComponent +
        stageComponent
    )
  );

  /*
   * 6C.5 — Relationship strength band
   */
  let strength: Strength = "DORMANT";

  if (engagementScore >= 75) strength = "STRONG";
  else if (engagementScore >= 50) strength = "HEALTHY";
  else if (engagementScore >= 25) strength = "WATCH";
  else strength = "DORMANT";

  /*
   * 6C.6 — Signals
   */
  const positiveSignals: Signal[] = [];
  const negativeSignals: Signal[] = [];

  const recent = (type: string, withinDays: number) =>
    activities.some(
      (a) =>
        a.activity_type === type &&
        now - new Date(a.occurred_at).getTime() <=
          withinDays * 86400000
    );

  if (recent("MEETING", 30)) positiveSignals.push("RECENT_MEETING");
  if (recent("CALL", 21)) positiveSignals.push("RECENT_CALL");
  if (recent("EMAIL", 14)) positiveSignals.push("RECENT_EMAIL");
  if (recent("COMMITMENT", 90))
    positiveSignals.push("ACTIVE_COMMITMENT");
  if (probability >= 50) positiveSignals.push("HIGH_PROBABILITY");

  if (
    activities.some(
      (a) =>
        a.activity_type === "NOTE" &&
        a.details?.includes("[DOCUMENT]") &&
        now - new Date(a.occurred_at).getTime() <=
          90 * 86400000
    )
  ) {
    positiveSignals.push("DOCUMENTS_DISCUSSED");
  }

  if (overdueActions > 0) negativeSignals.push("OVERDUE_ACTION");
  if (!investor.crm?.next_action)
    negativeSignals.push("MISSING_NEXT_ACTION");

  const staleThreshold = STALE_THRESHOLDS[stage];

  if (
    daysSinceContact === null ||
    daysSinceContact >= staleThreshold
  ) {
    negativeSignals.push("PROLONGED_SILENCE");
  }

  if (
    stage !== "PROSPECT" &&
    stage !== "INVESTED" &&
    daysSinceContact !== null &&
    daysSinceContact >= staleThreshold * 2
  ) {
    negativeSignals.push("STALLED_STAGE");
  }

  /*
   * 6C.10 — Priority score
   *
   * Weighted capital + recent engagement + urgency.
   */
  const expectedWeight = Math.min(60, expectedInr / 100000);
  const weightedWeight = Math.min(30, weightedInr / 100000);
  const engagementWeight = engagementScore / 5;
  const overdueWeight = overdueActions * 4;
  const missingNextActionWeight = investor.crm?.next_action
    ? 0
    : 6;
  const highProbabilityWeight = probability / 4;
  const inactivityWeight =
    daysSinceContact === null
      ? 8
      : Math.min(12, daysSinceContact / 3);

  const priorityScore =
    expectedWeight +
    weightedWeight +
    engagementWeight +
    overdueWeight +
    missingNextActionWeight +
    highProbabilityWeight +
    inactivityWeight;

  const followUpDue =
    overdueActions > 0 ||
    !investor.crm?.next_action ||
    daysSinceContact === null ||
    daysSinceContact >= staleThreshold;

  const objections = parseObjections(activities);

  return {
    investor,
    stage,
    expectedInr,
    probability,
    weightedInr,
    daysSinceContact,
    lastContactDate,
    engagementScore,
    strength,
    recencyComponent,
    frequencyComponent,
    highTouchComponent,
    stageComponent,
    totalActivities,
    activitiesLast30,
    activitiesLast90,
    openActions,
    overdueActions,
    objections,
    positiveSignals,
    negativeSignals,
    priorityScore,
    followUpDue,
  };
}

type SortKey =
  | "PRIORITY"
  | "ENGAGEMENT"
  | "EXPECTED"
  | "RECENCY"
  | "OBJECTIONS";

export default function InvestorRelationshipPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [strengthFilter, setStrengthFilter] = useState<
    "ALL" | Strength
  >("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [followUpOnly, setFollowUpOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("PRIORITY");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [crmResponse, activityResponse] = await Promise.all([
        fetch("/api/admin/investor-crm", { cache: "no-store" }),
        fetch("/api/admin/investor-crm/activities", {
          cache: "no-store",
        }),
      ]);

      if (!crmResponse.ok) {
        throw new Error("Unable to load investor CRM.");
      }

      if (!activityResponse.ok) {
        throw new Error("Unable to load investor activities.");
      }

      const crmData = await crmResponse.json();
      const activityData = await activityResponse.json();

      setInvestors(crmData.investors ?? []);
      setActivities(activityData.activities ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load relationship intelligence."
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

  const insights: Insight[] = useMemo(() => {
    return investors.map((investor) =>
      computeInsight(
        investor,
        activitiesByInvestor.get(investor.id) ?? []
      )
    );
  }, [investors, activitiesByInvestor]);

  const investorTypes = useMemo(() => {
    const set = new Set<string>();
    investors.forEach((inv) => {
      if (inv.investor_type) set.add(inv.investor_type);
    });
    return Array.from(set).sort();
  }, [investors]);

  const filtered = useMemo(() => {
    let list = insights;

    if (strengthFilter !== "ALL") {
      list = list.filter((i) => i.strength === strengthFilter);
    }

    if (typeFilter !== "ALL") {
      list = list.filter(
        (i) => i.investor.investor_type === typeFilter
      );
    }

    if (followUpOnly) {
      list = list.filter((i) => i.followUpDue);
    }

    if (search.trim()) {
      const needle = search.trim().toLowerCase();

      list = list.filter((i) => {
        const investor = i.investor;

        return [
          investor.full_name,
          investor.organization,
          investor.email,
          investor.investor_type,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(needle)
          );
      });
    }

    const sorted = [...list];

    sorted.sort((a, b) => {
      switch (sortKey) {
        case "PRIORITY":
          return b.priorityScore - a.priorityScore;
        case "ENGAGEMENT":
          return b.engagementScore - a.engagementScore;
        case "EXPECTED":
          return b.expectedInr - a.expectedInr;
        case "RECENCY": {
          const aDays =
            a.daysSinceContact === null
              ? Number.MAX_SAFE_INTEGER
              : a.daysSinceContact;
          const bDays =
            b.daysSinceContact === null
              ? Number.MAX_SAFE_INTEGER
              : b.daysSinceContact;
          return aDays - bDays;
        }
        case "OBJECTIONS":
          return b.objections.length - a.objections.length;
      }
    });

    return sorted;
  }, [
    insights,
    strengthFilter,
    typeFilter,
    followUpOnly,
    search,
    sortKey,
  ]);

  const metrics = useMemo(() => {
    const totalInvestors = insights.length;

    const active = insights.filter(
      (i) => i.stage !== "INVESTED" && i.stage !== "PROSPECT"
    ).length;

    const strong = insights.filter(
      (i) => i.strength === "STRONG" || i.strength === "HEALTHY"
    ).length;

    const dormant = insights.filter(
      (i) => i.strength === "DORMANT"
    ).length;

    const followUp = insights.filter((i) => i.followUpDue).length;

    const avgEngagement =
      totalInvestors > 0
        ? Math.round(
            insights.reduce(
              (sum, i) => sum + i.engagementScore,
              0
            ) / totalInvestors
          )
        : 0;

    return {
      totalInvestors,
      active,
      strong,
      dormant,
      followUp,
      avgEngagement,
    };
  }, [insights]);

  const objectionSummary = useMemo(() => {
    const counts: Record<ObjectionCategory, number> = {
      VALUATION: 0,
      TIMING: 0,
      TEAM: 0,
      MARKET: 0,
      STRUCTURE: 0,
      OTHER: 0,
    };

    let total = 0;

    for (const insight of insights) {
      for (const objection of insight.objections) {
        counts[objection.category] += 1;
        total += 1;
      }
    }

    return { counts, total };
  }, [insights]);

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
                  Relationship Intelligence
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Investor Relationship Intelligence
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Engagement scoring, relationship strength, interest
                signals, objection tracking, dormancy detection and
                prioritization across every investor relationship.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => void loadAll()}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:opacity-40"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <a
                href="/admin/investor-pipeline"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Pipeline
              </a>

              <a
                href="/admin/investor-intelligence"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Intelligence
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* METRICS */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <MetricTile
            label="Investors"
            value={String(metrics.totalInvestors)}
            detail="Total relationships"
            tone="cyan"
          />
          <MetricTile
            label="Active"
            value={String(metrics.active)}
            detail="Beyond prospect"
            tone="violet"
          />
          <MetricTile
            label="Strong / Healthy"
            value={String(metrics.strong)}
            detail="High engagement"
            tone="green"
          />
          <MetricTile
            label="Dormant"
            value={String(metrics.dormant)}
            detail="Low engagement"
            tone="red"
          />
          <MetricTile
            label="Follow-up Due"
            value={String(metrics.followUp)}
            detail="Requires action"
            tone="amber"
          />
          <MetricTile
            label="Avg Engagement"
            value={`${metrics.avgEngagement}`}
            detail="Out of 100"
            tone="cyan"
          />
        </section>

        {/* OBJECTION SUMMARY */}
        {objectionSummary.total > 0 && (
          <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Objection Tracking
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  6C.7 — Objections raised across all relationships
                </p>
              </div>

              <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1 text-xs font-semibold text-amber-300">
                {objectionSummary.total} total
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {Object.entries(objectionSummary.counts).map(
                ([category, count]) => (
                  <div
                    key={category}
                    className={`rounded-2xl border p-4 transition ${
                      count > 0
                        ? "border-white/15 bg-white/[0.04]"
                        : "border-white/[0.06] bg-white/[0.02] opacity-50"
                    }`}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                      {category}
                    </div>
                    <div
                      className={`mt-2 text-2xl font-semibold ${
                        count > 0
                          ? "text-amber-300"
                          : "text-white/30"
                      }`}
                    >
                      {count}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* FILTERS */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
          <div className="grid gap-4 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Search
              </label>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, org, email"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-300/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Strength
              </label>

              <select
                value={strengthFilter}
                onChange={(e) =>
                  setStrengthFilter(e.target.value as "ALL" | Strength)
                }
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-300/40"
              >
                <option value="ALL" className="bg-[#0c111d]">
                  All strengths
                </option>
                <option value="STRONG" className="bg-[#0c111d]">
                  Strong
                </option>
                <option value="HEALTHY" className="bg-[#0c111d]">
                  Healthy
                </option>
                <option value="WATCH" className="bg-[#0c111d]">
                  Watch
                </option>
                <option value="DORMANT" className="bg-[#0c111d]">
                  Dormant
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Investor Type
              </label>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-300/40"
              >
                <option value="ALL" className="bg-[#0c111d]">
                  All types
                </option>
                {investorTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-[#0c111d]"
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Sort By
              </label>

              <select
                value={sortKey}
                onChange={(e) =>
                  setSortKey(e.target.value as SortKey)
                }
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-violet-300/40"
              >
                <option value="PRIORITY" className="bg-[#0c111d]">
                  Priority score
                </option>
                <option value="ENGAGEMENT" className="bg-[#0c111d]">
                  Engagement score
                </option>
                <option value="EXPECTED" className="bg-[#0c111d]">
                  Expected ticket
                </option>
                <option value="RECENCY" className="bg-[#0c111d]">
                  Most recently contacted
                </option>
                <option value="OBJECTIONS" className="bg-[#0c111d]">
                  Most objections
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFollowUpOnly((v) => !v)}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  followUpOnly
                    ? "border-amber-300/40 bg-amber-300/[0.08] text-amber-200"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                {followUpOnly
                  ? "Showing follow-up only"
                  : "Show follow-up only"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4 text-[10px] uppercase tracking-[0.16em] text-white/30">
            <span>
              Showing {filtered.length} of {insights.length}
            </span>
          </div>
        </section>

        {/* RANKED LIST */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-3xl bg-white/[0.025]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl text-white/25">
              ◇
            </div>
            <p className="mt-5 text-sm font-semibold text-white/70">
              No relationships match the current view
            </p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/30">
              Try clearing filters or widening the strength
              selection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((insight) => {
              const expanded = expandedId === insight.investor.id;
              const tone = STRENGTH_TONES[insight.strength];

              return (
                <article
                  key={insight.investor.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-xl shadow-black/10 transition hover:border-white/20"
                >
                  <button
                    onClick={() =>
                      setExpandedId(
                        expanded ? null : insight.investor.id
                      )
                    }
                    className="flex w-full items-center gap-4 px-6 py-5 text-left"
                  >
                    {/* Avatar */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/[0.06] text-xs font-semibold text-violet-200">
                      {initials(insight.investor.full_name)}
                    </div>

                    {/* Identity + stage */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`/admin/investors/${insight.investor.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="truncate text-sm font-semibold text-white/90 hover:text-violet-200"
                        >
                          {investorDisplayName(insight.investor)}
                        </a>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/55">
                          {STAGE_LABELS[insight.stage]}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${tone.bg} ${tone.border} ${tone.text}`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full ${tone.dot}`}
                          />
                          {tone.label}
                        </span>

                        {insight.followUpDue && (
                          <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                            Follow-up
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/35">
                        <span>
                          {insight.investor.organization ||
                            insight.investor.investor_type ||
                            "—"}
                        </span>

                        <span>•</span>

                        <span>
                          {insight.daysSinceContact === null
                            ? "No contact recorded"
                            : `Last contact ${insight.daysSinceContact}d ago`}
                        </span>

                        <span>•</span>

                        <span>{compactINR(insight.expectedInr)}</span>

                        {insight.objections.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-300">
                              {insight.objections.length} objection
                              {insight.objections.length === 1
                                ? ""
                                : "s"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Engagement bar */}
                    <div className="hidden shrink-0 items-center gap-3 lg:flex">
                      <div className="w-40">
                        <div className="mb-1 flex justify-between text-[9px] text-white/35">
                          <span>Engagement</span>
                          <span className="font-semibold text-white/70">
                            {insight.engagementScore}
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className={`h-full rounded-full ${
                              insight.strength === "STRONG"
                                ? "bg-emerald-300"
                                : insight.strength === "HEALTHY"
                                  ? "bg-cyan-300"
                                  : insight.strength === "WATCH"
                                    ? "bg-amber-300"
                                    : "bg-red-300"
                            }`}
                            style={{
                              width: `${insight.engagementScore}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-white/25 transition ${
                        expanded ? "rotate-90" : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>

                  {expanded && (
                    <div className="border-t border-white/[0.06] bg-black/20 px-6 py-5">
                      <div className="grid gap-4 lg:grid-cols-3">
                        {/* Breakdown */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0c111d] p-4">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                            Engagement Breakdown
                          </div>

                          <div className="mt-3 space-y-2 text-xs">
                            <BreakdownRow
                              label="Recency"
                              value={insight.recencyComponent}
                              max={40}
                            />
                            <BreakdownRow
                              label="Frequency"
                              value={insight.frequencyComponent}
                              max={30}
                            />
                            <BreakdownRow
                              label="High-touch"
                              value={insight.highTouchComponent}
                              max={15}
                            />
                            <BreakdownRow
                              label="Stage depth"
                              value={insight.stageComponent}
                              max={15}
                            />
                          </div>

                          <div className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] text-white/35">
                            <div className="flex justify-between">
                              <span>Activities (30d)</span>
                              <span className="font-semibold text-white/70">
                                {insight.activitiesLast30}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span>Activities (90d)</span>
                              <span className="font-semibold text-white/70">
                                {insight.activitiesLast90}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span>Total activities</span>
                              <span className="font-semibold text-white/70">
                                {insight.totalActivities}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Signals */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0c111d] p-4">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                            Signals
                          </div>

                          {insight.positiveSignals.length === 0 &&
                          insight.negativeSignals.length === 0 ? (
                            <p className="mt-3 text-xs text-white/35">
                              No signals detected.
                            </p>
                          ) : (
                            <div className="mt-3 space-y-2">
                              {insight.positiveSignals.map((s) => (
                                <SignalChip
                                  key={s}
                                  signal={s}
                                  tone="positive"
                                />
                              ))}

                              {insight.negativeSignals.map((s) => (
                                <SignalChip
                                  key={s}
                                  signal={s}
                                  tone="negative"
                                />
                              ))}
                            </div>
                          )}

                          <div className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] text-white/35">
                            <div className="flex justify-between">
                              <span>Open actions</span>
                              <span className="font-semibold text-white/70">
                                {insight.openActions}
                              </span>
                            </div>
                            {insight.overdueActions > 0 && (
                              <div className="mt-1 flex justify-between">
                                <span className="text-red-300">
                                  Overdue
                                </span>
                                <span className="font-semibold text-red-300">
                                  {insight.overdueActions}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Objections */}
                        <div className="rounded-2xl border border-white/[0.06] bg-[#0c111d] p-4">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                            Objections
                          </div>

                          {insight.objections.length === 0 ? (
                            <p className="mt-3 text-xs text-white/35">
                              No objections recorded.
                            </p>
                          ) : (
                            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                              {insight.objections
                                .slice(0, 6)
                                .map((objection, index) => (
                                  <div
                                    key={`${objection.occurredAt}-${index}`}
                                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                                        {objection.category}
                                      </span>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                          objection.severity === "HIGH"
                                            ? "bg-red-400/15 text-red-300"
                                            : objection.severity ===
                                                "MEDIUM"
                                              ? "bg-amber-400/15 text-amber-300"
                                              : "bg-cyan-400/15 text-cyan-300"
                                        }`}
                                      >
                                        {objection.severity}
                                      </span>
                                    </div>

                                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-white/55">
                                      {objection.excerpt}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
                        <a
                          href={`/admin/investors/${insight.investor.id}`}
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          Open profile
                        </a>

                        <a
                          href="/admin/investor-crm"
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          Record activity
                        </a>

                        <a
                          href="/admin/investor-operations"
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          Operations
                        </a>

                        <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-white/25">
                          Priority score {Math.round(insight.priorityScore)}
                        </span>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function MetricTile({
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

      <div className="mt-2 text-xs text-white/35">{detail}</div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div>
      <div className="flex justify-between">
        <span className="text-white/40">{label}</span>
        <span className="font-semibold text-white/70">
          {value}/{max}
        </span>
      </div>

      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-violet-300/70"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SignalChip({
  signal,
  tone,
}: {
  signal: Signal;
  tone: "positive" | "negative";
}) {
  const tones = {
    positive:
      "border-emerald-300/15 bg-emerald-300/[0.05] text-emerald-300",
    negative: "border-red-300/15 bg-red-300/[0.05] text-red-300",
  };

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-[11px] font-medium ${tones[tone]}`}
    >
      {SIGNAL_LABELS[signal]}
    </div>
  );
}