import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json({ error: 'Token and email are required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // VERIFY TOKEN AGAINST DATABASE
    const { data: author, error } = await supabaseAdmin
      .from('authors')
      .select('id, auth_token, auth_token_expires')
      .ilike('email', email)
      .eq('auth_token', token)
      .maybeSingle();

    if (error || !author) {
      return NextResponse.json({ error: 'Invalid authentication link or token.' }, { status: 400 });
    }

    if (author.auth_token_expires && new Date(author.auth_token_expires) < new Date()) {
      return NextResponse.json({ error: 'Authentication link has expired. Please request a new one.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Token verified successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
  }
}