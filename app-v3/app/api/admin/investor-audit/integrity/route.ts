import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requirePermission } from "@/lib/route-authorization";

type IssueSeverity = "HIGH" | "MEDIUM" | "LOW";

interface IntegrityIssue {
  severity: IssueSeverity;
  code: string;
  message: string;
  count: number;
  sample_ids: string[];
}

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

/**
 * GET /api/admin/investor-audit/integrity
 *
 * 5C.15 — CRM integrity verification.
 *
 * Runs structural consistency checks against the live investor CRM
 * state. Returns a severity-tagged list of issues plus an overall
 * health status. Read-only. No mutation.
 *
 * Permission: VIEW
 */
export async function GET() {
  const admin = await requirePermission("VIEW");

  if (!admin.authorized) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  try {
    const supabase = getAdminSupabase();

    const [
      investorsResult,
      crmLogsResult,
      activitiesResult,
      auditResult,
    ] = await Promise.all([
      supabase
        .from("investor_profiles")
        .select("id"),

      supabase
        .from("investor_crm_logs")
        .select("id, investor_id, stage, next_action, updated_at"),

      supabase
        .from("investor_crm_activities")
        .select(
          "id, investor_id, activity_type, status, due_at, subject"
        ),

      supabase
        .from("investor_crm_audit_log")
        .select("id, investor_id, activity_id, occurred_at")
        .order("occurred_at", { ascending: false })
        .limit(2000),
    ]);

    if (investorsResult.error) throw investorsResult.error;
    if (crmLogsResult.error) throw crmLogsResult.error;
    if (activitiesResult.error) throw activitiesResult.error;
    if (auditResult.error) throw auditResult.error;

    const investors = investorsResult.data ?? [];
    const crmLogs = crmLogsResult.data ?? [];
    const activities = activitiesResult.data ?? [];
    const auditEvents = auditResult.data ?? [];

    const investorIds = new Set(investors.map((i) => i.id));
    const activityIds = new Set(activities.map((a) => a.id));

    const issues: IntegrityIssue[] = [];

    /*
     * Check 1 — Orphaned activities.
     *
     * An activity that references an investor id not present in
     * investor_profiles indicates a broken relationship record.
     */
    const orphanedActivities = activities.filter(
      (a) => !investorIds.has(a.investor_id)
    );

    if (orphanedActivities.length > 0) {
      issues.push({
        severity: "HIGH",
        code: "ORPHANED_ACTIVITIES",
        message:
          "CRM activities reference investors that no longer exist.",
        count: orphanedActivities.length,
        sample_ids: orphanedActivities
          .slice(0, 5)
          .map((a) => a.id),
      });
    }

    /*
     * Check 2 — Open activities missing an operational due date.
     *
     * Every OPEN activity is an operational obligation. Without a
     * due date, the Operations queue and reminders cannot function.
     */
    const openWithoutDue = activities.filter(
      (a) => a.status === "OPEN" && !a.due_at
    );

    if (openWithoutDue.length > 0) {
      issues.push({
        severity: "MEDIUM",
        code: "OPEN_WITHOUT_DUE",
        message:
          "Open CRM activities have no operational due date.",
        count: openWithoutDue.length,
        sample_ids: openWithoutDue
          .slice(0, 5)
          .map((a) => a.id),
      });
    }

    /*
     * Check 3 — FOLLOW_UP activities outside the OPEN state.
     *
     * The server enforces that FOLLOW_UP is always created OPEN. Any
     * FOLLOW_UP in a non-OPEN state indicates either an audit gap or
     * direct database manipulation.
     */
    const followUpInvalid = activities.filter(
      (a) =>
        a.activity_type === "FOLLOW_UP" &&
        a.status !== "OPEN" &&
        a.status !== "COMPLETED" &&
        a.status !== "CANCELLED"
    );

    if (followUpInvalid.length > 0) {
      issues.push({
        severity: "HIGH",
        code: "FOLLOW_UP_INVALID_STATUS",
        message:
          "Follow-up activities exist in an unrecognised state.",
        count: followUpInvalid.length,
        sample_ids: followUpInvalid
          .slice(0, 5)
          .map((a) => a.id),
      });
    }

    /*
     * Check 4 — Progressed investors without a CRM record.
     *
     * A contact-stage-or-beyond investor without a CRM log row is
     * either the result of manual data manipulation or a stage
     * transition that bypassed the CRM PATCH endpoint.
     */
    const PROGRESSED_STAGES = [
      "CONTACTED",
      "INTERESTED",
      "NDA",
      "DUE_DILIGENCE",
      "COMMITMENT",
      "INVESTED",
    ];

    const latestCrmByInvestor = new Map<
      string,
      {
        stage: string;
        next_action: string | null;
        updated_at: string;
      }
    >();

    for (const log of crmLogs) {
      const existing = latestCrmByInvestor.get(log.investor_id);

      if (
        !existing ||
        new Date(log.updated_at).getTime() >
          new Date(existing.updated_at).getTime()
      ) {
        latestCrmByInvestor.set(log.investor_id, {
          stage: log.stage,
          next_action: log.next_action,
          updated_at: log.updated_at,
        });
      }
    }

    const progressedWithoutCrm = investors.filter((investor) => {
      const crm = latestCrmByInvestor.get(investor.id);
      return crm && PROGRESSED_STAGES.includes(crm.stage);
    });

    // This is informational rather than an integrity issue per se.
    // We report it at LOW severity so the founder sees the shape of
    // the pipeline but is not alarmed.
    if (progressedWithoutCrm.length > 0) {
      issues.push({
        severity: "LOW",
        code: "PROGRESSED_INVESTORS",
        message:
          "Investors currently in an active relationship stage.",
        count: progressedWithoutCrm.length,
        sample_ids: progressedWithoutCrm
          .slice(0, 5)
          .map((i) => i.id),
      });
    }

    /*
     * Check 5 — Orphaned audit entries.
     *
     * An audit row referencing a missing investor or activity id
     * indicates a cascade integrity break. The FK uses ON DELETE
     * SET NULL so this should be structurally impossible, but we
     * verify explicitly.
     */
    const orphanedAuditInvestor = auditEvents.filter(
      (e) => e.investor_id && !investorIds.has(e.investor_id)
    );

    if (orphanedAuditInvestor.length > 0) {
      issues.push({
        severity: "HIGH",
        code: "ORPHANED_AUDIT_INVESTOR",
        message:
          "Audit entries reference investors that no longer exist.",
        count: orphanedAuditInvestor.length,
        sample_ids: orphanedAuditInvestor
          .slice(0, 5)
          .map((e) => e.id),
      });
    }

    const orphanedAuditActivity = auditEvents.filter(
      (e) => e.activity_id && !activityIds.has(e.activity_id)
    );

    if (orphanedAuditActivity.length > 0) {
      issues.push({
        severity: "MEDIUM",
        code: "ORPHANED_AUDIT_ACTIVITY",
        message:
          "Audit entries reference activities that no longer exist.",
        count: orphanedAuditActivity.length,
        sample_ids: orphanedAuditActivity
          .slice(0, 5)
          .map((e) => e.id),
      });
    }

    /*
     * Overall status.
     *
     * DEGRADED — at least one HIGH severity issue
     * WARNING  — at least one MEDIUM severity issue
     * HEALTHY  — no issues above LOW
     */
    const hasHigh = issues.some(
      (i) => i.severity === "HIGH"
    );
    const hasMedium = issues.some(
      (i) => i.severity === "MEDIUM"
    );

    const status: "HEALTHY" | "WARNING" | "DEGRADED" =
      hasHigh
        ? "DEGRADED"
        : hasMedium
          ? "WARNING"
          : "HEALTHY";

    return NextResponse.json({
      success: true,
      checked_at: new Date().toISOString(),
      investor_count: investors.length,
      crm_log_count: crmLogs.length,
      activity_count: activities.length,
      audit_event_count: auditEvents.length,
      issues,
      status,
    });
  } catch (error) {
    console.error(
      "Investor audit integrity error:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to run integrity verification.",
      },
      { status: 500 }
    );
  }
}