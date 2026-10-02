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

const ALLOWED_STATUS = ['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];
const ALLOWED_VISIBILITY = ['PUBLIC', 'INTERNAL', 'RESTRICTED'];

// ---------------------------------------------------------------------------
// GET — list projects for an office
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
      .select('id')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('office_projects')
      .select(
        'id, office_id, title, description, status, owner_office_id, collaborators, visibility, started_at, completed_at, display_order, created_at, updated_at'
      )
      .eq('office_id', office.id)
      .order('status', { ascending: true })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Projects GET error:', error);
      return NextResponse.json({ error: 'Unable to load projects.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, projects: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load projects.';
    console.error('Projects GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a project
// Body: { office_slug, title, description?, status?, collaborators?,
//         visibility?, started_at?, display_order? }
// ---------------------------------------------------------------------------

interface PostBody {
  office_slug?: string;
  title?: string;
  description?: string;
  status?: string;
  collaborators?: string[];
  visibility?: string;
  started_at?: string;
  display_order?: number;
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
    const title = body.title?.trim();

    if (!officeSlug || !title) {
      return NextResponse.json(
        { error: 'office_slug and title are required.' },
        { status: 400 }
      );
    }

    const status = body.status ?? 'ACTIVE';
    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${ALLOWED_STATUS.join(', ')}.` },
        { status: 400 }
      );
    }

    const visibility = body.visibility ?? 'PUBLIC';
    if (!ALLOWED_VISIBILITY.includes(visibility)) {
      return NextResponse.json(
        { error: `visibility must be one of: ${ALLOWED_VISIBILITY.join(', ')}.` },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: office, error: officeError } = await supabase
      .from('offices')
      .select('id, name')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    const { data: created, error: createError } = await supabase
      .from('office_projects')
      .insert({
        office_id: office.id,
        owner_office_id: office.id,
        title,
        description: body.description?.trim() || null,
        status,
        collaborators: body.collaborators ?? [],
        visibility,
        started_at: body.started_at || new Date().toISOString(),
        display_order: body.display_order ?? 100,
      })
      .select('*')
      .single();

    if (createError || !created) {
      console.error('Project POST error:', createError);
      return NextResponse.json({ error: 'Unable to create project.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: office.id,
      event_type: 'CONTENT_CREATED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_projects',
      target_id: created.id,
      summary: `Project "${title}" created (${status})`,
      payload: { status, visibility },
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true, project: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to create project.';
    console.error('Projects POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update a project
// Body: { id, title?, description?, status?, collaborators?, visibility?,
//         started_at?, completed_at?, display_order? }
// ---------------------------------------------------------------------------

interface PatchBody {
  id?: string;
  title?: string;
  description?: string | null;
  status?: string;
  collaborators?: string[];
  visibility?: string;
  started_at?: string | null;
  completed_at?: string | null;
  display_order?: number;
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

    if (body.title !== undefined) patch.title = body.title;
    if (body.description !== undefined) patch.description = body.description;
    if (body.collaborators !== undefined) patch.collaborators = body.collaborators;
    if (body.visibility !== undefined) {
      if (!ALLOWED_VISIBILITY.includes(body.visibility)) {
        return NextResponse.json({ error: 'Invalid visibility.' }, { status: 400 });
      }
      patch.visibility = body.visibility;
    }
    if (body.started_at !== undefined) patch.started_at = body.started_at;
    if (body.display_order !== undefined) patch.display_order = body.display_order;

    if (body.status !== undefined) {
      if (!ALLOWED_STATUS.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
      }
      patch.status = body.status;

      if (body.status === 'COMPLETED' && !body.completed_at) {
        patch.completed_at = new Date().toISOString();
      } else if (body.completed_at !== undefined) {
        patch.completed_at = body.completed_at;
      }
    }

    const supabase = getServiceClient();

    const { data: updated, error } = await supabase
      .from('office_projects')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Project PATCH error:', error);
      return NextResponse.json({ error: 'Unable to update project.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: updated.office_id,
      event_type: 'CONTENT_UPDATED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_projects',
      target_id: updated.id,
      summary: `Project "${updated.title}" updated`,
      payload: { changed_fields: Object.keys(patch) },
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update project.';
    console.error('Projects PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — remove a project
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

    const { data: existing } = await supabase
      .from('office_projects')
      .select('office_id, title')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('office_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Project DELETE error:', error);
      return NextResponse.json({ error: 'Unable to delete project.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: existing?.office_id ?? null,
      event_type: 'CONTENT_DELETED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_projects',
      target_id: id,
      summary: `Project "${existing?.title ?? id}" deleted`,
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to delete project.';
    console.error('Projects DELETE exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}