import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profileErr) throw profileErr;

    const { data: articles, error: articleErr } = await supabaseAdmin
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (articleErr) throw articleErr;

    const profileList = profiles || [];
    const articleList = articles || [];

    const totalMembers = profileList.length;

    const verifiedFounders = profileList.filter(
      (p) => p.is_founding_member
    ).length;

    const totalRevenue = profileList.reduce(
      (sum, p) => sum + (Number(p.amount_paid) || 0),
      0
    );

    const pendingArticles = articleList.filter(
      (a) => a.status === "pending"
    ).length;

    return NextResponse.json({
      metrics: {
        totalMembers,
        verifiedFounders,
        totalRevenue,
        pendingArticles,
      },
      profiles: profileList,
      articles: articleList,
    });
  } catch (error: any) {
    console.error("[ADMIN DATA]", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to fetch admin data",
      },
      { status: 500 }
    );
  }
}
