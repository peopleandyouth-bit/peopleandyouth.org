import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json(); // type: 'MAGIC_LINK' | 'RESET_PASSWORD'

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY missing on server. Please check Vercel environment settings.' 
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Determine target URL and link type
    const isMagicLink = type === 'MAGIC_LINK';
    const linkType = isMagicLink ? 'magiclink' : 'recovery';
    const redirectTo = isMagicLink 
      ? 'https://www.peopleandyouth.org/admin/command-centre'
      : 'https://www.peopleandyouth.org/admin/reset-password';

    // 1. GENERATE AUTHENTICATION LINK VIA SUPABASE ADMIN
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: linkType,
      email,
      options: { redirectTo }
    });

    if (linkError || !linkData?.properties?.action_link) {
      return NextResponse.json({ 
        error: linkError?.message || 'Failed to generate authentication link. Ensure user is registered.' 
      }, { status: 400 });
    }

    const actionLink = linkData.properties.action_link;

    // 2. DISPATCH BRANDED EMAIL VIA RESEND
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