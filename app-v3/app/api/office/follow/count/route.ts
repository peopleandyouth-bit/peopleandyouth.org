import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

    const { count } = await supabase
      .from('office_followers')
      .select('id', { count: 'exact', head: true })
      .eq('office_id', office.id)
      .eq('status', 'CONFIRMED');

    return NextResponse.json({
      success: true,
      follower_count: count ?? 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load count.';
    console.error('Follower count exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}