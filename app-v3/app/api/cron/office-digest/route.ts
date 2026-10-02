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
// GET — send due digests
//
// Idempotency: a digest is "due" when:
//   - frequency = DAILY  and last_sent_at < now() - 22 hours
//   - frequency = WEEKLY and last_sent_at < now() - 6 days
//   - frequency = OFF    — skipped entirely
//
// Optional query params for manual triggering:
//   ?office_slug=founder           — only this office
//   ?force=true                    — ignore due-check, send anyway
// ---------------------------------------------------------------------------

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

    // Load all offices with their digest preferences
    let officeQuery = supabase
      .from('offices')
      .select('id, slug, name, status')
      .order('display_order');

    if (officeSlug) officeQuery = officeQuery.eq('slug', officeSlug);

    const { data: offices, error: officeError } = await officeQuery;

    if (officeError || !offices) {
      console.error('Digest offices load error:', officeError);
      return NextResponse.json({ error: 'Unable to load offices.' }, { status: 500 });
    }

    const now = Date.now();
    const results: Array<{
      office_slug: string;
      status: 'SENT' | 'FAILED' | 'SKIPPED';
      reason?: string;
      message_id?: string;
      pending_appointments?: number;
      unread_correspondence?: number;
    }> = [];

    for (const office of offices) {
      // Load or create preferences
      const { data: prefs } = await supabase
        .from('office_digest_preferences')
        .select('*')
        .eq('office_id', office.id)
        .maybeSingle();

      const effectivePrefs = prefs ?? {
        frequency: 'WEEKLY',
        recipient_email: null,
        include_appointments: true,
        include_correspondence: true,
        include_audit_summary: false,
        last_sent_at: null,
      };

      if (effectivePrefs.frequency === 'OFF') {
        results.push({ office_slug: office.slug, status: 'SKIPPED', reason: 'frequency_off' });
        continue;
      }

      // Due check
      if (!force && effectivePrefs.last_sent_at) {
        const lastSent = new Date(effectivePrefs.last_sent_at).getTime();
        const hoursSince = (now - lastSent) / (1000 * 60 * 60);

        if (effectivePrefs.frequency === 'DAILY' && hoursSince < 22) {
          results.push({ office_slug: office.slug, status: 'SKIPPED', reason: 'not_due_daily' });
          continue;
        }
        if (effectivePrefs.frequency === 'WEEKLY' && hoursSince < 144) {
          results.push({ office_slug: office.slug, status: 'SKIPPED', reason: 'not_due_weekly' });
          continue;
        }
      }

      // Pending appointments
      const { count: apptCount } = await supabase
        .from('office_appointments')
        .select('id', { count: 'exact', head: true })
        .eq('office_id', office.id)
        .eq('status', 'PENDING');

      // Unread correspondence
      const { count: corrCount } = await supabase
        .from('office_correspondence')
        .select('id', { count: 'exact', head: true })
        .eq('office_id', office.id)
        .eq('status', 'UNREAD');

      const pendingAppointments = apptCount ?? 0;
      const unreadCorrespondence = corrCount ?? 0;

      // Skip if nothing to report (unless forced)
      if (
        !force &&
        pendingAppointments === 0 &&
        unreadCorrespondence === 0
      ) {
        results.push({ office_slug: office.slug, status: 'SKIPPED', reason: 'nothing_to_report' });
        continue;
      }

      // Recipient email — prefs override, then active assignment's author email, then founder
      let recipient = effectivePrefs.recipient_email as string | null;

      if (!recipient) {
        const { data: assignment } = await supabase
          .from('office_assignments')
          .select('author_id')
          .eq('office_id', office.id)
          .eq('status', 'ACTIVE')
          .maybeSingle();

        if (assignment?.author_id) {
          const { data: author } = await supabase
            .from('authors')
            .select('email')
            .eq('id', assignment.author_id)
            .maybeSingle();
          recipient = author?.email ?? null;
        }
      }

      if (!recipient) recipient = 'contact@peopleandyouth.org';

      // Build email
      const resend = new Resend(resendApiKey);

      const subject = `${office.name} — ${effectivePrefs.frequency === 'DAILY' ? 'Daily' : 'Weekly'} Brief`;

      try {
        const sendResult = await resend.emails.send({
          from: 'People & Youth <contact@peopleandyouth.org>',
          to: [recipient],
          subject,
          html: `
            <div style="font-family:Arial,Helvetica,sans-serif;background:#030611;color:#f3f4f6;padding:32px 16px;">
              <div style="max-width:560px;margin:0 auto;background:#070b19;border:1px solid rgba(251,191,36,.3);border-radius:12px;padding:28px;">
                <div style="color:#fbbf24;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
                  OFFICE BRIEF · ${effectivePrefs.frequency}
                </div>
                <h2 style="color:#ffffff;margin:12px 0 16px;font-size:22px;">
                  ${office.name}
                </h2>
                <p style="font-size:13px;color:#d1d5db;line-height:1.6;">
                  A summary of items awaiting your attention.
                </p>
                <table style="width:100%;margin:20px 0;font-size:14px;color:#d1d5db;border-collapse:collapse;">
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                      Pending appointment requests
                    </td>
                    <td style="padding:12px 0;text-align:right;color:#fbbf24;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.06);">
                      ${pendingAppointments}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                      Unread correspondence
                    </td>
                    <td style="padding:12px 0;text-align:right;color:#fbbf24;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.06);">
                      ${unreadCorrespondence}
                    </td>
                  </tr>
                </table>
                <a href="${SITE_URL}/admin/command-centre"
                   style="display:inline-block;background:#fbbf24;color:#030611;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:14px 28px;border-radius:8px;text-decoration:none;">
                  Open Office Desk &rarr;
                </a>
                <p style="font-size:10px;color:#6b7280;line-height:1.5;margin-top:24px;">
                  This digest is sent ${effectivePrefs.frequency === 'DAILY' ? 'daily' : 'weekly'} while your office has pending items. Change your frequency in Office Desk.
                </p>
              </div>
            </div>
          `,
        });

        const messageId =
          (sendResult as { data?: { id?: string } })?.data?.id ?? null;

        // Update last_sent_at
        if (prefs) {
          await supabase
            .from('office_digest_preferences')
            .update({ last_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq('id', prefs.id);
        } else {
          await supabase.from('office_digest_preferences').insert({
            office_id: office.id,
            frequency: 'WEEKLY',
            last_sent_at: new Date().toISOString(),
          });
        }

        // Log
        await supabase.from('office_digest_log').insert({
          office_id: office.id,
          frequency: effectivePrefs.frequency,
          recipient_email: recipient,
          pending_appointments: pendingAppointments,
          unread_correspondence: unreadCorrespondence,
          resend_message_id: messageId,
          status: 'SENT',
        });

        results.push({
          office_slug: office.slug,
          status: 'SENT',
          message_id: messageId ?? undefined,
          pending_appointments: pendingAppointments,
          unread_correspondence: unreadCorrespondence,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown send error';

        await supabase.from('office_digest_log').insert({
          office_id: office.id,
          frequency: effectivePrefs.frequency,
          recipient_email: recipient,
          pending_appointments: pendingAppointments,
          unread_correspondence: unreadCorrespondence,
          status: 'FAILED',
          error_message: message,
        });

        results.push({
          office_slug: office.slug,
          status: 'FAILED',
          reason: message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Digest failed.';
    console.error('Digest GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}