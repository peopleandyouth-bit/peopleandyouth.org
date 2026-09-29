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

const ALLOWED_TYPES = [
  'NOTE',
  'ARTICLE',
  'ESSAY',
  'PROPOSAL',
  'SPEECH',
  'LETTER',
  'STATEMENT',
];

const ALLOWED_VISIBILITY = ['PUBLIC', 'INTERNAL', 'RESTRICTED'];
const ALLOWED_STATUS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

// ---------------------------------------------------------------------------
// GET — list content for an office (admin view, includes drafts)
//
// ?office_slug=<slug>          → all content (drafts + published) for the office
// ?office_slug=<slug>&type=NOTE → filter by type
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const officeSlug = searchParams.get('office_slug')?.trim();
    const type = searchParams.get('type')?.trim();

    if (!officeSlug) {
      return NextResponse.json(
        { error: 'office_slug is required.' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: office, error: officeError } = await supabase
      .from('offices')
      .select('id, slug')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json(
        { error: 'Office not found.' },
        { status: 404 }
      );
    }

    let query = supabase
      .from('office_content')
      .select(
        'id, office_id, author_id, type, title, subtitle, body, excerpt, cover_image_url, tags, visibility, status, published_at, display_order, created_at, updated_at'
      )
      .eq('office_id', office.id)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (type && ALLOWED_TYPES.includes(type)) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Office content GET error:', error);
      return NextResponse.json(
        { error: 'Unable to load content.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, content: data ?? [] });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to load content.';
    console.error('Office content GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create content for an office.
//
// Body: {
//   office_slug: string,
//   type: 'NOTE' | 'ARTICLE' | ... ,
//   title?: string,
//   subtitle?: string,
//   body: string,
//   excerpt?: string,
//   cover_image_url?: string,
//   tags?: string[],
//   visibility?: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED',
//   status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
// }
// ---------------------------------------------------------------------------

interface PostBody {
  office_slug?: string;
  type?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  excerpt?: string;
  cover_image_url?: string;
  tags?: string[];
  visibility?: string;
  status?: string;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    let body: PostBody;
    try {
      body = (await request.json()) as PostBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const officeSlug = body.office_slug?.trim();
    const type = body.type?.trim();
    const contentBody = body.body?.trim();

    if (!officeSlug || !type || !contentBody) {
      return NextResponse.json(
        { error: 'office_slug, type, and body are required.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Unknown type: ${type}.` },
        { status: 400 }
      );
    }

    const visibility = body.visibility ?? 'PUBLIC';
    if (!ALLOWED_VISIBILITY.includes(visibility)) {
      return NextResponse.json(
        { error: `Unknown visibility: ${visibility}.` },
        { status: 400 }
      );
    }

    const status = body.status ?? 'PUBLISHED';
    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        { error: `Unknown status: ${status}.` },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: office, error: officeError } = await supabase
      .from('offices')
      .select('id, slug')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json(
        { error: 'Office not found.' },
        { status: 404 }
      );
    }

    // For NOTE type, title is optional; for others it's useful but not required.
    const publishedAt =
      status === 'PUBLISHED' ? new Date().toISOString() : null;

    const { data: created, error: createError } = await supabase
      .from('office_content')
      .insert({
        office_id: office.id,
        author_id: auth.user.id ? null : null, // author of content is set on publish via Office Desk if needed
        type,
        title: body.title ?? null,
        subtitle: body.subtitle ?? null,
        body: contentBody,
        excerpt: body.excerpt ?? null,
        cover_image_url: body.cover_image_url ?? null,
        tags: body.tags ?? [],
        visibility,
        status,
        published_at: publishedAt,
      })
      .select(
        'id, office_id, type, title, subtitle, body, excerpt, cover_image_url, tags, visibility, status, published_at, created_at'
      )
      .single();

    if (createError) {
      console.error('Office content POST error:', createError);
      return NextResponse.json(
        { error: createError.message || 'Unable to create content.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, content: created });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to create content.';
    console.error('Office content POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update existing content
//
// Body: { id, ...same fields as POST except office_slug }
// ---------------------------------------------------------------------------

interface PatchContentBody extends PostBody {
  id?: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    let body: PatchContentBody;
    try {
      body = (await request.json()) as PatchContentBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const id = body.id?.trim();
    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    if (body.type && !ALLOWED_TYPES.includes(body.type)) {
      return NextResponse.json(
        { error: `Unknown type: ${body.type}.` },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.type !== undefined) patch.type = body.type;
    if (body.title !== undefined) patch.title = body.title;
    if (body.subtitle !== undefined) patch.subtitle = body.subtitle;
    if (body.body !== undefined) patch.body = body.body;
    if (body.excerpt !== undefined) patch.excerpt = body.excerpt;
    if (body.cover_image_url !== undefined)
      patch.cover_image_url = body.cover_image_url;
    if (body.tags !== undefined) patch.tags = body.tags;
    if (body.visibility !== undefined) patch.visibility = body.visibility;
    if (body.status !== undefined) {
      patch.status = body.status;
      if (body.status === 'PUBLISHED') {
        patch.published_at = new Date().toISOString();
      }
    }

    const supabase = getServiceClient();

    const { data: updated, error } = await supabase
      .from('office_content')
      .update(patch)
      .eq('id', id)
      .select(
        'id, office_id, type, title, subtitle, body, excerpt, cover_image_url, tags, visibility, status, published_at, updated_at'
      )
      .single();

    if (error) {
      console.error('Office content PATCH error:', error);
      return NextResponse.json(
        { error: 'Unable to update content.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, content: updated });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to update content.';
    console.error('Office content PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — remove content by id
//
// ?id=<uuid>
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim();

    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { error } = await supabase
      .from('office_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Office content DELETE error:', error);
      return NextResponse.json(
        { error: 'Unable to delete content.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to delete content.';
    console.error('Office content DELETE exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}