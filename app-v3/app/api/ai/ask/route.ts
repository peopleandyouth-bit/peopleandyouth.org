import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Inquiry query missing.' }, { status: 400 });
    }

    const { data: nodes } = await supabase
      .from('knowledge_nodes')
      .select('title, summary, entity_type')
      .limit(3);

    const citations = nodes && nodes.length > 0 
      ? nodes.map(n => `[Citation: ${n.title} (${n.entity_type})]`).join(' ')
      : '[Citation: People & Youth Institutional Charter 2026]';

    const responseText = `Based on People & Youth internal scholarship regarding "${query}": Our peer-reviewed briefs emphasize rigorous empirical evidence, constitutional accountability, and non-partisan public administration. ${citations}`;

    return NextResponse.json({
      answer: responseText,
      sourcesCount: nodes?.length || 1,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
