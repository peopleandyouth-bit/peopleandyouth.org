import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/route-authorization";

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
const DEFAULT_TARGET_RAISE_INR = 50000000;

type TriggeredBy = "CRON" | "MANUAL";
type AuthorizeSuccess = { ok: true; actor: string };
type AuthorizeFailure = { ok: false; status: number; error: string };
type AuthorizeResult = AuthorizeSuccess | AuthorizeFailure;

function isAuthorizeFailure(
  result: AuthorizeResult
): result is AuthorizeFailure {
  return result.ok === false;
}

interface ScanSummary {
  generated_at: string;
  daily_review: {
    total_investors: number;
    active_relationships: number;
    open_actions: number;
    completed_actions_last_7d: number;
  };
  overdue_scan: {
    count: number;
    items: Array<{
      activity_id: string;
      investor_id: string;
      investor_name: string;
      subject: string | null;
      due_at: string;
      days_overdue: number;
    }>;
  };
  dormancy_scan: {
    count: number;
    items: Array<{
      investor_id: string;
      investor_name: string;
      stage: string;
      days_since_contact: number | null;
      threshold_days: number;
    }>;
  };
  pipeline_health: {
    stage_distribution: Array<{
      stage: string;
      count: number;
      value_inr: number;
    }>;
    blocked_stages: Array<{
      stage: string;
      count: number;
      avg_days_in_stage: number;
      threshold_days: number;
    }>;
  };
  raise_progress: {
    target_inr: number;
    weighted_pipeline_inr: number;
    proposed_inr: number;
    confirmed_inr: number;
    remaining_inr: number;
    coverage_percent: number;
  };
  executive_summary: {
    attention_items: number;
    opportunities: number;
    risks: number;
    narrative: string;
  };
}

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

function daysSince(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 86400000)
  );
}

async function loadTargetRaise(
  supabase: ReturnType<typeof getAdminSupabase>
): Promise<number> {
  try {
    const { data } = await supabase
      .from("investor_cms_config")
      .select("target_raise_inr")
      .limit(1)
      .maybeSingle();

    const value = Number(data?.target_raise_inr ?? 0);

    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  } catch {
    // investor_cms_config may not exist in all environments
  }

  return DEFAULT_TARGET_RAISE_INR;
}

