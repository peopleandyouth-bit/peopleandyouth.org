"use client";

import { useEffect, useMemo, useState } from "react";

type Investor = {
id: string;
full_name: string | null;
email: string | null;
organization: string | null;
investor_type: string | null;
proposed_ticket_inr: number | null;
verification_status: string | null;
access_level?: string | null;
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
created_at: string;
updated_at: string;
};

type Severity = "OVERDUE" | "HIGH" | "MEDIUM" | "LOW";

type IntelligenceSignal = {
id?: string;
investor_id: string;
investor_name: string;
organization: string | null;
email: string | null;
stage: string;
severity: Severity;
signal_type: string;
title: string;
description: string;
recommended_action: string;
expected_investment_inr: number;
probability_percent: number;
last_contact_date: string | null;
next_action: string | null;
created_at: string | null;
};

type IntelligenceSummary = {
total_signals: number;
overdue: number;
high: number;
medium: number;
low: number;
stale_investors: number;
stalled_pipeline: number;
overdue_followups: number;
missing_next_actions: number;
high_value_attention: number;
probability_risks: number;
relationship_risks: number;
};

type IntelligenceApiSummary = {
total_signals?: number;
overdue?: number;
high?: number;
medium?: number;
low?: number;
stale_investors?: number;
stalled_pipeline?: number;
overdue_followups?: number;
missing_next_actions?: number;
high_value_attention?: number;
probability_risks?: number;
relationship_risks?: number;
severity?: {
overdue?: number;
high?: number;
medium?: number;
low?: number;
};
};

const STAGES = [
"PROSPECT",
"CONTACTED",
"INTERESTED",
"NDA",
"DUE_DILIGENCE",
"COMMITMENT",
"INVESTED",
] as const;

const STAGE_LABELS: Record<string, string> = {
PROSPECT: "Prospect",
CONTACTED: "Contacted",
INTERESTED: "Interested",
NDA: "NDA",
DUE_DILIGENCE: "Due Diligence",
COMMITMENT: "Commitment",
INVESTED: "Invested",
};

