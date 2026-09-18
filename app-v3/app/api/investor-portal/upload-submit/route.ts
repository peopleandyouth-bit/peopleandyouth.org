import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  requireInvestor,
  isInvestorAuthFailure,
} from "@/lib/investor-portal-auth";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const BUCKET = "investor-uploads";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
];

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

function safeFileName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-100);
}

/*
 * POST — investor submits a file in response to an upload request.
 *
 * Accepts multipart/form-data:
 *   - request_id: uuid
 *   - file: File
 *
 * Validation:
 *   - Investor must be authenticated (VERIFIED + APPROVED)
 *   - request_id must exist, belong to this investor, and be OPEN
 *   - File must pass size + MIME checks
 *
 * On success: uploads to investor-uploads bucket, inserts
 * investor_uploads row, and transitions request to SUBMITTED.
 */
export async function POST(request: NextRequest) {
  const auth = await requireInvestor();

  if (isInvestorAuthFailure(auth)) {
    return NextResponse.json(
      { error: "Investor portal access required." },
      { status: auth.reason === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart form data." },
      { status: 400 }
    );
  }

  const requestId = String(formData.get("request_id") ?? "").trim();
  const file = formData.get("file");

  if (!requestId) {
    return NextResponse.json(
      { error: "request_id is required." },
      { status: 400 }
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A file is required." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds the 20 MB limit." },
      { status: 400 }
    );
  }

  if (
    file.type &&
    !ALLOWED_MIME_TYPES.includes(file.type)
  ) {
    return NextResponse.json(
      {
        error:
          "This file type is not accepted. Upload a PDF, Word, Excel, or image file.",
      },
      { status: 400 }
    );
  }

  const admin = getAdminSupabase();

  // Verify request belongs to this investor and is OPEN.
  const { data: uploadRequest, error: requestError } = await admin
    .from("investor_upload_requests")
    .select("id, status")
    .eq("id", requestId)
    .eq("investor_id", auth.profile.id)
    .maybeSingle();

  if (requestError) {
    console.error("Upload request lookup error:", requestError);
    return NextResponse.json(
      { error: "Unable to verify upload request." },
      { status: 500 }
    );
  }

  if (!uploadRequest) {
    return NextResponse.json(
      { error: "Upload request not found." },
      { status: 404 }
    );
  }

  if (uploadRequest.status !== "OPEN") {
    return NextResponse.json(
      {
        error:
          "This upload request is no longer accepting submissions.",
      },
      { status: 409 }
    );
  }

  // Upload to storage.
  const originalName = file.name || "document";
  const objectPath = `${auth.profile.id}/${requestId}/${crypto.randomUUID()}-${safeFileName(
    originalName
  )}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(objectPath, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    console.error("Investor upload storage error:", uploadError);
    return NextResponse.json(
      { error: "Unable to store the uploaded file." },
      { status: 500 }
    );
  }

  // Insert upload row.
  const { data: uploadRow, error: insertError } = await admin
    .from("investor_uploads")
    .insert({
      investor_id: auth.profile.id,
      request_id: requestId,
      file_name: originalName,
      file_path: objectPath,
      file_type: file.type || null,
      file_size_bytes: file.size,
      status: "SUBMITTED",
    })
    .select(
      "id, request_id, file_name, file_size_bytes, file_type, status, uploaded_at"
    )
    .single();

  if (insertError) {
    console.error("Investor upload insert error:", insertError);

    // Best-effort cleanup.
    await admin.storage.from(BUCKET).remove([objectPath]);

    return NextResponse.json(
      { error: "Unable to register the uploaded file." },
      { status: 500 }
    );
  }

  // Transition the request to SUBMITTED.
  await admin
    .from("investor_upload_requests")
    .update({ status: "SUBMITTED" })
    .eq("id", requestId);

  return NextResponse.json(
    { success: true, upload: uploadRow },
    { status: 201 }
  );
}