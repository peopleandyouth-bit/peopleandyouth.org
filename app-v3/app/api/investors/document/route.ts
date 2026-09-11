import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "investor-data-room";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const documentId = url.searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required." },
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
              // Safe for route-handler compatibility.
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    await supabase.rpc("link_current_investor");

    const { data: profile, error: profileError } = await supabase
      .from("investor_profiles")
      .select("id, verification_status, access_level")
      .eq("user_id", user.id)
      .eq("verification_status", "VERIFIED")
      .eq("access_level", "APPROVED")
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Approved investor access required." },
        { status: 403 }
      );
    }

    const { data: document, error: documentError } = await supabase
      .from("investor_documents")
      .select(
        "id, title, file_path, file_type, access_level, is_active"
      )
      .eq("id", documentId)
      .eq("is_active", true)
      .in("access_level", ["PUBLIC", "APPROVED"])
      .maybeSingle();

    if (documentError || !document) {
      return NextResponse.json(
        { error: "Investor document not found." },
        { status: 404 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error(
        "SUPABASE_SERVICE_ROLE_KEY is not configured."
      );

      return NextResponse.json(
        { error: "Secure document service is not configured." },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: signedUrl, error: signedUrlError } =
      await adminSupabase.storage
        .from(BUCKET)
        .createSignedUrl(document.file_path, 300);

    if (signedUrlError || !signedUrl?.signedUrl) {
      console.error(
        "Investor document signed URL error:",
        signedUrlError
      );

      return NextResponse.json(
        { error: "Unable to open investor document." },
        { status: 500 }
      );
    }

    return NextResponse.redirect(signedUrl.signedUrl);
  } catch (error) {
    console.error("Investor document API error:", error);

    return NextResponse.json(
      { error: "Unable to process document request." },
      { status: 500 }
    );
  }
}