async function computeScanSummary(): Promise<ScanSummary> {
  const supabase = getAdminSupabase();
  const now = Date.now();

  const [
    { data: investors, error: investorsError },
    { data: activities, error: activitiesError },
    targetRaiseInr,
  ] = await Promise.all([
    supabase
      .from("investor_profiles")
      .select(
        "id, full_name, email, organization, investor_type, proposed_ticket_inr, verification_status, access_level, kyc_completed, nda_signed"
      ),
    supabase
      .from("investor_crm_activities")
      .select(
        "id, investor_id, activity_type, subject, details, occurred_at, due_at, status, assigned_admin"
      ),
    loadTargetRaise(supabase),
  ]);

  if (investorsError) throw investorsError;
  if (activitiesError) throw activitiesError;

  const { data: crmLogs, error: crmError } = await supabase
    .from("investor_crm_logs")
    .select(
      "investor_id, stage, expected_investment_inr, actual_investment_inr, probability_percent, last_contact_date, next_action, updated_at"
    )
    .order("updated_at", { ascending: false });

  if (crmError) throw crmError;

  const latestCrm = new Map<
    string,
    {
      stage: string;
      expected_investment_inr: number | null;
      actual_investment_inr: number | null;
      probability_percent: number | null;
      last_contact_date: string | null;
      next_action: string | null;
      updated_at: string;
    }
  >();

  for (const row of crmLogs ?? []) {
    if (!latestCrm.has(row.investor_id)) {
      latestCrm.set(row.investor_id, {
        stage: row.stage,
        expected_investment_inr: row.expected_investment_inr,
        actual_investment_inr: row.actual_investment_inr,
        probability_percent: row.probability_percent,
        last_contact_date: row.last_contact_date,
        next_action: row.next_action,
        updated_at: row.updated_at,
      });
    }
  }

  const investorMap = new Map<
    string,
    {
      id: string;
      full_name: string | null;
      organization: string | null;
      email: string | null;
    }
  >();

  for (const inv of investors ?? []) {
    investorMap.set(inv.id, {
      id: inv.id,
      full_name: inv.full_name,
      organization: inv.organization,
      email: inv.email,
    });
  }

  const investorName = (id: string) => {
    const inv = investorMap.get(id);
    return inv?.full_name || inv?.organization || inv?.email || "Investor";
  };

  // ------- 9C.1 Daily CRM review -------
  const openActions = (activities ?? []).filter(
    (a) => a.status === "OPEN"
  );
  const completedLast7d = (activities ?? []).filter(
    (a) =>
      a.status === "COMPLETED" &&
      now - new Date(a.occurred_at).getTime() <= 7 * 86400000
  );

  const activeRelationships = (investors ?? []).filter((inv) => {
    const crm = latestCrm.get(inv.id);
    const stage = crm?.stage ?? "PROSPECT";
    return stage !== "PROSPECT" && stage !== "INVESTED";
  }).length;

  const dailyReview = {
    total_investors: (investors ?? []).length,
    active_relationships: activeRelationships,
    open_actions: openActions.length,
    completed_actions_last_7d: completedLast7d.length,
  };

  // ------- 9C.2 Overdue-action scan -------
  const overdueItems = openActions
    .filter(
      (a) => a.due_at && new Date(a.due_at).getTime() < now
    )
    .map((a) => ({
      activity_id: a.id,
      investor_id: a.investor_id,
      investor_name: investorName(a.investor_id),
      subject: a.subject,
      due_at: a.due_at!,
      days_overdue: Math.max(
        0,
        Math.floor(
          (now - new Date(a.due_at!).getTime()) / 86400000
        )
      ),
    }))
    .sort((a, b) => b.days_overdue - a.days_overdue);

  // ------- 9C.3 Dormancy scan -------
  const dormancyItems = (investors ?? [])
    .map((inv) => {
      const crm = latestCrm.get(inv.id);
      const stage = (crm?.stage ?? "PROSPECT") as string;
      const threshold = STALE_THRESHOLDS[stage] ?? 14;
      const days = daysSince(crm?.last_contact_date ?? null);

      return {
        investor_id: inv.id,
        investor_name: investorName(inv.id),
        stage,
        days_since_contact: days,
        threshold_days: threshold,
      };
    })
    .filter(
      (item) =>
        item.stage !== "INVESTED" &&
        (item.days_since_contact === null ||
          item.days_since_contact >= item.threshold_days * 2)
    );

  // ------- 9C.4 Pipeline health -------
  const stageDistribution: Record<
    string,
    { count: number; value_inr: number }
  > = {};

  for (const inv of investors ?? []) {
    const crm = latestCrm.get(inv.id);
    const stage = crm?.stage ?? "PROSPECT";
    const expected = Number(
      crm?.expected_investment_inr ??
        inv.proposed_ticket_inr ??
        0
    );

    const bucket = (stageDistribution[stage] = stageDistribution[
      stage
    ] ?? { count: 0, value_inr: 0 });

    bucket.count += 1;
    bucket.value_inr += expected;
  }

  const stageDwell: Record<
    string,
    { count: number; total: number }
  > = {};

  for (const inv of investors ?? []) {
    const crm = latestCrm.get(inv.id);
    const stage = crm?.stage ?? "PROSPECT";
    if (stage === "INVESTED") continue;

    const days = daysSince(crm?.last_contact_date ?? null) ?? 0;
    const bucket = (stageDwell[stage] = stageDwell[stage] ?? {
      count: 0,
      total: 0,
    });

    bucket.count += 1;
    bucket.total += days;
  }

  const blockedStages = Object.entries(stageDwell)
    .map(([stage, bucket]) => ({
      stage,
      count: bucket.count,
      avg_days_in_stage:
        bucket.count > 0 ? bucket.total / bucket.count : 0,
      threshold_days: STALE_THRESHOLDS[stage] ?? 14,
    }))
    .filter(
      (s) => s.avg_days_in_stage >= s.threshold_days * 1.5
    )
    .sort((a, b) => b.avg_days_in_stage - a.avg_days_in_stage);

  // ------- 9C.5 Raise progress -------
  let currentPipeline = 0;
  let weightedPipeline = 0;
  let proposed = 0;
  let confirmed = 0;

  for (const inv of investors ?? []) {
    const crm = latestCrm.get(inv.id);
    const expected = Number(
      crm?.expected_investment_inr ??
        inv.proposed_ticket_inr ??
        0
    );
    const probability = Number(
      crm?.probability_percent ?? 10
    );
    const actual = Number(crm?.actual_investment_inr ?? 0);
    const stage = crm?.stage ?? "PROSPECT";

    currentPipeline += expected;
    weightedPipeline += expected * (probability / 100);

    if (stage === "COMMITMENT") proposed += expected;
    if (stage === "INVESTED") confirmed += actual;
  }

  const remaining = Math.max(
    0,
    targetRaiseInr - proposed - confirmed
  );
  const coverage =
    targetRaiseInr > 0
      ? (weightedPipeline / targetRaiseInr) * 100
      : 0;

  // ------- 9C.6 Executive summary -------
  const risks =
    overdueItems.length + dormancyItems.length;
  const opportunities = (investors ?? []).filter((inv) => {
    const crm = latestCrm.get(inv.id);
    const stage = crm?.stage ?? "PROSPECT";
    return [
      "INTERESTED",
      "NDA",
      "DUE_DILIGENCE",
    ].includes(stage);
  }).length;

  const attentionItems = (investors ?? []).filter((inv) => {
    const crm = latestCrm.get(inv.id);
    const expected = Number(
      crm?.expected_investment_inr ??
        inv.proposed_ticket_inr ??
        0
    );
    const days = daysSince(crm?.last_contact_date ?? null);
    return (
      expected >= HIGH_VALUE_THRESHOLD &&
      (days === null || days >= 7)
    );
  }).length;

  const narrativeParts: string[] = [];

  narrativeParts.push(
    `${(investors ?? []).length} investor relationship${
      (investors ?? []).length === 1 ? "" : "s"
    } under management.`
  );

  if (overdueItems.length > 0) {
    narrativeParts.push(
      `${overdueItems.length} overdue action${
        overdueItems.length === 1 ? "" : "s"
      } require attention.`
    );
  } else {
    narrativeParts.push("No overdue actions.");
  }

  if (dormancyItems.length > 0) {
    narrativeParts.push(
      `${dormancyItems.length} relationship${
        dormancyItems.length === 1 ? "" : "s"
      } showing dormancy risk.`
    );
  }

  narrativeParts.push(
    `Raise coverage at ${coverage.toFixed(0)}% of target.`
  );

  if (blockedStages.length > 0) {
    narrativeParts.push(
      `Pipeline blockage detected at ${blockedStages[0].stage}.`
    );
  }

  const executive_summary = {
    attention_items: attentionItems,
    opportunities,
    risks,
    narrative: narrativeParts.join(" "),
  };

  return {
    generated_at: new Date().toISOString(),
    daily_review: dailyReview,
    overdue_scan: {
      count: overdueItems.length,
      items: overdueItems.slice(0, 50),
    },
    dormancy_scan: {
      count: dormancyItems.length,
      items: dormancyItems.slice(0, 50),
    },
    pipeline_health: {
      stage_distribution: Object.entries(stageDistribution).map(
        ([stage, bucket]) => ({
          stage,
          count: bucket.count,
          value_inr: bucket.value_inr,
        })
      ),
      blocked_stages: blockedStages,
    },
    raise_progress: {
      target_inr: targetRaiseInr,
      weighted_pipeline_inr: Math.round(weightedPipeline),
      proposed_inr: proposed,
      confirmed_inr: confirmed,
      remaining_inr: remaining,
      coverage_percent: Math.round(coverage),
    },
    executive_summary,
  };
}

