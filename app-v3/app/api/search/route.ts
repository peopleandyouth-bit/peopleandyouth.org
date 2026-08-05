import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase() || '';

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const { data, error } = await supabase
    .from('public_publications_feed')
    .select('*')
    .or(`title.ilike.%${q}%,subtitle.ilike.%${q}%,author_name.ilike.%${q}%,category.ilike.%${q}%`)
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data || [] });
}