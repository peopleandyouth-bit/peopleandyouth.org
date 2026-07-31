import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { title, category, author_name, author_email, abstract } = await req.json();

    if (!title || !category || !author_name || !author_email || !abstract) {
      return NextResponse.json(
        { error: "All required fields must be completed." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("articles")
      .insert([
        {
          title,
          category,
          author_name,
          author_email,
          abstract,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Article Insert Error:", error);
      return NextResponse.json(
        { error: "Failed to submit policy paper to database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Policy paper submitted successfully!",
      articleId: data.id,
    });
  } catch (error: any) {
    console.error("Submission Error:", error);
    return NextResponse.json(
      { error: "Internal server error during paper submission." },
      { status: 500 }
    );
  }
}