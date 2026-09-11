import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { InvestorDecisionIntelligence } from "@/lib/investor-decision-intelligence";
import { normalizeCrmTimelineItem } from "@/lib/investor-crm-timeline";
import { calculateInvestorScore } from "@/lib/investor-scoring";
import { buildInvestorActionRecommendation } from "@/lib/investor-action-recommendation";
const STAGE_ORDER = [
  "PROSPECT",
  "CONTACTED",
  "INTERESTED",
  "NDA",
  "DUE_DILIGENCE",
  "COMMITMENT",
  "INVESTED",
] as const;

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

const SEVERITY_WEIGHT: Record<string, number> = {
  OVERDUE: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function daysSince(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 86400000),
  );
}

function money(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function deriveHealth({
  signals,
  openActions,
  stage,
  probability,
}: {
  signals: Array<{ severity?: string }>;
  openActions: Array<unknown>;
  stage: string;
  probability: number;
}) {
  const severe = signals.filter(
    (signal) =>
      signal.severity === "OVERDUE" ||
      signal.severity === "HIGH",
  ).length;

  const medium = signals.filter(
    (signal) => signal.severity === "MEDIUM",
  ).length;

  if (severe >= 2) return "AT_RISK";
  if (severe === 1) return "ATTENTION";
  if (medium >= 2) return "WATCH";
  if (openActions.length >= 3) return "ATTENTION";

  if (
    (stage === "COMMITMENT" || stage === "INVESTED") &&
    probability >= 70
  ) {
    return "STRONG";
  }

  if (
    stage === "INTERESTED" ||
    stage === "NDA" ||
    stage === "DUE_DILIGENCE"
  ) {
    return "DEVELOPING";
  }

  return "STABLE";
}

function getRecommendation({
  stage,
  probability,
  expected,
  actual,
  openActions,
  signals,
  lastContactDays,
  kycCompleted,
  ndaSigned,
}: {
  stage: string;
  probability: number;
  expected: number;
  actual: number;
  openActions: any[];
  signals: any[];
  lastContactDays: number | null;
  kycCompleted: boolean;
  ndaSigned: boolean;
}) {
  const hasOverdue = signals.some(
    (signal) => signal.severity === "OVERDUE",
  );

  const hasMissingAction = signals.some(
    (signal) =>
      signal.signal_type === "MISSING_NEXT_ACTION",
  );

  if (hasOverdue || hasMissingAction) {
    return {
      action: "FOLLOW_UP",
      priority: "HIGH",
      reason:
        "An overdue or missing relationship action requires immediate attention.",
    };
  }

  if (
    !kycCompleted &&
    ["DUE_DILIGENCE", "COMMITMENT"].includes(stage)
  ) {
    return {
      action: "COMPLETE_KYC",
      priority: "HIGH",
      reason:
        "The investor has reached an advanced stage without completed KYC.",
    };
  }

  if (
    !ndaSigned &&
    ["NDA", "DUE_DILIGENCE", "COMMITMENT"].includes(stage)
  ) {
    return {
      action: "COMPLETE_NDA",
      priority: "HIGH",
      reason:
        "The investor is at or beyond the NDA stage without a completed NDA.",
    };
  }

  if (
    expected >= HIGH_VALUE_THRESHOLD &&
    (lastContactDays === null || lastContactDays >= 7)
  ) {
    return {
      action: "PERSONAL_OUTREACH",
      priority: "HIGH",
      reason:
        "This is a material capital opportunity without sufficiently recent relationship activity.",
    };
  }

  if (
    stage === "COMMITMENT" &&
    probability >= 70 &&
    expected > actual
  ) {
    return {
      action: "ADVANCE_COMMITMENT",
      priority: "HIGH",
      reason:
        "High commitment probability exists with remaining expected capital to convert.",
    };
  }

  if (stage === "DUE_DILIGENCE") {
    return {
      action: "ADVANCE_DUE_DILIGENCE",
      priority: "MEDIUM",
      reason:
        "The investor is in due diligence and should be moved toward a concrete decision.",
    };
  }

  if (stage === "INTERESTED") {
    return {
      action: "SCHEDULE_MEETING",
      priority: "MEDIUM",
      reason:
        "The investor is interested and should be advanced through a substantive relationship touchpoint.",
    };
  }

  if (openActions.length > 0) {
    return {
      action: "EXECUTE_OPEN_ACTION",
      priority: "MEDIUM",
      reason:
        "The investor already has an outstanding operational action.",
    };
  }

  const threshold = STALE_THRESHOLDS[stage] ?? 14;

  if (
    lastContactDays !== null &&
    lastContactDays >= threshold
  ) {
    return {
      action: "RE_ENGAGE",
      priority: "MEDIUM",
      reason:
        "The relationship has exceeded its stage-specific engagement threshold.",
    };
  }

  return {
    action: "MAINTAIN_RELATIONSHIP",
    priority: "LOW",
    reason:
      "No critical intervention is currently indicated.",
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const investorId =
      request.nextUrl.searchParams.get("investor_id");

    if (!investorId) {
      return NextResponse.json(
        {
          success: false,
          error: "investor_id is required",
        },
        { status: 400 },
      );
    }

    const [
      investorResult,
      crmResult,
      activitiesResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("investor_profiles")
        .select("*")
        .eq("id", investorId)
        .maybeSingle(),

      supabaseAdmin
        .from("investor_crm_logs")
        .select("*")
        .eq("investor_id", investorId)
        .order("updated_at", { ascending: false })
        .limit(1),

      supabaseAdmin
        .from("investor_crm_activities")
        .select(
          "id, investor_id, activity_type, subject, details, occurred_at, due_at, status, assigned_admin, created_by, created_at, updated_at",
        )
        .eq("investor_id", investorId)
        .order("occurred_at", { ascending: false })
        .limit(50),
    ]);

    if (investorResult.error) throw investorResult.error;
    if (crmResult.error) throw crmResult.error;
    if (activitiesResult.error) throw activitiesResult.error;

    if (!investorResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: "Investor not found",
        },
        { status: 404 },
      );
    }

    const investor = investorResult.data;
    const crm = crmResult.data?.[0] ?? null;
    const activities = activitiesResult.data ?? [];

    const stage = crm?.stage ?? "PROSPECT";
    const expected = money(crm?.expected_investment_inr);
    const actual = money(crm?.actual_investment_inr);

    const probability = Math.max(
      0,
      Math.min(
        100,
        Number(crm?.probability_percent ?? 0),
      ),
    );

    const weighted = Math.round(
      (expected * probability) / 100,
    );

    const lastContactDays = daysSince(
      crm?.last_contact_date,
    );

    const threshold =
      STALE_THRESHOLDS[stage] ?? 14;

    const openActions = activities.filter(
      (activity) => activity.status === "OPEN",
    );

    const overdueActions = openActions.filter(
      (activity) =>
        activity.due_at &&
        new Date(activity.due_at).getTime() < Date.now(),
    );

    const relationshipActivities =
      activities.filter((activity) =>
        [
          "EMAIL",
          "MEETING",
          "CALL",
          "NOTE",
          "FOLLOW_UP",
        ].includes(activity.activity_type),
      );

    const signals: any[] = [];

    if (overdueActions.length > 0) {
      signals.push({
        signal_type: "OVERDUE_FOLLOW_UP",
        severity: "OVERDUE",
        title: "Overdue relationship action",
        reason:
          `${overdueActions.length} open CRM action(s) are past due.`,
      });
    }

    if (
      lastContactDays === null ||
      lastContactDays >= threshold
    ) {
      signals.push({
        signal_type: "STALE_INVESTOR",
        severity:
          lastContactDays !== null &&
          lastContactDays >= threshold * 2
            ? "HIGH"
            : "MEDIUM",
        title: "Relationship becoming stale",
        reason:
          lastContactDays === null
            ? "No last-contact date is recorded."
            : `No recorded contact for ${lastContactDays} days; stage threshold is ${threshold} days.`,
      });
    }

    if (!crm?.next_action) {
      signals.push({
        signal_type: "MISSING_NEXT_ACTION",
        severity: "HIGH",
        title: "Missing next action",
        reason:
          "The investor has no defined CRM next action.",
      });
    }

    if (
      expected >= HIGH_VALUE_THRESHOLD &&
      (lastContactDays === null ||
        lastContactDays >= 7)
    ) {
      signals.push({
        signal_type: "HIGH_VALUE_ATTENTION",
        severity: "HIGH",
        title: "High-value investor attention",
        reason:
          "Material expected investment requires active relationship management.",
      });
    }

    if (
      probability >= 60 &&
      expected > 0 &&
      [
        "PROSPECT",
        "CONTACTED",
        "INTERESTED",
      ].includes(stage)
    ) {
      signals.push({
        signal_type: "PROBABILITY_RISK",
        severity: "MEDIUM",
        title: "Probability conversion risk",
        reason:
          "A meaningful investment probability exists while the investor remains early in the pipeline.",
      });
    }

    if (
      [
        "DUE_DILIGENCE",
        "COMMITMENT",
        "INVESTED",
      ].includes(stage) &&
      investor.kyc_completed !== true
    ) {
      signals.push({
        signal_type: "KYC_GAP",
        severity: "HIGH",
        title: "KYC incomplete",
        reason:
          "The investor has reached an advanced stage without completed KYC.",
      });
    }

    if (
      [
        "NDA",
        "DUE_DILIGENCE",
        "COMMITMENT",
      ].includes(stage) &&
      investor.nda_signed !== true
    ) {
      signals.push({
        signal_type: "NDA_GAP",
        severity: "HIGH",
        title: "NDA incomplete",
        reason:
          "The investor is at or beyond the NDA stage without a completed NDA.",
      });
    }

    signals.sort(
      (a, b) =>
        (SEVERITY_WEIGHT[b.severity] ?? 0) -
        (SEVERITY_WEIGHT[a.severity] ?? 0),
    );

    const decision = getRecommendation({
      stage,
      probability,
      expected,
      actual,
      openActions,
      signals,
      lastContactDays,
      kycCompleted:
        investor.kyc_completed === true,
      ndaSigned:
        investor.nda_signed === true,
    });

    const health = deriveHealth({
      signals,
      openActions,
      stage,
      probability,
    });

    /*
     * PHASE 5A.9
     *
     * Canonical decision-intelligence model.
     *
     * The existing 4G response contract remains unchanged. This typed
     * object formalizes the decision layer so future CRM intelligence
     * features consume one canonical model instead of creating parallel
     * decision structures.
     */
    const crmTimeline = activities.map((activity) =>
      normalizeCrmTimelineItem(
        activity as unknown as Record<string, unknown>,
      ),
    );
    const investorScore = calculateInvestorScore({
      lifecycleState:
        typeof investor.lifecycle_state === "string"
          ? investor.lifecycle_state
          : null,

      relationshipStage:
        typeof crm?.stage === "string"
          ? crm.stage
          : null,

      expectedInvestmentInr: expected,
      probabilityPercent: probability,

      daysSinceLastContact: lastContactDays,
      activityCount: activities.length,

      openActionCount: openActions.length,
      overdueActionCount: overdueActions.length,

      riskLevel:
        typeof crm?.risk_level === "string"
          ? crm.risk_level
          : null,

      kycCompleted: investor.kyc_completed === true,
      ndaSigned: investor.nda_signed === true,
    });
    const actionRecommendation =
      buildInvestorActionRecommendation({
        recommendedAction: decision.action,
        decisionPriority:
          decision.priority === "CRITICAL" ||
          decision.priority === "HIGH" ||
          decision.priority === "MEDIUM" ||
          decision.priority === "LOW"
            ? decision.priority
            : "MEDIUM",
        riskLevel:
          typeof crm?.risk_level === "string"
            ? crm.risk_level
            : "LOW",

        lifecycleState:
          typeof investor.lifecycle_state === "string"
            ? investor.lifecycle_state
            : null,

        relationshipStage:
          typeof crm?.stage === "string"
            ? crm.stage
            : null,

        openActionCount: openActions.length,
        overdueActionCount: overdueActions.length,

        kycCompleted: investor.kyc_completed === true,
        ndaSigned: investor.nda_signed === true,

        investorScore: investorScore.score,
        investorScoreBand: investorScore.band,
      });
    const decisionIntelligence: InvestorDecisionIntelligence = {
      recommendedAction: decision.action,
      recommendationReason: decision.reason,

      priority: decision.priority as InvestorDecisionIntelligence["priority"],
      riskLevel:
        crm?.risk_level === "MEDIUM" ||
        crm?.risk_level === "HIGH" ||
        crm?.risk_level === "CRITICAL"
          ? crm.risk_level
          : "LOW",
      attentionReason:
        typeof crm?.attention_reason === "string"
          ? crm.attention_reason
          : null,

      relationshipHealth: health,
      daysSinceLastContact: lastContactDays,
      activityCount: activities.length,

      expectedInvestmentInr: expected,
      weightedInvestmentInr: weighted,
      probabilityPercent: probability,

      obligations: openActions.map(
        (activity) =>
          activity.subject ||
          activity.activity_type ||
          "Open CRM action",
      ),

      signals: signals.map(
        (signal) =>
          signal.title ||
          signal.reason ||
          signal.signal_type,
      ),
    };

    return NextResponse.json({
      success: true,
      generated_at:
        new Date().toISOString(),

      investor,

      crm: {
        ...crm,
        stage,
        expected_investment_inr: expected,
        actual_investment_inr: actual,
        probability_percent: probability,
      },

      capital: {
        expected_investment_inr: expected,
        weighted_pipeline_inr: weighted,
        actual_investment_inr: actual,
        remaining_expected_inr:
          Math.max(0, expected - actual),
        probability_percent: probability,
      },

      relationship: {
        health,
        last_contact_date:
          crm?.last_contact_date ?? null,
        days_since_last_contact:
          lastContactDays,
        stale_threshold_days:
          threshold,
        latest_activity_at:
          activities[0]?.occurred_at ?? null,
        latest_relationship_activity_at:
          relationshipActivities[0]?.occurred_at ??
          null,
        recent_activity_count:
          activities.length,
        recent_relationship_activity_count:
          relationshipActivities.length,
      },

      obligations: {
        open_count: openActions.length,
        overdue_count: overdueActions.length,
        items: openActions,
      },

      intelligence: {
        signal_count: signals.length,
        signals,
      },

      decision: {
        recommended_action:
          decision.action,
        priority:
          decision.priority,
        reason:
          decision.reason,
      },

      /*
       * Canonical Phase 5A.9 decision-intelligence contract.
       * Existing 4G fields above remain backward compatible.
       */
      decision_intelligence:
        decisionIntelligence,

      crm_timeline: crmTimeline,

      investor_score: investorScore,

      action_recommendation: actionRecommendation,

      recent_activities:
        activities.slice(0, 20),

      stage_order: STAGE_ORDER,
    });
  } catch (error) {
    console.error(
      "Investor decision context error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load investor decision context",
      },
      { status: 500 },
    );
  }
}









