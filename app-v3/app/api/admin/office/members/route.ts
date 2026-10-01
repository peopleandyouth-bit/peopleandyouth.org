import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';
import { logAuditEvent, extractRequestMeta } from '@/lib/office-audit';

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

const ALLOWED_ROLES = ['VIEWER', 'EDITOR', 'MANAGER'];

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

    const { data: members, error } = await supabase
      .from('office_members')
      .select('id, office_id, author_id, role, status, joined_at, ended_at, created_at')
      .eq('office_id', office.id)
      .order('status', { ascending: true })
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Office members GET error:', error);
      return NextResponse.json({ error: 'Unable to load members.' }, { status: 500 });
    }

    const authorIds = (members ?? []).map((m) => m.author_id);

    const { data: authors } = await supabase
      .from('authors')
      .select('id, name, email, designation, photo_url')
      .in('id', authorIds);

    const authorMap = new Map<
      string,
      {
        name: string;
        email: string | null;
        designation: string | null;
        photo_url: string | null;
      }
    >();
    for (const a of authors ?? []) {
      authorMap.set(a.id, {
        name: a.name,
        email: a.email,
        designation: a.designation,
        photo_url: a.photo_url,
      });
    }

    const enriched = (members ?? []).map((m) => ({
      ...m,
      author: authorMap.get(m.author_id) ?? null,
    }));

    return NextResponse.json({ success: true, members: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load members.';
    console.error('Office members GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PostBody {
  office_slug?: string;
  author_id?: string;
  role?: string;
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
    const authorId = body.author_id?.trim();
    const role = body.role?.trim();

    if (!officeSlug || !authorId || !role) {
      return NextResponse.json(
        { error: 'office_slug, author_id, and role are required.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `role must be one of: ${ALLOWED_ROLES.join(', ')}.` },
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

    const { data: author, error: authorError } = await supabase
      .from('authors')
      .select('id, name')
      .eq('id', authorId)
      .maybeSingle();

    if (authorError || !author) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 });
    }

    const { data: created, error: createError } = await supabase
      .from('office_members')
      .insert({
        office_id: office.id,
        author_id: author.id,
        role,
        status: 'ACTIVE',
        added_by: auth.identity.id,
      })
      .select('id, office_id, author_id, role, status, joined_at, created_at')
      .single();

    if (createError) {
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'This person is already an active member of this office.' },
          { status: 409 }
        );
      }
      console.error('Office member POST error:', createError);
      return NextResponse.json({ error: 'Unable to add member.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: created.office_id,
      event_type: 'MEMBER_ADDED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_members',
      target_id: created.id,
      summary: `Member added with role ${created.role}`,
      payload: { author_id: created.author_id, role: created.role },
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true, member: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to add member.';
    console.error('Office member POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PatchBody {
  id?: string;
  role?: string;
  status?: 'ACTIVE' | 'ENDED' | 'SUSPENDED';
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

    const id = body.id?.trim();
    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.role !== undefined) {
      if (!ALLOWED_ROLES.includes(body.role)) {
        return NextResponse.json(
          { error: `role must be one of: ${ALLOWED_ROLES.join(', ')}.` },
          { status: 400 }
        );
      }
      patch.role = body.role;
    }

    if (body.status !== undefined) {
      patch.status = body.status;
      if (body.status === 'ENDED') {
        patch.ended_at = new Date().toISOString();
      }
    }

    const supabase = getServiceClient();

    const { data: updated, error } = await supabase
      .from('office_members')
      .update(patch)
      .eq('id', id)
      .select('id, office_id, author_id, role, status, joined_at, ended_at')
      .single();

    if (error) {
      console.error('Office member PATCH error:', error);
      return NextResponse.json({ error: 'Unable to update member.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: updated.office_id,
      event_type: 'MEMBER_UPDATED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_members',
      target_id: updated.id,
      summary: `Member updated`,
      payload: { changed_fields: Object.keys(patch) },
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update member.';
    console.error('Office member PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

    const { data: existing } = await supabase
      .from('office_members')
      .select('office_id, author_id')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('office_members')
      .update({
        status: 'ENDED',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Office member DELETE error:', error);
      return NextResponse.json({ error: 'Unable to remove member.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: existing?.office_id ?? null,
      event_type: 'MEMBER_REMOVED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_members',
      target_id: id,
      summary: `Member ${id} removed`,
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to remove member.';
    console.error('Office member DELETE exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}