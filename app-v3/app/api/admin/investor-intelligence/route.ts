import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const STALE_THRESHOLDS: Record<string, number> = {
PROSPECT: 14,
CONTACTED: 10,
INTERESTED: 7,
NDA: 10,
DUE_DILIGENCE: 7,
COMMITMENT: 5,
INVESTED: 30,
};

const HIGH_VALUE_THRESHOLD = 500000;

type Severity = "OVERDUE" | "HIGH" | "MEDIUM" | "LOW";

type SignalType =
| "OVERDUE_FOLLOW_UP"
| "STALE_INVESTOR"
| "STALLED_PIPELINE"
| "MISSING_NEXT_ACTION"
| "HIGH_VALUE_ATTENTION"
| "PROBABILITY_RISK"
| "KYC_GAP"
| "NDA_GAP";

function getAdminSupabase() {
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
throw new Error("Supabase server configuration is missing.");
}

return createClient(url, serviceRoleKey, {
auth: {
autoRefreshToken: false,
persistSession: false,
},
});
}

function severityRank(severity: Severity) {
return {
OVERDUE: 4,
HIGH: 3,
MEDIUM: 2,
LOW: 1,
}[severity];
}

function daysSince(dateValue: string | null | undefined) {
if (!dateValue) {
return Infinity;
}

const date = new Date(dateValue);

if (Number.isNaN(date.getTime())) {
return Infinity;
}

return Math.floor(
(Date.now() - date.getTime()) / 86400000
);
}

