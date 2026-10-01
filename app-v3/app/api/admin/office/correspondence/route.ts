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
// GET — list correspondence for an office
// ?office_slug=<slug>                  → all, newest first
// ?office_slug=<slug>&status=UNREAD    → filter
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
      .from('office_correspondence')
      .select(
        'id, office_id, sender_name, sender_email, sender_phone, sender_organization, sender_designation, subject, body, category, tags, status, important, read_at, archived_at, created_at, updated_at'
      )
      .eq('office_id', office.id)
      .order('important', { ascending: false })
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      console.error('Admin correspondence GET error:', error);
      return NextResponse.json({ error: 'Unable to load correspondence.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, correspondence: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load correspondence.';
    console.error('Admin correspondence GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — mark read / important / archived / tag
// ---------------------------------------------------------------------------

interface PatchBody {
  id?: string;
  status?: 'UNREAD' | 'READ' | 'ARCHIVED';
  important?: boolean;
  tags?: string[];
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let payload: PatchBody;
    try {
      payload = (await request.json()) as PatchBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const id = payload.id?.trim();
    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.status !== undefined) {
      if (!['UNREAD', 'READ', 'ARCHIVED'].includes(payload.status)) {
        return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
      }
      patch.status = payload.status;
      if (payload.status === 'READ') {
        patch.read_at = new Date().toISOString();
        patch.read_by = auth.identity.id;
      } else if (payload.status === 'ARCHIVED') {
        patch.archived_at = new Date().toISOString();
      }
    }

    if (payload.important !== undefined) {
      patch.important = payload.important;
    }

    if (payload.tags !== undefined) {
      patch.tags = payload.tags;
    }

    const supabase = getServiceClient();

    const { data: updated, error } = await supabase
      .from('office_correspondence')
      .update(patch)
      .eq('id', id)
      .select(
        'id, office_id, sender_name, sender_email, subject, status, important, tags, read_at, archived_at, updated_at'
      )
      .single();

    if (error) {
      console.error('Admin correspondence PATCH error:', error);
      return NextResponse.json({ error: 'Unable to update correspondence.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, correspondence: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update correspondence.';
    console.error('Admin correspondence PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}