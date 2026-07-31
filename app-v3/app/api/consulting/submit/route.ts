import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { organization_name, contact_person, email, phone, sector, project_scope, budget_range } = await req.json();

    if (!organization_name || !contact_person || !email || !phone || !sector || !project_scope) {
      return NextResponse.json(
        { error: "Please fill in all mandatory fields." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("consulting_requests")
      .insert([
        {
          organization_name,
          contact_person,
          email,
          phone,
          sector,
          project_scope,
          budget_range: budget_range || "Unspecified",
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Consulting Request Error:", error);
      return NextResponse.json(
        { error: "Failed to record consulting proposal." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Consulting inquiry submitted successfully!",
      requestId: data.id,
    });
  } catch (error: any) {
    console.error("Consulting Submit Error:", error);
    return NextResponse.json(
      { error: "Internal server error during proposal submission." },
      { status: 500 }
    );
  }
}