const STAGE_TONES: Record<
string,
{ text: string; bg: string; border: string }
> = {
PROSPECT: {
text: "text-white/60",
bg: "bg-white/[0.05]",
border: "border-white/10",
},
CONTACTED: {
text: "text-cyan-300",
bg: "bg-cyan-300/[0.07]",
border: "border-cyan-300/10",
},
INTERESTED: {
text: "text-sky-300",
bg: "bg-sky-300/[0.07]",
border: "border-sky-300/10",
},
NDA: {
text: "text-violet-300",
bg: "bg-violet-300/[0.07]",
border: "border-violet-300/10",
},
DUE_DILIGENCE: {
text: "text-amber-300",
bg: "bg-amber-300/[0.07]",
border: "border-amber-300/10",
},
COMMITMENT: {
text: "text-emerald-300",
bg: "bg-emerald-300/[0.07]",
border: "border-emerald-300/10",
},
INVESTED: {
text: "text-green-300",
bg: "bg-green-300/[0.07]",
border: "border-green-300/10",
},
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

const SIGNAL_LABELS: Record<string, string> = {
OVERDUE_FOLLOW_UP: "Overdue Follow-up",
STALE_INVESTOR: "Stale Relationship",
STALLED_PIPELINE: "Stalled Pipeline",
MISSING_NEXT_ACTION: "Missing Next Action",
HIGH_VALUE_ATTENTION: "High-Value Attention",
PROBABILITY_RISK: "Probability Risk",
KYC_GAP: "KYC Gap",
NDA_GAP: "NDA Gap",
};

function formatCurrency(value: number | null | undefined) {
if (!value) return "₹0";

return new Intl.NumberFormat("en-IN", {
style: "currency",
currency: "INR",
maximumFractionDigits: 0,
}).format(value);
}

function compactCurrency(value: number) {
if (value >= 10000000) {
return `₹${(value / 10000000).toFixed(2)} Cr`;
}

if (value >= 100000) {
return `₹${(value / 100000).toFixed(1)} L`;
}

if (value >= 1000) {
return `₹${(value / 1000).toFixed(0)}K`;
}

return formatCurrency(value);
}

function formatDate(value: string | null | undefined) {
if (!value) return "—";

return new Intl.DateTimeFormat("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
}).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
if (!value) return "—";

return new Intl.DateTimeFormat("en-IN", {
day: "2-digit",
month: "short",
hour: "2-digit",
minute: "2-digit",
}).format(new Date(value));
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

function getDueState(value: string | null) {
if (!value) return "none";

const due = new Date(value);
const now = new Date();

const start = new Date(now);
start.setHours(0, 0, 0, 0);

const end = new Date(now);
end.setHours(23, 59, 59, 999);

if (due < start) return "overdue";
if (due <= end) return "today";
return "upcoming";
}

function severityTone(severity: Severity) {
if (severity === "OVERDUE") {
return {
dot: "bg-red-300",
glow: "shadow-[0_0_12px_rgba(252,165,165,0.7)]",
text: "text-red-300",
bg: "bg-red-300/[0.07]",
border: "border-red-300/15",
};
}

if (severity === "HIGH") {
return {
dot: "bg-orange-300",
glow: "shadow-[0_0_12px_rgba(253,186,116,0.65)]",
text: "text-orange-300",
bg: "bg-orange-300/[0.07]",
border: "border-orange-300/15",
};
}

if (severity === "MEDIUM") {
return {
dot: "bg-amber-300",
glow: "shadow-[0_0_12px_rgba(252,211,77,0.6)]",
text: "text-amber-300",
bg: "bg-amber-300/[0.07]",
border: "border-amber-300/15",
};
}

return {
dot: "bg-cyan-300",
glow: "shadow-[0_0_12px_rgba(103,232,249,0.55)]",
text: "text-cyan-300",
bg: "bg-cyan-300/[0.07]",
border: "border-cyan-300/15",
};
}

/**

* Deterministic signal identity.
*
* 4C intelligence signals are derived objects rather than database rows.
* The API now supplies the canonical id, while this fallback keeps the
* page safe if an older response is ever returned.
  */
  function getSignalId(signal: IntelligenceSignal) {
  return (
  signal.id ??
  `${signal.investor_id}:${signal.signal_type}`
  );
  }

/**

* Normalizes both the current intelligence API summary shape:
*
* summary.severity.overdue/high/medium/low
*
* and the flat shape expected by the dashboard.
  */
  function normalizeIntelligenceSummary(
  summary: IntelligenceApiSummary | null | undefined
  ): IntelligenceSummary | null {
  if (!summary) return null;

return {
total_signals: Number(summary.total_signals ?? 0),

overdue: Number(
  summary.overdue ?? summary.severity?.overdue ?? 0
),

high: Number(
  summary.high ?? summary.severity?.high ?? 0
),

medium: Number(
  summary.medium ?? summary.severity?.medium ?? 0
),

low: Number(
  summary.low ?? summary.severity?.low ?? 0
),

stale_investors: Number(
  summary.stale_investors ?? 0
),

stalled_pipeline: Number(
  summary.stalled_pipeline ?? 0
),

overdue_followups: Number(
  summary.overdue_followups ?? 0
),

missing_next_actions: Number(
  summary.missing_next_actions ?? 0
),

high_value_attention: Number(
  summary.high_value_attention ?? 0
),

probability_risks: Number(
  summary.probability_risks ?? 0
),

relationship_risks: Number(
  summary.relationship_risks ?? 0
),

};
}

export default function InvestorIntelligencePage() {
const [investors, setInvestors] = useState<Investor[]>([]);
const [activities, setActivities] = useState<Activity[]>([]);
const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
const [intelligenceSummary, setIntelligenceSummary] =
useState<IntelligenceSummary | null>(null);

const [loading, setLoading] = useState(true);
const [intelligenceLoading, setIntelligenceLoading] =
useState(true);

const [error, setError] = useState("");
const [intelligenceError, setIntelligenceError] =
useState("");

const [search, setSearch] = useState("");
const [selectedStage, setSelectedStage] = useState("ALL");
const [selectedSignalType, setSelectedSignalType] =
useState("ALL");

const [selectedInvestor, setSelectedInvestor] =
useState<Investor | null>(null);

/*

* STEP 6
*
* Tracks the deterministic signal identity currently being
* converted into an operational CRM activity.
  */
  const [executingSignalId, setExecutingSignalId] =
  useState<string | null>(null);

const [actionMessage, setActionMessage] =
useState<{
type: "success" | "error";
text: string;
} | null>(null);

async function loadData() {
try {
setLoading(true);
setIntelligenceLoading(true);
setError("");
setIntelligenceError("");

  const [
    crmResponse,
    activityResponse,
    intelligenceResponse,
  ] = await Promise.all([
    fetch("/api/admin/investor-crm", {
      cache: "no-store",
    }),

    fetch("/api/admin/investor-crm/activities", {
      cache: "no-store",
    }),

    fetch("/api/admin/investor-intelligence", {
      cache: "no-store",
    }),
  ]);

  if (!crmResponse.ok) {
    throw new Error(
      "Unable to load investor CRM."
    );
  }

  if (!activityResponse.ok) {
    throw new Error(
      "Unable to load investor activities."
    );
  }

  if (!intelligenceResponse.ok) {
    const intelligenceData =
      await intelligenceResponse
        .json()
        .catch(() => null);

    throw new Error(
      intelligenceData?.error ||
        "Unable to load investor intelligence signals."
    );
  }

  const crmData = await crmResponse.json();
  const activityData =
    await activityResponse.json();
  const intelligenceData =
    await intelligenceResponse.json();

  setInvestors(crmData.investors ?? []);
  setActivities(activityData.activities ?? []);

  const normalizedSignals: IntelligenceSignal[] = (
    intelligenceData.signals ?? []
  ).map((signal: IntelligenceSignal) => ({
    ...signal,

    /*
     * Preserve the deterministic server identity even if
     * the API response is temporarily from an older build.
     */
    id:
      signal.id ??
      `${signal.investor_id}:${signal.signal_type}`,

    expected_investment_inr: Number(
      signal.expected_investment_inr ?? 0
    ),

    probability_percent: Number(
      signal.probability_percent ?? 0
    ),
  }));

  setSignals(normalizedSignals);

  setIntelligenceSummary(
    normalizeIntelligenceSummary(
      intelligenceData.summary
    )
  );
} catch (err) {
  console.error(err);

  setError(
    err instanceof Error
      ? err.message
      : "Unable to load investor intelligence."
  );

  setIntelligenceError(
    err instanceof Error
      ? err.message
      : "Unable to load intelligence signals."
  );
} finally {
  setLoading(false);
  setIntelligenceLoading(false);
}

}

/*

* STEP 6
*
* Converts a derived intelligence signal into an operational
* investor_crm_activities record through the existing action API.
  */
  async function executeIntelligenceAction(
  signal: IntelligenceSignal
  ) {
  const signalId = getSignalId(signal);

if (executingSignalId) {

  return;
}

try {
  setExecutingSignalId(signalId);
  setActionMessage(null);

  const response = await fetch(
    "/api/admin/investor-intelligence/actions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        investor_id: signal.investor_id,
        signal_type: signal.signal_type,
        recommended_action:
          signal.recommended_action,
      }),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "Unable to create CRM action."
    );
  }

  if (data?.duplicate) {
    setActionMessage({
      type: "success",
      text: "This intelligence signal already has an open CRM action.",
    });
  } else {
    setActionMessage({
      type: "success",
      text: "CRM action created successfully.",
    });
  }

  /*
   * Reload the intelligence and activity layers so the new
   * operational activity is immediately reflected throughout
   * the dashboard.
   */
  await loadData();
} catch (err) {
  console.error(
    "Investor intelligence action error:",
    err
  );

  setActionMessage({
    type: "error",
    text:
      err instanceof Error
        ? err.message
        : "Unable to create CRM action.",
  });
} finally {
  setExecutingSignalId(null);
}

}

