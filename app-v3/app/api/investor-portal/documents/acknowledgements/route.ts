import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";

export const dynamic = "force-dynamic";

/*
 * GET /api/investor-portal/documents/acknowledgements
 *
 * Returns the list of document IDs the authenticated investor has
 * already acknowledged. Used by the documents page to render the
 * "Acknowledged" badge.
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
    .from("investor_document_acknowledgements")
    .select("document_id")
    .eq("investor_id", auth.profile.id);

  if (error) {
    console.error(
      "Investor portal acknowledgements error:",
      error
    );
    return NextResponse.json(
      { error: "Unable to load acknowledgements." },
      { status: 500 }
    );
  }

  const documentIds = (data ?? []).map((row) => row.document_id);

  return NextResponse.json({
    success: true,
    document_ids: documentIds,
  });
}