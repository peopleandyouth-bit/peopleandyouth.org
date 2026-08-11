import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

function extractErrorMessage(err: any): string {
  if (!err) return 'Unknown authentication error.';
  if (typeof err === 'string' && err.trim() !== '' && err !== '{}') return err;
  if (err.message && typeof err.message === 'string' && err.message.trim() !== '' && err.message !== '{}') return err.message;
  if (err.error_description) return err.error_description;
  try {
    const jsonStr = JSON.stringify(err, Object.getOwnPropertyNames(err));
    if (jsonStr && jsonStr !== '{}' && jsonStr !== '[]') return jsonStr;
  } catch (e) {}
  return 'Authentication request failed. Please check SUPABASE_SERVICE_ROLE_KEY in Vercel.';
}

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
        error: 'Vercel Environment Missing: SUPABASE_SERVICE_ROLE_KEY is not set in Vercel environment variables.' 
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. ALLOWLIST DIRECTORY CHECK (public.authors)
    const { data: authorData, error: authorError } = await supabaseAdmin
      .from('authors')
      .select('id, name, email')
      .ilike('email', email)
      .maybeSingle();

    if (authorError) {
      return NextResponse.json({ error: `Directory Check Failed: ${extractErrorMessage(authorError)}` }, { status: 500 });
    }

    if (!authorData) {
      return NextResponse.json({ 
        error: "Access Denied: This email address is not registered in the People & Youth Directory. Please contact the Founder's Office for onboarding." 
      }, { status: 403 });
    }

    // 2. INITIALIZE USER IN auth.users
    const { error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true
    });

    if (createUserError && !createUserError.message.toLowerCase().includes('already')) {
      console.log('User creation note:', createUserError.message);
    }

    // 3. GENERATE ACTION LINK
    const isMagicLink = type === 'MAGIC_LINK';
    const redirectTo = isMagicLink 
      ? 'https://www.peopleandyouth.org/admin/command-centre'
      : 'https://www.peopleandyouth.org/admin/reset-password';

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo }
    });

    if (linkError || !linkData?.properties?.action_link) {
      return NextResponse.json({ error: extractErrorMessage(linkError) }, { status: 400 });
    }

    const actionLink = linkData.properties.action_link;

    // 4. DISPATCH EMAIL VIA RESEND
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Vercel Environment Missing: RESEND_API_KEY is not set.' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const subject = isMagicLink 
      ? 'One-Click Admin Access Link — People & Youth Console' 
      : 'Set / Reset Your Password — People & Youth Console';

    const sendRes = await resend.emails.send({
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

    if (sendRes.error) {
      return NextResponse.json({ error: `Resend Email Error: ${extractErrorMessage(sendRes.error)}` }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: isMagicLink 
        ? '✨ One-click login link sent! Check your email inbox.' 
        : '📧 Password setup email sent! Check your inbox to configure your password.' 
    });

  } catch (err: any) {
    return NextResponse.json({ error: extractErrorMessage(err) }, { status: 500 });
  }
}