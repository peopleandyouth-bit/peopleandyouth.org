import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profileErr) throw profileErr;

    const { data: articles, error: articleErr } = await supabaseAdmin
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    const articleList = articleErr ? [] : (articles || []);

    const totalMembers = profiles?.length || 0;
    const verifiedFounders = profiles?.filter((p) => p.is_founding_member).length || 0;
    const totalRevenue = profiles?.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0) || 0;
    const pendingArticles = articleList.filter((a) => a.status === "pending").length;

    return NextResponse.json({
      metrics: {
        totalMembers,
        verifiedFounders,
        totalRevenue,
        pendingArticles,
      },
      profiles: profiles || [],
      articles: articleList,
    });
  } catch (error: any) {
    console.error("Admin Fetch Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch admin data" }, { status: 500 });
  }
}