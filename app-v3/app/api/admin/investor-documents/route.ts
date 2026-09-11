import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const BUCKET = "investor-data-room";

function getAdminSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("investor_documents")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Investor documents GET failed:", error);

      return NextResponse.json(
        { error: "Unable to load investor documents." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      documents: data ?? [],
    });
  } catch (error) {
    console.error("Investor documents GET error:", error);

    return NextResponse.json(
      { error: "Unable to load investor documents." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const title = String(formData.get("title") || "").trim();
    const description = String(
      formData.get("description") || ""
    ).trim();
    const category = String(
      formData.get("category") || "Investor Material"
    ).trim();
    const accessLevel = String(
      formData.get("access_level") || "APPROVED"
    ).trim();
    const displayOrder = Number(
      formData.get("display_order") || 0
    );

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A document file is required." },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Document title is required." },
        { status: 400 }
      );
    }

    if (!["PUBLIC", "APPROVED"].includes(accessLevel)) {
      return NextResponse.json(
        { error: "Invalid access level." },
        { status: 400 }
      );
    }

    const maxFileSize = 25 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "Maximum document size is 25 MB." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const originalName = file.name || "document";
    const extension =
      originalName.includes(".")
        ? originalName.split(".").pop()?.toLowerCase() || "bin"
        : "bin";

    const safeName = originalName
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");

    const objectPath =
      `documents/${crypto.randomUUID()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, arrayBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("Investor document upload failed:", uploadError);

      return NextResponse.json(
        { error: "Unable to upload document." },
        { status: 500 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("investor_documents")
      .insert({
        title,
        description: description || null,
        category: category || "Investor Material",
        file_path: objectPath,
        file_type: file.type || extension,
        file_size_bytes: file.size,
        access_level: accessLevel,
        display_order: Number.isFinite(displayOrder)
          ? displayOrder
          : 0,
        is_active: true,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error(
        "Investor document database insert failed:",
        insertError
      );

      await supabase.storage
        .from(BUCKET)
        .remove([objectPath]);

      return NextResponse.json(
        { error: "Unable to register uploaded document." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        document: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Investor document POST error:", error);

    return NextResponse.json(
      { error: "Unable to process document upload." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();

    const id = String(body.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required." },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      updates.title = String(body.title).trim();
    }

    if (body.description !== undefined) {
      updates.description =
        String(body.description).trim() || null;
    }

    if (body.category !== undefined) {
      updates.category =
        String(body.category).trim() || "Investor Material";
    }

    if (body.access_level !== undefined) {
      if (!["PUBLIC", "APPROVED"].includes(body.access_level)) {
        return NextResponse.json(
          { error: "Invalid access level." },
          { status: 400 }
        );
      }

      updates.access_level = body.access_level;
    }

    if (body.display_order !== undefined) {
      const order = Number(body.display_order);

      if (!Number.isFinite(order)) {
        return NextResponse.json(
          { error: "Invalid display order." },
          { status: 400 }
        );
      }

      updates.display_order = order;
    }

    if (body.is_active !== undefined) {
      updates.is_active = Boolean(body.is_active);
    }

    updates.updated_at = new Date().toISOString();

    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("investor_documents")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Investor document update failed:", error);

      return NextResponse.json(
        { error: "Unable to update investor document." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document: data,
    });
  } catch (error) {
    console.error("Investor document PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to update investor document." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const id = String(body.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { data: document, error: lookupError } = await supabase
      .from("investor_documents")
      .select("id, file_path")
      .eq("id", id)
      .single();

    if (lookupError || !document) {
      return NextResponse.json(
        { error: "Investor document not found." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("investor_documents")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "Investor document database deletion failed:",
        deleteError
      );

      return NextResponse.json(
        { error: "Unable to delete investor document." },
        { status: 500 }
      );
    }

    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([document.file_path]);

      if (storageError) {
        console.error(
          "Investor document storage deletion failed:",
          storageError
        );
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Investor document DELETE error:", error);

    return NextResponse.json(
      { error: "Unable to delete investor document." },
      { status: 500 }
    );
  }
}