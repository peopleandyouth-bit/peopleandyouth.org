import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const password = String(body.password || '');

    if (!password) {
      return NextResponse.json(
        {
          error: 'Password is required.',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: 'Password must be at least 8 characters long.',
        },
        { status: 400 }
      );
    }

    /*
     * Create the SSR Supabase client.
     *
     * The authentication session established by
     * /api/auth/confirm is available through the
     * Supabase SSR cookies.
     */
    const supabase = await createClient();

    /*
     * Verify that an authenticated user actually exists.
     *
     * We deliberately do NOT accept an email address or
     * arbitrary user ID from the browser.
     */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        'No authenticated user during password update:',
        userError
      );

      return NextResponse.json(
        {
          error:
            'Your password-reset session is invalid or has expired. Please request a new password link.',
        },
        { status: 401 }
      );
    }

    /*
     * Update the password of the authenticated user.
     */
    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      console.error(
        'Supabase password update error:',
        updateError
      );

      return NextResponse.json(
        {
          error:
            updateError.message ||
            'Unable to update your password.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password configured successfully.',
      email: user.email || null,
    });

  } catch (error: any) {
    console.error(
      'Set-password fatal error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to configure password.',
      },
      { status: 500 }
    );
  }
}