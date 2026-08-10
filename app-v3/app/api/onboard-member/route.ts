import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, email, designation, department, office } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'No email provided' }, { status: 400 });
    }

    // 1. CREATE AUTH USER & ISSUE MAGIC LINK INVITE IN SUPABASE AUTH (auth.users)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: 'https://www.peopleandyouth.org/admin'
      });

      if (authError) {
        console.warn('Supabase Auth Invite warning (User may already exist):', authError.message);
      } else {
        console.log('User created in auth.users:', authUser.user.email);
      }
    } else {
      console.warn('SUPABASE_SERVICE_ROLE_KEY missing on Vercel. Auth invite skipped.');
    }

    // 2. DISPATCH SUBSTANTIVE INSTITUTIONAL APPOINTMENT LETTER VIA RESEND
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: 'People & Youth <contact@peopleandyouth.org>',
        to: [email],
        subject: 'Welcome to People & Youth — Your Institutional Appointment Has Been Confirmed',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #030611; color: #f3f4f6; padding: 30px 16px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #070b19; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 28px;">
              <span style="color: #fbbf24; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">CONFIRMATION OF INSTITUTIONAL APPOINTMENT</span>
              <h1 style="color: #ffffff; font-size: 24px; margin-top: 6px;">People & Youth</h1>
              
              <div style="background-color: #030611; border-left: 4px solid #fbbf24; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #fbbf24;">Dear ${name},</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #d1d5db;">Your appointment as <strong>${designation}</strong> in <strong>${department || 'Executive Board'}</strong> (${office || 'Global Secretariat'}) has been confirmed.</p>
              </div>

              <p style="font-size: 13px; color: #9ca3af; line-height: 1.6;">A login invite link from Supabase Auth has also been dispatched to your inbox so you can access your restricted Command Centre workspace at <a href="https://www.peopleandyouth.org/admin" style="color: #fbbf24;">peopleandyouth.org/admin</a>.</p>
              
              <div style="margin-top: 24px; border-t: 1px solid #1f2937; pt-16; font-size: 11px; color: #6b7280; text-align: center;">
                OFFICE OF THE FOUNDER & CHIEF EXECUTIVE OFFICER • People & Youth
              </div>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true, message: 'Auth user invited & appointment letter dispatched' });
  } catch (error: any) {
    console.error('Onboarding handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}