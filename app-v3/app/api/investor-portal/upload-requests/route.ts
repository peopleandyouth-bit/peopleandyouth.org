import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";

export const dynamic = "force-dynamic";

/*
 * GET — list open upload requests issued to the investor.
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

  const { data: requests, error: requestsError } = await supabase
    .from("investor_upload_requests")
    .select("id, title, description, status, due_at, created_at")
    .eq("investor_id", auth.profile.id)
    .in("status", ["OPEN", "SUBMITTED"])
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (requestsError) {
    console.error("Upload requests GET error:", requestsError);
    return NextResponse.json(
      { error: "Unable to load upload requests." },
      { status: 500 }
    );
  }

  // Fetch uploads linked to those requests.
  const requestIds = (requests ?? []).map((r) => r.id);

  const { data: uploads, error: uploadsError } =
    requestIds.length > 0
      ? await supabase
          .from("investor_uploads")
          .select(
            "id, request_id, file_name, file_size_bytes, file_type, status, uploaded_at"
          )
          .in("request_id", requestIds)
      : { data: [], error: null };

  if (uploadsError) {
    console.error("Uploads for requests error:", uploadsError);
  }

  const uploadsByRequest = new Map<string, typeof uploads>();
  for (const upload of uploads ?? []) {
    if (!upload.request_id) continue;
    const list = uploadsByRequest.get(upload.request_id) ?? [];
    list.push(upload);
    uploadsByRequest.set(upload.request_id, list);
  }

  const enriched = (requests ?? []).map((r) => ({
    ...r,
    uploads: uploadsByRequest.get(r.id) ?? [],
  }));

  return NextResponse.json({
    success: true,
    requests: enriched,
  });
}