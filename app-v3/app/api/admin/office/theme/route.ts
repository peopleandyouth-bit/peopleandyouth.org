import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';

// ---------------------------------------------------------------------------
// The 10 approved institutional themes.
// Only these values may be set on any office.
// ---------------------------------------------------------------------------

export const APPROVED_THEMES = [
  'institutional-ink',
  'founders-gold',
  'civic-emerald',
  'constitutional-navy',
  'archive-parchment',
  'research-slate',
  'editorial-violet',
  'technology-cyan',
  'policy-maroon',
  'heritage-cream',
] as const;

type ApprovedTheme = (typeof APPROVED_THEMES)[number];

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

interface PatchBody {
  slug?: string;
  theme_slug?: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    let body: PatchBody;
    try {
      body = (await request.json()) as PatchBody;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const slug = body.slug?.trim();
    const theme = body.theme_slug?.trim() as ApprovedTheme | undefined;

    if (!slug) {
      return NextResponse.json({ error: 'slug is required.' }, { status: 400 });
    }

    if (!theme || !APPROVED_THEMES.includes(theme)) {
      return NextResponse.json(
        {
          error: `theme_slug must be one of: ${APPROVED_THEMES.join(', ')}.`,
        },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: updated, error } = await supabase
      .from('offices')
      .update({
        theme_slug: theme,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)
      .select('id, slug, name, theme_slug, updated_at')
      .single();

    if (error) {
      console.error('Office theme PATCH error:', error);
      return NextResponse.json(
        { error: 'Unable to update theme.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, office: updated });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to update theme.';
    console.error('Office theme PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    themes: APPROVED_THEMES,
  });
}