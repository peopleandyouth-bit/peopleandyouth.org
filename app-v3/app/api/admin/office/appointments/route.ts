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

// ---------------------------------------------------------------------------
// GET — list appointments for an office
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const officeSlug = searchParams.get('office_slug')?.trim();
    const status = searchParams.get('status')?.trim();

    if (!officeSlug) {
      return NextResponse.json({ error: 'office_slug is required.' }, { status: 400 });
    }

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
      .from('office_appointments')
      .select(
        'id, office_id, requester_name, requester_email, requester_phone, requester_organization, requester_designation, purpose, message, preferred_date, preferred_time, duration_minutes, scheduled_at, location, meeting_link, status, response_message, responded_at, created_at, updated_at'
      )
      .eq('office_id', office.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      console.error('Admin appointments GET error:', error);
      return NextResponse.json({ error: 'Unable to load appointments.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, appointments: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load appointments.';
    console.error('Admin appointments GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — respond to an appointment
// ---------------------------------------------------------------------------

interface PatchBody {
  id?: string;
  status?: string;
  response_message?: string;
  scheduled_at?: string;
  location?: string;
  meeting_link?: string;
}

const ALLOWED_STATUS = ['ACCEPTED', 'DECLINED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'];

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

    const id = body.id?.trim();
    const status = body.status?.trim();

    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    if (!status || !ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${ALLOWED_STATUS.join(', ')}.` },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = {
      status,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      responded_by: auth.identity.id,
    };

    if (body.response_message !== undefined) {
      patch.response_message = body.response_message;
    }
    if (body.scheduled_at !== undefined) {
      patch.scheduled_at = body.scheduled_at;
    }
    if (body.location !== undefined) {
      patch.location = body.location;
    }
    if (body.meeting_link !== undefined) {
      patch.meeting_link = body.meeting_link;
    }

    const supabase = getServiceClient();

    const { data: updated, error } = await supabase
      .from('office_appointments')
      .update(patch)
      .eq('id', id)
      .select(
        'id, office_id, requester_name, requester_email, purpose, status, scheduled_at, response_message, responded_at, updated_at'
      )
      .single();

    if (error) {
      console.error('Admin appointments PATCH error:', error);
      return NextResponse.json({ error: 'Unable to update appointment.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update appointment.';
    console.error('Admin appointments PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}