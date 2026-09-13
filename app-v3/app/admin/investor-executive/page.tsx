"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

const STAGE_ACCENT: Record<
  Stage,
  { text: string; bar: string }
> = {
  PROSPECT: { text: "text-white/55", bar: "bg-white/40" },
  CONTACTED: { text: "text-cyan-300", bar: "bg-cyan-300" },
  INTERESTED: { text: "text-sky-300", bar: "bg-sky-300" },
  NDA: { text: "text-violet-300", bar: "bg-violet-300" },
  DUE_DILIGENCE: { text: "text-amber-300", bar: "bg-amber-300" },
  COMMITMENT: { text: "text-emerald-300", bar: "bg-emerald-300" },
  INVESTED: { text: "text-green-300", bar: "bg-green-300" },
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

const DEFAULT_TARGET_RAISE_INR = 50000000; // ₹5 Cr
const TARGET_RAISE_STORAGE_KEY =
  "peopleandyouth.investor.target_raise_inr";

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

type IntegrityResponse = {
  success: boolean;
  status: "HEALTHY" | "WARNING" | "DEGRADED";
  investor_count: number;
  crm_log_count: number;
  activity_count: number;
  audit_event_count: number;
  issues: Array<{
    severity: "HIGH" | "MEDIUM" | "LOW";
    code: string;
    message: string;
    count: number;
  }>;
  checked_at: string;
};

type Insight = {
  investor: Investor;
  stage: Stage;
  expectedInr: number;
  probability: number;
  weightedInr: number;
  daysSinceContact: number | null;
  stageDays: number | null;
  engagementScore: number;
  priorityScore: number;
  openActions: number;
  overdueActions: number;
  hasDocumentsActivity: boolean;
  stale: boolean;
  strength: "STRONG" | "HEALTHY" | "WATCH" | "DORMANT";
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

function ticketBucket(amount: number): string {
  if (amount >= 10000000) return "₹1 Cr+";
  if (amount >= 5000000) return "₹50L+";
  if (amount >= 1000000) return "₹10L+";
  if (amount >= 500000) return "₹5L+";
  if (amount >= 100000) return "₹1L+";
  return "Under ₹1L";
}

const TICKET_BUCKETS = [
  "₹1 Cr+",
  "₹50L+",
  "₹10L+",
  "₹5L+",
  "₹1L+",
  "Under ₹1L",
] as const;

/*
 * Compute a compact per-investor insight used across 8A–8D.
 * Mirrors the scoring logic shipped in 6C but keeps a local copy so
 * this dashboard remains standalone and consistent.
 */
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
  const daysSinceContact = daysSince(
    investor.crm?.last_contact_date
  );

  const now = Date.now();

  const overdueActions = activities.filter(
    (a) =>
      a.investor_id === investor.id &&
      a.status === "OPEN" &&
      a.due_at &&
      new Date(a.due_at).getTime() < now
  ).length;

  const openActions = activities.filter(
    (a) => a.investor_id === investor.id && a.status === "OPEN"
  ).length;

  const hasDocumentsActivity = activities.some(
    (a) =>
      a.investor_id === investor.id &&
      a.details?.includes("[DOCUMENT]")
  );

  const recent = activities.filter(
    (a) =>
      a.investor_id === investor.id &&
      now - new Date(a.occurred_at).getTime() <= 90 * 86400000
  );

  const highTouch = recent.filter((a) =>
    ["MEETING", "CALL", "EMAIL"].includes(a.activity_type)
  ).length;

  let recencyComponent = 0;
  if (daysSinceContact !== null) {
    if (daysSinceContact <= 3) recencyComponent = 40;
    else if (daysSinceContact <= 7) recencyComponent = 30;
    else if (daysSinceContact <= 14) recencyComponent = 20;
    else if (daysSinceContact <= 30) recencyComponent = 10;
  }

  let frequencyComponent = 0;
  if (recent.length >= 12) frequencyComponent = 30;
  else if (recent.length >= 8) frequencyComponent = 25;
  else if (recent.length >= 5) frequencyComponent = 20;
  else if (recent.length >= 3) frequencyComponent = 14;
  else if (recent.length >= 1) frequencyComponent = 8;

  let highTouchComponent = 0;
  if (highTouch >= 5) highTouchComponent = 15;
  else if (highTouch >= 3) highTouchComponent = 11;
  else if (highTouch >= 1) highTouchComponent = 6;

  let stageComponent = 2;
  if (stage === "INVESTED") stageComponent = 15;
  else if (stage === "COMMITMENT") stageComponent = 14;
  else if (stage === "DUE_DILIGENCE") stageComponent = 12;
  else if (stage === "NDA") stageComponent = 10;
  else if (stage === "INTERESTED") stageComponent = 8;
  else if (stage === "CONTACTED") stageComponent = 5;

  const engagementScore = Math.min(
    100,
    recencyComponent +
      frequencyComponent +
      highTouchComponent +
      stageComponent
  );

  let strength: Insight["strength"] = "DORMANT";
  if (engagementScore >= 75) strength = "STRONG";
  else if (engagementScore >= 50) strength = "HEALTHY";
  else if (engagementScore >= 25) strength = "WATCH";

  const staleThreshold = STALE_THRESHOLDS[stage];
  const stale =
    daysSinceContact === null ||
    daysSinceContact >= staleThreshold;

  // Priority score: weighted capital + engagement + urgency
  const priorityScore =
    Math.min(60, expectedInr / 100000) +
    Math.min(30, weightedInr / 100000) +
    engagementScore / 5 +
    overdueActions * 4 +
    (investor.crm?.next_action ? 0 : 6) +
    probability / 4 +
    (daysSinceContact === null
      ? 8
      : Math.min(12, daysSinceContact / 3));

  // Stage days: days since last CRM update (proxy for stage dwell)
  const stageDays = daysSince(
    investor.crm?.last_contact_date
  );

  return {
    investor,
    stage,
    expectedInr,
    probability,
    weightedInr,
    daysSinceContact,
    stageDays,
    engagementScore,
    priorityScore,
    openActions,
    overdueActions,
    hasDocumentsActivity,
    stale,
    strength,
  };
}

type Tab = "overview" | "raise" | "investors" | "decisions";

const TAB_LABELS: Record<Tab, string> = {
  overview: "Executive Overview",
  raise: "Raise Intelligence",
  investors: "Investor Intelligence",
  decisions: "Decision Intelligence",
};

export default function InvestorExecutivePage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [integrity, setIntegrity] =
    useState<IntegrityResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [targetRaiseInr, setTargetRaiseInr] = useState<number>(
    DEFAULT_TARGET_RAISE_INR
  );
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [crmRes, activitiesRes, integrityRes] =
        await Promise.all([
          fetch("/api/admin/investor-crm", { cache: "no-store" }),
          fetch("/api/admin/investor-crm/activities", {
            cache: "no-store",
          }),
          fetch("/api/admin/investor-audit/integrity", {
            cache: "no-store",
          }).catch(() => null),
        ]);

      if (!crmRes.ok) throw new Error("Unable to load investor CRM.");
      if (!activitiesRes.ok)
        throw new Error("Unable to load activities.");

      const crmData = await crmRes.json();
      const activitiesData = await activitiesRes.json();

      setInvestors(crmData.investors ?? []);
      setActivities(activitiesData.activities ?? []);

      if (integrityRes && integrityRes.ok) {
        const integrityData = await integrityRes.json();
        setIntegrity(integrityData as IntegrityResponse);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load executive dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Hydrate target raise from localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(
        TARGET_RAISE_STORAGE_KEY
      );

      if (stored) {
        const parsed = Number(stored);

        if (Number.isFinite(parsed) && parsed > 0) {
          setTargetRaiseInr(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  function saveTargetRaise() {
    const parsed = Number(targetInput.replace(/[^0-9.]/g, ""));

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setEditingTarget(false);
      setTargetInput("");
      return;
    }

    setTargetRaiseInr(parsed);

    try {
      window.localStorage.setItem(
        TARGET_RAISE_STORAGE_KEY,
        String(parsed)
      );
    } catch {
      // ignore
    }

    setEditingTarget(false);
    setTargetInput("");
  }

  const insights: Insight[] = useMemo(() => {
    return investors.map((investor) =>
      computeInsight(investor, activities)
    );
  }, [investors, activities]);

  // ---------- 8A ----------
  const raise = useMemo(() => {
    const currentPipeline = insights.reduce(
      (sum, i) => sum + i.expectedInr,
      0
    );
    const weightedPipeline = insights.reduce(
      (sum, i) => sum + i.weightedInr,
      0
    );

    const proposedCommitments = insights
      .filter((i) => i.stage === "COMMITMENT")
      .reduce((sum, i) => sum + i.expectedInr, 0);

    const confirmedCommitments = insights
      .filter((i) => i.stage === "INVESTED")
      .reduce((sum, i) => {
        const actual = Number(
          i.investor.crm?.actual_investment_inr ?? 0
        );
        return sum + actual;
      }, 0);

    const remaining = Math.max(
      0,
      targetRaiseInr - proposedCommitments - confirmedCommitments
    );

    const coverage =
      targetRaiseInr > 0
        ? (weightedPipeline / targetRaiseInr) * 100
        : 0;

    const byBucket: Record<string, number> = {};
    TICKET_BUCKETS.forEach((b) => {
      byBucket[b] = 0;
    });

    insights.forEach((i) => {
      const bucket = ticketBucket(i.expectedInr);
      byBucket[bucket] = (byBucket[bucket] ?? 0) + 1;
    });

    return {
      currentPipeline,
      weightedPipeline,
      proposedCommitments,
      confirmedCommitments,
      remaining,
      coverage,
      byBucket,
    };
  }, [insights, targetRaiseInr]);

  // ---------- 8B ----------
  const investorQueues = useMemo(() => {
    const sorted = [...insights];

    const highestPotential = [...sorted]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 5);

    const mostEngaged = [...sorted]
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5);

    const dormant = sorted.filter(
      (i) =>
        i.strength === "DORMANT" ||
        (i.daysSinceContact !== null &&
          i.daysSinceContact >=
            STALE_THRESHOLDS[i.stage] * 2)
    );

    const requiringFollowUp = sorted.filter(
      (i) =>
        i.overdueActions > 0 ||
        !i.investor.crm?.next_action ||
        i.stale
    );

    const awaitingDocuments = sorted.filter(
      (i) =>
        ["NDA", "DUE_DILIGENCE"].includes(i.stage) &&
        !i.hasDocumentsActivity
    );

    const awaitingDecision = sorted.filter(
      (i) =>
        ["DUE_DILIGENCE", "COMMITMENT"].includes(i.stage) &&
        i.daysSinceContact !== null &&
        i.daysSinceContact >= 14
    );

    const relationshipRisk = sorted.filter(
      (i) =>
        i.overdueActions > 0 ||
        (!i.investor.crm?.next_action &&
          i.stage !== "PROSPECT")
    );

    return {
      highestPotential,
      mostEngaged,
      dormant,
      requiringFollowUp,
      awaitingDocuments,
      awaitingDecision,
      relationshipRisk,
    };
  }, [insights]);

  // ---------- 8C ----------
  const decisions = useMemo(() => {
    const whoNext = investorQueues.highestPotential.slice(0, 3);

    const goingCold = [...insights]
      .filter((i) => i.stale && i.stage !== "INVESTED")
      .sort((a, b) => {
        const aDays = a.daysSinceContact ?? 9999;
        const bDays = b.daysSinceContact ?? 9999;
        return bDays - aDays;
      })
      .slice(0, 3);

    const needsFollowUp = [...insights]
      .filter((i) => i.overdueActions > 0)
      .sort((a, b) => b.overdueActions - a.overdueActions)
      .slice(0, 3);

    const highTicket = [...insights]
      .filter((i) => i.expectedInr >= 500000)
      .sort((a, b) => b.expectedInr - a.expectedInr)
      .slice(0, 3);

    // Blocked pipeline: stage with highest total accumulated dwell
    const stageDwell: Record<string, { count: number; total: number }> =
      {};
    insights.forEach((i) => {
      if (i.stage === "INVESTED") return;
      const bucket = (stageDwell[i.stage] = stageDwell[i.stage] ?? {
        count: 0,
        total: 0,
      });
      bucket.count += 1;
      bucket.total += i.stageDays ?? 0;
    });

    const blockedStageEntry = Object.entries(stageDwell)
      .filter(([, v]) => v.count > 0)
      .map(([stage, v]) => ({
        stage: stage as Stage,
        count: v.count,
        avgDays: v.total / v.count,
      }))
      .sort((a, b) => b.avgDays - a.avgDays)[0];

    const overdueTotal = activities.filter(
      (a) =>
        a.status === "OPEN" &&
        a.due_at &&
        new Date(a.due_at).getTime() < Date.now()
    ).length;

    const managementAttention = [
      ...insights.filter((i) => i.overdueActions > 0),
      ...investorQueues.dormant,
      ...investorQueues.awaitingDecision,
    ];

    // Deduplicate by investor id
    const seen = new Set<string>();
    const managementAttentionDedup = managementAttention.filter((i) => {
      if (seen.has(i.investor.id)) return false;
      seen.add(i.investor.id);
      return true;
    });

    return {
      whoNext,
      goingCold,
      needsFollowUp,
      highTicket,
      blockedStage: blockedStageEntry ?? null,
      overdueTotal,
      managementAttention: managementAttentionDedup.slice(0, 5),
      managementAttentionTotal: managementAttentionDedup.length,
    };
  }, [insights, investorQueues, activities]);

  // ---------- 8D ----------
  const executive = useMemo(() => {
    const totalExpected = insights.reduce(
      (sum, i) => sum + i.expectedInr,
      0
    );

    const stageDistribution = STAGES.map((stage) => {
      const list = insights.filter((i) => i.stage === stage);
      const value = list.reduce((s, i) => s + i.expectedInr, 0);
      const pct =
        totalExpected > 0
          ? Math.round((value / totalExpected) * 100)
          : 0;
      return { stage, count: list.length, value, pct };
    });

    const typeDistribution: Record<string, number> = {};
    insights.forEach((i) => {
      const key = i.investor.investor_type || "Unspecified";
      typeDistribution[key] = (typeDistribution[key] ?? 0) + 1;
    });

    const avgEngagement =
      insights.length > 0
        ? Math.round(
            insights.reduce(
              (sum, i) => sum + i.engagementScore,
              0
            ) / insights.length
          )
        : 0;

    const strongCount = insights.filter(
      (i) => i.strength === "STRONG" || i.strength === "HEALTHY"
    ).length;

    const openActionsTotal = activities.filter(
      (a) => a.status === "OPEN"
    ).length;

    const riskCount =
      decisions.overdueTotal + investorQueues.relationshipRisk.length;

    const opportunityCount = insights.filter(
      (i) =>
        i.stage === "INTERESTED" ||
        i.stage === "NDA" ||
        i.stage === "DUE_DILIGENCE"
    ).length;

    return {
      stageDistribution,
      typeDistribution,
      avgEngagement,
      strongCount,
      openActionsTotal,
      riskCount,
      opportunityCount,
    };
  }, [insights, activities, decisions, investorQueues]);

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1800px] px-6 py-8 lg:px-10">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                  Executive Dashboard
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Fundraising Intelligence
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Raise intelligence, investor queues, decision
                recommendations and executive alerts — unified across
                the entire investor relationship platform.
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
                href="/admin/investor-pipeline"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Pipeline
              </a>

              <a
                href="/admin/investor-intelligence"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Signals
              </a>

              <a
                href="/admin/investor-audit"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Audit
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* 8D.1 — RAISE OVERVIEW KPI BAR */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPI
            label="Target Raise"
            value={compactINR(targetRaiseInr)}
            detail="Capital formation goal"
            tone="emerald"
            onClick={() => {
              setEditingTarget(true);
              setTargetInput(String(targetRaiseInr));
            }}
            editable
          />
          <KPI
            label="Weighted Pipeline"
            value={compactINR(raise.weightedPipeline)}
            detail={`Coverage ${raise.coverage.toFixed(0)}%`}
            tone={
              raise.coverage >= 100
                ? "emerald"
                : raise.coverage >= 60
                  ? "amber"
                  : "red"
            }
          />
          <KPI
            label="Proposed"
            value={compactINR(raise.proposedCommitments)}
            detail="Commitment stage"
            tone="cyan"
          />
          <KPI
            label="Confirmed"
            value={compactINR(raise.confirmedCommitments)}
            detail="Invested capital"
            tone="emerald"
          />
          <KPI
            label="Remaining"
            value={compactINR(raise.remaining)}
            detail="To close the round"
            tone={raise.remaining === 0 ? "emerald" : "violet"}
          />
        </section>

        {/* TARGET RAISE EDITOR */}
        {editingTarget && (
          <section className="mb-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.04] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Target Raise (₹)
                </label>
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="e.g. 50000000 for ₹5 Cr"
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveTargetRaise}
                  className="rounded-xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-200"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingTarget(false);
                    setTargetInput("");
                  }}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/55 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-white/40">
              Default ₹5 Cr. Stored in your browser. Does not affect
              any investor records.
            </p>
          </section>
        )}

        {/* TABS */}
        <section className="mb-6 flex flex-wrap gap-2">
          {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => {
            const active = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "border-emerald-300/40 bg-emerald-300/[0.08] text-emerald-200"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </section>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-3xl bg-white/[0.025]"
              />
            ))}
          </div>
        ) : (
          <>
            {/* EXECUTIVE OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* 8D.8 — Executive alerts */}
                <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        8D.8
                      </div>
                      <h2 className="mt-1 text-lg font-semibold">
                        Executive Alerts
                      </h2>
                      <p className="mt-1 text-xs text-white/40">
                        Prioritised items requiring attention.
                      </p>
                    </div>

                    {integrity && (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                          integrity.status === "HEALTHY"
                            ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-300"
                            : integrity.status === "WARNING"
                              ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-300"
                              : "border-red-300/20 bg-red-300/[0.06] text-red-300"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        CRM {integrity.status}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 lg:grid-cols-3">
                    <AlertCard
                      severity={
                        decisions.overdueTotal > 0 ? "HIGH" : "LOW"
                      }
                      title="Overdue actions"
                      count={decisions.overdueTotal}
                      description="Open follow-ups past their due date"
                      href="/admin/investor-operations"
                    />

                    <AlertCard
                      severity={
                        investorQueues.dormant.length > 3
                          ? "HIGH"
                          : investorQueues.dormant.length > 0
                            ? "MEDIUM"
                            : "LOW"
                      }
                      title="Dormant relationships"
                      count={investorQueues.dormant.length}
                      description="Investors with prolonged silence"
                      href="/admin/investor-relationship"
                    />

                    <AlertCard
                      severity={
                        raise.coverage < 50
                          ? "HIGH"
                          : raise.coverage < 100
                            ? "MEDIUM"
                            : "LOW"
                      }
                      title="Raise coverage"
                      count={Math.round(raise.coverage)}
                      description="Weighted pipeline % of target"
                      href="/admin/investor-pipeline"
                    />

                    <AlertCard
                      severity={
                        investorQueues.awaitingDecision.length > 2
                          ? "MEDIUM"
                          : "LOW"
                      }
                      title="Awaiting decision"
                      count={investorQueues.awaitingDecision.length}
                      description="Investors stuck in DD or Commitment"
                      href="/admin/investor-relationship"
                    />

                    <AlertCard
                      severity={
                        investorQueues.relationshipRisk.length > 5
                          ? "MEDIUM"
                          : "LOW"
                      }
                      title="Relationship risk"
                      count={investorQueues.relationshipRisk.length}
                      description="Missing next action or overdue"
                      href="/admin/investor-intelligence"
                    />

                    <AlertCard
                      severity={
                        decisions.managementAttentionTotal > 5
                          ? "MEDIUM"
                          : decisions.managementAttentionTotal > 0
                            ? "LOW"
                            : "LOW"
                      }
                      title="Management attention"
                      count={decisions.managementAttentionTotal}
                      description="Aggregated issues requiring founder focus"
                      href="/admin/investor-relationship"
                    />
                  </div>
                </section>

                {/* 8D.2 Pipeline + 8D.3 Distribution */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Panel
                    step="8D.2"
                    title="Pipeline Overview"
                  >
                    <div className="space-y-3">
                      {executive.stageDistribution.map((item) => {
                        const accent = STAGE_ACCENT[item.stage];

                        return (
                          <div key={item.stage}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${accent.bar}`}
                                />
                                <span className={accent.text}>
                                  {STAGE_LABELS[item.stage]}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-white/45">
                                <span className="text-[10px]">
                                  {item.count} inv
                                </span>
                                <span className="font-semibold text-white/70">
                                  {compactINR(item.value)}
                                </span>
                              </div>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className={`h-full rounded-full ${accent.bar}`}
                                style={{ width: `${item.pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>

                  <Panel step="8D.3" title="Investor Distribution">
                    {Object.keys(executive.typeDistribution).length ===
                    0 ? (
                      <p className="text-xs text-white/40">
                        No investors yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(executive.typeDistribution)
                          .sort((a, b) => b[1] - a[1])
                          .map(([type, count]) => {
                            const total = insights.length || 1;
                            const pct = Math.round(
                              (count / total) * 100
                            );

                            return (
                              <div key={type}>
                                <div className="mb-1 flex justify-between text-xs">
                                  <span className="text-white/55">
                                    {type}
                                  </span>
                                  <span className="font-semibold text-white/75">
                                    {count}
                                  </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                  <div
                                    className="h-full rounded-full bg-cyan-300/70"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </Panel>
                </div>

                {/* 8D.4 Engagement + 8D.5 Actions + 8D.6 Risks + 8D.7 Opportunities */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricMini
                    step="8D.4"
                    label="Avg Engagement"
                    value={`${executive.avgEngagement}`}
                    detail={`${executive.strongCount} strong / healthy`}
                    tone="cyan"
                  />
                  <MetricMini
                    step="8D.5"
                    label="Outstanding Actions"
                    value={String(executive.openActionsTotal)}
                    detail="Across all relationships"
                    tone="amber"
                  />
                  <MetricMini
                    step="8D.6"
                    label="Risk Indicators"
                    value={String(executive.riskCount)}
                    detail="Overdue + missing next action"
                    tone="red"
                  />
                  <MetricMini
                    step="8D.7"
                    label="Active Opportunities"
                    value={String(executive.opportunityCount)}
                    detail="Interested → Due Diligence"
                    tone="emerald"
                  />
                </div>
              </div>
            )}

            {/* RAISE TAB */}
            {activeTab === "raise" && (
              <div className="space-y-6">
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricLarge
                    step="8A.1"
                    label="Target Raise"
                    value={compactINR(targetRaiseInr)}
                    detail="Capital formation goal"
                    tone="emerald"
                  />
                  <MetricLarge
                    step="8A.2"
                    label="Current Pipeline"
                    value={compactINR(raise.currentPipeline)}
                    detail={`${insights.length} investors`}
                    tone="cyan"
                  />
                  <MetricLarge
                    step="8A.7"
                    label="Pipeline Coverage"
                    value={`${raise.coverage.toFixed(0)}%`}
                    detail={`Weighted vs target`}
                    tone={
                      raise.coverage >= 100
                        ? "emerald"
                        : raise.coverage >= 60
                          ? "amber"
                          : "red"
                    }
                  />
                  <MetricLarge
                    step="8A.3"
                    label="Proposed Commitments"
                    value={compactINR(raise.proposedCommitments)}
                    detail="Commitment stage"
                    tone="violet"
                  />
                  <MetricLarge
                    step="8A.4"
                    label="Confirmed Commitments"
                    value={compactINR(raise.confirmedCommitments)}
                    detail="Invested capital"
                    tone="emerald"
                  />
                  <MetricLarge
                    step="8A.5"
                    label="Remaining Raise"
                    value={compactINR(raise.remaining)}
                    detail="Target minus committed"
                    tone="amber"
                  />
                </section>

                <Panel step="8A.6" title="Ticket Size Distribution">
                  <div className="space-y-3">
                    {TICKET_BUCKETS.map((bucket) => {
                      const count = raise.byBucket[bucket] ?? 0;
                      const total = insights.length || 1;
                      const pct = Math.round((count / total) * 100);

                      return (
                        <div key={bucket}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="text-white/55">
                              {bucket}
                            </span>
                            <span className="font-semibold text-white/75">
                              {count} investor
                              {count === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-violet-300/70"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              </div>
            )}

            {/* INVESTORS TAB */}
            {activeTab === "investors" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <InvestorQueue
                  step="8B.1"
                  title="Highest Potential"
                  description="Ranked by priority score across capital, engagement, and urgency."
                  investors={investorQueues.highestPotential}
                />
                <InvestorQueue
                  step="8B.2"
                  title="Most Engaged"
                  description="Highest engagement score in the last 90 days."
                  investors={investorQueues.mostEngaged}
                />
                <InvestorQueue
                  step="8B.3"
                  title="Dormant"
                  description="Prolonged silence — beyond twice the stage threshold."
                  investors={investorQueues.dormant}
                  tone="danger"
                />
                <InvestorQueue
                  step="8B.4"
                  title="Requiring Follow-up"
                  description="Overdue actions, missing next action, or stale."
                  investors={investorQueues.requiringFollowUp}
                  tone="warning"
                />
                <InvestorQueue
                  step="8B.5"
                  title="Awaiting Documents"
                  description="In NDA or Due Diligence without recorded document activity."
                  investors={investorQueues.awaitingDocuments}
                />
                <InvestorQueue
                  step="8B.6"
                  title="Awaiting Decision"
                  description="Stalled in DD or Commitment for 14+ days."
                  investors={investorQueues.awaitingDecision}
                  tone="warning"
                />
                <InvestorQueue
                  step="8B.7"
                  title="Relationship Risk"
                  description="Missing next action or overdue actions."
                  investors={investorQueues.relationshipRisk}
                  tone="danger"
                />
              </div>
            )}

            {/* DECISIONS TAB */}
            {activeTab === "decisions" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <AnswerCard
                  step="8C.1"
                  question="Who should we contact next?"
                  answer={
                    decisions.whoNext.length === 0
                      ? "No investors require immediate contact."
                      : `${decisions.whoNext
                          .map(
                            (i) =>
                              investorDisplayName(i.investor)
                          )
                          .join(", ")}`
                  }
                  investors={decisions.whoNext}
                  tone="primary"
                />

                <AnswerCard
                  step="8C.2"
                  question="Who is going cold?"
                  answer={
                    decisions.goingCold.length === 0
                      ? "No relationships are going cold."
                      : `${decisions.goingCold.length} investor${
                          decisions.goingCold.length === 1
                            ? ""
                            : "s"
                        } beyond stage threshold.`
                  }
                  investors={decisions.goingCold}
                  tone="danger"
                />

                <AnswerCard
                  step="8C.3"
                  question="Who needs follow-up?"
                  answer={
                    decisions.needsFollowUp.length === 0
                      ? "No overdue follow-ups."
                      : `${decisions.needsFollowUp.reduce(
                          (sum, i) => sum + i.overdueActions,
                          0
                        )} overdue across ${decisions.needsFollowUp.length} investor${
                          decisions.needsFollowUp.length === 1
                            ? ""
                            : "s"
                        }.`
                  }
                  investors={decisions.needsFollowUp}
                  tone="warning"
                />

                <AnswerCard
                  step="8C.4"
                  question="Who has high ticket potential?"
                  answer={
                    decisions.highTicket.length === 0
                      ? "No high-value tickets currently in the pipeline."
                      : `Top ${decisions.highTicket.length} by expected ticket.`
                  }
                  investors={decisions.highTicket}
                  tone="primary"
                />

                <AnswerCard
                  step="8C.5"
                  question="Where is the pipeline blocked?"
                  answer={
                    decisions.blockedStage
                      ? `${STAGE_LABELS[
                          decisions.blockedStage.stage
                        ]} — ${decisions.blockedStage.count} investor${
                          decisions.blockedStage.count === 1
                            ? ""
                            : "s"
                        } averaging ${Math.round(
                          decisions.blockedStage.avgDays
                        )} days.`
                      : "No pipeline stage is blocked."
                  }
                  investors={[]}
                  tone="warning"
                />

                <AnswerCard
                  step="8C.6"
                  question="Which actions are overdue?"
                  answer={
                    decisions.overdueTotal === 0
                      ? "No overdue actions."
                      : `${decisions.overdueTotal} open action${
                          decisions.overdueTotal === 1 ? "" : "s"
                        } past due.`
                  }
                  investors={[]}
                  tone="danger"
                  actionLabel="Open Operations"
                  actionHref="/admin/investor-operations"
                />

                <AnswerCard
                  step="8C.7"
                  question="What requires management attention?"
                  answer={
                    decisions.managementAttention.length === 0
                      ? "Nothing currently requires founder-level escalation."
                      : `${decisions.managementAttentionTotal} aggregated issue${
                          decisions.managementAttentionTotal === 1
                            ? ""
                            : "s"
                        } across overdue, dormant, and stalled relationships.`
                  }
                  investors={decisions.managementAttention}
                  tone="danger"
                />
              </div>
            )}
          </>
        )}
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
  onClick,
  editable,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "cyan" | "violet" | "amber" | "red";
  onClick?: () => void;
  editable?: boolean;
}) {
  const tones = {
    emerald: {
      text: "text-emerald-300",
      dot: "bg-emerald-300",
      glow: "shadow-emerald-500/10",
    },
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
    <button
      type="button"
      onClick={onClick}
      disabled={!editable}
      className={`rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-left shadow-xl transition ${selected.glow} ${
        editable
          ? "cursor-pointer hover:border-white/20"
          : "cursor-default"
      }`}
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

      {editable && (
        <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-white/25">
          Click to edit
        </div>
      )}
    </button>
  );
}

function MetricLarge({
  step,
  label,
  value,
  detail,
  tone,
}: {
  step: string;
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "cyan" | "violet" | "amber" | "red";
}) {
  const tones = {
    emerald: "text-emerald-300",
    cyan: "text-cyan-300",
    violet: "text-violet-300",
    amber: "text-amber-300",
    red: "text-red-300",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
          {label}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40">
          {step}
        </span>
      </div>

      <div className={`mt-5 text-3xl font-semibold ${tones[tone]}`}>
        {value}
      </div>

      <div className="mt-2 text-xs text-white/35">{detail}</div>
    </div>
  );
}

function MetricMini({
  step,
  label,
  value,
  detail,
  tone,
}: {
  step: string;
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "cyan" | "violet" | "amber" | "red";
}) {
  const tones = {
    emerald: "text-emerald-300",
    cyan: "text-cyan-300",
    violet: "text-violet-300",
    amber: "text-amber-300",
    red: "text-red-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
          {label}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
          {step}
        </span>
      </div>

      <div className={`mt-3 text-2xl font-semibold ${tones[tone]}`}>
        {value}
      </div>

      <div className="mt-1 text-[10px] text-white/35">{detail}</div>
    </div>
  );
}

function Panel({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
          {step}
        </span>
      </div>

      {children}
    </section>
  );
}

function AlertCard({
  severity,
  title,
  count,
  description,
  href,
}: {
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  count: number;
  description: string;
  href: string;
}) {
  const tones = {
    HIGH: {
      text: "text-red-300",
      bg: "bg-red-400/[0.06]",
      border: "border-red-400/20",
      dot: "bg-red-300",
    },
    MEDIUM: {
      text: "text-amber-300",
      bg: "bg-amber-300/[0.06]",
      border: "border-amber-300/20",
      dot: "bg-amber-300",
    },
    LOW: {
      text: "text-cyan-300",
      bg: "bg-cyan-300/[0.06]",
      border: "border-cyan-300/20",
      dot: "bg-cyan-300",
    },
  };

  const selected = tones[severity];

  return (
    <a
      href={href}
      className={`flex flex-col rounded-2xl border p-4 transition hover:border-white/25 ${selected.border} ${selected.bg}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${selected.text}`}
        >
          {severity}
        </span>
        <span
          className={`h-1.5 w-1.5 rounded-full ${selected.dot} shadow-[0_0_10px_currentColor]`}
        />
      </div>

      <div className={`mt-3 text-3xl font-semibold ${selected.text}`}>
        {count}
      </div>

      <div className="mt-2 text-sm font-medium text-white/75">{title}</div>
      <div className="mt-1 text-[10px] text-white/40">{description}</div>
    </a>
  );
}

function InvestorQueue({
  step,
  title,
  description,
  investors,
  tone = "neutral",
}: {
  step: string;
  title: string;
  description: string;
  investors: Insight[];
  tone?: "neutral" | "warning" | "danger";
}) {
  const toneMap = {
    neutral: "border-white/10",
    warning: "border-amber-300/15",
    danger: "border-red-300/15",
  };

  return (
    <section
      className={`rounded-3xl border bg-white/[0.035] p-5 shadow-xl shadow-black/10 ${toneMap[tone]}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white/90">
              {title}
            </h3>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40">
              {step}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-white/40">
            {description}
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white/60">
          {investors.length}
        </span>
      </div>

      {investors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-white/30">
          None
        </div>
      ) : (
        <div className="space-y-2">
          {investors.slice(0, 5).map((i) => (
            <a
              key={i.investor.id}
              href={`/admin/investors/${i.investor.id}`}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 transition hover:border-white/15 hover:bg-white/[0.04]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[10px] font-semibold text-white/65">
                {initials(i.investor.full_name)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-white/85">
                  {investorDisplayName(i.investor)}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/35">
                  <span>{STAGE_LABELS[i.stage]}</span>
                  <span>·</span>
                  <span>{compactINR(i.expectedInr)}</span>
                  {i.daysSinceContact !== null && (
                    <>
                      <span>·</span>
                      <span>{i.daysSinceContact}d</span>
                    </>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function AnswerCard({
  step,
  question,
  answer,
  investors,
  tone = "primary",
  actionLabel,
  actionHref,
}: {
  step: string;
  question: string;
  answer: string;
  investors: Insight[];
  tone?: "primary" | "warning" | "danger";
  actionLabel?: string;
  actionHref?: string;
}) {
  const toneMap = {
    primary: {
      border: "border-emerald-300/15",
      accent: "text-emerald-300",
    },
    warning: {
      border: "border-amber-300/15",
      accent: "text-amber-300",
    },
    danger: {
      border: "border-red-300/15",
      accent: "text-red-300",
    },
  };

  const selected = toneMap[tone];

  return (
    <section
      className={`rounded-3xl border bg-white/[0.035] p-5 shadow-xl shadow-black/10 ${selected.border}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">
          {step}
        </span>
        <span
          className={`h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor] ${selected.accent}`}
        />
      </div>

      <h3 className="text-base font-semibold text-white/90">
        {question}
      </h3>

      <p
        className={`mt-2 text-sm leading-6 ${selected.accent}`}
      >
        {answer}
      </p>

      {investors.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {investors.slice(0, 3).map((i) => (
            <a
              key={i.investor.id}
              href={`/admin/investors/${i.investor.id}`}
              className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 text-xs transition hover:border-white/15 hover:bg-white/[0.04]"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-[9px] font-semibold text-white/60">
                {initials(i.investor.full_name)}
              </div>
              <span className="min-w-0 flex-1 truncate text-white/75">
                {investorDisplayName(i.investor)}
              </span>
              <span className="shrink-0 text-[10px] text-white/35">
                {STAGE_LABELS[i.stage]}
              </span>
            </a>
          ))}
        </div>
      )}

      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="mt-4 inline-flex text-[11px] font-semibold text-cyan-300 hover:text-cyan-200"
        >
          {actionLabel} →
        </a>
      )}
    </section>
  );
}