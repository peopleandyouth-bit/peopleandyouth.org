import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. VERIFY TOKEN IN DATABASE
    const { data: author, error } = await supabaseAdmin
      .from('authors')
      .select('id, auth_token')
      .ilike('email', email)
      .eq('auth_token', token)
      .maybeSingle();

    if (error || !author) {
      return NextResponse.json({ error: 'Invalid or expired setup token.' }, { status: 400 });
    }

    // 2. CREATE OR UPDATE USER IN auth.users WITH NEW PASSWORD
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const users = (existingUser?.users ?? []) as Array<{
  email?: string | null;
  [key: string]: any;
}>;

const matchedUser = users.find(
  u => u.email?.toLowerCase() === email.toLowerCase()
);

    if (matchedUser) {
      await supabaseAdmin.auth.admin.updateUserById(matchedUser.id, { password });
    } else {
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
    }

    // 3. CLEAR TOKEN IN DATABASE
    await supabaseAdmin
      .from('authors')
      .update({ auth_token: null, auth_token_expires: null })
      .eq('id', author.id);

    return NextResponse.json({ success: true, message: 'Password configured successfully!' });

  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to set password.' }, { status: 500 });
  }
}