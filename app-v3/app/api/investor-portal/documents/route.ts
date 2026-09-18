import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";
import {
  projectDocumentsForInvestor,
  type InternalDocument,
} from "@/lib/investor-portal-projection";
import {
  loadInvestorAccessState,
  canSeeDocument,
} from "@/lib/investor-document-access";

export const dynamic = "force-dynamic";

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

  // Load investor access state (verification + DD grant).
  const accessState = await loadInvestorAccessState(
    supabase,
    auth.profile.id,
    auth.profile.verification_status,
    auth.profile.access_level
  );

  // Fetch all active documents. Broader filter than before — we now
  // fetch everything active and let canSeeDocument apply the tier
  // logic per row.
  const { data, error } = await supabase
    .from("investor_documents")
    .select(
      "id, title, description, category, file_type, file_size_bytes, access_level, display_order, created_at, updated_at"
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Investor portal documents error:", error);
    return NextResponse.json(
      { error: "Unable to load documents." },
      { status: 500 }
    );
  }

  // Apply per-investor access filter.
  const visible = (data ?? []).filter((doc) =>
    canSeeDocument(
      {
        access_level: doc.access_level,
        investor_id: null, // investor_documents has no investor_id column
      },
      accessState
    )
  );

  const projection = projectDocumentsForInvestor(
    visible as unknown as InternalDocument[]
  );

  return NextResponse.json({
    success: true,
    documents: projection,
    access: {
      has_dd_access: accessState.hasDdAccess,
      verified: accessState.verificationStatus === "VERIFIED",
      approved: accessState.accessLevel === "APPROVED",
    },
  });
}