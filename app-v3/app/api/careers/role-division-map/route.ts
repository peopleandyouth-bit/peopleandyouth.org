import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
// GET /api/careers/role-division-map
// Returns the full mapping: role_title -> { division_id, division_slug,
// division_name, display_order }.
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('career_role_division_map')
      .select(
        'role_title, display_order, division:campus_divisions(id, slug, name, icon)'
      )
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Role-division map GET error:', error);
      return NextResponse.json({ error: 'Unable to load mapping.' }, { status: 500 });
    }

    const rows = (data ?? []).map((r) => {
      const div = Array.isArray(r.division) ? r.division[0] : r.division;
      return {
        role_title: r.role_title,
        display_order: r.display_order,
        division_id: div?.id ?? null,
        division_slug: div?.slug ?? null,
        division_name: div?.name ?? null,
        division_icon: div?.icon ?? null,
      };
    });

    return NextResponse.json({ success: true, roles: rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load mapping.';
    console.error('Role-division map exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}