useEffect(() => {
loadData();
}, []);

const investorMap = useMemo(() => {
return new Map(
investors.map((investor) => [
investor.id,
investor,
])
);
}, [investors]);

const metrics = useMemo(() => {
const expected = investors.reduce(
(sum, investor) =>
sum +
Number(
investor.crm?.expected_investment_inr ??
investor.proposed_ticket_inr ??
0
),
0
);

const weighted = investors.reduce(
  (sum, investor) => {
    const expectedInvestment = Number(
      investor.crm?.expected_investment_inr ??
        investor.proposed_ticket_inr ??
        0
    );

    const probability = Number(
      investor.crm?.probability_percent ?? 10
    );

    return (
      sum +
      expectedInvestment *
        (probability / 100)
    );
  },
  0
);

const committed = investors.reduce(
  (sum, investor) => {
    if (
      investor.crm?.stage !==
      "COMMITMENT"
    ) {
      return sum;
    }

    return (
      sum +
      Number(
        investor.crm?.expected_investment_inr ??
          investor.proposed_ticket_inr ??
          0
      )
    );
  },
  0
);

const invested = investors.reduce(
  (sum, investor) =>
    sum +
    Number(
      investor.crm?.actual_investment_inr ??
        0
    ),
  0
);

const overdue = activities.filter(
  (activity) =>
    activity.status === "OPEN" &&
    getDueState(activity.due_at) ===
      "overdue"
).length;

const dueToday = activities.filter(
  (activity) =>
    activity.status === "OPEN" &&
    getDueState(activity.due_at) ===
      "today"
).length;

const openActions = activities.filter(
  (activity) =>
    activity.status === "OPEN"
).length;

const activeRelationships =
  investors.filter((investor) =>
    [
      "CONTACTED",
      "INTERESTED",
      "NDA",
      "DUE_DILIGENCE",
      "COMMITMENT",
    ].includes(
      investor.crm?.stage ??
        "PROSPECT"
    )
  ).length;

return {
  expected,
  weighted,
  committed,
  invested,
  overdue,
  dueToday,
  openActions,
  activeRelationships,
};

}, [investors, activities]);

const stageStats = useMemo(() => {
return STAGES.map((stage) => {
const stageInvestors =
investors.filter(
(investor) =>
(investor.crm?.stage ??
"PROSPECT") === stage
);

  const value =
    stageInvestors.reduce(
      (sum, investor) =>
        sum +
        Number(
          investor.crm
            ?.expected_investment_inr ??
            investor.proposed_ticket_inr ??
            0
        ),
      0
    );

  return {
    stage,
    count: stageInvestors.length,
    value,
  };
});

}, [investors]);

const verificationStats = useMemo(() => {
return {
verified: investors.filter(
(investor) =>
investor.verification_status ===
"VERIFIED"
).length,

  approved: investors.filter(
    (investor) =>
      investor.access_level ===
      "APPROVED"
  ).length,

  kyc: investors.filter(
    (investor) =>
      investor.kyc_completed
  ).length,

  nda: investors.filter(
    (investor) =>
      investor.nda_signed
  ).length,
};

}, [investors]);

const filteredSignals = useMemo(() => {
return signals
.filter((signal) => {
if (
selectedSignalType !==
"ALL" &&
signal.signal_type !==
selectedSignalType
) {
return false;
}

    if (
      selectedStage !== "ALL" &&
      signal.stage !== selectedStage
    ) {
      return false;
    }

    if (!search.trim()) return true;

    const query =
      search.trim().toLowerCase();

    return [
      signal.investor_name,
      signal.organization,
      signal.email,
      signal.title,
      signal.description,
      signal.recommended_action,
      signal.signal_type,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value)
          .toLowerCase()
          .includes(query)
      );
  })
  .slice(0, 12);

}, [
signals,
search,
selectedStage,
selectedSignalType,
]);

const signalTypes = useMemo(() => {
return Array.from(
new Set(
signals.map(
(signal) =>
signal.signal_type
)
)
);
}, [signals]);

const recentActivities = useMemo(() => {
return [...activities]
.sort(
(a, b) =>
new Date(
b.occurred_at
).getTime() -
new Date(
a.occurred_at
).getTime()
)
.slice(0, 8);
}, [activities]);

const conversionRate = useMemo(() => {
if (investors.length === 0) {
return 0;
}

const progressed =
  investors.filter((investor) =>
    [
      "CONTACTED",
      "INTERESTED",
      "NDA",
      "DUE_DILIGENCE",
      "COMMITMENT",
      "INVESTED",
    ].includes(
      investor.crm?.stage ?? ""
    )
  ).length;

return Math.round(
  (progressed /
    investors.length) *
    100
);

}, [investors]);

