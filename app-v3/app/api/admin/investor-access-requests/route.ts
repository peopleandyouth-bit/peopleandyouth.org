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

function cleanString(value: unknown, maxLength = 2000) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

/*
 * GET — list access requests, filtered by status.
 *
 * Query: ?status=PENDING | APPROVED | DECLINED
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission("VIEW");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const supabase = getAdminSupabase();

  let query = supabase
    .from("investor_access_requests")
    .select(
      `
      id, investor_id, scope, reason, status, decided_at, decided_by, created_at,
      investor:investor_profiles!inner(id, full_name, email, organization, verification_status, access_level)
      `
    )
    .order("created_at", { ascending: false });

  if (
    status === "PENDING" ||
    status === "APPROVED" ||
    status === "DECLINED"
  ) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Access requests admin GET error:", error);
    return NextResponse.json(
      { error: "Unable to load access requests." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    requests: data ?? [],
  });
}

/*
 * PATCH — decide on an access request.
 *
 * Body: { request_id: string, decision: 'APPROVED' | 'DECLINED', notes?: string }
 *
 * When APPROVED for scope DUE_DILIGENCE, this also inserts the
 * corresponding investor_dd_access grant as part of the same
 * transaction-like flow.
 */
export async function PATCH(request: NextRequest) {
  const auth = await requirePermission("APPROVE");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  let body: {
    request_id?: unknown;
    decision?: unknown;
    notes?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const requestId = cleanString(body.request_id, 100);
  const decision = body.decision;

  if (!requestId) {
    return NextResponse.json(
      { error: "request_id is required." },
      { status: 400 }
    );
  }

  if (decision !== "APPROVED" && decision !== "DECLINED") {
    return NextResponse.json(
      { error: "decision must be APPROVED or DECLINED." },
      { status: 400 }
    );
  }

  const notes = cleanString(body.notes, 2000);
  const supabase = getAdminSupabase();

  const { data: existing } = await supabase
    .from("investor_access_requests")
    .select("id, investor_id, scope, status")
    .eq("id", requestId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json(
      { error: "Access request not found." },
      { status: 404 }
    );
  }

  if (existing.status !== "PENDING") {
    return NextResponse.json(
      { error: "This request has already been decided." },
      { status: 409 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("investor_access_requests")
    .update({
      status: decision,
      decided_at: new Date().toISOString(),
      decided_by: auth.user.email ?? "unknown",
    })
    .eq("id", requestId)
    .select(
      "id, investor_id, scope, status, decided_at, decided_by"
    )
    .single();

  if (updateError) {
    console.error("Access request PATCH error:", updateError);
    return NextResponse.json(
      { error: "Unable to update the access request." },
      { status: 500 }
    );
  }

  // If approved for DD and no existing grant, create one.
  if (decision === "APPROVED" && existing.scope === "DUE_DILIGENCE") {
    const { data: existingGrant } = await supabase
      .from("investor_dd_access")
      .select("id")
      .eq("investor_id", existing.investor_id)
      .maybeSingle();

    if (!existingGrant) {
      await supabase.from("investor_dd_access").insert({
        investor_id: existing.investor_id,
        granted_by: auth.user.email ?? "unknown",
        notes: notes ?? "Granted via access request approval",
      });
    }
  }

  await recordAuditEvent({
    investorId: existing.investor_id,
    eventType: "ACCESS_REQUEST_DECIDED",
    actor: {
      id: auth.user.id,
      email: auth.user.email ?? "",
      role: auth.identity?.role ?? "unknown",
    },
    source: "PATCH /api/admin/investor-access-requests",
    summary: `${decision} access request for ${existing.scope}`,
    payload: {
      request_id: requestId,
      decision,
      scope: existing.scope,
      notes,
    },
  });

  return NextResponse.json({ success: true, request: updated });
}