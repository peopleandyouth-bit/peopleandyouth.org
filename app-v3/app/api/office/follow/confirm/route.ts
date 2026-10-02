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
      .select('id, status, full_name, office_id')
      .eq('confirmation_token', token)
      .maybeSingle();

    if (!follower) {
      return NextResponse.json(
        { error: 'Invalid or expired confirmation link.' },
        { status: 404 }
      );
    }

    if (follower.status === 'CONFIRMED') {
      return NextResponse.json({
        success: true,
        already_confirmed: true,
        message: 'Your follow was already confirmed.',
      });
    }

    const { error: updateError } = await supabase
      .from('office_followers')
      .update({
        status: 'CONFIRMED',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', follower.id);

    if (updateError) {
      console.error('Confirm update error:', updateError);
      return NextResponse.json({ error: 'Unable to confirm.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Your follow has been confirmed.',
      full_name: follower.full_name,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to confirm.';
    console.error('Follow confirm exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}