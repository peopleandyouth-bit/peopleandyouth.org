import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/route-authorization";
import { recordAuditEvent } from "@/lib/investor-audit";

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

function cleanString(value: unknown, maxLength = 500) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

/*
 * GET — list all investors with their DD access state.
 *
 * Returns every investor profile joined with any investor_dd_access
 * row. Used by the admin access page to render the full list.
 */
export async function GET() {
  const auth = await requirePermission("VIEW");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const supabase = getAdminSupabase();

  const [{ data: investors }, { data: grants }] = await Promise.all([
    supabase
      .from("investor_profiles")
      .select(
        "id, full_name, email, organization, verification_status, access_level, created_at"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("investor_dd_access")
      .select("id, investor_id, granted_at, granted_by, notes"),
  ]);

  const grantMap = new Map<
    string,
    {
      id: string;
      granted_at: string;
      granted_by: string | null;
      notes: string | null;
    }
  >();

  for (const g of grants ?? []) {
    grantMap.set(g.investor_id, {
      id: g.id,
      granted_at: g.granted_at,
      granted_by: g.granted_by,
      notes: g.notes,
    });
  }

  const enriched = (investors ?? []).map((inv) => ({
    ...inv,
    dd_access: grantMap.get(inv.id) ?? null,
  }));

  return NextResponse.json({
    success: true,
    investors: enriched,
  });
}

/*
 * POST — grant DD access.
 *
 * Body: { investor_id: string, notes?: string }
 *
 * Constraint: DD access is never granted automatically. This route is
 * the ONLY path that inserts into investor_dd_access from an HTTP
 * request, and it requires CREATE permission.
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission("CREATE");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  let body: { investor_id?: unknown; notes?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const investorId = cleanString(body.investor_id, 100);
  if (!investorId) {
    return NextResponse.json(
      { error: "investor_id is required." },
      { status: 400 }
    );
  }

  const notes = cleanString(body.notes, 2000);
  const supabase = getAdminSupabase();

  // Verify investor exists and is eligible.
  const { data: investor } = await supabase
    .from("investor_profiles")
    .select("id, full_name, email, verification_status, access_level")
    .eq("id", investorId)
    .maybeSingle();

  if (!investor) {
    return NextResponse.json(
      { error: "Investor not found." },
      { status: 404 }
    );
  }

  if (
    investor.verification_status !== "VERIFIED" ||
    investor.access_level !== "APPROVED"
  ) {
    return NextResponse.json(
      {
        error:
          "Investor must be VERIFIED and APPROVED before DD access can be granted.",
      },
      { status: 409 }
    );
  }

  // Check for existing grant.
  const { data: existing } = await supabase
    .from("investor_dd_access")
    .select("id")
    .eq("investor_id", investorId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        success: true,
        duplicate: true,
        message: "DD access is already granted to this investor.",
      },
      { status: 200 }
    );
  }

  const { data: grant, error: insertError } = await supabase
    .from("investor_dd_access")
    .insert({
      investor_id: investorId,
      granted_by: auth.user.email ?? "unknown",
      notes,
    })
    .select("id, investor_id, granted_at, granted_by, notes")
    .single();

  if (insertError) {
    console.error("DD access grant error:", insertError);
    return NextResponse.json(
      { error: "Unable to grant DD access." },
      { status: 500 }
    );
  }

  await recordAuditEvent({
    investorId,
    eventType: "DD_ACCESS_GRANTED",
    actor: {
      id: auth.user.id,
      email: auth.user.email ?? "",
      role: auth.identity?.role ?? "unknown",
    },
    source: "POST /api/admin/investor-dd-access",
    summary: `Granted Due Diligence access to ${
      investor.full_name ?? investor.email ?? "investor"
    }`,
    payload: {
      granted_at: grant.granted_at,
      notes,
    },
  });

  return NextResponse.json(
    { success: true, grant },
    { status: 201 }
  );
}

/*
 * DELETE — revoke DD access.
 *
 * Body: { investor_id: string, reason?: string }
 */
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission("DELETE");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  let body: { investor_id?: unknown; reason?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const investorId = cleanString(body.investor_id, 100);
  if (!investorId) {
    return NextResponse.json(
      { error: "investor_id is required." },
      { status: 400 }
    );
  }

  const reason = cleanString(body.reason, 2000);
  const supabase = getAdminSupabase();

  const { data: existing } = await supabase
    .from("investor_dd_access")
    .select("id, granted_at")
    .eq("investor_id", investorId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json(
      { error: "No DD access grant found for this investor." },
      { status: 404 }
    );
  }

  const { error: deleteError } = await supabase
    .from("investor_dd_access")
    .delete()
    .eq("investor_id", investorId);

  if (deleteError) {
    console.error("DD access revoke error:", deleteError);
    return NextResponse.json(
      { error: "Unable to revoke DD access." },
      { status: 500 }
    );
  }

  await recordAuditEvent({
    investorId,
    eventType: "DD_ACCESS_REVOKED",
    actor: {
      id: auth.user.id,
      email: auth.user.email ?? "",
      role: auth.identity?.role ?? "unknown",
    },
    source: "DELETE /api/admin/investor-dd-access",
    summary: "Revoked Due Diligence access",
    payload: {
      previous_granted_at: existing.granted_at,
      reason,
    },
  });

  return NextResponse.json({ success: true });
}