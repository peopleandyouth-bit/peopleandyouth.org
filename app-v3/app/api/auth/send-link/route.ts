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
        error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL missing in environment.' 
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. DIRECTORY ALLOWLIST CHECK (public.authors)
    const { data: authorData, error: authorError } = await supabaseAdmin
      .from('authors')
      .select('id, name, email, designation')
      .ilike('email', email)
      .maybeSingle();

    if (authorError) {
      return NextResponse.json({ error: `Database error checking directory: ${String(authorError.message)}` }, { status: 500 });
    }

    if (!authorData) {
      return NextResponse.json({ 
        error: 'Access Denied: This email address is not registered in the People & Youth Directory. Please contact the Founder\'s Office for onboarding.' 
      }, { status: 403 });
    }

    // 2. PROVISION IN auth.users IF NOT EXISTS
    const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true
    });
    if (createErr && !createErr.message.toLowerCase().includes('already')) {
      console.log('User creation log:', createErr.message);
    }

    // 3. GENERATE AUTH LINK
    const isMagicLink = type === 'MAGIC_LINK';
    const linkType = isMagicLink ? 'magiclink' : 'recovery';
    const redirectTo = isMagicLink 
      ? 'https://www.peopleandyouth.org/admin/command-centre'
      : 'https://www.peopleandyouth.org/admin/reset-password';

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: linkType,
      email,
      options: { redirectTo }
    });

    if (linkError || !linkData?.properties?.action_link) {
      // EXPLICIT STRING CONVERSION: Ensures Error objects never serialize to {}
      const errMsg = linkError?.message ? String(linkError.message) : 'Failed to generate link in Supabase Auth.';
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const actionLink = linkData.properties.action_link;

    // 4. SEND EMAIL VIA RESEND
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error: RESEND_API_KEY is missing.' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const subject = isMagicLink 
      ? 'One-Click Admin Access Link — People & Youth Console' 
      : 'Set / Reset Your Password — People & Youth Console';

    const buttonLabel = isMagicLink ? '✨ Access Admin Console Now' : '🔑 Set / Update Your Password';

    const emailRes = await resend.emails.send({
      from: 'People & Youth Security <contact@peopleandyouth.org>',
      to: [email],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #030611; color: #f3f4f6; padding: 32px 16px;">
          <div style="max-width: 550px; margin: 0 auto; background-color: #070b19; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 28px; text-align: center;">
            <span style="color: #fbbf24; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px;">
              SECURITY & AUTHENTICATION PORTAL
            </span>
            <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 20px;">
              ${isMagicLink ? 'One-Click Console Login' : 'Console Password Configuration'}
            </h2>

            <p style="font-size: 13px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">
              Dear ${authorData.name || 'Team Member'},<br/><br/>
              ${isMagicLink 
                ? 'Click the button below to log directly into your restricted Command Centre workspace.' 
                : 'Click the button below to configure your personal access password for the People & Youth Console.'}
            </p>

            <a href="${actionLink}" style="display: inline-block; background-color: #fbbf24; color: #030611; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-bottom: 24px;">
              ${buttonLabel} →
            </a>

            <p style="font-size: 11px; color: #6b7280; line-height: 1.5; margin: 0;">
              If you did not request this link, you can safely ignore this email.<br/>
              OFFICE OF THE FOUNDER & CHIEF EXECUTIVE OFFICER • People & Youth
            </p>
          </div>
        </div>
      `
    });

    if (emailRes.error) {
      return NextResponse.json({ error: `Resend Email Error: ${String(emailRes.error.message)}` }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: isMagicLink 
        ? '✨ One-click login link sent! Check your email inbox.' 
        : '📧 Password setup email sent! Check your inbox to configure your password.' 
    });

  } catch (err: any) {
    const errMsg = err?.message ? String(err.message) : 'An unexpected server error occurred.';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}