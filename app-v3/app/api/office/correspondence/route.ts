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
  sender_name?: string;
  sender_email?: string;
  sender_phone?: string;
  sender_organization?: string;
  sender_designation?: string;
  subject?: string;
  body?: string;
  category?: string;
}

export async function POST(request: NextRequest) {
  try {
    let payload: PostBody;
    try {
      payload = (await request.json()) as PostBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const officeSlug = cleanString(payload.office_slug, 100);
    const senderName = cleanString(payload.sender_name, 200);
    const senderEmail = cleanEmail(payload.sender_email);
    const subject = cleanString(payload.subject, 400);
    const body = cleanString(payload.body, 20000);

    if (!officeSlug || !senderName || !senderEmail || !subject || !body) {
      return NextResponse.json(
        { error: 'office_slug, sender_name, sender_email, subject, and body are required.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
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

    const { data: created, error: createError } = await supabase
      .from('office_correspondence')
      .insert({
        office_id: office.id,
        sender_name: senderName,
        sender_email: senderEmail,
        sender_phone: cleanString(payload.sender_phone, 60),
        sender_organization: cleanString(payload.sender_organization, 200),
        sender_designation: cleanString(payload.sender_designation, 200),
        subject,
        body,
        category: cleanString(payload.category, 100),
        status: 'UNREAD',
      })
      .select('id, created_at')
      .single();

    if (createError || !created) {
      console.error('Correspondence insert error:', createError);
      return NextResponse.json(
        { error: 'Unable to submit correspondence.' },
        { status: 500 }
      );
    }

    // Notify the officeholder (or fall back to founder)
    try {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (resendApiKey) {
        const { data: assignment } = await supabase
          .from('office_assignments')
          .select('author_id')
          .eq('office_id', office.id)
          .eq('status', 'ACTIVE')
          .maybeSingle();

        let recipient = 'contact@peopleandyouth.org';
        let officeholderName = "Founder's Office";

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
          replyTo: senderEmail,
          subject: `Correspondence — ${office.name} — ${subject}`,
          html: `
            <div style="font-family:Arial,Helvetica,sans-serif;background:#030611;color:#f3f4f6;padding:32px 16px;">
              <div style="max-width:560px;margin:0 auto;background:#070b19;border:1px solid rgba(251,191,36,.3);border-radius:12px;padding:28px;">
                <div style="color:#fbbf24;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
                  CORRESPONDENCE RECEIVED
                </div>
                <h2 style="color:#ffffff;margin:12px 0 16px;font-size:20px;">
                  ${office.name}
                </h2>
                <p style="font-size:13px;color:#d1d5db;line-height:1.6;">
                  ${officeholderName}, a new message has arrived for your office.
                </p>
                <table style="width:100%;margin:20px 0;font-size:12px;color:#d1d5db;">
                  <tr><td style="padding:4px 0;color:#9ca3af;">From</td><td style="text-align:right;">${senderName}</td></tr>
                  <tr><td style="padding:4px 0;color:#9ca3af;">Email</td><td style="text-align:right;">${senderEmail}</td></tr>
                  <tr><td style="padding:4px 0;color:#9ca3af;">Subject</td><td style="text-align:right;">${subject}</td></tr>
                </table>
                <div style="background:#030611;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px;font-size:13px;color:#d1d5db;line-height:1.6;white-space:pre-wrap;">
                  ${body}
                </div>
                <a href="${SITE_URL}/admin/command-centre"
                   style="display:inline-block;margin-top:20px;background:#fbbf24;color:#030611;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:14px 28px;border-radius:8px;text-decoration:none;">
                  Open Office Desk &rarr;
                </a>
              </div>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error('Correspondence notification email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      correspondence_id: created.id,
      message: 'Message delivered to the office.',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unable to submit correspondence.';
    console.error('Public correspondence POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}