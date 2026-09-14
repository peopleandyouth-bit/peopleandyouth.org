import { NextResponse } from "next/server";
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
 * GET /api/admin/investor-governance
 *
 * Returns a live governance snapshot: IAM, RLS, grants, audit trail,
 * automation execution, and secret hygiene.
 *
 * Permission: VIEW (5B.17)
 */
export async function GET() {
  const auth = await requirePermission("VIEW");

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase.rpc(
      "investor_governance_snapshot"
    );

    if (error) {
      console.error("Governance snapshot error:", error);
      return NextResponse.json(
        { error: "Unable to load governance snapshot." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      snapshot: data,
      secrets: {
        service_role_configured: Boolean(
          process.env.SUPABASE_SERVICE_ROLE_KEY
        ),
        cron_secret_configured: Boolean(
          process.env.CRON_SECRET
        ),
        supabase_url_configured: Boolean(
          process.env.NEXT_PUBLIC_SUPABASE_URL
        ),
      },
    });
  } catch (error) {
    console.error("Governance snapshot exception:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load governance snapshot.",
      },
      { status: 500 }
    );
  }
}