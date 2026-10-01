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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug')?.trim();
    const id = searchParams.get('id')?.trim();

    const supabase = getServiceClient();

    if (slug || id) {
      let officeQuery = supabase
        .from('offices')
        .select(
          'id, slug, name, level, office_number, mandate, responsibilities, facilities, tagline, hero_quote, hero_image_url, emblem_url, theme_slug, status, display_order, created_at, updated_at'
        );

      if (slug) officeQuery = officeQuery.eq('slug', slug);
      if (id) officeQuery = officeQuery.eq('id', id);

      const { data: office, error: officeError } = await officeQuery.maybeSingle();

      if (officeError) {
        console.error('Office GET error:', officeError);
        return NextResponse.json({ error: 'Unable to load office.' }, { status: 500 });
      }

      if (!office) {
        return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
      }

      const { data: assignment } = await supabase
        .from('office_assignments')
        .select(
          'id, title, subtitle, mandate_statement, status, started_at, ended_at, display_order, author_id'
        )
        .eq('office_id', office.id)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      let author: Record<string, unknown> | null = null;
      if (assignment?.author_id) {
        const { data: authorRow } = await supabase
          .from('authors')
          .select(
            'id, name, slug, email, photo_url, bio, short_bio, long_bio, headline, designation, organization, department, office, expertise, interests, languages, professional_experience, linkedin_url, website_url, institutional_affiliation, academic_credentials, is_leadership, display_order'
          )
          .eq('id', assignment.author_id)
          .maybeSingle();

        author = authorRow ?? null;
      }

      const { data: content } = await supabase
        .from('office_content')
        .select(
          'id, type, title, subtitle, body, excerpt, cover_image_url, tags, visibility, status, published_at, display_order'
        )
        .eq('office_id', office.id)
        .eq('visibility', 'PUBLIC')
        .eq('status', 'PUBLISHED')
        .order('published_at', { ascending: false });

      return NextResponse.json({
        success: true,
        office,
        assignment: assignment ?? null,
        author,
        content: content ?? [],
      });
    }

    const { data: offices, error: listError } = await supabase
      .from('offices')
      .select(
        'id, slug, name, level, office_number, mandate, facilities, tagline, theme_slug, status, display_order'
      )
      .order('display_order', { ascending: true });

    if (listError) {
      console.error('Office list error:', listError);
      return NextResponse.json({ error: 'Unable to list offices.' }, { status: 500 });
    }

    const officeIds = (offices ?? []).map((o) => o.id);

    const { data: assignments } = await supabase
      .from('office_assignments')
      .select('office_id, title, subtitle, author_id')
      .in('office_id', officeIds)
      .eq('status', 'ACTIVE');

    const authorIds = (assignments ?? [])
      .map((a) => a.author_id)
      .filter((v): v is string => !!v);

    const { data: authors } = await supabase
      .from('authors')
      .select('id, name, photo_url, designation')
      .in('id', authorIds);

    const authorMap = new Map<
      string,
      { name: string; photo_url: string | null; designation: string | null }
    >();
    for (const a of authors ?? []) {
      authorMap.set(a.id, {
        name: a.name,
        photo_url: a.photo_url,
        designation: a.designation,
      });
    }

    const assignmentMap = new Map<
      string,
      {
        title: string;
        subtitle: string | null;
        author: { name: string; photo_url: string | null; designation: string | null } | null;
      }
    >();
    for (const a of assignments ?? []) {
      const author = a.author_id ? authorMap.get(a.author_id) ?? null : null;
      assignmentMap.set(a.office_id, {
        title: a.title,
        subtitle: a.subtitle,
        author,
      });
    }

    const enriched = (offices ?? []).map((o) => ({
      ...o,
      assignment: assignmentMap.get(o.id) ?? null,
    }));

    return NextResponse.json({ success: true, offices: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load offices.';
    console.error('Office GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PatchBody {
  slug?: string;
  name?: string;
  mandate?: string;
  responsibilities?: string[];
  facilities?: string[];
  tagline?: string;
  hero_quote?: string;
  hero_image_url?: string;
  emblem_url?: string;
  theme_slug?: string;
  status?: 'ACTIVE' | 'VACANT' | 'ON_LEAVE' | 'ARCHIVED';
}

const ALLOWED_THEMES = [
  'institutional-ink',
  'founders-gold',
  'civic-emerald',
  'constitutional-navy',
  'archive-parchment',
  'research-slate',
  'editorial-violet',
  'technology-cyan',
  'policy-maroon',
  'heritage-cream',
];

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

    const slug = body.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: 'slug is required.' }, { status: 400 });
    }

    if (body.theme_slug && !ALLOWED_THEMES.includes(body.theme_slug)) {
      return NextResponse.json(
        { error: `Unknown theme: ${body.theme_slug}.` },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) patch.name = body.name;
    if (body.mandate !== undefined) patch.mandate = body.mandate;
    if (body.responsibilities !== undefined) patch.responsibilities = body.responsibilities;
    if (body.facilities !== undefined) patch.facilities = body.facilities;
    if (body.tagline !== undefined) patch.tagline = body.tagline;
    if (body.hero_quote !== undefined) patch.hero_quote = body.hero_quote;
    if (body.hero_image_url !== undefined) patch.hero_image_url = body.hero_image_url;
    if (body.emblem_url !== undefined) patch.emblem_url = body.emblem_url;
    if (body.theme_slug !== undefined) patch.theme_slug = body.theme_slug;
    if (body.status !== undefined) patch.status = body.status;

    const supabase = getServiceClient();

    const { data: updated, error: updateError } = await supabase
      .from('offices')
      .update(patch)
      .eq('slug', slug)
      .select(
        'id, slug, name, level, office_number, mandate, responsibilities, facilities, tagline, hero_quote, hero_image_url, emblem_url, theme_slug, status, display_order, updated_at'
      )
      .single();

    if (updateError) {
      console.error('Office PATCH error:', updateError);
      return NextResponse.json({ error: 'Unable to update office.' }, { status: 500 });
    }

    const meta = extractRequestMeta(request);
    await logAuditEvent({
      office_id: updated.id,
      event_type: 'OFFICE_UPDATED',
      actor_user_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: auth.identity?.role ?? null,
      target_type: 'office',
      target_id: updated.id,
      summary: `Office "${updated.name}" updated`,
      payload: { changed_fields: Object.keys(patch) },
      ip: meta.ip,
      user_agent: meta.user_agent,
    });

    return NextResponse.json({ success: true, office: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update office.';
    console.error('Office PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PostBody {
  slug?: string;
  name?: string;
  level?: 'LEADERSHIP' | 'EXECUTIVE' | 'COUNCIL' | 'GLOBAL' | 'INFRASTRUCTURE';
  office_number?: string;
  mandate?: string;
  facilities?: string[];
  tagline?: string;
  display_order?: number;
}

const ALLOWED_LEVELS = ['LEADERSHIP', 'EXECUTIVE', 'COUNCIL', 'GLOBAL', 'INFRASTRUCTURE'];

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

    const slug = body.slug?.trim();
    const name = body.name?.trim();
    const level = body.level;

    if (!slug || !name || !level) {
      return NextResponse.json(
        { error: 'slug, name, and level are required.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_LEVELS.includes(level)) {
      return NextResponse.json({ error: `Unknown level: ${level}.` }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: created, error: createError } = await supabase
      .from('offices')
      .insert({
        slug,
        name,
        level,
        office_number: body.office_number ?? null,
        mandate: body.mandate ?? null,
        facilities: body.facilities ?? [],
        tagline: body.tagline ?? null,
        status: 'VACANT',
        display_order: body.display_order ?? 100,
      })
      .select(
        'id, slug, name, level, office_number, mandate, facilities, tagline, theme_slug, status, display_order, created_at'
      )
      .single();

    if (createError) {
      console.error('Office POST error:', createError);
      return NextResponse.json(
        { error: createError.message || 'Unable to create office.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, office: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to create office.';
    console.error('Office POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}