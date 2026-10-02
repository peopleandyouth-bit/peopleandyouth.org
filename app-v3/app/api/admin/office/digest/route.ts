import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';

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

const ALLOWED_FREQUENCIES = ['OFF', 'DAILY', 'WEEKLY'];

// ---------------------------------------------------------------------------
// GET — read digest preferences for an office
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const officeSlug = searchParams.get('office_slug')?.trim();

    if (!officeSlug) {
      return NextResponse.json({ error: 'office_slug is required.' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: office, error: officeError } = await supabase
      .from('offices')
      .select('id')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    const { data: prefs } = await supabase
      .from('office_digest_preferences')
      .select('*')
      .eq('office_id', office.id)
      .maybeSingle();

    const { data: log } = await supabase
      .from('office_digest_log')
      .select('id, frequency, recipient_email, pending_appointments, unread_correspondence, status, sent_at')
      .eq('office_id', office.id)
      .order('sent_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      preferences: prefs ?? null,
      recent_log: log ?? [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load preferences.';
    console.error('Digest GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update digest preferences
// ---------------------------------------------------------------------------

interface PatchBody {
  office_slug?: string;
  frequency?: string;
  recipient_email?: string | null;
  include_appointments?: boolean;
  include_correspondence?: boolean;
  include_audit_summary?: boolean;
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let body: PatchBody;
    try {
      body = (await request.json()) as PatchBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const officeSlug = body.office_slug?.trim();
    if (!officeSlug) {
      return NextResponse.json({ error: 'office_slug is required.' }, { status: 400 });
    }

    if (body.frequency && !ALLOWED_FREQUENCIES.includes(body.frequency)) {
      return NextResponse.json(
        { error: `frequency must be one of: ${ALLOWED_FREQUENCIES.join(', ')}.` },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: office, error: officeError } = await supabase
      .from('offices')
      .select('id')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.frequency !== undefined) patch.frequency = body.frequency;
    if (body.recipient_email !== undefined) patch.recipient_email = body.recipient_email;
    if (body.include_appointments !== undefined) patch.include_appointments = body.include_appointments;
    if (body.include_correspondence !== undefined) patch.include_correspondence = body.include_correspondence;
    if (body.include_audit_summary !== undefined) patch.include_audit_summary = body.include_audit_summary;

    const { data: existing } = await supabase
      .from('office_digest_preferences')
      .select('id')
      .eq('office_id', office.id)
      .maybeSingle();

    let updated;
    if (existing) {
      const { data, error } = await supabase
        .from('office_digest_preferences')
        .update(patch)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      updated = data;
    } else {
      const { data, error } = await supabase
        .from('office_digest_preferences')
        .insert({ office_id: office.id, ...patch })
        .select('*')
        .single();
      if (error) throw error;
      updated = data;
    }

    return NextResponse.json({ success: true, preferences: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update preferences.';
    console.error('Digest PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}