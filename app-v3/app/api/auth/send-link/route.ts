import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email: rawEmail, type } = await req.json();
    const email = rawEmail ? rawEmail.trim().toLowerCase() : '';

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY is missing on Vercel. Please check environment variables.' 
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. AUTHORIZATION GUARD: MUST EXIST IN public.authors
    const { data: authorData, error: authorError } = await supabaseAdmin
      .from('authors')
      .select('id, name, email, designation')
      .ilike('email', email)
      .maybeSingle();

    if (authorError || !authorData) {
      return NextResponse.json({ 
        error: 'Access Denied: This email address is not registered in the People & Youth Directory. Please contact the Founder\'s Office for onboarding.' 
      }, { status: 403 });
    }

    // 2. INITIALIZE USER IN auth.users IF NOT YET CREATED
    try {
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true
      });
    } catch (e) {
      // User already exists in auth.users, proceed normally
    }

    const isMagicLink = type === 'MAGIC_LINK';
    const primaryLinkType = isMagicLink ? 'magiclink' : 'recovery';
    const redirectTo = isMagicLink 
      ? 'https://www.peopleandyouth.org/admin/command-centre'
      : 'https://www.peopleandyouth.org/admin/reset-password';

    // 3. GENERATE ACTION LINK (WITH FAIL-SAFE FALLBACK)
    let actionLink: string | null = null;

    const primaryResult = await supabaseAdmin.auth.admin.generateLink({
      type: primaryLinkType,
      email,
      options: { redirectTo }
    });

    if (primaryResult.data?.properties?.action_link) {
      actionLink = primaryResult.data.properties.action_link;
    } else {
      // Fallback: Use magiclink to log them in and redirect straight to password setup
      const fallbackResult = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo }
      });
      if (fallbackResult.data?.properties?.action_link) {
        actionLink = fallbackResult.data.properties.action_link;
      }
    }

    if (!actionLink) {
      return NextResponse.json({ 
        error: 'Unable to generate authentication link. Please verify system configuration.' 
      }, { status: 400 });
    }

    // 4. DISPATCH EMAIL VIA RESEND
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const subject = isMagicLink 
        ? 'One-Click Admin Access Link — People & Youth Console' 
        : 'Set / Reset Your Password — People & Youth Console';

      const buttonLabel = isMagicLink ? '✨ Access Admin Console Now' : '🔑 Set / Update Your Password';

      await resend.emails.send({
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
    }

    return NextResponse.json({ 
      success: true, 
      message: isMagicLink 
        ? '✨ One-click login link sent! Check your email inbox.' 
        : '📧 Password setup email sent! Check your inbox to configure your password.' 
    });

  } catch (error: any) {
    console.error('Auth Link API Error:', error);
    return NextResponse.json({ 
      error: error?.message || 'An unexpected server error occurred.' 
    }, { status: 500 });
  }
}