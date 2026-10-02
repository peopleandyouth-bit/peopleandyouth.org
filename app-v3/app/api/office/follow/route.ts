import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

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
  full_name?: string;
  email?: string;
  district?: string;
  interests?: string[];
  consent?: boolean;
  phone?: string;
  organization?: string;
  designation?: string;
  linkedin_url?: string;
  how_did_you_hear?: string;
}

const ALLOWED_INTERESTS = [
  'Governance',
  'Research',
  'Publications',
  'Policy',
  'Technology',
  'Rural',
  'Education',
  'Youth',
];

export async function POST(request: NextRequest) {
  try {
    let body: PostBody;
    try {
      body = (await request.json()) as PostBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const officeSlug = cleanString(body.office_slug, 100);
    const fullName = cleanString(body.full_name, 200);
    const email = cleanEmail(body.email);
    const district = cleanString(body.district, 200);

    if (!officeSlug || !fullName || !email || !district) {
      return NextResponse.json(
        { error: 'office_slug, full_name, email, and district are required.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    if (body.consent !== true) {
      return NextResponse.json(
        { error: 'Consent is required to receive updates.' },
        { status: 400 }
      );
    }

    const interests = Array.isArray(body.interests)
      ? body.interests.filter((i) => ALLOWED_INTERESTS.includes(i))
      : [];

    if (interests.length === 0) {
      return NextResponse.json(
        { error: 'Select at least one interest.' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: office, error: officeError } = await supabase
      .from('offices')
      .select('id, slug, name')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (officeError || !office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    // Check for existing follower with same email
    const { data: existing } = await supabase
      .from('office_followers')
      .select('id, status, confirmation_token')
      .eq('office_id', office.id)
      .ilike('email', email)
      .maybeSingle();

    if (existing) {
      // If already confirmed, treat as no-op success
      if (existing.status === 'CONFIRMED') {
        return NextResponse.json({
          success: true,
          message: 'You are already following this office.',
          already_following: true,
        });
      }

      // If PENDING, resend confirmation with same token
      if (existing.status === 'PENDING' && existing.confirmation_token) {
        // Update the record's details and resend
        await supabase
          .from('office_followers')
          .update({
            full_name: fullName,
            district,
            interests,
            phone: cleanString(body.phone, 60),
            organization: cleanString(body.organization, 200),
            designation: cleanString(body.designation, 200),
            linkedin_url: cleanString(body.linkedin_url, 400),
            how_did_you_hear: cleanString(body.how_did_you_hear, 100),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        await sendConfirmationEmail(
          office.name,
          fullName,
          email,
          existing.confirmation_token
        );

        return NextResponse.json({
          success: true,
          message: 'A confirmation email has been sent. Please check your inbox.',
          resent: true,
        });
      }

      // If UNSUBSCRIBED, reactivate as PENDING with a new token
      if (existing.status === 'UNSUBSCRIBED') {
        const newToken = randomBytes(32).toString('hex');

        await supabase
          .from('office_followers')
          .update({
            full_name: fullName,
            district,
            interests,
            phone: cleanString(body.phone, 60),
            organization: cleanString(body.organization, 200),
            designation: cleanString(body.designation, 200),
            linkedin_url: cleanString(body.linkedin_url, 400),
            how_did_you_hear: cleanString(body.how_did_you_hear, 100),
            status: 'PENDING',
            confirmation_token: newToken,
            confirmed_at: null,
            unsubscribed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        await sendConfirmationEmail(office.name, fullName, email, newToken);

        return NextResponse.json({
          success: true,
          message: 'A confirmation email has been sent. Please check your inbox.',
          reactivated: true,
        });
      }
    }

    // New follower
    const token = randomBytes(32).toString('hex');

    const { error: insertError } = await supabase
      .from('office_followers')
      .insert({
        office_id: office.id,
        full_name: fullName,
        email,
        district,
        interests,
        consent: true,
        phone: cleanString(body.phone, 60),
        organization: cleanString(body.organization, 200),
        designation: cleanString(body.designation, 200),
        linkedin_url: cleanString(body.linkedin_url, 400),
        how_did_you_hear: cleanString(body.how_did_you_hear, 100),
        status: 'PENDING',
        confirmation_token: token,
      });

    if (insertError) {
      console.error('Follower insert error:', insertError);
      return NextResponse.json({ error: 'Unable to complete signup.' }, { status: 500 });
    }

    await sendConfirmationEmail(office.name, fullName, email, token);

    return NextResponse.json({
      success: true,
      message: 'A confirmation email has been sent. Please check your inbox.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to complete signup.';
    console.error('Public follow POST exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function sendConfirmationEmail(
  officeName: string,
  followerName: string,
  email: string,
  token: string
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const resend = new Resend(resendApiKey);

  const confirmUrl = `${SITE_URL}/follow/confirm?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from: 'People & Youth <contact@peopleandyouth.org>',
    to: [email],
    subject: `Confirm your follow of ${officeName}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#030611;color:#f3f4f6;padding:32px 16px;">
        <div style="max-width:560px;margin:0 auto;background:#070b19;border:1px solid rgba(251,191,36,.3);border-radius:12px;padding:28px;">
          <div style="color:#fbbf24;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
            People &amp; Youth
          </div>
          <h2 style="color:#ffffff;margin:12px 0 16px;font-size:20px;">
            Confirm your follow
          </h2>
          <p style="font-size:13px;color:#d1d5db;line-height:1.6;">
            Dear ${followerName},
            <br/><br/>
            You asked to follow the <strong>${officeName}</strong>. Click the button
            below to confirm. Until you confirm, we will not send you any updates.
          </p>
          <a href="${confirmUrl}"
             style="display:inline-block;background:#fbbf24;color:#030611;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:14px 28px;border-radius:8px;text-decoration:none;margin-top:8px;">
            Confirm Follow &rarr;
          </a>
          <p style="font-size:10px;color:#6b7280;line-height:1.5;margin-top:24px;">
            If you did not request this, you can safely ignore this email. The link
            expires after you use it once.
          </p>
        </div>
      </div>
    `,
  });
}