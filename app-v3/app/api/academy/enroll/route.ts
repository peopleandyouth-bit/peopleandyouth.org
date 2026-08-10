import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, program, phone } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Insert enrollment lead safely
    const { data, error } = await supabase.from('reflections').insert({
      author_name: name,
      author_email: email,
      prompt_question: `Academy Enrollment: ${program || 'General Program'}`,
      message: `Phone: ${phone || 'N/A'} | Enrollment request for ${program || 'People & Youth Academy'}`,
      category: 'Academy Enrollment'
    });

    if (error) {
      console.error('Enrollment DB error:', error);
    }

    return NextResponse.json({ success: true, message: 'Enrollment application received' });
  } catch (err: any) {
    console.error('Enrollment route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Academy enrollment endpoint active' });
}