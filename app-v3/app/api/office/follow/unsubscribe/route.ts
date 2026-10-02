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
    const token = searchParams.get('token')?.trim();

    if (!token) {
      return NextResponse.json({ error: 'Token is required.' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: follower } = await supabase
      .from('office_followers')
      .select('id, status')
      .eq('confirmation_token', token)
      .maybeSingle();

    if (!follower) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe link.' },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from('office_followers')
      .update({
        status: 'UNSUBSCRIBED',
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', follower.id);

    if (updateError) {
      console.error('Unsubscribe update error:', updateError);
      return NextResponse.json({ error: 'Unable to unsubscribe.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to unsubscribe.';
    console.error('Unsubscribe exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}