async function authorize(
  request: NextRequest,
  mode: TriggeredBy
): Promise<AuthorizeResult> {
  if (mode === "CRON") {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return {
        ok: false,
        status: 503,
        error:
          "CRON_SECRET is not configured. Add it in Vercel environment variables.",
      };
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return {
        ok: false,
        status: 401,
        error: "Unauthorized cron invocation.",
      };
    }

    return { ok: true, actor: "vercel-cron" };
  }

  const auth = await requirePermission("CREATE");

  if (!auth.authorized) {
    return {
      ok: false,
      status: auth.status,
      error: auth.error,
    };
  }

  return {
    ok: true,
    actor: auth.user.email ?? "unknown-admin",
  };
}

async function runScan(
  request: NextRequest,
  mode: TriggeredBy
) {
  const started = Date.now();

  const authResult = await authorize(request, mode);

    if (isAuthorizeFailure(authResult)) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const supabase = getAdminSupabase();

  try {
    const summary = await computeScanSummary();
    const duration = Date.now() - started;

    const { data: record, error: insertError } = await supabase
      .from("investor_automation_scans")
      .insert({
        scan_type: "DAILY_REVIEW",
        triggered_by: mode,
        triggered_by_actor: authResult.actor,
        status: "SUCCESS",
        summary,
        duration_ms: duration,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Scan record insert failed:", insertError);
      return NextResponse.json(
        {
          error:
            "Scan executed but could not be persisted. Check logs.",
          summary,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      scan: record,
      summary,
    });
  } catch (error) {
    const duration = Date.now() - started;
    const message =
      error instanceof Error ? error.message : "Unknown scan error.";

    console.error("Automation scan failed:", error);

    try {
      await supabase.from("investor_automation_scans").insert({
        scan_type: "DAILY_REVIEW",
        triggered_by: mode,
        triggered_by_actor: authResult.actor,
        status: "FAILED",
        error_message: message,
        summary: {},
        duration_ms: duration,
      });
    } catch (persistError) {
      console.error(
        "Failed to persist scan failure record:",
        persistError
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * GET — Vercel Cron entrypoint.
 *
 * Vercel invokes this path with a GET request and an
 * `Authorization: Bearer <CRON_SECRET>` header. The header must match
 * the CRON_SECRET environment variable or the scan is refused.
 */
export async function GET(request: NextRequest) {
  return runScan(request, "CRON");
}

/**
 * POST — Manual trigger.
 *
 * Requires an authenticated institutional identity with CREATE
 * permission. Used by the automation UI to run the scan on demand.
 */
export async function POST(request: NextRequest) {
  return runScan(request, "MANUAL");
}