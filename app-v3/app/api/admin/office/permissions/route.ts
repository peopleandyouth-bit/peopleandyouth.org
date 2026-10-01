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

const ALLOWED_SCOPES = ['INTERNAL', 'RESTRICTED'];

// ---------------------------------------------------------------------------
// GET — list grants for an office
// ?office_slug=<slug>
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
      .select('id, slug, name')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    // Auto-expire: mark grants past expires_at as EXPIRED before listing
    await supabase
      .from('office_permissions')
      .update({ status: 'EXPIRED', updated_at: new Date().toISOString() })
      .eq('office_id', office.id)
      .eq('status', 'ACTIVE')
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString());

    const { data, error } = await supabase
      .from('office_permissions')
      .select(
        'id, office_id, grantee_email, grantee_name, grantee_author_id, scope, reason, expires_at, status, granted_at, revoked_at, created_at'
      )
      .eq('office_id', office.id)
      .order('status', { ascending: true })
      .order('granted_at', { ascending: false });

    if (error) {
      console.error('Admin permissions GET error:', error);
      return NextResponse.json({ error: 'Unable to load grants.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, permissions: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load grants.';
    console.error('Admin permissions GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a grant
// Body: { office_slug, grantee_email, grantee_name?, scope, reason?, expires_at? }
// ---------------------------------------------------------------------------

interface PostBody {
  office_slug?: string;
  grantee_email?: string;
  grantee_name?: string;
  scope?: string;
  reason?: string;
  expires_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let body: PostBody;
    try {
      body = (await request.json()) as PostBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const officeSlug = body.office_slug?.trim();
    const granteeEmail = body.grantee_email?.trim().toLowerCase();
    const scope = body.scope?.trim();

    if (!officeSlug || !granteeEmail || !scope) {
      return NextResponse.json(
        { error: 'office_slug, grantee_email, and scope are required.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(granteeEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    if (!ALLOWED_SCOPES.includes(scope)) {
      return NextResponse.json(
        { error: `scope must be one of: ${ALLOWED_SCOPES.join(', ')}.` },
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

    // Try to resolve the grantee to an existing author by email
    let granteeAuthorId: string | null = null;
    const { data: author } = await supabase
      .from('authors')
      .select('id')
      .ilike('email', granteeEmail)
      .maybeSingle();

    if (author?.id) {
      granteeAuthorId = author.id;
    }

    const { data: created, error: createError } = await supabase
      .from('office_permissions')
      .insert({
        office_id: office.id,
        grantee_email: granteeEmail,
        grantee_name: body.grantee_name?.trim() || null,
        grantee_author_id: granteeAuthorId,
        scope,
        reason: body.reason?.trim() || null,
        expires_at: body.expires_at || null,
        status: 'ACTIVE',
        granted_by: auth.identity.id,
      })
      .select(
        'id, office_id, grantee_email, grantee_name, scope, reason, expires_at, status, granted_at'
      )
      .single();

    if (createError) {
      console.error('Admin permissions POST error:', createError);
      return NextResponse.json({ error: 'Unable to create grant.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, permission: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to create grant.';
    console.error('Admin permissions POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — revoke a grant
// ?id=<uuid>
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim();

    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { error } = await supabase
      .from('office_permissions')
      .update({
        status: 'REVOKED',
        revoked_at: new Date().toISOString(),
        revoked_by: auth.identity.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Admin permissions DELETE error:', error);
      return NextResponse.json({ error: 'Unable to revoke grant.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to revoke grant.';
    console.error('Admin permissions DELETE exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}