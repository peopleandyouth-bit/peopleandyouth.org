import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/route-authorization";

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

/**
 * GET /api/admin/candidate-applications/[id]
 *
 * Full application detail including the audit timeline.
 *
 * Permission: VIEW
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("VIEW");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Application id is required." },
      { status: 400 }
    );
  }

  try {
    const supabase = getAdminSupabase();

    const [
      { data: application, error: appError },
      { data: auditEvents, error: auditError },
    ] = await Promise.all([
      supabase
        .from("candidate_applications")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("candidate_application_audit_log")
        .select(
          "id, event_type, actor_email, actor_role, source, summary, payload, occurred_at"
        )
        .eq("application_id", id)
        .order("occurred_at", { ascending: false })
        .limit(50),
    ]);

    if (appError) {
      console.error("Application detail lookup error:", appError);
      return NextResponse.json(
        { error: "Unable to load application." },
        { status: 500 }
      );
    }

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    if (auditError) {
      console.error("Application audit lookup error:", auditError);
    }

    return NextResponse.json({
      success: true,
      application,
      audit_events: auditEvents ?? [],
    });
  } catch (error) {
    console.error("Application detail exception:", error);
    return NextResponse.json(
      { error: "Unable to load application." },
      { status: 500 }
    );
  }
}