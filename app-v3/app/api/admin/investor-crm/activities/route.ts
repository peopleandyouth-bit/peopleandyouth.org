import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { requirePermission } from "@/lib/route-authorization";

const ACTIVITY_TYPES = [
  "NOTE",
  "CALL",
  "EMAIL",
  "MEETING",
  "STAGE_CHANGE",
  "FOLLOW_UP",
  "KYC",
  "NDA",
  "DUE_DILIGENCE",
  "COMMITMENT",
  "INVESTMENT",
  "OTHER",
] as const;

const ACTIVITY_STATUSES = [
  "OPEN",
  "COMPLETED",
  "CANCELLED",
] as const;

type ActivityType = (typeof ACTIVITY_TYPES)[number];
type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

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

function isActivityType(value: unknown): value is ActivityType {
  return (
    typeof value === "string" &&
    ACTIVITY_TYPES.includes(value as ActivityType)
  );
}

function isActivityStatus(value: unknown): value is ActivityStatus {
  return (
    typeof value === "string" &&
    ACTIVITY_STATUSES.includes(value as ActivityStatus)
  );
}

function cleanString(value: unknown, maxLength = 5000) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function parseDate(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return null;
  }

  return timestamp.toISOString();
}

/**
 * GET
 *
 * Returns activities for a specific investor.
 *
 * Query parameters:
 *   ?investor_id=<uuid>
 *   ?status=OPEN
 *
 * Without investor_id, returns the operational activity queue.
 */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  try {
    const supabase = getAdminSupabase();
    const { searchParams } = new URL(request.url);
    const investorId = searchParams.get("investor_id");
    const status = searchParams.get("status");

    let query = supabase
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
      .order("occurred_at", { ascending: false });

    if (investorId) {
      query = query.eq("investor_id", investorId);
    }

    if (status) {
      if (!isActivityStatus(status)) {
        return NextResponse.json(
          { error: "Invalid activity status." },
          { status: 400 }
        );
      }

      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Investor activity GET error:", error);
      return NextResponse.json(
        { error: "Unable to load investor activities." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      activities: data ?? [],
    });
  } catch (error) {
    console.error("Investor activity GET exception:", error);
    return NextResponse.json(
      { error: "Unable to load investor activities." },
      { status: 500 }
    );
  }
}

/**
 * POST
 *
 * Creates a new institutional activity or operational follow-up.
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

    if (!investorId) {
      return NextResponse.json(
        { error: "investor_id is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { data: investor, error: investorError } = await supabase
      .from("investor_profiles")
      .select("id")
      .eq("id", investorId)
      .maybeSingle();

    if (investorError) {
      console.error(
        "Investor activity investor lookup error:",
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

    const activityType = body?.activity_type ?? "NOTE";

    if (!isActivityType(activityType)) {
      return NextResponse.json(
        { error: "Invalid activity type." },
        { status: 400 }
      );
    }

    /*
     * 5B.1 — Follow-up Action
     *
     * Follow-ups are operational CRM actions. They must be explicitly
     * created as FOLLOW_UP activities and remain OPEN until resolved
     * by a later Phase 5B/5C action.
     */
    if (activityType === "FOLLOW_UP") {
      if (body?.status !== undefined && body.status !== "OPEN") {
        return NextResponse.json(
          { error: "Follow-up actions must be created with OPEN status." },
          { status: 400 }
        );
      }

      if (!parseDate(body?.due_at)) {
        return NextResponse.json(
          { error: "A due_at date is required for follow-up actions." },
          { status: 400 }
        );
      }

      if (!cleanString(body?.subject, 300)) {
        return NextResponse.json(
          { error: "A subject is required for follow-up actions." },
          { status: 400 }
        );
      }
    }

    const requestedStatus =
      activityType === "FOLLOW_UP"
        ? "OPEN"
        : body?.status ?? "COMPLETED";

    if (!isActivityStatus(requestedStatus)) {
      return NextResponse.json(
        { error: "Invalid activity status." },
        { status: 400 }
      );
    }

    const subject = cleanString(body?.subject, 300);
    const details = cleanString(body?.details, 10000);
    const occurredAt =
      parseDate(body?.occurred_at) ?? new Date().toISOString();
    const dueAt = parseDate(body?.due_at);

    const assignedAdmin =
      cleanString(body?.assigned_admin, 200) ??
      admin.user.email ??
      "Founder";

    const { data, error } = await supabase
      .from("investor_crm_activities")
      .insert({
        investor_id: investorId,
        activity_type: activityType,
        subject,
        details,
        occurred_at: occurredAt,
        due_at: dueAt,
        status: requestedStatus,
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

    if (error) {
      console.error("Investor activity POST error:", error);
      return NextResponse.json(
        { error: "Unable to create investor activity." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        activity: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Investor activity POST exception:", error);
    return NextResponse.json(
      { error: "Unable to create investor activity." },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 *
 * Updates operational state of an activity.
 *
 * Supported fields:
 *   status
 *   due_at
 *   assigned_admin
 *   subject
 *   details
 *
 * Permission: EDIT (5B.17)
 */
export async function PATCH(request: NextRequest) {
  const admin = await requirePermission("EDIT");

  if (!admin.authorized) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  try {
    const body = await request.json();
    const activityId = cleanString(body?.id, 100);

    if (!activityId) {
      return NextResponse.json(
        { error: "Activity id is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { data: existing, error: existingError } = await supabase
      .from("investor_crm_activities")
      .select("id")
      .eq("id", activityId)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Investor activity lookup error:",
        existingError
      );
      return NextResponse.json(
        { error: "Unable to verify activity." },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "Activity not found." },
        { status: 404 }
      );
    }

    const update: Record<string, unknown> = {};

    if (body?.status !== undefined) {
      if (!isActivityStatus(body.status)) {
        return NextResponse.json(
          { error: "Invalid activity status." },
          { status: 400 }
        );
      }

      update.status = body.status;
    }

    if (body?.due_at !== undefined) {
      update.due_at = parseDate(body.due_at);
    }

    if (body?.assigned_admin !== undefined) {
      update.assigned_admin = cleanString(body.assigned_admin, 200);
    }

    if (body?.subject !== undefined) {
      update.subject = cleanString(body.subject, 300);
    }

    if (body?.details !== undefined) {
      update.details = cleanString(body.details, 10000);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields supplied for update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("investor_crm_activities")
      .update(update)
      .eq("id", activityId)
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

    if (error) {
      console.error("Investor activity PATCH error:", error);
      return NextResponse.json(
        { error: "Unable to update investor activity." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      activity: data,
    });
  } catch (error) {
    console.error("Investor activity PATCH exception:", error);
    return NextResponse.json(
      { error: "Unable to update investor activity." },
      { status: 500 }
    );
  }
}