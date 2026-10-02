import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';
import { Resend } from 'resend';

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
// GET — list followers for an office
// ?office_slug=<slug>&status=CONFIRMED|PENDING|UNSUBSCRIBED|ALL
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const officeSlug = searchParams.get('office_slug')?.trim();
    const status = searchParams.get('status')?.trim();

    if (!officeSlug) {
      return NextResponse.json({ error: 'office_slug is required.' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: office } = await supabase
      .from('offices')
      .select('id')
      .eq('slug', officeSlug)
      .maybeSingle();

    if (!office) {
      return NextResponse.json({ error: 'Office not found.' }, { status: 404 });
    }

    let query = supabase
      .from('office_followers')
      .select(
        'id, office_id, full_name, email, district, phone, organization, designation, linkedin_url, interests, how_did_you_hear, status, created_at, confirmed_at, unsubscribed_at'
      )
      .eq('office_id', office.id)
      .order('created_at', { ascending: false });

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Followers GET error:', error);
      return NextResponse.json({ error: 'Unable to load followers.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, followers: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to load followers.';
    console.error('Followers GET exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — actions
// Body: { id, action: 'resend_confirmation' }
// ---------------------------------------------------------------------------

interface PatchBody {
  id?: string;
  action?: 'resend_confirmation';
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let body: PatchBody;
    try {
      body = (await request.json()) as PatchBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const id = body.id?.trim();
    const action = body.action;

    if (!id || !action) {
      return NextResponse.json({ error: 'id and action are required.' }, { status: 400 });
    }

    const supabase = getServiceClient();

    if (action === 'resend_confirmation') {
      const { data: follower } = await supabase
        .from('office_followers')
        .select('id, full_name, email, confirmation_token, office_id, status')
        .eq('id', id)
        .maybeSingle();

      if (!follower) {
        return NextResponse.json({ error: 'Follower not found.' }, { status: 404 });
      }

      if (follower.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Only PENDING followers can be resent.' },
          { status: 400 }
        );
      }

      const { data: office } = await supabase
        .from('offices')
        .select('name')
        .eq('id', follower.office_id)
        .maybeSingle();

      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey && follower.confirmation_token) {
        const resend = new Resend(resendApiKey);
        const confirmUrl = `${SITE_URL}/follow/confirm?token=${encodeURIComponent(
          follower.confirmation_token
        )}`;

        await resend.emails.send({
          from: 'People & Youth <contact@peopleandyouth.org>',
          to: [follower.email],
          subject: `Confirm your follow of ${office?.name ?? 'the office'}`,
          html: `
            <div style="font-family:Arial,Helvetica,sans-serif;background:#030611;color:#f3f4f6;padding:32px 16px;">
              <div style="max-width:560px;margin:0 auto;background:#070b19;border:1px solid rgba(251,191,36,.3);border-radius:12px;padding:28px;">
                <h2 style="color:#ffffff;margin:0 0 16px;font-size:20px;">Confirm your follow</h2>
                <p style="font-size:13px;color:#d1d5db;line-height:1.6;">
                  Dear ${follower.full_name},<br/><br/>
                  Click below to confirm your follow of ${office?.name ?? 'the office'}.
                </p>
                <a href="${confirmUrl}"
                   style="display:inline-block;background:#fbbf24;color:#030611;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:14px 28px;border-radius:8px;text-decoration:none;">
                  Confirm Follow &rarr;
                </a>
              </div>
            </div>
          `,
        });
      }

      await supabase
        .from('office_followers')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update.';
    console.error('Followers PATCH exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — remove a follower by id
// ?id=<uuid>
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')?.trim();

    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { error } = await supabase
      .from('office_followers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Follower DELETE error:', error);
      return NextResponse.json({ error: 'Unable to remove follower.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to remove follower.';
    console.error('Followers DELETE exception:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}