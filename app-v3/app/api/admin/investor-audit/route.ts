import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/route-authorization";

const EVENT_TYPES = [
  "ACTIVITY_CREATED",
  "ACTIVITY_COMPLETED",
  "ACTIVITY_CANCELLED",
  "ACTIVITY_RESCHEDULED",
  "ACTIVITY_REASSIGNED",
  "ACTIVITY_DETAILS_UPDATED",
  "STAGE_TRANSITION",
  "CRM_CAPITAL_UPDATED",
  "CRM_PROBABILITY_UPDATED",
  "CRM_NEXT_ACTION_UPDATED",
  "CRM_CONTACT_RECORDED",
  "INVESTOR_NOTES_UPDATED",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

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

function isEventType(value: unknown): value is EventType {
  return (
    typeof value === "string" &&
    EVENT_TYPES.includes(value as EventType)
  );
}

function cleanString(value: unknown, maxLength = 500) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

/**
 * GET /api/admin/investor-audit
 *
 * Read-only access to the immutable audit trail.
 *
 * Query parameters:
 *   ?investor_id=<uuid>       — filter to a single investor
 *   ?activity_id=<uuid>       — filter to a single activity
 *   ?actor_id=<uuid>          — filter to a single actor
 *   ?event_type=<TYPE>        — filter to a single event type
 *   ?limit=N                  — default 100, max 500
 *   ?offset=N                 — default 0
 *
 * Permission: VIEW (5B.17, 5C.13)
 */
export async function GET(request: NextRequest) {
  const admin = await requirePermission("VIEW");

  if (!admin.authorized) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const investorId = cleanString(
      searchParams.get("investor_id"),
      100
    );
    const activityId = cleanString(
      searchParams.get("activity_id"),
      100
    );
    const actorId = cleanString(
      searchParams.get("actor_id"),
      100
    );
    const eventType = searchParams.get("event_type");

    const limitRaw = Number(searchParams.get("limit") ?? 100);
    const offsetRaw = Number(searchParams.get("offset") ?? 0);

    const limit = Math.min(
      Math.max(Number.isFinite(limitRaw) ? limitRaw : 100, 1),
      500
    );

    const offset = Math.max(
      Number.isFinite(offsetRaw) ? offsetRaw : 0,
      0
    );

    const supabase = getAdminSupabase();

    let query = supabase
      .from("investor_crm_audit_log")
      .select("*", { count: "exact" })
      .order("occurred_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (investorId) {
      query = query.eq("investor_id", investorId);
    }

    if (activityId) {
      query = query.eq("activity_id", activityId);
    }

    if (actorId) {
      query = query.eq("actor_id", actorId);
    }

    if (eventType) {
      if (!isEventType(eventType)) {
        return NextResponse.json(
          { error: "Invalid event type." },
          { status: 400 }
        );
      }

      query = query.eq("event_type", eventType);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Investor audit GET error:", error);
      return NextResponse.json(
        { error: "Unable to load audit trail." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: data ?? [],
      total: count ?? 0,
      limit,
      offset,
      event_types: EVENT_TYPES,
    });
  } catch (error) {
    console.error("Investor audit GET exception:", error);
    return NextResponse.json(
      { error: "Unable to load audit trail." },
      { status: 500 }
    );
  }
}