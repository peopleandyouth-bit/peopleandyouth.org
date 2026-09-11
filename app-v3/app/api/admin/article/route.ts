import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/route-authorization";

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission("APPROVE");

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { articleId, status } = await req.json();

    if (!articleId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("articles")
      .update({ status })
      .eq("id", articleId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      article: data,
    });
  } catch (error: any) {
    console.error("[ADMIN ARTICLE]", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to update article",
      },
      { status: 500 }
    );
  }
}

