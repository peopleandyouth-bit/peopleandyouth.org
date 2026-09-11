import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type ApplicationPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  investorType?: string;
  linkedinUrl?: string;
  proposedTicket?: string | number;
};

const ALLOWED_INVESTOR_TYPES = new Set([
  "Angel",
  "VC",
  "Family Office",
  "Institutional",
  "Other",
]);

function cleanText(value: unknown, maxLength = 500) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  if (!cleaned) return null;

  return cleaned.slice(0, maxLength);
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApplicationPayload;

    const fullName = cleanText(body.fullName, 150);
    const email = cleanText(body.email, 320)?.toLowerCase();
    const phone = cleanText(body.phone, 50);
    const organization = cleanText(body.organization, 200);
    const investorType = cleanText(body.investorType, 50);
    const linkedinUrl = cleanText(body.linkedinUrl, 500);

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || !validEmail(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (investorType && !ALLOWED_INVESTOR_TYPES.has(investorType)) {
      return NextResponse.json(
        { error: "Invalid investor type." },
        { status: 400 }
      );
    }

    let proposedTicket: number | null = null;

    if (
      body.proposedTicket !== undefined &&
      body.proposedTicket !== null &&
      body.proposedTicket !== ""
    ) {
      const parsed = Number(body.proposedTicket);

      if (!Number.isFinite(parsed) || parsed < 0) {
        return NextResponse.json(
          { error: "Proposed ticket must be a valid positive amount." },
          { status: 400 }
        );
      }

      proposedTicket = parsed;
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
              // Safe for API-route/server compatibility.
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? null;

    const { data: existing, error: existingError } = await supabase
      .from("investor_profiles")
      .select(
        "id, user_id, full_name, email, verification_status, access_level"
      )
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      console.error("Investor lookup failed:", existingError);

      return NextResponse.json(
        { error: "Unable to process the application right now." },
        { status: 500 }
      );
    }

    if (existing) {
      if (
        existing.verification_status === "VERIFIED" &&
        existing.access_level === "APPROVED"
      ) {
        return NextResponse.json(
          {
            success: true,
            status: "APPROVED",
            message:
              "An approved investor profile already exists for this email address.",
          },
          { status: 200 }
        );
      }

      if (existing.verification_status === "PENDING") {
        return NextResponse.json(
          {
            success: true,
            status: "PENDING",
            message:
              "Your investor access request is already under review.",
          },
          { status: 200 }
        );
      }

      if (existing.verification_status === "REJECTED") {
        return NextResponse.json(
          {
            success: false,
            status: "REJECTED",
            message:
              "This investor access request is currently not eligible for another submission.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          status: existing.verification_status,
          message:
            "An investor profile already exists for this email address.",
        },
        { status: 409 }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("investor_profiles")
      .insert({
        user_id: userId,
        full_name: fullName,
        email,
        phone,
        organization,
        investor_type: investorType || "Other",
        linkedin_url: linkedinUrl,
        proposed_ticket_inr: proposedTicket,
        verification_status: "PENDING",
        access_level: "REGISTERED",
      })
      .select(
        "id, full_name, email, verification_status, access_level, created_at"
      )
      .single();

    if (insertError) {
      console.error("Investor application insert failed:", insertError);

      return NextResponse.json(
        { error: "Unable to submit the investor application." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: "PENDING",
        application: inserted,
        message:
          "Your investor access request has been submitted for institutional review.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Investor application API error:", error);

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
