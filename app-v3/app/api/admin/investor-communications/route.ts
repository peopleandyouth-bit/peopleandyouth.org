import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

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

function cleanString(value: unknown, maxLength = 10000) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  if (!trimmed) return null;

  return trimmed.slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildInstitutionalHtml(
  recipientName: string,
  subject: string,
  message: string
) {
  const paragraphs = message
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px 0; line-height:1.7;">${escapeHtml(
          paragraph
        ).replace(/\r?\n/g, "<br />")}</p>`
    )
    .join("");

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f1eb;color:#111827;">
    <div style="font-family:Georgia,serif;max-width:680px;margin:32px auto;background:#ffffff;border:1px solid #d7c69b;border-radius:16px;overflow:hidden;">
      <div style="background:#070b19;padding:28px 32px;">
        <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:3px;color:#c59b27;font-weight:700;">
          PEOPLE &amp; YOUTH
        </div>
        <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:1.5px;color:#aeb5c4;margin-top:8px;">
          INSTITUTIONAL COMMUNICATION
        </div>
      </div>

      <div style="padding:34px 36px;">
        <p style="font-size:16px;margin:0 0 24px 0;">
          Dear ${escapeHtml(recipientName)},
        </p>

        ${paragraphs}

        <div style="height:1px;background:#e5e7eb;margin:28px 0;"></div>

        <p style="font-size:13px;color:#4b5563;margin:0;">
          Warm regards,
        </p>
        <p style="font-size:14px;font-weight:700;color:#0b192c;margin:5px 0 0;">
          Investor Relations Office
        </p>
        <p style="font-size:12px;color:#6b7280;margin:4px 0 0;">
          People &amp; Youth
        </p>
        <p style="font-size:12px;color:#6b7280;margin:2px 0 0;">
          contact@peopleandyouth.org
        </p>
      </div>
    </div>
  </body>
</html>`;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  try {
    const supabase = getAdminSupabase();

    const investorId = cleanString(
      request.nextUrl.searchParams.get("investor_id"),
      100
    );

    if (investorId) {
      const { data: investor, error: investorError } =
        await supabase
          .from("investor_profiles")
          .select(
            `
            id,
            full_name,
            email,
            phone,
            organization,
            investor_type,
            geography,
            verification_status,
            kyc_completed,
            nda_signed,
            access_level,
            proposed_ticket_inr,
            created_at,
            updated_at
            `
          )
          .eq("id", investorId)
          .maybeSingle();

      if (investorError) {
        console.error(
          "Investor communications investor lookup error:",
          investorError
        );

        return NextResponse.json(
          { error: "Unable to load investor." },
          { status: 500 }
        );
      }

      if (!investor) {
        return NextResponse.json(
          { error: "Investor not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        investor,
      });
    }

    const { data, error } = await supabase
      .from("investor_profiles")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        organization,
        investor_type,
        geography,
        verification_status,
        kyc_completed,
        nda_signed,
        access_level,
        proposed_ticket_inr,
        created_at,
        updated_at
        `
      )
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(
        "Investor communications investor GET error:",
        error
      );

      return NextResponse.json(
        { error: "Unable to load investors." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      investors: data ?? [],
    });
  } catch (error) {
    console.error(
      "Investor communications GET exception:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load investors." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  try {
    const body = await request.json();

    const investorId = cleanString(body?.investor_id, 100);
    const subject = cleanString(body?.subject, 300);
    const message = cleanString(body?.message, 20000);
    const completeActivityId = cleanString(
      body?.complete_activity_id,
      100
    );

    if (!investorId || !subject || !message) {
      return NextResponse.json(
        {
          error:
            "Investor, subject, and message are required.",
        },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    const { data: investor, error: investorError } =
      await supabase
        .from("investor_profiles")
        .select(
          `
          id,
          full_name,
          email,
          organization
          `
        )
        .eq("id", investorId)
        .maybeSingle();

    if (investorError) {
      console.error(
        "Investor communications investor lookup error:",
        investorError
      );

      return NextResponse.json(
        { error: "Unable to verify investor." },
        { status: 500 }
      );
    }

    if (!investor) {
      return NextResponse.json(
        { error: "Investor not found." },
        { status: 404 }
      );
    }

    if (!investor.email) {
      return NextResponse.json(
        {
          error:
            "This investor does not have an email address.",
        },
        { status: 400 }
      );
    }

    let followUpActivity: {
      id: string;
      investor_id: string;
      activity_type: string;
      status: string;
      subject: string | null;
    } | null = null;

    if (completeActivityId) {
      const { data: activity, error: activityLookupError } =
        await supabase
          .from("investor_crm_activities")
          .select(
            `
            id,
            investor_id,
            activity_type,
            status,
            subject
            `
          )
          .eq("id", completeActivityId)
          .eq("investor_id", investor.id)
          .maybeSingle();

      if (activityLookupError) {
        console.error(
          "Investor communications activity lookup error:",
          activityLookupError
        );

        return NextResponse.json(
          {
            error:
              "Unable to verify the selected follow-up action.",
          },
          { status: 500 }
        );
      }

      if (!activity) {
        return NextResponse.json(
          {
            error:
              "The selected follow-up action could not be found.",
          },
          { status: 404 }
        );
      }

      if (
        activity.activity_type !== "FOLLOW_UP" ||
        activity.status !== "OPEN"
      ) {
        return NextResponse.json(
          {
            error:
              "Only an open FOLLOW_UP action can be completed from an investor email.",
          },
          { status: 400 }
        );
      }

      followUpActivity = activity;
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured.");

      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "People & Youth Investor Relations <contact@peopleandyouth.org>";

    const recipientName =
      cleanString(investor.full_name, 300) ||
      cleanString(investor.organization, 300) ||
      "Investor";

    const html = buildInstitutionalHtml(
      recipientName,
      subject,
      message
    );

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [investor.email],
          subject,
          text: message,
          html,
        }),
      }
    );

    const resendBody = await resendResponse
      .json()
      .catch(() => null);

    if (!resendResponse.ok) {
      console.error(
        "Resend investor communication error:",
        resendBody
      );

      return NextResponse.json(
        {
          error:
            typeof resendBody?.message === "string"
              ? resendBody.message
              : "Email could not be sent.",
        },
        { status: 502 }
      );
    }

    const resendId =
      typeof resendBody?.id === "string"
        ? resendBody.id
        : null;

    const activityDetails = [
      `Recipient: ${investor.email}`,
      `Subject: ${subject}`,
      resendId ? `Resend ID: ${resendId}` : null,
      followUpActivity
        ? `Completed follow-up: ${followUpActivity.id}`
        : null,
      "",
      message,
    ]
      .filter((value) => value !== null)
      .join("\n");

    const { data: activity, error: activityError } =
      await supabase
        .from("investor_crm_activities")
        .insert({
          investor_id: investor.id,
          activity_type: "EMAIL",
          subject: `Email sent: ${subject}`,
          details: activityDetails,
          occurred_at: new Date().toISOString(),
          status: "COMPLETED",
          assigned_admin: admin.user.email ?? "Founder",
          created_by: admin.user.id,
        })
        .select(
          `
          id,
          investor_id,
          activity_type,
          subject,
          details,
          occurred_at,
          due_at,
          status,
          assigned_admin,
          created_by,
          created_at,
          updated_at
          `
        )
        .single();

    if (activityError) {
      console.error(
        "Investor communication activity logging error:",
        activityError
      );

      return NextResponse.json({
        success: true,
        warning:
          "Email was sent successfully, but the CRM activity could not be recorded.",
        recipient: investor.email,
        resend_id: resendId,
      });
    }

    let completedFollowUp = false;
    let followUpWarning: string | null = null;

    if (followUpActivity) {
      const { error: followUpUpdateError } =
        await supabase
          .from("investor_crm_activities")
          .update({
            status: "COMPLETED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", followUpActivity.id)
          .eq("investor_id", investor.id)
          .eq("status", "OPEN");

      if (followUpUpdateError) {
        console.error(
          "Investor communications follow-up completion error:",
          followUpUpdateError
        );

        followUpWarning =
          "Email was sent and logged, but the linked follow-up could not be marked completed.";
      } else {
        completedFollowUp = true;
      }
    }

    return NextResponse.json({
      success: true,
      recipient: investor.email,
      resend_id: resendId,
      activity,
      completed_follow_up: completedFollowUp,
      warning: followUpWarning,
    });
  } catch (error) {
    console.error(
      "Investor communications POST exception:",
      error
    );

    return NextResponse.json(
      { error: "Unable to send investor communication." },
      { status: 500 }
    );
  }
}