return ( <main className="min-h-screen bg-[#070a12] text-white"> <div className="mx-auto max-w-[1700px] px-6 py-8 lg:px-10"> <header className="mb-8"> <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"> <div> <div className="mb-3 flex items-center gap-3"> <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.9)]" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300">
              Investor Intelligence
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Investor Intelligence
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
            Executive visibility across capital, pipeline momentum,
            relationship health and operational risk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={
              loading ||
              intelligenceLoading ||
              Boolean(executingSignalId)
            }
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ||
            intelligenceLoading
              ? "Refreshing…"
              : "Refresh"}
          </button>

          <a
            href="/admin/investor-operations"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.07] hover:text-white"
          >
            Operations
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

    {error && (
      <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
        {error}
      </div>
    )}

    {actionMessage && (
      <div
        className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${
          actionMessage.type === "success"
            ? "border-emerald-300/15 bg-emerald-300/[0.05] text-emerald-200"
            : "border-red-400/20 bg-red-400/[0.06] text-red-200"
        }`}
      >
        {actionMessage.text}
      </div>
    )}

    <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <IntelligenceMetric
        label="Pipeline"
        value={compactCurrency(
          metrics.expected
        )}
        detail={`${investors.length} investor relationships`}
        tone="violet"
      />

      <IntelligenceMetric
        label="Weighted Pipeline"
        value={compactCurrency(
          metrics.weighted
        )}
        detail={`${conversionRate}% progressed beyond prospect`}
        tone="cyan"
      />

      <IntelligenceMetric
        label="Committed"
        value={compactCurrency(
          metrics.committed
        )}
        detail={`${
          stageStats.find(
            (item) =>
              item.stage ===
              "COMMITMENT"
          )?.count ?? 0
        } commitment-stage investors`}
        tone="green"
      />

      <IntelligenceMetric
        label="Invested"
        value={compactCurrency(
          metrics.invested
        )}
        detail="Capital recorded in CRM"
        tone="blue"
      />
    </section>

    <section className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">
                Lifecycle Intelligence
              </h2>

              {!intelligenceLoading &&
                intelligenceSummary && (
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${
                      intelligenceSummary.overdue >
                      0
                        ? "border-red-300/15 bg-red-300/[0.07] text-red-300"
                        : intelligenceSummary.high >
                          0
                        ? "border-orange-300/15 bg-orange-300/[0.07] text-orange-300"
                        : "border-emerald-300/15 bg-emerald-300/[0.07] text-emerald-300"
                    }`}
                  >
                    {
                      intelligenceSummary.total_signals
                    }{" "}
                    signals
                  </span>
                )}
            </div>

            <p className="mt-1 text-xs text-white/40">
              Machine-derived relationship risks, stalled pipeline and
              priority actions from live CRM activity.
            </p>
          </div>

          {!intelligenceLoading &&
            intelligenceSummary && (
              <div className="flex flex-wrap gap-2">
                <SignalCounter
                  label="Overdue"
                  value={
                    intelligenceSummary.overdue
                  }
                  severity="OVERDUE"
                />

                <SignalCounter
                  label="High"
                  value={
                    intelligenceSummary.high
                  }
                  severity="HIGH"
                />

                <SignalCounter
                  label="Medium"
                  value={
                    intelligenceSummary.medium
                  }
                  severity="MEDIUM"
                />

                <SignalCounter
                  label="Stale"
                  value={
                    intelligenceSummary.stale_investors
                  }
                  severity="LOW"
                />
              </div>
            )}
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <IntelligenceInsight
          label="Overdue Follow-ups"
          value={
            intelligenceSummary
              ?.overdue_followups ?? 0
          }
          description="Open activities past their due date"
          tone="red"
        />

        <IntelligenceInsight
          label="Stalled Pipeline"
          value={
            intelligenceSummary
              ?.stalled_pipeline ?? 0
          }
          description="Relationships without recent movement"
          tone="amber"
        />

        <IntelligenceInsight
          label="No Next Action"
          value={
            intelligenceSummary
              ?.missing_next_actions ?? 0
          }
          description="Active relationships lacking a next step"
          tone="violet"
        />

        <IntelligenceInsight
          label="High-Value Attention"
          value={
            intelligenceSummary
              ?.high_value_attention ?? 0
          }
          description="Significant prospects requiring focus"
          tone="cyan"
        />
      </div>

      {intelligenceError &&
        !error && (
          <div className="border-t border-red-400/10 bg-red-400/[0.025] px-6 py-4 text-xs text-red-200/80">
            {intelligenceError}
          </div>
        )}
    </section>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                Capital Pipeline
              </h2>

              <p className="mt-1 text-xs text-white/40">
                Investor distribution across the institutional journey
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/45">
              Target visibility
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {stageStats.map((item) => {
              const width =
                metrics.expected > 0
                  ? Math.max(
                      item.count > 0
                        ? 3
                        : 0,
                      (item.value /
                        metrics.expected) *
                        100
                    )
                  : 0;

              const tone =
                STAGE_TONES[
                  item.stage
                ] ??
                STAGE_TONES.PROSPECT;

              return (
                <button
                  key={item.stage}
                  onClick={() =>
                    setSelectedStage(
                      item.stage
                    )
                  }
                  className="group w-full text-left"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-lg border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${tone.bg} ${tone.border} ${tone.text}`}
                      >
                        {
                          STAGE_LABELS[
                            item.stage
                          ]
                        }
                      </span>

                      <span className="text-xs text-white/30">
                        {item.count} investor
                        {item.count ===
                        1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    <span className="text-xs font-medium text-white/65">
                      {formatCurrency(
                        item.value
                      )}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        item.stage ===
                        "COMMITMENT"
                          ? "bg-emerald-300"
                          : item.stage ===
                            "DUE_DILIGENCE"
                          ? "bg-amber-300"
                          : item.stage ===
                            "NDA"
                          ? "bg-violet-300"
                          : "bg-cyan-300"
                      }`}
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <SmallMetric
              label="Expected Capital"
              value={formatCurrency(
                metrics.expected
              )}
            />

            <SmallMetric
              label="Weighted Value"
              value={formatCurrency(
                metrics.weighted
              )}
            />

            <SmallMetric
              label="Active Relationships"
              value={String(
                metrics.activeRelationships
              )}
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-semibold">
            Relationship Health
          </h2>

          <p className="mt-1 text-xs text-white/40">
            Verification, diligence and operating readiness
          </p>
        </div>

        <div className="space-y-3 p-6">
          <HealthRow
            label="Verified"
            value={
              verificationStats.verified
            }
            total={investors.length}
            tone="cyan"
          />

          <HealthRow
            label="Approved Access"
            value={
              verificationStats.approved
            }
            total={investors.length}
            tone="violet"
          />

          <HealthRow
            label="KYC Complete"
            value={
              verificationStats.kyc
            }
            total={investors.length}
            tone="green"
          />

          <HealthRow
            label="NDA Signed"
            value={
              verificationStats.nda
            }
            total={investors.length}
            tone="amber"
          />
        </div>

        <div className="mx-6 mb-6 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
              Operational Exposure
            </span>

            <span
              className={`text-sm font-semibold ${
                metrics.overdue > 0
                  ? "text-red-300"
                  : metrics.dueToday >
                    0
                  ? "text-amber-300"
                  : "text-emerald-300"
              }`}
            >
              {metrics.overdue > 0
                ? `${metrics.overdue} overdue`
                : metrics.dueToday > 0
                ? `${metrics.dueToday} due today`
                : "Controlled"}
            </span>
          </div>

          <div className="mt-3 text-xs leading-5 text-white/35">
            {metrics.openActions} open operational actions currently
            recorded across investor relationships.
          </div>
        </div>
      </section>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                Investor Intelligence
              </h2>

              <p className="mt-1 text-xs text-white/40">
                Search and inspect the capital relationships behind the
                numbers.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search investor, organisation or email"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-cyan-300/30 sm:w-64"
              />

              <select
                value={selectedStage}
                onChange={(event) =>
                  setSelectedStage(
                    event.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white/70 outline-none"
              >
                <option
                  value="ALL"
                  className="bg-[#0c111d]"
                >
                  All stages
                </option>

                {STAGES.map(
                  (stage) => (
                    <option
                      key={stage}
                      value={stage}
                      className="bg-[#0c111d]"
                    >
                      {
                        STAGE_LABELS[
                          stage
                        ]
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {loading ? (
            <IntelligenceSkeleton />
          ) : filteredInvestors(
              investors,
              search,
              selectedStage
            ).length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-sm font-medium text-white/50">
                No investors match the current view.
              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setSelectedStage(
                    "ALL"
                  );
                }}
                className="mt-3 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Clear filters →
              </button>
            </div>
          ) : (
            filteredInvestors(
              investors,
              search,
              selectedStage
            )
              .slice(0, 12)
              .map(
                (investor) => {
                  const stage =
                    investor.crm
                      ?.stage ??
                    "PROSPECT";

                  const tone =
                    STAGE_TONES[
                      stage
                    ] ??
                    STAGE_TONES.PROSPECT;

                  const expected =
                    Number(
                      investor.crm
                        ?.expected_investment_inr ??
                        investor.proposed_ticket_inr ??
                        0
                    );

                  const staleDays =
                    investor.crm
                      ?.last_contact_date
                      ? Math.max(
                          0,
                          Math.floor(
                            (Date.now() -
                              new Date(
                                investor
                                  .crm
                                  .last_contact_date
                              ).getTime()) /
                              86400000
                          )
                        )
                      : null;

                  return (
                    <button
                      key={
                        investor.id
                      }
                      onClick={() =>
                        setSelectedInvestor(
                          investor
                        )
                      }
                      className="group flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-white/[0.025]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.05] text-xs font-semibold text-cyan-200">
                        {initials(
                          investor.full_name
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="truncate text-sm font-medium text-white/80 group-hover:text-white">
                            {investor.full_name ||
                              investor.organization ||
                              "Investor"}
                          </span>

                          <span
                            className={`hidden rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider sm:inline-flex ${tone.bg} ${tone.border} ${tone.text}`}
                          >
                            {
                              STAGE_LABELS[
                                stage
                              ]
                            }
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/30">
                          <span>
                            {investor.organization ||
                              investor.email ||
                              "Institutional relationship"}
                          </span>

                          {investor.investor_type && (
                            <>
                              <span>
                                •
                              </span>

                              <span>
                                {
                                  investor.investor_type
                                }
                              </span>
                            </>
                          )}

                          {staleDays !==
                            null && (
                            <>
                              <span>
                                •
                              </span>

                              <span
                                className={
                                  staleDays >=
                                  14
                                    ? "text-amber-300/70"
                                    : ""
                                }
                              >
                                Contacted{" "}
                                {
                                  staleDays
                                }
                                d ago
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-sm font-medium text-white/70">
                          {formatCurrency(
                            expected
                          )}
                        </div>

                        <div className="mt-1 text-[9px] uppercase tracking-wider text-white/25">
                          Expected
                        </div>
                      </div>
                    </button>
                  );
                }
              )
          )}
        </div>

        {!loading &&
          filteredInvestors(
            investors,
            search,
            selectedStage
          ).length > 12 && (
            <div className="border-t border-white/[0.06] px-6 py-4 text-center text-[10px] uppercase tracking-[0.18em] text-white/25">
              Showing 12 of{" "}
              {
                filteredInvestors(
                  investors,
                  search,
                  selectedStage
                ).length
              }{" "}
              relationships
            </div>
          )}
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                Attention Required
              </h2>

              <p className="mt-1 text-xs text-white/40">
                System-derived relationship risks requiring intervention
              </p>
            </div>

            <select
              value={
                selectedSignalType
              }
              onChange={(event) =>
                setSelectedSignalType(
                  event.target.value
                )
              }
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white/70 outline-none"
            >
              <option
                value="ALL"
                className="bg-[#0c111d]"
              >
                All signals
              </option>

              {signalTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-[#0c111d]"
                  >
                    {
                      SIGNAL_LABELS[
                        type
                      ] ?? type
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {intelligenceLoading ? (
            <IntelligenceSkeleton compact />
          ) : filteredSignals.length ===
            0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] text-lg text-emerald-300">
                ✓
              </div>

              <p className="mt-4 text-sm font-medium text-white/60">
                No material attention flags
              </p>

              <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-white/30">
                Current CRM and relationship activity do not indicate
                an obvious issue requiring intervention.
              </p>
            </div>
          ) : (
            filteredSignals.map(
              (signal) => {
                const tone =
                  severityTone(
                    signal.severity
                  );

                const signalId =
                  getSignalId(
                    signal
                  );

                const executing =
                  executingSignalId ===
                  signalId;

                const investor =
                  investorMap.get(
                    signal.investor_id
                  ) ?? {
                    id: signal.investor_id,
                    full_name:
                      signal.investor_name,
                    email:
                      signal.email,
                    organization:
                      signal.organization,
                    investor_type:
                      null,
                    proposed_ticket_inr:
                      null,
                    verification_status:
                      null,
                    access_level:
                      null,
                    kyc_completed:
                      false,
                    nda_signed:
                      false,
                    crm: {
                      stage:
                        signal.stage,
                      expected_investment_inr:
                        signal.expected_investment_inr,
                      probability_percent:
                        signal.probability_percent,
                      last_contact_date:
                        signal.last_contact_date,
                      next_action:
                        signal.next_action,
                    },
                  };

                return (
                  <div
                    key={signalId}
                    className="group px-6 py-4 transition hover:bg-white/[0.025]"
                  >
                    <div className="flex gap-4">
                      <button
                        type="button"
                        aria-label={`Inspect ${signal.investor_name}`}
                        onClick={() =>
                          setSelectedInvestor(
                            investor
                          )
                        }
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot} ${tone.glow}`}
                      />

                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedInvestor(
                              investor
                            )
                          }
                          className="block w-full text-left"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-medium text-white/80 group-hover:text-white">
                              {signal.investor_name ||
                                signal.organization ||
                                "Investor"}
                            </span>

                            <span
                              className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${tone.bg} ${tone.border} ${tone.text}`}
                            >
                              {
                                signal.severity
                              }
                            </span>

                            <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white/30">
                              {
                                SIGNAL_LABELS[
                                  signal
                                    .signal_type
                                ] ??
                                  signal.signal_type
                              }
                            </span>
                          </div>

                          <div className="mt-1 text-xs font-medium text-white/45">
                            {
                              signal.title
                            }
                          </div>

                          <div className="mt-1 line-clamp-2 text-[10px] leading-5 text-white/30">
                            {
                              signal.description
                            }
                          </div>
                        </button>

                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 text-[10px] font-medium text-cyan-300/70">
                            <span className="text-cyan-300/45">
                              Action:
                            </span>{" "}
                            {
                              signal.recommended_action
                            }
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              executeIntelligenceAction(
                                signal
                              )
                            }
                            disabled={
                              Boolean(
                                executingSignalId
                              )
                            }
                            className="shrink-0 self-start rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold text-white/60 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.06] hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
                          >
                            {executing
                              ? "Creating action..."
                              : "Create CRM Action"}
                          </button>
                        </div>
                      </div>

                      <div className="hidden shrink-0 text-right sm:block">
                        <div className="text-xs font-medium text-white/60">
                          {compactCurrency(
                            signal.expected_investment_inr
                          )}
                        </div>

                        <div className="mt-1 text-[9px] text-white/25">
                          {
                            signal.probability_percent
                          }
                          % probability
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>

        {!intelligenceLoading &&
          filteredSignals.length >
            12 && (
            <div className="border-t border-white/[0.06] px-6 py-4 text-center text-[10px] uppercase tracking-[0.18em] text-white/25">
              Showing 12 highest-priority signals
            </div>
          )}
      </section>
    </div>

    <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold">
          Institutional Pulse
        </h2>

        <p className="mt-1 text-xs text-white/40">
          Most recent investor relationship activity
        </p>
      </div>

      <div className="grid gap-3 p-6 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <IntelligenceSkeleton compact />
        ) : recentActivities.length ===
          0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-white/30">
            No relationship activity has been recorded yet.
          </div>
        ) : (
          recentActivities
            .slice(0, 8)
            .map((activity) => {
              const investor =
                investorMap.get(
                  activity.investor_id
                );

              return (
                <button
                  key={activity.id}
                  onClick={() =>
                    investor &&
                    setSelectedInvestor(
                      investor
                    )
                  }
                  className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 text-left transition hover:border-cyan-300/15 hover:bg-white/[0.035]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-300/60">
                      {TYPE_LABELS[
                        activity
                          .activity_type
                      ] ??
                        activity.activity_type}
                    </span>

                    <span className="text-[9px] text-white/25">
                      {formatDateTime(
                        activity.occurred_at
                      )}
                    </span>
                  </div>

                  <div className="mt-3 truncate text-sm font-medium text-white/70">
                    {activity.subject ||
                      "Investor activity"}
                  </div>

                  <div className="mt-1 truncate text-xs text-white/30">
                    {investor?.full_name ||
                      investor?.organization ||
                      "Investor"}
                  </div>
                </button>
              );
            })
        )}
      </div>
    </section>
  </div>

  {selectedInvestor && (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <button
        aria-label="Close investor intelligence"
        className="absolute inset-0 cursor-default"
        onClick={() =>
          setSelectedInvestor(null)
        }
      />

      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-white/10 bg-[#0a0e18] shadow-2xl">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/[0.08] text-sm font-semibold text-violet-200">
                {initials(
                  selectedInvestor.full_name
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {selectedInvestor.full_name ||
                    selectedInvestor.organization ||
                    "Investor"}
                </h2>

                <p className="mt-1 text-xs text-white/35">
                  {selectedInvestor.organization ||
                    selectedInvestor.email ||
                    "Institutional relationship"}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setSelectedInvestor(null)
              }
              className="rounded-xl border border-white/10 px-3 py-2 text-white/40 hover:bg-white/[0.05] hover:text-white"
            >
              Ã—
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              label="Stage"
              value={
                STAGE_LABELS[
                  selectedInvestor.crm
                    ?.stage ??
                    "PROSPECT"
                ] ??
                "Prospect"
              }
            />

            <MiniStat
              label="Expected"
              value={formatCurrency(
                selectedInvestor.crm
                  ?.expected_investment_inr ??
                  selectedInvestor.proposed_ticket_inr
              )}
            />

            <MiniStat
              label="Probability"
              value={`${selectedInvestor.crm?.probability_percent ?? 10}%`}
            />

            <MiniStat
              label="Actual"
              value={formatCurrency(
                selectedInvestor.crm
                  ?.actual_investment_inr
              )}
            />
          </div>

          <div className="mt-6">
            <SectionLabel>
              Institutional Status
            </SectionLabel>

            <div className="grid grid-cols-3 gap-2">
              <StatusChip
                label="Verification"
                value={
                  selectedInvestor.verification_status ??
                  "PENDING"
                }
                positive={
                  selectedInvestor.verification_status ===
                  "VERIFIED"
                }
              />

              <StatusChip
                label="KYC"
                value={
                  selectedInvestor.kyc_completed
                    ? "DONE"
                    : "OPEN"
                }
                positive={Boolean(
                  selectedInvestor.kyc_completed
                )}
              />

              <StatusChip
                label="NDA"
                value={
                  selectedInvestor.nda_signed
                    ? "DONE"
                    : "OPEN"
                }
                positive={Boolean(
                  selectedInvestor.nda_signed
                )}
              />
            </div>
          </div>

          <div className="mt-6">
            <SectionLabel>
              Relationship Signal
            </SectionLabel>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">
                  Last contact
                </span>

                <span className="text-xs text-white/65">
                  {formatDate(
                    selectedInvestor.crm
                      ?.last_contact_date
                  )}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-white/40">
                  Next action
                </span>

                <span className="max-w-[240px] truncate text-right text-xs text-white/65">
                  {selectedInvestor.crm
                    ?.next_action ||
                    "Not specified"}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-white/40">
                  Owner
                </span>

                <span className="text-xs text-white/65">
                  {selectedInvestor.crm
                    ?.assigned_admin ||
                    "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <SectionLabel>
              Intelligence Signals
            </SectionLabel>

            <div className="space-y-2">
              {signals
                .filter(
                  (signal) =>
                    signal.investor_id ===
                    selectedInvestor.id
                )
                .slice(0, 8)
                .map((signal) => {
                  const tone =
                    severityTone(
                      signal.severity
                    );

                  const signalId =
                    getSignalId(
                      signal
                    );

                  const executing =
                    executingSignalId ===
                    signalId;

                  return (
                    <div
                      key={signalId}
                      className={`rounded-2xl border ${tone.border} ${tone.bg} p-4`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${tone.dot} ${tone.glow}`}
                          />

                          <span
                            className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${tone.text}`}
                          >
                            {
                              signal.severity
                            }
                          </span>
                        </div>

                        <span className="text-[9px] text-white/25">
                          {
                            SIGNAL_LABELS[
                              signal
                                .signal_type
                            ] ??
                              signal.signal_type
                          }
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-white/70">
                        {
                          signal.title
                        }
                      </div>

                      <p className="mt-2 text-xs leading-5 text-white/35">
                        {
                          signal.description
                        }
                      </p>

                      <p className="mt-2 text-xs leading-5 text-cyan-300/70">
                        {
                          signal.recommended_action
                        }
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          executeIntelligenceAction(
                            signal
                          )
                        }
                        disabled={
                          Boolean(
                            executingSignalId
                          )
                        }
                        className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold text-white/60 transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.06] hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {executing
                          ? "Creating action..."
                          : "Create CRM Action"}
                      </button>
                    </div>
                  );
                })}

              {signals.filter(
                (signal) =>
                  signal.investor_id ===
                  selectedInvestor.id
              ).length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-white/30">
                  No active intelligence signals.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <SectionLabel>
              Relationship Activity
            </SectionLabel>

            <div className="space-y-2">
              {activities
                .filter(
                  (activity) =>
                    activity.investor_id ===
                    selectedInvestor.id
                )
                .sort(
                  (a, b) =>
                    new Date(
                      b.occurred_at
                    ).getTime() -
                    new Date(
                      a.occurred_at
                    ).getTime()
                )
                .slice(0, 8)
                .map(
                  (activity) => (
                    <div
                      key={
                        activity.id
                      }
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-cyan-300/60">
                          {TYPE_LABELS[
                            activity
                              .activity_type
                          ] ??
                            activity.activity_type}
                        </span>

                        <span className="text-[9px] text-white/25">
                          {formatDateTime(
                            activity.occurred_at
                          )}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-white/70">
                        {activity.subject ||
                          "Activity"}
                      </div>

                      {activity.details && (
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/35">
                          {
                            activity.details
                          }
                        </p>
                      )}
                    </div>
                  )
                )}

              {activities.filter(
                (activity) =>
                  activity.investor_id ===
                  selectedInvestor.id
              ).length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-white/30">
                  No recorded relationship activity.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href="/admin/investor-crm"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-xs font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            >
              Open CRM
            </a>

            <a
              href="/admin/investor-operations"
              className="rounded-xl bg-cyan-300 px-4 py-3 text-center text-xs font-semibold text-black transition hover:bg-cyan-200"
            >
              Open Operations
            </a>
          </div>
        </div>
      </aside>
    </div>
  )}
</main>

);
}

function filteredInvestors(
investors: Investor[],
search: string,
selectedStage: string
) {
const query =
search.trim().toLowerCase();

return investors
.filter((investor) => {
if (selectedStage !== "ALL") {
const stage =
investor.crm?.stage ??
"PROSPECT";

    if (stage !== selectedStage) {
      return false;
    }
  }

  if (!query) return true;

  return [
    investor.full_name,
    investor.organization,
    investor.email,
    investor.investor_type,
  ]
    .filter(Boolean)
    .some((value) =>
      String(value)
        .toLowerCase()
        .includes(query)
    );
})
.sort((a, b) => {
  const aValue = Number(
    a.crm?.expected_investment_inr ??
      a.proposed_ticket_inr ??
      0
  );

  const bValue = Number(
    b.crm?.expected_investment_inr ??
      b.proposed_ticket_inr ??
      0
  );

  return bValue - aValue;
});

}

function IntelligenceMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "violet" | "cyan" | "green" | "blue";
}) {
  const tones = {
    violet: {
      text: "text-violet-300",
      dot: "bg-violet-300",
      glow: "shadow-violet-500/10",
    },
    cyan: {
      text: "text-cyan-300",
      dot: "bg-cyan-300",
      glow: "shadow-cyan-500/10",
    },
    green: {
      text: "text-emerald-300",
      dot: "bg-emerald-300",
      glow: "shadow-emerald-500/10",
    },
    blue: {
      text: "text-sky-300",
      dot: "bg-sky-300",
      glow: "shadow-sky-500/10",
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

      <div
        className={`mt-5 text-3xl font-semibold ${selected.text}`}
      >
        {value}
      </div>

      <div className="mt-2 text-xs text-white/35">
        {detail}
      </div>
    </div>
  );
}

function SignalCounter({
  label,
  value,
  severity,
}: {
  label: string;
  value: number;
  severity: Severity;
}) {
  const tone = severityTone(severity);

  return (
    <div
      className={`rounded-xl border ${tone.border} ${tone.bg} px-3 py-2`}
    >
      <div
        className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${tone.text}`}
      >
        {label}
      </div>

      <div className="mt-1 text-sm font-semibold text-white/70">
        {value}
      </div>
    </div>
  );
}

function IntelligenceInsight({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: number;
  description: string;
  tone: "red" | "amber" | "violet" | "cyan";
}) {
  const tones = {
    red: {
      text: "text-red-300",
      border: "border-red-300/10",
      bg: "bg-red-300/[0.035]",
    },
    amber: {
      text: "text-amber-300",
      border: "border-amber-300/10",
      bg: "bg-amber-300/[0.035]",
    },
    violet: {
      text: "text-violet-300",
      border: "border-violet-300/10",
      bg: "bg-violet-300/[0.035]",
    },
    cyan: {
      text: "text-cyan-300",
      border: "border-cyan-300/10",
      bg: "bg-cyan-300/[0.035]",
    },
  };

  const selected = tones[tone];

  return (
    <div
      className={`rounded-2xl border ${selected.border} ${selected.bg} p-4`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${selected.text}`}
        >
          {label}
        </div>

        <div
          className={`text-2xl font-semibold ${selected.text}`}
        >
          {value}
        </div>
      </div>

      <div className="mt-2 text-[10px] leading-5 text-white/30">
        {description}
      </div>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-4">
      <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-medium text-white/70">
        {value}
      </div>
    </div>
  );
}

function HealthRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "cyan" | "violet" | "green" | "amber";
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  const toneClasses = {
    cyan: "bg-cyan-300",
    violet: "bg-violet-300",
    green: "bg-emerald-300",
    amber: "bg-amber-300",
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-white/50">
          {label}
        </span>

        <span className="text-xs font-medium text-white/65">
          {value}/{total}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className={`h-full rounded-full ${toneClasses[tone]}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatusChip({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3">
      <div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/25">
        {label}
      </div>

      <div
        className={`mt-1 text-[10px] font-semibold uppercase tracking-wider ${
          positive
            ? "text-emerald-300"
            : "text-amber-300"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/25">
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3">
      <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-medium text-white/70">
        {value}
      </div>
    </div>
  );
}
function IntelligenceSkeleton({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "space-y-3 p-6"
          : "space-y-1 p-6"
      }
    >
      {Array.from({
        length: compact ? 4 : 6,
      }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse rounded-2xl bg-white/[0.025] ${
            compact
              ? "h-16"
              : "h-14"
          }`}
        />
      ))}
    </div>
  );
}
