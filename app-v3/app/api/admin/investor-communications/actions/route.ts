import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/route-authorization";
import {
  getTemplateById,
  renderTemplate,
  type TemplateRenderContext,
} from "@/lib/investor-communication-templates";
import { recordAuditEvent } from "@/lib/investor-audit";

type Mode = "PREVIEW" | "CREATE";

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

function cleanString(value: unknown, maxLength = 5000) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function parseDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function firstNameOf(fullName: string | null | undefined) {
  if (!fullName) return "Investor";
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || "Investor";
}

/**
 * POST /api/admin/investor-communications/actions
 *
 * Two modes:
 *
 *   mode = "PREVIEW"
 *     Renders a template against live investor state and returns the
 *     composed subject + body. No database write.
 *
 *   mode = "CREATE"
 *     Renders the template and writes an activity record to
 *     investor_crm_activities. Used for operational follow-ups,
 *     meeting follow-ups and notification records.
 *
 * Permission: CREATE (5B.17)
 */
export async function POST(request: NextRequest) {
  const admin = await requirePermission("CREATE");

  if (!admin.authorized) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  try {
    const body = await request.json();

    const mode: Mode =
      body?.mode === "CREATE" ? "CREATE" : "PREVIEW";

    const investorId = cleanString(body?.investor_id, 100);
    const templateId = cleanString(body?.template_id, 100);

    if (!investorId) {
      return NextResponse.json(
        { error: "investor_id is required." },
        { status: 400 }
      );
    }

    if (!templateId) {
      return NextResponse.json(
        { error: "template_id is required." },
        { status: 400 }
      );
    }

    const template = getTemplateById(templateId);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found." },
        { status: 404 }
      );
    }

    const supabase = getAdminSupabase();

    const [
      { data: investor, error: investorError },
      { data: crmRow, error: crmError },
    ] = await Promise.all([
      supabase
        .from("investor_profiles")
        .select(
          "id, full_name, email, organization, investor_type"
        )
        .eq("id", investorId)
        .maybeSingle(),
      supabase
        .from("investor_crm_logs")
        .select("stage, assigned_admin")
        .eq("investor_id", investorId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (investorError) {
      console.error(
        "Communication action investor lookup error:",
        investorError
      );
      return NextResponse.json(
        { error: "Unable to verify investor." },
        { status: 500 }
      );
    }

    if (crmError) {
      console.error(
        "Communication action CRM lookup error:",
        crmError
      );
    }

    if (!investor) {
      return NextResponse.json(
        { error: "Investor not found." },
        { status: 404 }
      );
    }

    const investorName =
      cleanString(investor.full_name, 300) ??
      cleanString(investor.organization, 300) ??
      cleanString(investor.email, 300) ??
      "Investor";

    const context: TemplateRenderContext = {
      investorName,
      firstName: firstNameOf(investor.full_name),
      organization:
        cleanString(investor.organization, 300) ?? "—",
      investorType:
        cleanString(investor.investor_type, 200) ??
        "investor",
      stage: cleanString(crmRow?.stage, 60) ?? "PROSPECT",
      assignedAdmin:
        cleanString(crmRow?.assigned_admin, 200) ??
        admin.user.email ??
        "Founder",
    };

    const rendered = renderTemplate(template, context);

    const overrideSubject = cleanString(body?.subject, 300);
    const overrideBody = cleanString(body?.details, 10000);

    const finalSubject = overrideSubject ?? rendered.subject;
    const finalBody = overrideBody ?? rendered.body;

    if (mode === "PREVIEW") {
      return NextResponse.json({
        success: true,
        mode: "PREVIEW",
        template: {
          id: template.id,
          name: template.name,
          category: template.category,
          activity_type: template.activityType,
          suggested_stages: template.suggestedStages,
          suggested_due_days:
            template.suggestedDueDays ?? null,
        },
        rendered: {
          subject: finalSubject,
          body: finalBody,
          used_placeholders: rendered.used,
        },
      });
    }

    /*
     * mode === "CREATE"
     *
     * Two flavors:
     *
     * 1. Operational follow-up → status OPEN with a due_at
     * 2. Historical record → status COMPLETED
     *
     * The behavior is driven by request payload:
     *   create_status: "OPEN" | "COMPLETED"
     *   due_at: ISO string (required if create_status === "OPEN")
     */
    const createStatus: "OPEN" | "COMPLETED" =
      body?.create_status === "OPEN" ? "OPEN" : "COMPLETED";

    const dueAtIso =
      createStatus === "OPEN"
        ? parseDate(body?.due_at) ??
          new Date(
            Date.now() +
              (template.suggestedDueDays ?? 3) *
                24 *
                60 *
                60 *
                1000
          ).toISOString()
        : null;

    const activityType = template.activityType;

    const assignedAdmin =
      cleanString(body?.assigned_admin, 200) ??
      context.assignedAdmin;

    /*
     * The rendered body is stored in details with a structured
     * header so the CRM timeline and the audit trail both carry
     * the same information the investor would have received.
     */
    const headerLines = [
      `[TEMPLATE:${template.id}]`,
      `Category: ${template.category}`,
      "",
    ];

    const details = `${headerLines.join("\n")}${finalBody}`;

    const { data: activity, error: insertError } = await supabase
      .from("investor_crm_activities")
      .insert({
        investor_id: investorId,
        activity_type: activityType,
        subject: finalSubject,
        details,
        occurred_at: new Date().toISOString(),
        due_at: dueAtIso,
        status: createStatus,
        assigned_admin: assignedAdmin,
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

    if (insertError) {
      console.error(
        "Communication action insert error:",
        insertError
      );
      return NextResponse.json(
        { error: "Unable to create communication action." },
        { status: 500 }
      );
    }

    await recordAuditEvent({
      investorId,
      activityId: activity.id,
      eventType: "ACTIVITY_CREATED",
      actor: {
        id: admin.user.id,
        email: admin.user.email ?? "",
        role: admin.identity?.role ?? "unknown",
      },
      source: "POST /api/admin/investor-communications/actions",
      summary: `Created ${activityType} from template ${template.name}`,
      payload: {
        template_id: template.id,
        template_category: template.category,
        activity_type: activityType,
        status: createStatus,
        subject: finalSubject,
        due_at: dueAtIso,
      },
    });

    return NextResponse.json(
      {
        success: true,
        mode: "CREATE",
        activity,
        template: {
          id: template.id,
          name: template.name,
          category: template.category,
        },
        rendered: {
          subject: finalSubject,
          body: finalBody,
          used_placeholders: rendered.used,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Communication action POST exception:",
      error
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process communication action.",
      },
      { status: 500 }
    );
  }
}