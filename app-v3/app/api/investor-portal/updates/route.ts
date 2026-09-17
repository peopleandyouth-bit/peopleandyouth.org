import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";

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

  const { data, error } = await supabase
    .from("public_publications_feed")
    .select("id, title, subtitle, author_name, category, slug, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Investor portal updates error:", error);
    return NextResponse.json(
      { error: "Unable to load updates." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    updates: data ?? [],
  });
}