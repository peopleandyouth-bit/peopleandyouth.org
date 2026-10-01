import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';
import { isFounder } from '@/lib/iam';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server configuration is incomplete.');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// GET — list audit events for an office
// Founder-only.
//
// ?office_slug=<slug>              → all events, newest first, limit 200
// ?office_slug=<slug>&event_type=  → filter by event type
// ?office_slug=<slug>&limit=100    → limit (max 500)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!isFounder(auth.identity)) {
      return NextResponse.json(
        { error: 'Only the founder may read the audit log.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const officeSlug = searchParams.get('office_slug')?.trim();
    const eventType = searchParams.get('event_type')?.trim();
    const limitRaw = Number(searchParams.get('limit') ?? 200);

    if (!officeSlug) {
      return NextResponse.json({ error: 'office_slug is required.' }, { status: 400 });
    }

    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 200, 1), 500);

    const supabase = getServiceClient();

    const { data: office, error: officeError } = await supabase
      .from('offices')
      .select('id, slug, name')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    let query = supabase
      .from('office_audit_log')
      .select(
        'id, office_id, event_type, actor_user_id, actor_email, actor_role, target_type, target_id, summary, payload, ip, user_agent, occurred_at'
      )
      .eq('office_id', office.id)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (eventType) query = query.eq('event_type', eventType);

    const { data, error } = await query;

    if (error) {
      console.error('Audit GET error:', error);
      return NextResponse.json({ error: 'Unable to load audit log.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, events: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load audit log.';
    console.error('Audit GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}