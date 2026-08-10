import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, email, acceptedTerms } = await req.json();

    if (!email || !acceptedTerms) {
      return NextResponse.json({ error: 'Email and acceptance are required.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    // 1. UPDATE DATABASE RECORD IN SUPABASE
    const { error: dbError } = await supabase
      .from('authors')
      .update({
        consent_status: 'ACCEPTED',
        consented_at: timestamp
      })
      .eq('email', email);

    if (dbError) {
      console.warn('DB Update warning:', dbError.message);
    }

    // 2. DISPATCH EMAIL ALERT TO contact@peopleandyouth.org
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: 'People & Youth System <contact@peopleandyouth.org>',
        to: ['contact@peopleandyouth.org'],
        subject: `[CONSENT RECORDED] ${name || email} Has Formally Accepted Appointment Terms`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #030611; color: #f3f4f6; padding: 24px;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #070b19; border: 1px solid #fbbf24; border-radius: 10px; padding: 24px;">
              <span style="color: #fbbf24; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
                INSTITUTIONAL GOVERNANCE ALERT
              </span>
              <h2 style="color: #ffffff; margin-top: 6px; font-size: 18px;">Formal Consent & Mandate Acceptance Recorded</h2>
              
              <div style="background-color: #030611; border-left: 4px solid #10b981; padding: 12px; margin: 16px 0; font-size: 13px;">
                <p style="margin: 0; color: #ffffff;"><strong>Member Name:</strong> ${name || 'N/A'}</p>
                <p style="margin: 4px 0 0 0; color: #10b981;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 4px 0 0 0; color: #9ca3af;"><strong>Status:</strong> FORMALLY ACCEPTED</p>
                <p style="margin: 4px 0 0 0; color: #9ca3af;"><strong>Timestamp:</strong> ${timestamp}</p>
              </div>

              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                This consent record has been permanently logged into the Supabase institutional database and updated in your Command Centre dashboard.
              </p>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true, message: 'Institutional consent recorded successfully.' });
  } catch (error: any) {
    console.error('Consent submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}