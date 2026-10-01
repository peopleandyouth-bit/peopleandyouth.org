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
// GET — the full published campus hierarchy
//
// Returns:
//   zones[]         — each with buildings[] — each with divisions[]
//                     divisions[] also at top level for office mapping
//   unassigned      — offices without a division
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = getServiceClient();

    // Load all published zones, buildings, divisions, and offices
    const [
      { data: zones, error: zonesErr },
      { data: buildings, error: bldErr },
      { data: divisions, error: divErr },
      { data: offices, error: offErr },
    ] = await Promise.all([
      supabase
        .from('campus_zones')
        .select('id, slug, name, description, image_url, status, display_order')
        .eq('status', 'PUBLISHED')
        .order('display_order'),
      supabase
        .from('campus_buildings')
        .select('id, zone_id, slug, name, description, image_url, status, display_order')
        .eq('status', 'PUBLISHED')
        .order('display_order'),
      supabase
        .from('campus_divisions')
        .select('id, building_id, slug, name, description, icon, status, display_order')
        .eq('status', 'PUBLISHED')
        .order('display_order'),
      supabase
        .from('offices')
        .select('id, slug, name, level, office_number, status, division_id, theme_slug, display_order')
        .order('display_order'),
    ]);

    if (zonesErr || bldErr || divErr || offErr) {
      console.error('Campus GET error:', zonesErr || bldErr || divErr || offErr);
      return NextResponse.json({ error: 'Unable to load campus.' }, { status: 500 });
    }

    // Attach offices to divisions
    const officesByDivision = new Map<string, typeof offices>();
    const unassigned: typeof offices = [];

    for (const o of offices ?? []) {
      if (o.division_id) {
        const list = officesByDivision.get(o.division_id) ?? [];
        list.push(o);
        officesByDivision.set(o.division_id, list);
      } else {
        unassigned.push(o);
      }
    }

    // Attach divisions to buildings
    const divisionsByBuilding = new Map<string, typeof divisions>();
    const orphanDivisions: typeof divisions = [];

    for (const d of divisions ?? []) {
      const enriched = { ...d, offices: officesByDivision.get(d.id) ?? [] };

      if (d.building_id) {
        const list = divisionsByBuilding.get(d.building_id) ?? [];
        list.push(enriched);
        divisionsByBuilding.set(d.building_id, list);
      } else {
        orphanDivisions.push(enriched);
      }
    }

    // Attach buildings to zones
    const zonesWithBuildings = (zones ?? []).map((z) => {
      const zBs = (buildings ?? [])
        .filter((b) => b.zone_id === z.id)
        .map((b) => ({
          ...b,
          divisions: divisionsByBuilding.get(b.id) ?? [],
        }));

      return { ...z, buildings: zBs };
    });

    return NextResponse.json({
      success: true,
      zones: zonesWithBuildings,
      orphan_divisions: orphanDivisions,
      unassigned_offices: unassigned,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load campus.';
    console.error('Campus GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}