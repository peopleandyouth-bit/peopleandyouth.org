import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { requirePermission } from "@/lib/route-authorization";

const SIGNAL_TYPES = [
  "OVERDUE_FOLLOW_UP",
  "STALE_INVESTOR",
  "STALLED_PIPELINE",
  "MISSING_NEXT_ACTION",
  "HIGH_VALUE_ATTENTION",
  "PROBABILITY_RISK",
  "KYC_GAP",
  "NDA_GAP",
] as const;

type SignalType = (typeof SIGNAL_TYPES)[number];

const ACTION_ACTIVITY_TYPES: Record<SignalType, string> = {
  OVERDUE_FOLLOW_UP: "FOLLOW_UP",
  STALE_INVESTOR: "FOLLOW_UP",
  STALLED_PIPELINE: "FOLLOW_UP",
  MISSING_NEXT_ACTION: "FOLLOW_UP",
  HIGH_VALUE_ATTENTION: "FOLLOW_UP",
  PROBABILITY_RISK: "FOLLOW_UP",
  KYC_GAP: "KYC",
  NDA_GAP: "NDA",
};

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server configuration is incomplete.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function cleanString(value: unknown, maxLength = 5000) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function isSignalType(value: unknown): value is SignalType {
  return (
    typeof value === "string" &&
    SIGNAL_TYPES.includes(value as SignalType)
  );
}

function getActionTitle(signalType: SignalType, investorName: string) {
  switch (signalType) {
    case "OVERDUE_FOLLOW_UP":
      return `Follow up overdue — ${investorName}`;
    case "STALE_INVESTOR":
      return `Re-engage stale investor — ${investorName}`;
    case "STALLED_PIPELINE":
      return `Advance stalled pipeline — ${investorName}`;
    case "MISSING_NEXT_ACTION":
      return `Define next action — ${investorName}`;
    case "HIGH_VALUE_ATTENTION":
      return `Executive follow-up — ${investorName}`;
    case "PROBABILITY_RISK":
      return `Review probability risk — ${investorName}`;
    case "KYC_GAP":
      return `Complete KYC — ${investorName}`;
    case "NDA_GAP":
      return `Complete NDA — ${investorName}`;
    default:
      return `Investor intelligence action — ${investorName}`;
  }
}

function getRecommendedAction(
  signalType: SignalType,
  suppliedAction: string | null
) {
  if (suppliedAction) {
    return suppliedAction;
  }

  switch (signalType) {
    case "OVERDUE_FOLLOW_UP":
      return "Contact the investor and close or reschedule the overdue follow-up.";
    case "STALE_INVESTOR":
      return "Re-establish contact and determine whether the relationship should progress.";
    case "STALLED_PIPELINE":
      return "Contact the investor and establish the next concrete pipeline step.";
    case "MISSING_NEXT_ACTION":
      return "Define and record the next concrete relationship action.";
    case "HIGH_VALUE_ATTENTION":
      return "Prioritize executive outreach because of the investor's capital significance.";
    case "PROBABILITY_RISK":
      return "Review investor intent, objections and probability before continuing the pipeline.";
    case "KYC_GAP":
      return "Initiate or complete the outstanding KYC process.";
    case "NDA_GAP":
      return "Initiate or complete the outstanding NDA process.";
    default:
      return "Review the investor relationship and determine the next action.";
  }
}

/**
 * POST
 *
 * Converts an intelligence signal into an operational CRM activity.
 *
 * This endpoint deliberately does not create a new intelligence record.
 * Intelligence remains derived by /api/admin/investor-intelligence.
 *
 * The operation is idempotent for the same investor + signal type while
 * an equivalent OPEN activity already exists.
 *
 * Permission: CREATE (5B.17)
 */
