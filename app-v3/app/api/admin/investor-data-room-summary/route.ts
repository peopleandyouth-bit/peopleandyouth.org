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

/**
 * GET /api/admin/investor-data-room-summary?investor_id=X
 *
 * Compact read-only summary for the CRM Decision Context panel:
 *  - DD access state (granted / not)
 *  - Pending access requests
 *  - Open upload requests
 *  - Uploads awaiting review
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
  const investorId = (searchParams.get("investor_id") ?? "").trim();

  if (!investorId) {
    return NextResponse.json(
      { error: "investor_id is required." },
      { status: 400 }
    );
  }

  try {
    const supabase = getAdminSupabase();

    const [
      { data: ddGrant, error: ddError },
      { data: accessRequests, error: arError },
      { data: uploadRequests, error: urError },
      { data: uploads, error: uError },
    ] = await Promise.all([
      supabase
        .from("investor_dd_access")
        .select("id, granted_at, granted_by")
        .eq("investor_id", investorId)
        .maybeSingle(),
      supabase
        .from("investor_access_requests")
        .select("id, scope, status, created_at")
        .eq("investor_id", investorId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("investor_upload_requests")
        .select("id, title, status, due_at, created_at")
        .eq("investor_id", investorId)
        .in("status", ["OPEN", "SUBMITTED"])
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("investor_uploads")
        .select("id, file_name, status, uploaded_at")
        .eq("investor_id", investorId)
        .eq("status", "SUBMITTED")
        .order("uploaded_at", { ascending: false })
        .limit(10),
    ]);

    if (ddError) {
      console.error("Data room summary DD lookup error:", ddError);
    }
    if (arError) {
      console.error(
        "Data room summary access requests error:",
        arError
      );
    }
    if (urError) {
      console.error(
        "Data room summary upload requests error:",
        urError
      );
    }
    if (uError) {
      console.error(
        "Data room summary uploads error:",
        uError
      );
    }

    const pendingAccessRequests = (accessRequests ?? []).filter(
      (r) => r.status === "PENDING"
    );

    const openUploadRequests = (uploadRequests ?? []).filter(
      (r) => r.status === "OPEN"
    );

    const submittedUploads = uploads ?? [];

    const hasActivity =
      Boolean(ddGrant) ||
      pendingAccessRequests.length > 0 ||
      (uploadRequests ?? []).length > 0 ||
      submittedUploads.length > 0;

    return NextResponse.json({
      success: true,
      has_activity: hasActivity,
      dd_access: ddGrant ?? null,
      pending_access_requests: pendingAccessRequests,
      open_upload_requests: openUploadRequests,
      awaiting_review: submittedUploads,
      counts: {
        pending_access_requests: pendingAccessRequests.length,
        open_upload_requests: openUploadRequests.length,
        awaiting_review: submittedUploads.length,
      },
    });
  } catch (error) {
    console.error("Data room summary exception:", error);
    return NextResponse.json(
      { error: "Unable to load data room summary." },
      { status: 500 }
    );
  }
}