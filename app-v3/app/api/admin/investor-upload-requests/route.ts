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

function cleanString(value: unknown, maxLength = 5000) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function parseDate(value: unknown) {
  if (!value) return null;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/*
 * GET — list upload requests with uploads + investor info.
 *
 * Query: ?status=OPEN | SUBMITTED | COMPLETED | CANCELLED
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
    .from("investor_upload_requests")
    .select(
      `
      id, investor_id, title, description, status, due_at, created_at, completed_at, created_by,
      investor:investor_profiles!inner(id, full_name, email, organization)
      `
    )
    .order("created_at", { ascending: false });

  if (
    status === "OPEN" ||
    status === "SUBMITTED" ||
    status === "COMPLETED" ||
    status === "CANCELLED"
  ) {
    query = query.eq("status", status);
  }

  const { data: requests, error: reqError } = await query;

  if (reqError) {
    console.error("Upload requests admin GET error:", reqError);
    return NextResponse.json(
      { error: "Unable to load upload requests." },
      { status: 500 }
    );
  }

  const requestIds = (requests ?? []).map((r) => r.id);

  const { data: uploads } =
    requestIds.length > 0
      ? await supabase
          .from("investor_uploads")
          .select(
            "id, request_id, file_name, file_path, file_size_bytes, file_type, status, review_notes, uploaded_at, reviewed_at"
          )
          .in("request_id", requestIds)
      : { data: [] };

  const uploadsByRequest = new Map<
    string,
    typeof uploads
  >();

  for (const u of uploads ?? []) {
    if (!u.request_id) continue;
    const list = uploadsByRequest.get(u.request_id) ?? [];
    list.push(u);
    uploadsByRequest.set(u.request_id, list);
  }

  const enriched = (requests ?? []).map((r) => ({
    ...r,
    uploads: uploadsByRequest.get(r.id) ?? [],
  }));

  return NextResponse.json({
    success: true,
    requests: enriched,
  });
}

/*
 * POST — create a new upload request.
 *
 * Body: {
 *   investor_id: string,
 *   title: string,
 *   description?: string,
 *   due_at?: string
 * }
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission("CREATE");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  let body: {
    investor_id?: unknown;
    title?: unknown;
    description?: unknown;
    due_at?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const investorId = cleanString(body.investor_id, 100);
  const title = cleanString(body.title, 300);

  if (!investorId) {
    return NextResponse.json(
      { error: "investor_id is required." },
      { status: 400 }
    );
  }

  if (!title) {
    return NextResponse.json(
      { error: "title is required." },
      { status: 400 }
    );
  }

  const description = cleanString(body.description, 2000);
  const dueAt = parseDate(body.due_at);

  const supabase = getAdminSupabase();

  const { data: investor } = await supabase
    .from("investor_profiles")
    .select("id, full_name, email")
    .eq("id", investorId)
    .maybeSingle();

  if (!investor) {
    return NextResponse.json(
      { error: "Investor not found." },
      { status: 404 }
    );
  }

  const { data: created, error: insertError } = await supabase
    .from("investor_upload_requests")
    .insert({
      investor_id: investorId,
      title,
      description,
      due_at: dueAt,
      status: "OPEN",
      created_by: auth.user.email ?? "unknown",
    })
    .select(
      "id, investor_id, title, description, status, due_at, created_at"
    )
    .single();

  if (insertError) {
    console.error("Upload request POST error:", insertError);
    return NextResponse.json(
      { error: "Unable to create upload request." },
      { status: 500 }
    );
  }

  await recordAuditEvent({
    investorId,
    eventType: "UPLOAD_REQUEST_CREATED",
    actor: {
      id: auth.user.id,
      email: auth.user.email ?? "",
      role: auth.identity?.role ?? "unknown",
    },
    source: "POST /api/admin/investor-upload-requests",
    summary: `Requested material: ${title}`,
    payload: {
      request_id: created.id,
      title,
      due_at: dueAt,
    },
  });

  return NextResponse.json(
    { success: true, request: created },
    { status: 201 }
  );
}

/*
 * PATCH — cancel or complete an upload request.
 *
 * Body: { request_id: string, action: 'CANCEL' | 'COMPLETE' }
 */
export async function PATCH(request: NextRequest) {
  const auth = await requirePermission("EDIT");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  let body: { request_id?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const requestId = cleanString(body.request_id, 100);
  const action = body.action;

  if (!requestId) {
    return NextResponse.json(
      { error: "request_id is required." },
      { status: 400 }
    );
  }

  if (action !== "CANCEL" && action !== "COMPLETE") {
    return NextResponse.json(
      { error: "action must be CANCEL or COMPLETE." },
      { status: 400 }
    );
  }

  const supabase = getAdminSupabase();

  const { data: existing } = await supabase
    .from("investor_upload_requests")
    .select("id, investor_id, title, status")
    .eq("id", requestId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json(
      { error: "Upload request not found." },
      { status: 404 }
    );
  }

  const nextStatus =
    action === "CANCEL" ? "CANCELLED" : "COMPLETED";

  const { error: updateError } = await supabase
    .from("investor_upload_requests")
    .update({
      status: nextStatus,
      completed_at:
        nextStatus === "COMPLETED"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", requestId);

  if (updateError) {
    console.error("Upload request PATCH error:", updateError);
    return NextResponse.json(
      { error: "Unable to update upload request." },
      { status: 500 }
    );
  }

  await recordAuditEvent({
    investorId: existing.investor_id,
    eventType:
      action === "CANCEL"
        ? "UPLOAD_REQUEST_CANCELLED"
        : "UPLOAD_REVIEWED",
    actor: {
      id: auth.user.id,
      email: auth.user.email ?? "",
      role: auth.identity?.role ?? "unknown",
    },
    source: "PATCH /api/admin/investor-upload-requests",
    summary: `${nextStatus} upload request: ${existing.title}`,
    payload: {
      request_id: requestId,
      previous_status: existing.status,
      new_status: nextStatus,
    },
  });

  return NextResponse.json({ success: true });
}