import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";

export const dynamic = "force-dynamic";

const ALLOWED_SCOPES = ["DUE_DILIGENCE"] as const;
type AccessScope = (typeof ALLOWED_SCOPES)[number];

function isAllowedScope(value: unknown): value is AccessScope {
  return (
    typeof value === "string" &&
    (ALLOWED_SCOPES as readonly string[]).includes(value)
  );
}

function cleanString(value: unknown, maxLength = 2000) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

/*
 * GET — list the investor's own access requests.
 */
export async function GET() {
  const auth = await requireInvestor();

  if (isInvestorAuthFailure(auth)) {
    return NextResponse.json(
      { error: "Investor portal access required." },
      { status: auth.reason === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Read-only path.
        },
      },
    }
  );

  const { data, error } = await supabase
    .from("investor_access_requests")
    .select(
      "id, scope, reason, status, decided_at, created_at"
    )
    .eq("investor_id", auth.profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Access requests GET error:", error);
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
 * POST — create a new access request.
 *
 * Body: { scope: 'DUE_DILIGENCE', reason?: string }
 *
 * Idempotency: only one PENDING request per scope is allowed at a time.
 */
export async function POST(request: NextRequest) {
  const auth = await requireInvestor();

  if (isInvestorAuthFailure(auth)) {
    return NextResponse.json(
      { error: "Investor portal access required." },
      { status: auth.reason === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  let body: { scope?: unknown; reason?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!isAllowedScope(body.scope)) {
    return NextResponse.json(
      { error: "Invalid access scope." },
      { status: 400 }
    );
  }

  const reason = cleanString(body.reason, 2000);

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server component compatibility.
          }
        },
      },
    }
  );

  // Check for existing PENDING request.
  const { data: existing } = await supabase
    .from("investor_access_requests")
    .select("id")
    .eq("investor_id", auth.profile.id)
    .eq("scope", body.scope)
    .eq("status", "PENDING")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        success: true,
        duplicate: true,
        message:
          "A request for this access is already pending review.",
      },
      { status: 200 }
    );
  }

  const { data, error } = await supabase
    .from("investor_access_requests")
    .insert({
      investor_id: auth.profile.id,
      scope: body.scope,
      reason,
      status: "PENDING",
    })
    .select(
      "id, scope, reason, status, decided_at, created_at"
    )
    .single();

  if (error) {
    console.error("Access request insert error:", error);
    return NextResponse.json(
      { error: "Unable to submit access request." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, request: data },
    { status: 201 }
  );
}