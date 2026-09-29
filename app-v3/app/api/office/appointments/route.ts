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

function cleanString(value: unknown, max = 400): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function cleanEmail(value: unknown): string | null {
  const s = cleanString(value, 200);
  if (!s) return null;
  return s.toLowerCase();
}

interface PostBody {
  office_slug?: string;
  requester_name?: string;
  requester_email?: string;
  requester_phone?: string;
  requester_organization?: string;
  requester_designation?: string;
  purpose?: string;
  message?: string;
  preferred_date?: string;
  preferred_time?: string;
  duration_minutes?: number;
}

export async function POST(request: NextRequest) {
  try {
    let body: PostBody;
    try {
      body = (await request.json()) as PostBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const officeSlug = cleanString(body.office_slug, 100);
    const requesterName = cleanString(body.requester_name, 200);
    const requesterEmail = cleanEmail(body.requester_email);
    const purpose = cleanString(body.purpose, 500);

    if (!officeSlug || !requesterName || !requesterEmail || !purpose) {
      return NextResponse.json(
        { error: 'office_slug, requester_name, requester_email, and purpose are required.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: office, error: officeError } = await supabase
      .from('offices')
      .select('id, slug, name, status')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    const preferredDate = cleanString(body.preferred_date, 40);
    const preferredTime = cleanString(body.preferred_time, 40);

    const durationRaw = Number(body.duration_minutes);
    const duration = Number.isFinite(durationRaw) && durationRaw > 0 && durationRaw <= 480
      ? Math.round(durationRaw)
      : 30;

    const { data: created, error: createError } = await supabase
      .from('office_appointments')
      .insert({
        office_id: office.id,
        requester_name: requesterName,
        requester_email: requesterEmail,
        requester_phone: cleanString(body.requester_phone, 60),
        requester_organization: cleanString(body.requester_organization, 200),
        requester_designation: cleanString(body.requester_designation, 200),
        purpose,
        message: cleanString(body.message, 5000),
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        duration_minutes: duration,
        status: 'PENDING',
      })
      .select('id, created_at')
      .single();

    if (createError || !created) {
      console.error('Appointment insert error:', createError);
      return NextResponse.json({ error: 'Unable to submit appointment request.' }, { status: 500 });
    }

    // Notify officeholder (or founder fallback)
    try {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (resendApiKey) {
        // Find the officeholder's email if an active assignment exists.
        const { data: assignment } = await supabase
          .from('office_assignments')
          .select('author_id')
          .eq('office_id', office.id)
          .eq('status', 'ACTIVE')
          .maybeSingle();

        let recipient = 'contact@peopleandyouth.org';
        let officeholderName = 'Founder\'s Office';

        if (assignment?.author_id) {
          const { data: author } = await supabase
            .from('authors')
            .select('name, email')
            .eq('id', assignment.author_id)
            .maybeSingle();

          if (author?.email) {
            recipient = author.email;
            officeholderName = author.name;
          }
        }

        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: 'People & Youth <contact@peopleandyouth.org>',
          to: [recipient],
          replyTo: requesterEmail,
          subject: `Appointment Request — ${office.name}`,
          html: `
            <div style="font-family:Arial,Helvetica,sans-serif;background:#030611;color:#f3f4f6;padding:32px 16px;">
              <div style="max-width:560px;margin:0 auto;background:#070b19;border:1px solid rgba(251,191,36,.3);border-radius:12px;padding:28px;">
                <div style="color:#fbbf24;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
                  APPOINTMENT REQUEST
                </div>
                <h2 style="color:#ffffff;margin:12px 0 16px;font-size:20px;">
                  ${office.name}
                </h2>
                <p style="font-size:13px;color:#d1d5db;line-height:1.6;">
                  ${officeholderName}, a new appointment request has been submitted for your office.
                </p>
                <table style="width:100%;margin:20px 0;font-size:12px;color:#d1d5db;">
                  <tr><td style="padding:4px 0;color:#9ca3af;">Requester</td><td style="text-align:right;">${requesterName}</td></tr>
                  <tr><td style="padding:4px 0;color:#9ca3af;">Email</td><td style="text-align:right;">${requesterEmail}</td></tr>
                  <tr><td style="padding:4px 0;color:#9ca3af;">Purpose</td><td style="text-align:right;">${purpose}</td></tr>
                  ${preferredDate ? `<tr><td style="padding:4px 0;color:#9ca3af;">Preferred date</td><td style="text-align:right;">${preferredDate}</td></tr>` : ''}
                  ${preferredTime ? `<tr><td style="padding:4px 0;color:#9ca3af;">Preferred time</td><td style="text-align:right;">${preferredTime}</td></tr>` : ''}
                </table>
                <a href="${SITE_URL}/admin/command-centre"
                   style="display:inline-block;background:#fbbf24;color:#030611;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:14px 28px;border-radius:8px;text-decoration:none;">
                  Review in Office Desk &rarr;
                </a>
              </div>
            </div>
          `,
        });
      }
    } catch (emailError) {
      // Non-fatal: the appointment is still recorded.
      console.error('Appointment notification email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      appointment_id: created.id,
      message: 'Appointment request submitted. The office will respond shortly.',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to submit appointment request.';
    console.error('Public appointment POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}