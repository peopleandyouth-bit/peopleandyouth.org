import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";

export const dynamic = "force-dynamic";

/*
 * POST /api/investor-portal/acknowledge
 *
 * Records that the investor has reviewed a document. The write flows
 * through the investor's own session (RLS enforces investor_id =
 * auth.uid()'s investor_profile.id).
 *
 * Body: { document_id: string }
 */
export async function POST(request: NextRequest) {
  const auth = await requireInvestor();

  if (isInvestorAuthFailure(auth)) {
    return NextResponse.json(
      { error: "Investor portal access required." },
      { status: auth.reason === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  let body: { document_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const documentId =
    typeof body.document_id === "string"
      ? body.document_id.trim()
      : "";

  if (!documentId) {
    return NextResponse.json(
      { error: "document_id is required." },
      { status: 400 }
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

  // Confirm the document is visible to the investor.
  const { data: document } = await supabase
    .from("investor_documents")
    .select("id")
    .eq("id", documentId)
    .eq("is_active", true)
    .in("access_level", ["PUBLIC", "APPROVED"])
    .maybeSingle();

  if (!document) {
    return NextResponse.json(
      { error: "Document not available." },
      { status: 404 }
    );
  }

  // Upsert: only insert if not already acknowledged.
  const { error: insertError } = await supabase
    .from("investor_document_acknowledgements")
    .upsert(
      {
        investor_id: auth.profile.id,
        document_id: documentId,
      },
      { onConflict: "investor_id,document_id" }
    );

  if (insertError) {
    console.error("Acknowledgement insert error:", insertError);
    return NextResponse.json(
      { error: "Unable to record acknowledgement." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}