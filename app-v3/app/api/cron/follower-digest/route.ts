import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://www.peopleandyouth.org';

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

// ---------------------------------------------------------------------------
// GET /api/cron/follower-digest
//
// Weekly cron. For each office, for each CONFIRMED follower whose
// last_digest_sent_at is > 6 days ago, send an email containing the office's
// PUBLISHED PUBLIC content from the last 7 days.
//
// Skip followers whose office had no new content in that window.
//
// Optional query params for manual triggering:
//   ?office_slug=founder    — only this office
//   ?force=true             — ignore the 6-day due check
// ---------------------------------------------------------------------------

interface ContentItem {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  excerpt: string | null;
  body: string;
  published_at: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const officeSlug = searchParams.get('office_slug')?.trim();
    const force = searchParams.get('force') === 'true';

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const supabase = getServiceClient();
    const resend = new Resend(resendApiKey);

    // Load offices
    let officeQuery = supabase
      .from('offices')
      .select('id, slug, name')
      .order('display_order');

    if (officeSlug) officeQuery = officeQuery.eq('slug', officeSlug);

    const { data: offices, error: officesError } = await officeQuery;

    if (officesError || !offices) {
      console.error('Follower digest: offices load error:', officesError);
      return NextResponse.json({ error: 'Unable to load offices.' }, { status: 500 });
    }

    const now = Date.now();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    const results: Array<{
      office_slug: string;
      followers_sent: number;
      followers_skipped: number;
      content_items: number;
      reason?: string;
    }> = [];

    for (const office of offices) {
      // Load PUBLISHED PUBLIC content from the last 7 days
      const { data: recentContent } = await supabase
        .from('office_content')
        .select('id, type, title, subtitle, excerpt, body, published_at')
        .eq('office_id', office.id)
        .eq('visibility', 'PUBLIC')
        .eq('status', 'PUBLISHED')
        .gte('published_at', weekAgo)
        .order('published_at', { ascending: false });

      const contentItems: ContentItem[] = recentContent ?? [];

      if (contentItems.length === 0) {
        results.push({
          office_slug: office.slug,
          followers_sent: 0,
          followers_skipped: 0,
          content_items: 0,
          reason: 'no_recent_content',
        });
        continue;
      }

      // Load confirmed followers
      const { data: followers } = await supabase
        .from('office_followers')
        .select('id, full_name, email, confirmation_token, last_digest_sent_at, digest_frequency')
        .eq('office_id', office.id)
        .eq('status', 'CONFIRMED')
        .eq('digest_frequency', 'WEEKLY');

      if (!followers || followers.length === 0) {
        results.push({
          office_slug: office.slug,
          followers_sent: 0,
          followers_skipped: 0,
          content_items: contentItems.length,
          reason: 'no_followers',
        });
        continue;
      }

      let sent = 0;
      let skipped = 0;

      for (const follower of followers) {
        // Due check
        if (!force && follower.last_digest_sent_at) {
          const lastSent = new Date(follower.last_digest_sent_at).getTime();
          const daysSince = (now - lastSent) / (1000 * 60 * 60 * 24);
          if (daysSince < 6) {
            skipped++;
            continue;
          }
        }

        try {
                    await resend.emails.send({
            from: 'People & Youth <contact@peopleandyouth.org>',
            to: [follower.email],
            subject: `${office.name} — Weekly Digest`,
            html: buildDigestHtml(
              office.name,
              office.slug,
              follower.full_name,
              contentItems,
              follower.confirmation_token
            ),
          });

          await supabase
            .from('office_followers')
            .update({
              last_digest_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', follower.id);

          sent++;
        } catch (emailError) {
          console.error(
            `Follower digest email failed for ${follower.email}:`,
            emailError
          );
        }
      }

      results.push({
        office_slug: office.slug,
        followers_sent: sent,
        followers_skipped: skipped,
        content_items: contentItems.length,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Follower digest failed.';
    console.error('Follower digest exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

function buildDigestHtml(
  officeName: string,
  officeSlug: string,
  followerName: string,
  items: ContentItem[],
  unsubscribeToken: string | null
): string {
  const itemsHtml = items
    .map((item) => {
      const title = item.title || 'Untitled';
      const type = item.type;
      const excerpt = (item.excerpt || item.body || '').slice(0, 240);
      const published = item.published_at
        ? new Date(item.published_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '';

      return `
        <div style="border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px;margin-bottom:12px;background:#030611;">
          <div style="font-size:9px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#fbbf24;margin-bottom:6px;">
            ${type} · ${published}
          </div>
          <h3 style="color:#ffffff;font-size:16px;margin:0 0 8px;font-weight:700;">
            ${escapeHtml(title)}
          </h3>
          <p style="font-size:13px;color:#d1d5db;line-height:1.6;margin:0;">
            ${escapeHtml(excerpt)}${excerpt.length === 240 ? '…' : ''}
          </p>
        </div>
      `;
    })
    .join('');

  const unsubscribeUrl = unsubscribeToken
    ? `${SITE_URL}/api/office/follow/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
    : `${SITE_URL}/leadership-network`;

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#030611;color:#f3f4f6;padding:32px 16px;">
      <div style="max-width:620px;margin:0 auto;background:#070b19;border:1px solid rgba(251,191,36,.3);border-radius:12px;padding:28px;">
        <div style="color:#fbbf24;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
          People &amp; Youth · Weekly Digest
        </div>
        <h2 style="color:#ffffff;margin:12px 0 8px;font-size:22px;">
          ${escapeHtml(officeName)}
        </h2>
        <p style="font-size:13px;color:#d1d5db;line-height:1.6;margin-bottom:20px;">
          Dear ${escapeHtml(followerName)}, here is what the office published this week.
        </p>

        ${itemsHtml}

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">
                    <a href="${SITE_URL}/office/${officeSlug}"
             style="display:inline-block;background:#fbbf24;color:#030611;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Visit the Office &rarr;
          </a>
        </div>

        <p style="font-size:10px;color:#6b7280;line-height:1.5;margin-top:24px;">
          You are receiving this because you followed this office on peopleandyouth.org.
          <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">
            Unsubscribe
          </a>
        </p>
      </div>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