export async function GET() {
try {
await requireAdmin();

const supabase = getAdminSupabase();

const [
  investorsResult,
  crmResult,
  activitiesResult,
] = await Promise.all([
  supabase
    .from("investor_profiles")
    .select(
      "id, full_name, email, organization, verification_status, kyc_completed, nda_signed, access_level, created_at"
    )
    .order("created_at", { ascending: false }),

  supabase
    .from("investor_crm_logs")
    .select(
      "id, investor_id, stage, expected_investment_inr, actual_investment_inr, probability_percent, last_contact_date, next_action, assigned_admin, updated_at"
    )
    .order("updated_at", { ascending: false }),

  supabase
    .from("investor_crm_activities")
    .select(
      "id, investor_id, activity_type, subject, details, occurred_at, due_at, status, assigned_admin, created_at"
    )
    .order("occurred_at", { ascending: false }),
]);

if (investorsResult.error) {
  throw new Error(investorsResult.error.message);
}

if (crmResult.error) {
  throw new Error(crmResult.error.message);
}

if (activitiesResult.error) {
  throw new Error(activitiesResult.error.message);
}

const investors = investorsResult.data ?? [];
const crmRows = crmResult.data ?? [];
const activities = activitiesResult.data ?? [];

const latestCrmByInvestor = new Map<
  string,
  (typeof crmRows)[number]
>();

for (const crm of crmRows) {
  if (!latestCrmByInvestor.has(crm.investor_id)) {
    latestCrmByInvestor.set(crm.investor_id, crm);
  }
}

const activitiesByInvestor = new Map<
  string,
  (typeof activities)[number][]
>();

for (const activity of activities) {
  const existing =
    activitiesByInvestor.get(activity.investor_id) ?? [];

  existing.push(activity);

  activitiesByInvestor.set(
    activity.investor_id,
    existing
  );
}

const signals: Array<{
  investor_id: string;
  investor_name: string;
  organization: string | null;
  email: string | null;
  stage: string;
  severity: Severity;
  signal_type: SignalType;
  title: string;
  description: string;
  recommended_action: string;
  expected_investment_inr: number;
  probability_percent: number;
  last_contact_date: string | null;
  next_action: string | null;
  created_at: string;
}> = [];

for (const investor of investors) {
  const crm = latestCrmByInvestor.get(investor.id);

  const investorActivities =
    activitiesByInvestor.get(investor.id) ?? [];

  const stage = crm?.stage ?? "PROSPECT";

  const expectedInvestment = Number(
    crm?.expected_investment_inr ?? 0
  );

  const probability = Number(
    crm?.probability_percent ?? 0
  );

  const lastContactDate =
    crm?.last_contact_date ?? null;

  const daysWithoutContact =
    daysSince(lastContactDate);

  const threshold =
    STALE_THRESHOLDS[stage] ??
    STALE_THRESHOLDS.PROSPECT;

  const now = Date.now();

  const overdueActivities =
    investorActivities.filter(
      (activity) =>
        activity.status === "OPEN" &&
        activity.due_at &&
        new Date(activity.due_at).getTime() < now
    );

  const approved =
    investor.verification_status === "VERIFIED" &&
    investor.access_level === "APPROVED";

  /*
   * OVERDUE FOLLOW-UP
   */
  if (overdueActivities.length > 0) {
    const overdue =
      overdueActivities[0];

    signals.push({
      investor_id: investor.id,
      investor_name:
        investor.full_name ||
        investor.organization ||
        "Investor",
      organization:
        investor.organization ?? null,
      email: investor.email ?? null,
      stage,
      severity: "OVERDUE",
      signal_type: "OVERDUE_FOLLOW_UP",
      title:
        overdue.subject ||
        "Overdue investor follow-up",
      description:
        "An open investor activity has passed its due date.",
      recommended_action:
        "Complete, reschedule, or reassign the overdue follow-up.",
      expected_investment_inr:
        expectedInvestment,
      probability_percent:
        probability,
      last_contact_date:
        lastContactDate,
      next_action:
        crm?.next_action ?? null,
      created_at:
        new Date().toISOString(),
    });
  }

  /*
   * STALE INVESTOR
   */
  if (
    stage !== "INVESTED" &&
    daysWithoutContact !== Infinity &&
    daysWithoutContact >= threshold
  ) {
    signals.push({
      investor_id: investor.id,
      investor_name:
        investor.full_name ||
        investor.organization ||
        "Investor",
      organization:
        investor.organization ?? null,
      email: investor.email ?? null,
      stage,
      severity:
        expectedInvestment >=
        HIGH_VALUE_THRESHOLD
          ? "HIGH"
          : "MEDIUM",
      signal_type: "STALE_INVESTOR",
      title:
        "Investor relationship is stale",
      description:
        `No recorded contact for ${daysWithoutContact} days.`,
      recommended_action:
        "Re-engage the investor and record a meaningful interaction.",
      expected_investment_inr:
        expectedInvestment,
      probability_percent:
        probability,
      last_contact_date:
        lastContactDate,
      next_action:
        crm?.next_action ?? null,
      created_at:
        new Date().toISOString(),
    });
  }

  /*
   * STALLED PIPELINE
   */
  if (
    [
      "CONTACTED",
      "INTERESTED",
      "NDA",
      "DUE_DILIGENCE",
      "COMMITMENT",
    ].includes(stage) &&
    daysWithoutContact !== Infinity &&
    daysWithoutContact >= threshold
  ) {
    signals.push({
      investor_id: investor.id,
      investor_name:
        investor.full_name ||
        investor.organization ||
        "Investor",
      organization:
        investor.organization ?? null,
      email: investor.email ?? null,
      stage,
      severity:
        expectedInvestment >=
        HIGH_VALUE_THRESHOLD
          ? "HIGH"
          : "MEDIUM",
      signal_type: "STALLED_PIPELINE",
      title:
        "Investor pipeline has stalled",
      description:
        `The investor has remained in ${stage.replace(
          /_/g,
          " "
        )} without recent contact.`,
      recommended_action:
        "Define and execute the next concrete pipeline step.",
      expected_investment_inr:
        expectedInvestment,
      probability_percent:
        probability,
      last_contact_date:
        lastContactDate,
      next_action:
        crm?.next_action ?? null,
      created_at:
        new Date().toISOString(),
    });
  }

  /*
   * MISSING NEXT ACTION
   */
  if (
    [
      "CONTACTED",
      "INTERESTED",
      "NDA",
      "DUE_DILIGENCE",
      "COMMITMENT",
    ].includes(stage) &&
    !crm?.next_action?.trim()
  ) {
    signals.push({
      investor_id: investor.id,
      investor_name:
        investor.full_name ||
        investor.organization ||
        "Investor",
      organization:
        investor.organization ?? null,
      email: investor.email ?? null,
      stage,
      severity:
        expectedInvestment >=
        HIGH_VALUE_THRESHOLD
          ? "HIGH"
          : "MEDIUM",
      signal_type: "MISSING_NEXT_ACTION",
      title:
        "Next action is missing",
      description:
        "The investor is in an active relationship stage but has no CRM next action.",
      recommended_action:
        "Define the next action, owner, and expected timing.",
      expected_investment_inr:
        expectedInvestment,
      probability_percent:
        probability,
      last_contact_date:
        lastContactDate,
      next_action:
        null,
      created_at:
        new Date().toISOString(),
    });
  }

  /*
   * HIGH-VALUE ATTENTION
   */
  if (
    expectedInvestment >=
      HIGH_VALUE_THRESHOLD &&
    stage !== "INVESTED" &&
    (daysWithoutContact >= 7 ||
      daysWithoutContact === Infinity)
  ) {
    signals.push({
      investor_id: investor.id,
      investor_name:
        investor.full_name ||
        investor.organization ||
        "Investor",
      organization:
        investor.organization ?? null,
      email: investor.email ?? null,
      stage,
      severity: "HIGH",
      signal_type:
        "HIGH_VALUE_ATTENTION",
      title:
        "High-value investor requires attention",
      description:
        `Expected investment is â‚¹${expectedInvestment.toLocaleString(
          "en-IN"
        )} and recent engagement is insufficient.`,
      recommended_action:
        "Prioritise senior-level engagement and confirm investor intent.",
      expected_investment_inr:
        expectedInvestment,
      probability_percent:
        probability,
      last_contact_date:
        lastContactDate,
      next_action:
        crm?.next_action ?? null,
      created_at:
        new Date().toISOString(),
    });
  }

  /*
   * PROBABILITY RISK
   */
  if (
    expectedInvestment >=
      HIGH_VALUE_THRESHOLD &&
    !["PROSPECT", "INVESTED"].includes(
      stage
    ) &&
    probability < 40
  ) {
    signals.push({
      investor_id: investor.id,
      investor_name:
        investor.full_name ||
        investor.organization ||
        "Investor",
      organization:
        investor.organization ?? null,
      email: investor.email ?? null,
      stage,
      severity: "MEDIUM",
      signal_type:
        "PROBABILITY_RISK",
      title:
        "High-value probability risk",
      description:
        `Pipeline probability is currently ${probability}%.`,
      recommended_action:
        "Validate investor intent, stage accuracy, and next commitment step.",
      expected_investment_inr:
        expectedInvestment,
      probability_percent:
        probability,
      last_contact_date:
        lastContactDate,
      next_action:
        crm?.next_action ?? null,
      created_at:
        new Date().toISOString(),
    });
  }

  /*
   * KYC GAP
   */
  if (
    approved &&
    !investor.kyc_completed
  ) {
    signals.push({
      investor_id: investor.id,
      investor_name:
        investor.full_name ||
        investor.organization ||
        "Investor",
      organization:
        investor.organization ?? null,
      email: investor.email ?? null,
      stage,
      severity: "MEDIUM",
      signal_type: "KYC_GAP",
      title:
        "Investor KYC is incomplete",
      description:
        "The investor is approved but KYC is not recorded as complete.",
      recommended_action:
        "Complete and record the investor KYC process.",
      expected_investment_inr:
        expectedInvestment,
      probability_percent:
        probability,
      last_contact_date:
        lastContactDate,
      next_action:
        crm?.next_action ?? null,
      created_at:
        new Date().toISOString(),
    });
  }

  /*
   * NDA GAP
   */
  if (
    approved &&
    !investor.nda_signed
  ) {
    signals.push({
      investor_id: investor.id,
      investor_name:
        investor.full_name ||
        investor.organization ||
        "Investor",
      organization:
        investor.organization ?? null,
      email: investor.email ?? null,
      stage,
      severity: "MEDIUM",
      signal_type: "NDA_GAP",
      title:
        "Investor NDA is incomplete",
      description:
        "The investor is approved but NDA is not recorded as signed.",
      recommended_action:
        "Complete and record the investor NDA.",
      expected_investment_inr:
        expectedInvestment,
      probability_percent:
        probability,
      last_contact_date:
        lastContactDate,
      next_action:
        crm?.next_action ?? null,
      created_at:
        new Date().toISOString(),
    });
  }
}

/*
 * Deduplicate signals by investor + signal type.
 */
const deduplicatedSignals = Array.from(
  new Map(
    signals.map((signal) => [
      `${signal.investor_id}:${signal.signal_type}`,
      signal,
    ])
  ).values()
);

/*
 * Highest urgency first, then highest
 * expected investment.
 */
deduplicatedSignals.sort((a, b) => {
  const severityDifference =
    severityRank(b.severity) -
    severityRank(a.severity);

  if (severityDifference !== 0) {
    return severityDifference;
  }

  return (
    b.expected_investment_inr -
    a.expected_investment_inr
  );
});

/*
 * STEP 4
 *
 * Intelligence signals are derived objects, not database entities.
 * Give each signal a deterministic identity based on the investor
 * and signal type. This provides stable React/UI identity without
 * introducing a database ID or intelligence table.
 */
const normalizedSignals = deduplicatedSignals.map(
  (signal) => ({
    ...signal,
    id: `${signal.investor_id}:${signal.signal_type}`,
  })
);

/*
 * STEP 5
 *
 * Keep both the flat severity fields consumed by the existing
 * Intelligence UI and the nested severity object for compatibility.
 */
const severityCounts = {
  overdue:
    normalizedSignals.filter(
      (signal) =>
        signal.severity === "OVERDUE"
    ).length,

  high:
    normalizedSignals.filter(
      (signal) =>
        signal.severity === "HIGH"
    ).length,

  medium:
    normalizedSignals.filter(
      (signal) =>
        signal.severity === "MEDIUM"
    ).length,

  low:
    normalizedSignals.filter(
      (signal) =>
        signal.severity === "LOW"
    ).length,
};

const overdueFollowupCount =
  normalizedSignals.filter(
    (signal) =>
      signal.signal_type ===
      "OVERDUE_FOLLOW_UP"
  ).length;

const staleInvestorCount =
  normalizedSignals.filter(
    (signal) =>
      signal.signal_type ===
      "STALE_INVESTOR"
  ).length;

const stalledPipelineCount =
  normalizedSignals.filter(
    (signal) =>
      signal.signal_type ===
      "STALLED_PIPELINE"
  ).length;

const missingNextActionCount =
  normalizedSignals.filter(
    (signal) =>
      signal.signal_type ===
      "MISSING_NEXT_ACTION"
  ).length;

const highValueAttentionCount =
  normalizedSignals.filter(
    (signal) =>
      signal.signal_type ===
      "HIGH_VALUE_ATTENTION"
  ).length;

const probabilityRiskCount =
  normalizedSignals.filter(
    (signal) =>
      signal.signal_type ===
      "PROBABILITY_RISK"
  ).length;

const relationshipRiskCount =
  normalizedSignals.filter(
    (signal) =>
      signal.signal_type === "KYC_GAP" ||
      signal.signal_type === "NDA_GAP"
  ).length;

const summary = {
  total_signals:
    normalizedSignals.length,

  /*
   * Backward-compatible flat severity fields.
   */
  overdue:
    severityCounts.overdue,

  high:
    severityCounts.high,

  medium:
    severityCounts.medium,

  low:
    severityCounts.low,

  stale_investors:
    staleInvestorCount,

  stalled_pipeline:
    stalledPipelineCount,

  overdue_followups:
    overdueFollowupCount,

  missing_next_actions:
    missingNextActionCount,

  high_value_attention:
    highValueAttentionCount,

  probability_risks:
    probabilityRiskCount,

  relationship_risks:
    relationshipRiskCount,

  /*
   * Existing nested severity contract retained.
   */
  severity: severityCounts,
};

return NextResponse.json({
  success: true,
  generated_at:
    new Date().toISOString(),
  thresholds: {
    stale_days:
      STALE_THRESHOLDS,
    high_value_inr:
      HIGH_VALUE_THRESHOLD,
  },
  summary,
  signals: normalizedSignals,
});

} catch (error) {
console.error(
"Investor intelligence error:",
error
);

return NextResponse.json(
  {
    success: false,
    error:
      error instanceof Error
        ? error.message
        : "Failed to generate investor intelligence.",
  },
  {
    status: 500,
  }
);

}
}

