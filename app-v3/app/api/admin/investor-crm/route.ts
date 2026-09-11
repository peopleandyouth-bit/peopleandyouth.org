import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { requirePermission } from "@/lib/route-authorization";

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

function getAdminSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

function isStage(value: unknown): value is Stage {
  return (
    typeof value === "string" &&
    STAGES.includes(value as Stage)
  );
}

function parseNumber(
  value: unknown,
  field: string,
  options: {
    integer?: boolean;
    min?: number;
    max?: number;
  } = {}
) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${field} must be a valid number.`);
  }

  if (options.integer && !Number.isInteger(parsed)) {
    throw new Error(`${field} must be an integer.`);
  }

  if (
    options.min !== undefined &&
    parsed < options.min
  ) {
    throw new Error(
      `${field} must be at least ${options.min}.`
    );
  }

  if (
    options.max !== undefined &&
    parsed > options.max
  ) {
    throw new Error(
      `${field} must be at most ${options.max}.`
    );
  }

  return parsed;
}

function normalizeDate(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new Error("last_contact_date must be a valid date.");
  }

  return date.toISOString();
}

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const supabase = getAdminSupabase();

    const [
      { data: profiles, error: profilesError },
      { data: logs, error: logsError },
    ] = await Promise.all([
      supabase
        .from("investor_profiles")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("investor_crm_logs")
        .select("*")
        .order("updated_at", { ascending: false }),
    ]);

    if (profilesError) {
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      );
    }

    if (logsError) {
      return NextResponse.json(
        { error: logsError.message },
        { status: 500 }
      );
    }

    const logMap = new Map<
      string,
      Record<string, unknown>
    >();

    for (const log of logs || []) {
      if (
        log.investor_id &&
        !logMap.has(log.investor_id)
      ) {
        logMap.set(log.investor_id, log);
      }
    }

    const investors = (profiles || []).map((profile) => ({
      ...profile,
      crm: logMap.get(profile.id) || null,
    }));

    return NextResponse.json({
      investors,
      stages: STAGES,
    });
  } catch (error) {
    console.error("Investor CRM GET error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load investor CRM.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 *
 * Updates the CRM relationship record for an investor.
 *
 * Permission: EDIT (5B.17)
 */
export async function PATCH(
  request: Request
) {
  try {
    const auth = await requirePermission("EDIT");

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const investorId = body?.investor_id;

    if (
      typeof investorId !== "string" ||
      !investorId.trim()
    ) {
      return NextResponse.json(
        { error: "investor_id is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const {
      data: investor,
      error: investorError,
    } = await supabase
      .from("investor_profiles")
      .select("id, full_name, email")
      .eq("id", investorId)
      .maybeSingle();

    if (investorError) {
      return NextResponse.json(
        { error: investorError.message },
        { status: 500 }
      );
    }

    if (!investor) {
      return NextResponse.json(
        { error: "Investor not found." },
        { status: 404 }
      );
    }

    let stage: Stage = "PROSPECT";

    if (body.stage !== undefined) {
      if (!isStage(body.stage)) {
        return NextResponse.json(
          {
            error:
              "Invalid stage. Allowed stages: " +
              STAGES.join(", "),
          },
          { status: 400 }
        );
      }

      stage = body.stage;
    }

    const expectedInvestment =
      parseNumber(
        body.expected_investment_inr,
        "expected_investment_inr",
        { min: 0 }
      );

    const actualInvestment =
      parseNumber(
        body.actual_investment_inr,
        "actual_investment_inr",
        { min: 0 }
      );

    const probability =
      parseNumber(
        body.probability_percent,
        "probability_percent",
        {
          integer: true,
          min: 0,
          max: 100,
        }
      );

    const lastContactDate =
      normalizeDate(body.last_contact_date);

    const nextAction =
      body.next_action === null ||
      body.next_action === undefined
        ? null
        : String(body.next_action).trim() || null;

    const meetingNotes =
      body.meeting_notes === null ||
      body.meeting_notes === undefined
        ? null
        : String(body.meeting_notes).trim() || null;

    const assignedAdmin =
      body.assigned_admin === null ||
      body.assigned_admin === undefined
        ? "Founder"
        : String(body.assigned_admin).trim() ||
          "Founder";

    const now = new Date().toISOString();

    const payload = {
      investor_id: investorId,
      stage,
      expected_investment_inr:
        expectedInvestment ?? 0,
      actual_investment_inr:
        actualInvestment ?? 0,
      probability_percent:
        probability ?? 10,
      last_contact_date:
        lastContactDate,
      next_action: nextAction,
      meeting_notes: meetingNotes,
      assigned_admin: assignedAdmin,
      updated_at: now,
    };

    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("investor_crm_logs")
      .select("id")
      .eq("investor_id", investorId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    let crmRecord;

    if (existing?.id) {
      const {
        data,
        error,
      } = await supabase
        .from("investor_crm_logs")
        .update(payload)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      crmRecord = data;
    } else {
      const {
        data,
        error,
      } = await supabase
        .from("investor_crm_logs")
        .insert({
          ...payload,
          created_at: now,
        })
        .select("*")
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      crmRecord = data;
    }

    return NextResponse.json({
      success: true,
      crm: crmRecord,
    });
  } catch (error) {
    console.error("Investor CRM PATCH error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update investor CRM.",
      },
      { status: 500 }
    );
  }
}