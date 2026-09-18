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
 * PATCH — review a submitted upload.
 *
 * Body: {
 *   upload_id: string,
 *   decision: 'APPROVED' | 'REJECTED',
 *   notes?: string
 * }
 */
export async function PATCH(request: NextRequest) {
  const auth = await requirePermission("REVIEW");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  let body: {
    upload_id?: unknown;
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

  const uploadId = cleanString(body.upload_id, 100);
  const decision = body.decision;

  if (!uploadId) {
    return NextResponse.json(
      { error: "upload_id is required." },
      { status: 400 }
    );
  }

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return NextResponse.json(
      { error: "decision must be APPROVED or REJECTED." },
      { status: 400 }
    );
  }

  const notes = cleanString(body.notes, 2000);
  const supabase = getAdminSupabase();

  const { data: existing } = await supabase
    .from("investor_uploads")
    .select("id, investor_id, request_id, file_name, status")
    .eq("id", uploadId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json(
      { error: "Upload not found." },
      { status: 404 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("investor_uploads")
    .update({
      status: decision,
      review_notes: notes,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", uploadId)
    .select(
      "id, investor_id, request_id, file_name, status, review_notes, reviewed_at"
    )
    .single();

  if (updateError) {
    console.error("Upload review PATCH error:", updateError);
    return NextResponse.json(
      { error: "Unable to record the review." },
      { status: 500 }
    );
  }

  await recordAuditEvent({
    investorId: existing.investor_id,
    eventType: "UPLOAD_REVIEWED",
    actor: {
      id: auth.user.id,
      email: auth.user.email ?? "",
      role: auth.identity?.role ?? "unknown",
    },
    source: "PATCH /api/admin/investor-uploads",
    summary: `${decision} upload: ${existing.file_name}`,
    payload: {
      upload_id: uploadId,
      request_id: existing.request_id,
      previous_status: existing.status,
      decision,
      notes,
    },
  });

  return NextResponse.json({ success: true, upload: updated });
}