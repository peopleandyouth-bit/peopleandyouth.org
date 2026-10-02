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

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = getServiceClient();

    const [{ data: roles }, { data: divisions }] = await Promise.all([
      supabase
        .from('career_role_division_map')
        .select('id, role_title, division_id, display_order, notes, updated_at')
        .order('display_order', { ascending: true }),
      supabase
        .from('campus_divisions')
        .select('id, slug, name, icon')
        .order('display_order', { ascending: true }),
    ]);

    return NextResponse.json({
      success: true,
      roles: roles ?? [],
      divisions: divisions ?? [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load mapping.';
    console.error('Admin role map GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PatchBody {
  id?: string;
  division_id?: string;
  notes?: string | null;
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

    if (body.division_id !== undefined) patch.division_id = body.division_id;
    if (body.notes !== undefined) patch.notes = body.notes;
    if (body.display_order !== undefined) patch.display_order = body.display_order;

    const supabase = getServiceClient();

    const { data: updated, error } = await supabase
      .from('career_role_division_map')
      .update(patch)
      .eq('id', id)
      .select('id, role_title, division_id, display_order, notes, updated_at')
      .single();

    if (error) {
      console.error('Admin role map PATCH error:', error);
      return NextResponse.json({ error: 'Unable to update mapping.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, role: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update mapping.';
    console.error('Admin role map PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}