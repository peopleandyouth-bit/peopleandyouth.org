import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/route-authorization";

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

function cleanInteger(
  value: string | null,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.floor(parsed), min), max);
}

/**
 * GET /api/admin/investor-automation/scans
 *
 * Read-only list of recent automation scans.
 *
 * Query parameters:
 *   ?limit=N        default 20, max 200
 *   ?offset=N       default 0
 *   ?status=SUCCESS | FAILED
 *   ?triggered_by=CRON | MANUAL
 *
 * Permission: VIEW
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission("VIEW");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const limit = cleanInteger(
      searchParams.get("limit"),
      20,
      1,
      200
    );
    const offset = cleanInteger(
      searchParams.get("offset"),
      0,
      0,
      100000
    );

    const status = searchParams.get("status");
    const triggeredBy = searchParams.get("triggered_by");

    const supabase = getAdminSupabase();

    let query = supabase
      .from("investor_automation_scans")
      .select("*", { count: "exact" })
      .order("occurred_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status === "SUCCESS" || status === "FAILED") {
      query = query.eq("status", status);
    }

    if (triggeredBy === "CRON" || triggeredBy === "MANUAL") {
      query = query.eq("triggered_by", triggeredBy);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(
        "Investor automation scans GET error:",
        error
      );
      return NextResponse.json(
        { error: "Unable to load automation scans." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      scans: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error(
      "Investor automation scans GET exception:",
      error
    );
    return NextResponse.json(
      { error: "Unable to load automation scans." },
      { status: 500 }
    );
  }
}