export async function POST(request: NextRequest) {
  const admin = await requirePermission("CREATE");

  if (!admin.authorized) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  try {
    const body = await request.json();
    const investorId = cleanString(body?.investor_id, 100);
    const signalType = body?.signal_type;

    if (!investorId) {
      return NextResponse.json(
        { error: "investor_id is required." },
        { status: 400 }
      );
    }

    if (!isSignalType(signalType)) {
      return NextResponse.json(
        { error: "Invalid intelligence signal type." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { data: investor, error: investorError } = await supabase
      .from("investor_profiles")
      .select("id, full_name, email, organization")
      .eq("id", investorId)
      .maybeSingle();

    if (investorError) {
      console.error(
        "Investor intelligence action investor lookup error:",
        investorError
      );
      return NextResponse.json(
        { error: "Unable to verify investor." },
        { status: 500 }
      );
    }

    if (!investor) {
      return NextResponse.json(
        { error: "Investor not found." },
        { status: 404 }
      );
    }

    const investorName =
      cleanString(investor.full_name, 300) ??
      cleanString(investor.organization, 300) ??
      cleanString(investor.email, 300) ??
      "Investor";

    const activityType = ACTION_ACTIVITY_TYPES[signalType];
    const title = getActionTitle(signalType, investorName);
    const suppliedAction = cleanString(body?.recommended_action, 2000);
    const recommendedAction = getRecommendedAction(
      signalType,
      suppliedAction
    );

    /*
     * Idempotency guard:
     *
     * An intelligence refresh can return the same signal repeatedly.
     * We must not create an unlimited stream of identical operational
     * activities every time an administrator clicks the action.
     */
    const { data: existingActivities, error: existingError } = await supabase
      .from("investor_crm_activities")
      .select(
        `
        id,
        investor_id,
        activity_type,
        subject,
        details,
        occurred_at,
        due_at,
        status,
        assigned_admin,
        created_by,
        created_at,
        updated_at
        `
      )
      .eq("investor_id", investorId)
      .eq("activity_type", activityType)
      .eq("status", "OPEN")
      .order("created_at", { ascending: false })
      .limit(50);

    if (existingError) {
      console.error(
        "Investor intelligence action duplicate lookup error:",
        existingError
      );
      return NextResponse.json(
        { error: "Unable to verify existing action." },
        { status: 500 }
      );
    }

    const signalMarker = `[INTELLIGENCE:${signalType}]`;

    const existingAction =
      existingActivities?.find((activity) =>
        typeof activity.details === "string"
          ? activity.details.includes(signalMarker)
          : false
      ) ?? null;

    if (existingAction) {
      return NextResponse.json({
        success: true,
        created: false,
        duplicate: true,
        action: existingAction,
      });
    }

    const now = new Date().toISOString();

    /*
     * Intelligence actions are operational follow-ups.
     *
     * They intentionally remain inside investor_crm_activities so that
     * Operations and CRM immediately consume the same workflow state.
     */
    const details = [
      signalMarker,
      "Generated from Investor Intelligence.",
      "",
      `Recommended action: ${recommendedAction}`,
    ].join("\n");

    const dueAt =
      signalType === "OVERDUE_FOLLOW_UP"
        ? now
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const assignedAdmin =
      cleanString(body?.assigned_admin, 200) ??
      admin.user.email ??
      "Founder";

    const { data: activity, error: activityError } = await supabase
      .from("investor_crm_activities")
      .insert({
        investor_id: investorId,
        activity_type: activityType,
        subject: title,
        details,
        occurred_at: now,
        due_at: dueAt,
        status: "OPEN",
        assigned_admin: assignedAdmin,
        created_by: admin.user.id,
      })
      .select(
        `
        id,
        investor_id,
        activity_type,
        subject,
        details,
        occurred_at,
        due_at,
        status,
        assigned_admin,
        created_by,
        created_at,
        updated_at
        `
      )
      .single();

    if (activityError) {
      console.error(
        "Investor intelligence action creation error:",
        activityError
      );
      return NextResponse.json(
        { error: "Unable to create intelligence action." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        created: true,
        duplicate: false,
        action: activity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Investor intelligence action POST exception:",
      error
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to execute intelligence action.",
      },
      { status: 500 }
    );
  }
}