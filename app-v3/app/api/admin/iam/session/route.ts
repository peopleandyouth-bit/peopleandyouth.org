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
// Determine which of the caller's sessions is "the current one".
//
// We heuristically take the most recently updated session that matches the
// caller's user id AND whose access token validates. Supabase does not expose
// the session id from a JWT cleanly, so we use "valid token + most recent".
// ---------------------------------------------------------------------------

async function resolveCurrentSessionId(
  request: NextRequest,
  supabase: ReturnType<typeof getServiceClient>,
  userId: string,
  sessions: Array<{ id: string; updated_at: string }>
): Promise<string | null> {
  const token = readCurrentAccessToken(request);
  if (!token || sessions.length === 0) return null;

  const { data } = await supabase.auth.getUser(token);
  if (data?.user?.id !== userId) return null;

  // The list is ordered by updated_at DESC. The current session is almost
  // always the most recently touched one, because we just made a request
  // with it.
  return sessions[0].id;
}

// ---------------------------------------------------------------------------
// GET — list the caller's own sessions
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const auth = await requireIdentity();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { user } = auth;
    const supabase = getServiceClient();

    const { data, error } = await supabase.rpc('list_my_sessions', { target_user_id: user.id });

    if (error) {
      console.error('Session list RPC error:', error);
      return NextResponse.json(
        { error: 'Unable to load sessions.' },
        { status: 500 }
      );
    }

    const sessions = data ?? [];
    const currentSessionId = await resolveCurrentSessionId(
      request,
      supabase,
      user.id,
      sessions
    );

    return NextResponse.json({
      success: true,
      sessions,
      current_session_id: currentSessionId,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to load sessions.';
    console.error('Session GET error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — terminate one session, or all others
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireIdentity();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { user } = auth;
    const supabase = getServiceClient();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id')?.trim();
    const terminateAll = searchParams.get('all') === 'true';

    const { data: sessions, error: listError } = await supabase.rpc(
      'list_my_sessions'
    );

    if (listError) {
      console.error('Session list RPC error during DELETE:', listError);
      return NextResponse.json(
        { error: 'Unable to verify sessions.' },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: 'No sessions found.' },
        { status: 404 }
      );
    }

    const currentSessionId = await resolveCurrentSessionId(
      request,
      supabase,
      user.id,
      sessions
    );

    // ---------------------------------------------------------------------
    // Terminate ALL others
    // ---------------------------------------------------------------------
    if (terminateAll) {
      if (sessions.length <= 1) {
        return NextResponse.json({
          success: true,
          terminated: 0,
          message: 'No other sessions to terminate.',
        });
      }

      const currentToken = readCurrentAccessToken(request);
      if (!currentToken) {
        return NextResponse.json(
          { error: 'Cannot determine current session.' },
          { status: 400 }
        );
      }

      const { error: signOutError } = await supabase.auth.admin.signOut(
        currentToken,
        'others'
      );

      if (signOutError) {
        console.error('signOut others error:', signOutError);
        return NextResponse.json(
          { error: 'Unable to terminate sessions.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        terminated: sessions.length - 1,
      });
    }

    // ---------------------------------------------------------------------
    // Terminate ONE specific session
    // ---------------------------------------------------------------------
    if (sessionId) {
      const target = sessions.find((s) => s.id === sessionId);

      if (!target) {
        return NextResponse.json(
          { error: 'Session not found.' },
          { status: 404 }
        );
      }

      if (currentSessionId && sessionId === currentSessionId) {
        return NextResponse.json(
          {
            error:
              'Cannot terminate the current session this way. Use sign out instead.',
          },
          { status: 400 }
        );
      }

      // Call the SQL function — it hard-deletes the row, scoped to the
      // caller's own user id.
      const { data: deleted, error: deleteError } = await supabase.rpc('delete_my_session', { target_session_id: sessionId, target_user_id: user.id });

      if (deleteError) {
        console.error('delete_my_session RPC error:', deleteError);
        return NextResponse.json(
          { error: 'Unable to terminate session.' },
          { status: 500 }
        );
      }

      if (!deleted) {
        return NextResponse.json(
          { error: 'Session not found or already terminated.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        terminated: 1,
        session_id: sessionId,
      });
    }

    return NextResponse.json(
      { error: 'session_id or all=true is required.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to terminate sessions.';
    console.error('Session DELETE error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}