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

const ALLOWED_STATUS = ['WORKING_PAPER', 'UNDER_REVIEW', 'PUBLISHED', 'ARCHIVED'];
const ALLOWED_CLASSIFICATION = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];

// ---------------------------------------------------------------------------
// GET — list research for an office
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

    const { data: office } = await supabase
      .from('offices')
      .select('id')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (!office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('office_research')
      .select(
        'id, office_id, title, abstract, authors, keywords, category, document_url, cover_image_url, pages, doi, status, classification, version, supersedes_id, published_at, archived_at, display_order, created_at, updated_at'
      )
      .eq('office_id', office.id)
      .order('status', { ascending: true })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Research GET error:', error);
      return NextResponse.json({ error: 'Unable to load research.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, research: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load research.';
    console.error('Research GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create research entry
// Body: { office_slug, title, abstract?, authors?, keywords?, category?,
//         document_url?, pages?, doi?, status?, classification?, version? }
// ---------------------------------------------------------------------------

interface PostBody {
  office_slug?: string;
  title?: string;
  abstract?: string;
  authors?: string[];
  keywords?: string[];
  category?: string;
  document_url?: string;
  cover_image_url?: string;
  pages?: number;
  doi?: string;
  status?: string;
  classification?: string;
  version?: string;
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

    const status = body.status ?? 'WORKING_PAPER';
    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const classification = body.classification ?? 'PUBLIC';
    if (!ALLOWED_CLASSIFICATION.includes(classification)) {
      return NextResponse.json({ error: 'Invalid classification.' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: office } = await supabase
      .from('offices')
      .select('id, name')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (!office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    const { data: created, error: createError } = await supabase
      .from('office_research')
      .insert({
        office_id: office.id,
        title,
        abstract: body.abstract?.trim() || null,
        authors: Array.isArray(body.authors) ? body.authors : [],
        keywords: Array.isArray(body.keywords) ? body.keywords : [],
        category: body.category?.trim() || null,
        document_url: body.document_url?.trim() || null,
        cover_image_url: body.cover_image_url?.trim() || null,
        pages: typeof body.pages === 'number' ? body.pages : null,
        doi: body.doi?.trim() || null,
        status,
        classification,
        version: body.version?.trim() || '1.0',
        published_at: status === 'PUBLISHED' ? new Date().toISOString() : null,
        created_by: auth.identity.id,
      })
      .select('*')
      .single();

    if (createError || !created) {
      console.error('Research POST error:', createError);
      return NextResponse.json({ error: 'Unable to create research entry.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: office.id,
      event_type: 'CONTENT_CREATED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_research',
      target_id: created.id,
      summary: `Research "${title}" created (${status}, ${classification})`,
      payload: { status, classification, version: created.version },
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true, research: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to create research.';
    console.error('Research POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update research entry
// ---------------------------------------------------------------------------

interface PatchBody {
  id?: string;
  title?: string;
  abstract?: string | null;
  authors?: string[];
  keywords?: string[];
  category?: string | null;
  document_url?: string | null;
  cover_image_url?: string | null;
  pages?: number | null;
  doi?: string | null;
  status?: string;
  classification?: string;
  version?: string;
  display_order?: number;
  supersedes_id?: string | null;
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
    if (body.abstract !== undefined) patch.abstract = body.abstract;
    if (body.authors !== undefined) patch.authors = body.authors;
    if (body.keywords !== undefined) patch.keywords = body.keywords;
    if (body.category !== undefined) patch.category = body.category;
    if (body.document_url !== undefined) patch.document_url = body.document_url;
    if (body.cover_image_url !== undefined) patch.cover_image_url = body.cover_image_url;
    if (body.pages !== undefined) patch.pages = body.pages;
    if (body.doi !== undefined) patch.doi = body.doi;
    if (body.version !== undefined) patch.version = body.version;
    if (body.display_order !== undefined) patch.display_order = body.display_order;
    if (body.supersedes_id !== undefined) patch.supersedes_id = body.supersedes_id;

    if (body.classification !== undefined) {
      if (!ALLOWED_CLASSIFICATION.includes(body.classification)) {
        return NextResponse.json({ error: 'Invalid classification.' }, { status: 400 });
      }
      patch.classification = body.classification;
    }

    if (body.status !== undefined) {
      if (!ALLOWED_STATUS.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
      }
      patch.status = body.status;

      if (body.status === 'PUBLISHED') {
        patch.published_at = new Date().toISOString();
      } else if (body.status === 'ARCHIVED') {
        patch.archived_at = new Date().toISOString();
      }
    }

    const supabase = getServiceClient();

    const { data: updated, error } = await supabase
      .from('office_research')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Research PATCH error:', error);
      return NextResponse.json({ error: 'Unable to update research.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: updated.office_id,
      event_type: 'CONTENT_UPDATED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_research',
      target_id: updated.id,
      summary: `Research "${updated.title}" updated`,
      payload: { changed_fields: Object.keys(patch) },
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true, research: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update research.';
    console.error('Research PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — remove research entry
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
      .from('office_research')
      .select('office_id, title')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('office_research')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Research DELETE error:', error);
      return NextResponse.json({ error: 'Unable to delete research.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: existing?.office_id ?? null,
      event_type: 'CONTENT_DELETED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_research',
      target_id: id,
      summary: `Research "${existing?.title ?? id}" deleted`,
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to delete research.';
    console.error('Research DELETE exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}