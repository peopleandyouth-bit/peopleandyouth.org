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

const ALLOWED_TYPES = ['BOOK', 'PAPER', 'REPORT', 'DOCUMENT', 'RESOURCE', 'READING_LIST'];
const ALLOWED_CLASSIFICATIONS = ['PUBLIC', 'INTERNAL', 'PRIVATE'];

// ---------------------------------------------------------------------------
// GET — list library items for an office
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
      .from('office_library')
      .select(
        'id, office_id, title, author, publisher, year, isbn, description, cover_image_url, item_type, external_url, document_url, category, recommendation_note, classification, featured, display_order, created_at, updated_at'
      )
      .eq('office_id', office.id)
      .order('featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Library GET error:', error);
      return NextResponse.json({ error: 'Unable to load library.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, library: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load library.';
    console.error('Library GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create library item
// ---------------------------------------------------------------------------

interface PostBody {
  office_slug?: string;
  title?: string;
  author?: string;
  publisher?: string;
  year?: number;
  isbn?: string;
  description?: string;
  cover_image_url?: string;
  item_type?: string;
  external_url?: string;
  document_url?: string;
  category?: string;
  recommendation_note?: string;
  classification?: string;
  featured?: boolean;
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

    const itemType = body.item_type ?? 'BOOK';
    if (!ALLOWED_TYPES.includes(itemType)) {
      return NextResponse.json({ error: 'Invalid item_type.' }, { status: 400 });
    }

    const classification = body.classification ?? 'PUBLIC';
    if (!ALLOWED_CLASSIFICATIONS.includes(classification)) {
      return NextResponse.json({ error: 'Invalid classification.' }, { status: 400 });
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

    const { data: created, error: createError } = await supabase
      .from('office_library')
      .insert({
        office_id: office.id,
        title,
        author: body.author?.trim() || null,
        publisher: body.publisher?.trim() || null,
        year: typeof body.year === 'number' ? body.year : null,
        isbn: body.isbn?.trim() || null,
        description: body.description?.trim() || null,
        cover_image_url: body.cover_image_url?.trim() || null,
        item_type: itemType,
        external_url: body.external_url?.trim() || null,
        document_url: body.document_url?.trim() || null,
        category: body.category?.trim() || null,
        recommendation_note: body.recommendation_note?.trim() || null,
        classification,
        featured: body.featured ?? false,
        display_order: body.display_order ?? 100,
        created_by: auth.identity.id,
      })
      .select('*')
      .single();

    if (createError || !created) {
      console.error('Library POST error:', createError);
      return NextResponse.json({ error: 'Unable to create library item.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: office.id,
      event_type: 'CONTENT_CREATED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_library',
      target_id: created.id,
      summary: `Library item "${title}" created (${itemType}, ${classification})`,
      payload: { item_type: itemType, classification },
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true, library: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to create library item.';
    console.error('Library POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update library item
// ---------------------------------------------------------------------------

interface PatchBody {
  id?: string;
  title?: string;
  author?: string | null;
  publisher?: string | null;
  year?: number | null;
  isbn?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  item_type?: string;
  external_url?: string | null;
  document_url?: string | null;
  category?: string | null;
  recommendation_note?: string | null;
  classification?: string;
  featured?: boolean;
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
    if (body.author !== undefined) patch.author = body.author;
    if (body.publisher !== undefined) patch.publisher = body.publisher;
    if (body.year !== undefined) patch.year = body.year;
    if (body.isbn !== undefined) patch.isbn = body.isbn;
    if (body.description !== undefined) patch.description = body.description;
    if (body.cover_image_url !== undefined) patch.cover_image_url = body.cover_image_url;
    if (body.external_url !== undefined) patch.external_url = body.external_url;
    if (body.document_url !== undefined) patch.document_url = body.document_url;
    if (body.category !== undefined) patch.category = body.category;
    if (body.recommendation_note !== undefined) patch.recommendation_note = body.recommendation_note;
    if (body.featured !== undefined) patch.featured = body.featured;
    if (body.display_order !== undefined) patch.display_order = body.display_order;

    if (body.item_type !== undefined) {
      if (!ALLOWED_TYPES.includes(body.item_type)) {
        return NextResponse.json({ error: 'Invalid item_type.' }, { status: 400 });
      }
      patch.item_type = body.item_type;
    }

    if (body.classification !== undefined) {
      if (!ALLOWED_CLASSIFICATIONS.includes(body.classification)) {
        return NextResponse.json({ error: 'Invalid classification.' }, { status: 400 });
      }
      patch.classification = body.classification;
    }

    const supabase = getServiceClient();

    const { data: updated, error } = await supabase
      .from('office_library')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Library PATCH error:', error);
      return NextResponse.json({ error: 'Unable to update library item.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: updated.office_id,
      event_type: 'CONTENT_UPDATED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_library',
      target_id: updated.id,
      summary: `Library item "${updated.title}" updated`,
      payload: { changed_fields: Object.keys(patch) },
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true, library: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update library item.';
    console.error('Library PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — remove library item
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
      .from('office_library')
      .select('office_id, title')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('office_library')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Library DELETE error:', error);
      return NextResponse.json({ error: 'Unable to delete library item.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: existing?.office_id ?? null,
      event_type: 'CONTENT_DELETED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office_library',
      target_id: id,
      summary: `Library item "${existing?.title ?? id}" deleted`,
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to delete library item.';
    console.error('Library DELETE exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}