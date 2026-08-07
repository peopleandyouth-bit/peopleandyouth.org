import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, prompt_question, message, author_name, author_email, organization } = body;

    if (!message || !author_email) {
      return NextResponse.json(
        { error: 'Please provide your reflection message and a valid contact email.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('reflections')
      .insert({
        category: category || '🖋 Reflection',
        prompt_question: prompt_question || null,
        message,
        author_name: author_name || 'Anonymous Reader',
        author_email,
        organization: organization || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Failed to record reflection in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your reflection has been transmitted to The Reader’s Desk. Thank you for contributing to our institutional dialogue.',
      reflection: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}