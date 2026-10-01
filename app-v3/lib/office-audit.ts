import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Office audit logging — append-only.
//
// All writes go through the service role. No RLS write policies exist on
// office_audit_log; direct browser writes are impossible.
//
// This helper is designed to be non-fatal: if logging fails, it logs to the
// server console but does not throw. The primary operation should never be
// blocked by an audit failure.
// ---------------------------------------------------------------------------

export type AuditEventType =
  | 'CONTENT_VIEWED'
  | 'CONTENT_CREATED'
  | 'CONTENT_UPDATED'
  | 'CONTENT_DELETED'
  | 'GRANT_CREATED'
  | 'GRANT_REVOKED'
  | 'MEMBER_ADDED'
  | 'MEMBER_UPDATED'
  | 'MEMBER_REMOVED'
  | 'OFFICE_UPDATED'
  | 'THEME_CHANGED'
  | 'ASSIGNMENT_CHANGED';

export interface AuditEvent {
  office_id: string | null;
  event_type: AuditEventType;
  actor_user_id?: string | null;
  actor_email?: string | null;
  actor_role?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  summary?: string | null;
  payload?: Record<string, unknown> | null;
  ip?: string | null;
  user_agent?: string | null;
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Fire-and-forget audit write. Never throws. Never blocks the caller.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const supabase = getServiceClient();
    if (!supabase) return;

    await supabase.from('office_audit_log').insert({
      office_id: event.office_id,
      event_type: event.event_type,
      actor_user_id: event.actor_user_id ?? null,
      actor_email: event.actor_email ?? null,
      actor_role: event.actor_role ?? null,
      target_type: event.target_type ?? null,
      target_id: event.target_id ?? null,
      summary: event.summary ?? null,
      payload: event.payload ?? null,
      ip: event.ip ?? null,
      user_agent: event.user_agent ?? null,
    });
  } catch (error) {
    console.error('[office-audit] Failed to write audit event:', error);
  }
}

/**
 * Extract client ip and user agent from a NextRequest-like object.
 */
export function extractRequestMeta(request: {
  headers: { get: (name: string) => string | null };
}): { ip: string | null; user_agent: string | null } {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent');

  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : realIp || null;

  return { ip, user_agent: userAgent || null };
}