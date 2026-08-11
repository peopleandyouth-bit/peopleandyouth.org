import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = body.email || '';
    const type = body.type || 'MAGIC_LINK';
    const email = rawEmail.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Vercel Environment Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing.' 
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. DIRECTORY ALLOWLIST CHECK
    const { data: authorData, error: authorError } = await supabaseAdmin
      .from('authors')
      .select('id, name, email')
      .ilike('email', email)
      .maybeSingle();

    if (authorError) {
      return NextResponse.json({ 
        error: `Database Connection Failed: Check if Supabase project is active or paused. (${authorError.message})` 
      }, { status: 500 });
    }

    if (!authorData) {
      return NextResponse.json({ 
        error: "Access Denied: Email not registered in Directory. Please onboard this email first in Command Centre." 
      }, { status: 403 });
    }

    // 2. GENERATE AUTH LINK WITH CATCH FOR 500 ERRORS
    const isMagicLink = type === 'MAGIC_LINK';
    const redirectTo = isMagicLink 
      ? 'https://www.peopleandyouth.org/admin/command-centre'
      : 'https://www.peopleandyouth.org/admin/reset-password';

    let actionLink: string | null = null;

    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo }
      });

      if (linkError) {
        if (linkError.name === 'AuthRetryableFetchError' || (linkError as any).status === 500) {
          return NextResponse.json({ 
            error: "Supabase Auth 500 Error: Ensure your Supabase project is not paused and that SUPABASE_SERVICE_ROLE_KEY in Vercel is the 'service_role' secret key." 
          }, { status: 500 });
        }
        return NextResponse.json({ error: linkError.message || 'Failed to generate link.' }, { status: 400 });
      }

      actionLink = linkData?.properties?.action_link || null;
    } catch (fetchErr: any) {
      return NextResponse.json({ 
        error: "Supabase Auth Unreachable: Check Supabase project status and Vercel Service Role Key." 
      }, { status: 500 });
    }

    if (!actionLink) {
      return NextResponse.json({ error: 'Failed to generate action link.' }, { status: 400 });
    }

    // 3. DISPATCH VIA RESEND
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY missing on Vercel.' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const subject = isMagicLink 
      ? 'One-Click Admin Access Link — People & Youth Console' 
      : 'Set / Reset Your Password — People & Youth Console';

    await resend.emails.send({
      from: 'People & Youth Security <contact@peopleandyouth.org>',
      to: [email],
      subject,
      html: `
        <div style="font-family: sans-serif; background-color: #030611; color: #f3f4f6; padding: 32px 16px;">
          <div style="max-width: 550px; margin: 0 auto; background-color: #070b19; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 28px; text-align: center;">
            <span style="color: #fbbf24; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
              SECURITY & AUTHENTICATION PORTAL
            </span>
            <h2 style="color: #ffffff; margin: 12px 0 16px 0; font-size: 20px;">
              ${isMagicLink ? 'One-Click Console Login' : 'Console Password Configuration'}
            </h2>
            <p style="font-size: 13px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">
              Dear ${authorData.name || 'Team Member'},<br/><br/>
              Click the button below to ${isMagicLink ? 'access your Command Centre workspace' : 'configure your personal account password'}.
            </p>
            <a href="${actionLink}" style="display: inline-block; background-color: #fbbf24; color: #030611; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 8px; text-decoration: none;">
              ${isMagicLink ? '✨ Access Admin Console Now' : '🔑 Set / Update Your Password'} →
            </a>
          </div>
        </div>
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: isMagicLink 
        ? '✨ One-click login link sent! Check your email inbox.' 
        : '📧 Password setup email sent! Check your inbox to configure your password.' 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error occurred.' }, { status: 500 });
  }
}