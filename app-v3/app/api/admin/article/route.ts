import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { articleId, status } = await req.json();

    if (!articleId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("articles")
      .update({ status })
      .eq("id", articleId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, article: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update article" }, { status: 500 });
  }
}