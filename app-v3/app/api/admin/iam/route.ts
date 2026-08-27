import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getIamIdentity,
  getIamRole,
  hasPermission,
} from '@/lib/iam';

function getServerClient(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are missing.');
  }

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const accessToken = authorization
      .substring('Bearer '.length)
      .trim();

    const supabase = getServerClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const [identity, role] = await Promise.all([
      getIamIdentity(user.id),
      getIamRole(user.id),
    ]);

    if (!identity || identity.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: 'Institutional access is inactive.',
        },
        { status: 403 }
      );
    }

    const isAdmin = identity ? await hasPermission(identity, 'ADMIN') : false;

    return NextResponse.json({
      authenticated: true,
      identity,
      role,
      permissions: identity.permissions || [],
      isAdmin,
    });
  } catch (error: any) {
    console.error('IAM GET error:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Unable to resolve institutional identity.',
      },
      { status: 500 }
    );
  }
}

