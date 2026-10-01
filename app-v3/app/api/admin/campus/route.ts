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

const ALLOWED_STATUS = ['PUBLISHED', 'DRAFT', 'ARCHIVED'];

// ---------------------------------------------------------------------------
// GET — admin view of all zones/buildings/divisions (including DRAFT)
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = getServiceClient();

    const [
      { data: zones },
      { data: buildings },
      { data: divisions },
      { data: offices },
    ] = await Promise.all([
      supabase.from('campus_zones').select('*').order('display_order'),
      supabase.from('campus_buildings').select('*').order('display_order'),
      supabase.from('campus_divisions').select('*').order('display_order'),
      supabase
        .from('offices')
        .select('id, slug, name, level, office_number, status, division_id, display_order')
        .order('display_order'),
    ]);

    return NextResponse.json({
      success: true,
      zones: zones ?? [],
      buildings: buildings ?? [],
      divisions: divisions ?? [],
      offices: offices ?? [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load campus.';
    console.error('Admin campus GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — update a zone, building, or division
// Body: { entity: 'zone' | 'building' | 'division', id, ...fields }
// ---------------------------------------------------------------------------

interface PatchBody {
  entity?: 'zone' | 'building' | 'division';
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  icon?: string | null;
  status?: string;
  display_order?: number;
  zone_id?: string | null;
  building_id?: string | null;
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

    const entity = body.entity;
    const id = body.id?.trim();

    if (!entity || !['zone', 'building', 'division'].includes(entity)) {
      return NextResponse.json({ error: 'entity must be zone, building, or division.' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    if (body.status && !ALLOWED_STATUS.includes(body.status)) {
      return NextResponse.json({ error: `status must be one of ${ALLOWED_STATUS.join(', ')}.` }, { status: 400 });
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) patch.name = body.name;
    if (body.slug !== undefined) patch.slug = body.slug;
    if (body.description !== undefined) patch.description = body.description;
    if (body.image_url !== undefined) patch.image_url = body.image_url;
    if (body.status !== undefined) patch.status = body.status;
    if (body.display_order !== undefined) patch.display_order = body.display_order;

    if (entity === 'building' && body.zone_id !== undefined) {
      patch.zone_id = body.zone_id;
    }
    if (entity === 'division') {
      if (body.building_id !== undefined) patch.building_id = body.building_id;
      if (body.icon !== undefined) patch.icon = body.icon;
    }

    const supabase = getServiceClient();
    const table =
      entity === 'zone' ? 'campus_zones' : entity === 'building' ? 'campus_buildings' : 'campus_divisions';

    const { data: updated, error } = await supabase
      .from(table)
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Campus PATCH error:', error);
      return NextResponse.json({ error: 'Unable to update.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entity: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update.';
    console.error('Campus PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — assign an office to a division (or unassign)
// Body: { office_slug, division_id | null }
// ---------------------------------------------------------------------------

interface AssignBody {
  office_slug?: string;
  division_id?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let body: AssignBody;
    try {
      body = (await request.json()) as AssignBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const officeSlug = body.office_slug?.trim();
    const divisionId = body.division_id;

    if (!officeSlug) {
      return NextResponse.json({ error: 'office_slug is required.' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: updated, error } = await supabase
      .from('offices')
      .update({ division_id: divisionId ?? null, updated_at: new Date().toISOString() })
      .eq('slug', officeSlug)
      .select('id, slug, name, division_id')
      .single();

    if (error) {
      console.error('Campus office assign error:', error);
      return NextResponse.json({ error: 'Unable to assign office.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, office: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to assign office.';
    console.error('Campus office assign exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}