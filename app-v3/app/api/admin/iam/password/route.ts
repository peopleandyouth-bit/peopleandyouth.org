import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireIdentity } from '@/lib/admin-auth';

// ---------------------------------------------------------------------------
// Service-role client
// ---------------------------------------------------------------------------

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server configuration is incomplete.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ---------------------------------------------------------------------------
// Read the caller's current access token from the request cookie.
// (Same helper as the session route — kept local to avoid coupling.)
// ---------------------------------------------------------------------------

function readCurrentAccessToken(request: NextRequest): string | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return null;

    const ref = url.replace(/^https?:\/\//, '').split('.')[0];
    const cookieName = `sb-${ref}-auth-token`;

    const allCookies = request.cookies.getAll();

    const direct = allCookies.find((c) => c.name === cookieName);
    const chunks = allCookies
      .filter((c) => c.name.startsWith(`${cookieName}.`))
      .sort((a, b) => {
        const ai = Number(a.name.split('.').pop());
        const bi = Number(b.name.split('.').pop());
        return ai - bi;
      });

    let raw: string | undefined;

    if (direct) {
      raw = direct.value;
    } else if (chunks.length > 0) {
      raw = chunks.map((c) => c.value).join('');
    }

    if (!raw) return null;

    let payload = raw;

    if (payload.startsWith('base64-')) {
      payload = Buffer.from(payload.slice(7), 'base64').toString('utf-8');
    } else {
      try {
        payload = decodeURIComponent(payload);
      } catch {
        // keep as-is
      }
    }

    const parsed = JSON.parse(payload);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return typeof parsed.access_token === 'string'
        ? parsed.access_token
        : null;
    }

    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed[0];
    }

    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Verify the caller's current password by attempting a sign-in with it.
// ---------------------------------------------------------------------------

async function verifyCurrentPassword(
  email: string,
  password: string
): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase anon configuration is missing.');
  }

  const client = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  return !error && !!data?.user;
}

// ---------------------------------------------------------------------------
// PATCH — change the caller's own password
// ---------------------------------------------------------------------------

interface PatchBody {
  current_password?: string;
  new_password?: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireIdentity();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { user } = auth;

    let body: PatchBody;
    try {
      body = (await request.json()) as PatchBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const currentPassword = body.current_password;
    const newPassword = body.new_password;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { error: 'Current password is required.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'New password is required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: 'New password must differ from the current password.' },
        { status: 400 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { error: 'Caller has no email on record.' },
        { status: 400 }
      );
    }

    const passwordIsCorrect = await verifyCurrentPassword(
      user.email,
      currentPassword
    );

    if (!passwordIsCorrect) {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 403 }
      );
    }

    const supabase = getServiceClient();

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { error: 'Unable to update password.' },
        { status: 500 }
      );
    }

    // After the password change, terminate all OTHER sessions so that any
    // session that existed before the change is invalidated. The current
    // session (identified by the caller's JWT) is preserved.
    let othersTerminated = 0;

    try {
      const currentToken = readCurrentAccessToken(request);

      if (currentToken) {
        const { error: signOutError } = await supabase.auth.admin.signOut(
          currentToken,
          'others'
        );

        if (signOutError) {
          console.error(
            'signOut others after password change error:',
            signOutError
          );
          // Do not fail the request — password was changed successfully.
        } else {
          othersTerminated = -1; // we don't have an exact count; -1 signals "attempted"
        }
      }
    } catch (signOutException) {
      console.error(
        'Exception terminating other sessions after password change:',
        signOutException
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated.',
      others_terminated: othersTerminated,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to update password.';
    console.error('Password PATCH error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}