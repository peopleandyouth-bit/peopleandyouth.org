// lib/investor-audit.ts
//
// Phase 5C — Institutional audit trail writer.
//
// Every mutation performed on investor CRM entities flows through this
// helper. The audit log is append-only by construction and is never
// intended to be read or written by any client. Only server-side routes
// with the service-role key can access it.
//
// Failure policy: audit recording is best-effort. If the audit write
// fails for any reason, the exception is logged but never propagated.
// The primary operation must always succeed independently of the audit.

import { createClient } from "@supabase/supabase-js";

export type AuditEventType =
  | "ACTIVITY_CREATED"
  | "ACTIVITY_COMPLETED"
  | "ACTIVITY_CANCELLED"
  | "ACTIVITY_RESCHEDULED"
  | "ACTIVITY_REASSIGNED"
  | "ACTIVITY_DETAILS_UPDATED"
  | "STAGE_TRANSITION"
  | "CRM_CAPITAL_UPDATED"
  | "CRM_PROBABILITY_UPDATED"
  | "CRM_NEXT_ACTION_UPDATED"
  | "CRM_CONTACT_RECORDED"
  | "INVESTOR_NOTES_UPDATED";

export interface AuditActor {
  id: string;
  email: string;
  role: string;
}

export interface AuditEventInput {
  investorId: string | null;
  activityId?: string | null;
  eventType: AuditEventType;
  actor: AuditActor;
  source: string;
  summary: string;
  payload?: Record<string, unknown>;
  occurredAt?: string;
}

function getAuditSupabase() {
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

export async function recordAuditEvent(
  input: AuditEventInput
): Promise<void> {
  try {
    const supabase = getAuditSupabase();

    const { error } = await supabase
      .from("investor_crm_audit_log")
      .insert({
        investor_id: input.investorId,
        activity_id: input.activityId ?? null,
        event_type: input.eventType,
        actor_id: input.actor.id,
        actor_email: input.actor.email,
        actor_role: input.actor.role,
        source: input.source,
        summary: input.summary,
        payload: input.payload ?? {},
        occurred_at: input.occurredAt ?? new Date().toISOString(),
      });

    if (error) {
      console.error(
        "[AUDIT] Failed to record audit event:",
        error,
        input
      );
    }
  } catch (err) {
    console.error("[AUDIT] Audit recording exception:", err, input);
  }
}
