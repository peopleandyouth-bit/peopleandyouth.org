import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
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
              // Safe for API-route/server compatibility.
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          authenticated: false,
          authorized: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    /*
     * If an already-approved investor has an authenticated account
     * but investor_profiles.user_id is NULL, this securely links
     * that profile using the authenticated email.
     *
     * The database function itself requires:
     *   VERIFIED + APPROVED
     */
    const { error: linkError } = await supabase.rpc(
      "link_current_investor"
    );

    if (linkError) {
      console.error("Investor identity linkage failed:", linkError);

      return NextResponse.json(
        {
          authenticated: true,
          authorized: false,
          error: "Unable to verify investor access.",
        },
        { status: 500 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("investor_profiles")
      .select(
        [
          "id",
          "user_id",
          "full_name",
          "email",
          "phone",
          "organization",
          "investor_type",
          "linkedin_url",
          "website_url",
          "geography",
          "proposed_ticket_inr",
          "verification_status",
          "kyc_completed",
          "nda_signed",
          "nda_signed_at",
          "access_level",
          "created_at",
          "updated_at",
        ].join(", ")
      )
      .eq("user_id", user.id)
      .eq("verification_status", "VERIFIED")
      .eq("access_level", "APPROVED")
      .maybeSingle();

    if (profileError) {
      console.error("Investor profile lookup failed:", profileError);

      return NextResponse.json(
        {
          authenticated: true,
          authorized: false,
          error: "Unable to retrieve investor access.",
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          authenticated: true,
          authorized: false,
          error:
            "Investor access has not been approved for this account.",
        },
        { status: 403 }
      );
    }

    const { data: documents, error: documentsError } = await supabase
      .from("investor_documents")
      .select(
        [
          "id",
          "title",
          "description",
          "category",
          "file_path",
          "file_type",
          "file_size_bytes",
          "access_level",
          "display_order",
          "created_at",
          "updated_at",
        ].join(", ")
      )
      .eq("is_active", true)
      .in("access_level", ["PUBLIC", "APPROVED"])
      .order("display_order", { ascending: true });

    if (documentsError) {
      console.error("Investor documents lookup failed:", documentsError);

      return NextResponse.json(
        {
          authenticated: true,
          authorized: true,
          profile,
          documents: [],
          error: "Unable to load the data room.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      authorized: true,
      profile,
      documents: documents ?? [],
    });
  } catch (error) {
    console.error("Investor access API error:", error);

    return NextResponse.json(
      { error: "Unable to process investor access." },
      { status: 500 }
    );
  }
}
