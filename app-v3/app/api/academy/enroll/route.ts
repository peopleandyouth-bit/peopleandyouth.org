import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { courseId, userId } = await request.json();

    if (!courseId || !userId) {
      return NextResponse.json({ error: 'Missing courseId or userId.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('academy_enrollments')
      .insert([{
        user_id: userId,
        course_id: courseId,
        progress_percent: 0,
        status: 'enrolled'
      }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, enrollment: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
