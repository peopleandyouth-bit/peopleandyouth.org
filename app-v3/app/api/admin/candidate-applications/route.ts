import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/route-authorization";
import {
  APPLICATION_STATUSES,
  isApplicationStatus,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/candidate-application";

export const dynamic = "force-dynamic";

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

function cleanString(value: unknown, maxLength = 200) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

/**
 * GET /api/admin/candidate-applications
 *
 * List candidate applications with optional filters.
 *
 * Query parameters:
 *   ?status=APPLICATION_SUBMITTED
 *   ?department=<department>
 *   ?search=<name or email or role>
 *   ?limit=N  (default 200, max 500)
 *   ?offset=N (default 0)
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

  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const department = cleanString(searchParams.get("department"), 200);
  const search = cleanString(searchParams.get("search"), 200);

  const limitRaw = Number(searchParams.get("limit") ?? 200);
  const offsetRaw = Number(searchParams.get("offset") ?? 0);

  const limit = Math.min(
    Math.max(Number.isFinite(limitRaw) ? limitRaw : 200, 1),
    500
  );

  const offset = Math.max(
    Number.isFinite(offsetRaw) ? offsetRaw : 0,
    0
  );

  try {
    const supabase = getAdminSupabase();

    let query = supabase
      .from("candidate_applications")
      .select(
        `
        id,
        candidate_id,
        application_id,
        opportunity_type,
        department,
        role_title,
        location,
        full_name,
        email,
        phone,
        district,
        qualification,
        experience_years,
        status,
        assigned_admin,
        submitted_at,
        last_status_change_at
        `,
        { count: "exact" }
      )
      .order("submitted_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && isApplicationStatus(status)) {
      query = query.eq("status", status);
    }

    if (department) {
      query = query.eq("department", department);
    }

    if (search) {
      const pattern = `%${search}%`;
      query = query.or(
        `full_name.ilike.${pattern},email.ilike.${pattern},role_title.ilike.${pattern}`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(
        "Candidate applications admin GET error:",
        error
      );
      return NextResponse.json(
        { error: "Unable to load applications." },
        { status: 500 }
      );
    }

    // Build status counts across the entire table, not just the page.
    const { data: statusRows } = await supabase
      .from("candidate_applications")
      .select("status");

    const statusCounts: Record<string, number> = {};
    for (const s of APPLICATION_STATUSES) {
      statusCounts[s] = 0;
    }
    for (const row of statusRows ?? []) {
      if (row.status && row.status in statusCounts) {
        statusCounts[row.status] += 1;
      }
    }

    return NextResponse.json({
      success: true,
      applications: data ?? [],
      total: count ?? 0,
      limit,
      offset,
      status_counts: statusCounts,
      status_labels: STATUS_LABELS,
    });
  } catch (error) {
    console.error(
      "Candidate applications admin GET exception:",
      error
    );
    return NextResponse.json(
      { error: "Unable to load applications." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/candidate-applications
 *
 * Update a single application: status, admin_notes, assigned_admin,
 * rejection_reason. Every status change writes to the audit log.
 *
 * Body: { id, status?, admin_notes?, assigned_admin?, rejection_reason? }
 *
 * Permission: EDIT
 */
export async function PATCH(request: NextRequest) {
  const auth = await requirePermission("EDIT");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const id = cleanString(body.id, 100);
  if (!id) {
    return NextResponse.json(
      { error: "Application id is required." },
      { status: 400 }
    );
  }

  const supabase = getAdminSupabase();

  const { data: existing, error: lookupError } = await supabase
    .from("candidate_applications")
    .select(
      "id, status, admin_notes, assigned_admin, rejection_reason, full_name, email, role_title"
    )
    .eq("id", id)
    .maybeSingle();

  if (lookupError) {
    console.error(
      "Candidate application lookup error:",
      lookupError
    );
    return NextResponse.json(
      { error: "Unable to verify application." },
      { status: 500 }
    );
  }

  if (!existing) {
    return NextResponse.json(
      { error: "Application not found." },
      { status: 404 }
    );
  }

  const update: Record<string, unknown> = {};

  let newStatus: ApplicationStatus | null = null;

  if (body.status !== undefined) {
    if (!isApplicationStatus(body.status)) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }
    newStatus = body.status;
    update.status = newStatus;

    if (newStatus !== existing.status) {
      update.last_status_change_at = new Date().toISOString();
    }
  }

  if (body.admin_notes !== undefined) {
    update.admin_notes = cleanString(body.admin_notes, 10000);
  }

  if (body.assigned_admin !== undefined) {
    update.assigned_admin = cleanString(body.assigned_admin, 200);
  }

  if (body.rejection_reason !== undefined) {
    update.rejection_reason = cleanString(body.rejection_reason, 2000);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "No valid fields supplied." },
      { status: 400 }
    );
  }

  update.updated_at = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from("candidate_applications")
    .update(update)
    .eq("id", id)
    .select(
      "id, candidate_id, application_id, full_name, email, role_title, department, status, admin_notes, assigned_admin, rejection_reason, submitted_at, last_status_change_at, updated_at"
    )
    .single();

  if (updateError) {
    console.error("Candidate application PATCH error:", updateError);
    return NextResponse.json(
      { error: "Unable to update application." },
      { status: 500 }
    );
  }

  // Best-effort audit event.
  try {
    const eventType = newStatus
      ? "STATUS_CHANGED"
      : "APPLICATION_UPDATED";

    const summary = newStatus
      ? `Status: ${STATUS_LABELS[existing.status as ApplicationStatus] ?? existing.status} → ${STATUS_LABELS[newStatus]}`
      : `Application updated for ${existing.full_name}`;

    await supabase
      .from("candidate_application_audit_log")
      .insert({
        application_id: id,
        event_type: eventType,
        actor_id: auth.user.id,
        actor_email: auth.user.email ?? "",
        actor_role: auth.identity?.role ?? "unknown",
        source: "PATCH /api/admin/candidate-applications",
        summary,
        payload: {
          before: {
            status: existing.status,
            admin_notes: existing.admin_notes,
            assigned_admin: existing.assigned_admin,
            rejection_reason: existing.rejection_reason,
          },
          after: {
            status: update.status ?? existing.status,
            admin_notes: update.admin_notes ?? existing.admin_notes,
            assigned_admin:
              update.assigned_admin ?? existing.assigned_admin,
            rejection_reason:
              update.rejection_reason ?? existing.rejection_reason,
          },
          changed_fields: Object.keys(update),
        },
      });
  } catch (auditError) {
    console.error("Candidate audit insert error:", auditError);
  }

  return NextResponse.json({
    success: true,
    application: updated,
  });
}