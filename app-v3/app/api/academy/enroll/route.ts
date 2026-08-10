import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

// 1. GET HANDLER (Health Check / Status)
export async function GET() {
  return NextResponse.json({ 
    status: 'Academy enrollment endpoint active',
    service: 'People & Youth Academy Admissions API',
    timestamp: new Date().toISOString()
  });
}

// 2. POST HANDLER (Handles Form Submissions)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      full_name, 
      email, 
      phone, 
      program_track, 
      institution_affiliation, 
      statement_of_purpose 
    } = body;

    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Full name and email address are required fields.' }, 
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // A. STORE ENROLLMENT RECORD IN SUPABASE (If table exists)
    try {
      await supabase.from('academy_enrollments').insert({
        full_name,
        email,
        phone: phone || null,
        program_track: program_track || 'General Policy & Research Fellowship',
        institution_affiliation: institution_affiliation || null,
        statement_of_purpose: statement_of_purpose || null,
        status: 'PENDING_REVIEW',
        created_at: timestamp
      });
    } catch (dbErr) {
      console.warn('Supabase DB Insert Notice (Ensure academy_enrollments table exists):', dbErr);
    }

    // B. DISPATCH NOTIFICATION EMAILS VIA RESEND
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);

      // 1. Confirmation Email to Applicant
      await resend.emails.send({
        from: 'People & Youth Academy <contact@peopleandyouth.org>',
        to: [email],
        subject: 'Application Received — People & Youth Academy',
        html: `
          <div style="font-family: sans-serif; background-color: #030611; color: #f3f4f6; padding: 30px 16px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #070b19; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 28px;">
              <span style="color: #fbbf24; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
                APPLICATION ACKNOWLEDGEMENT
              </span>
              <h1 style="color: #ffffff; font-size: 22px; margin-top: 6px;">People & Youth Academy</h1>
              
              <div style="background-color: #030611; border-left: 4px solid #fbbf24; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 15px; font-weight: bold; color: #fbbf24;">Dear ${full_name},</p>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #d1d5db; line-height: 1.6;">
                  We have successfully received your enrollment application for the <strong>${program_track || 'People & Youth Academy'}</strong>.
                </p>
              </div>

              <p style="font-size: 13px; color: #9ca3af; line-height: 1.6;">
                Our Academic Admissions Committee reviews applications on a rolling basis. If your profile matches our fellowship standards, an institutional representative will reach out to discuss your mandate and onboarding steps.
              </p>

              <div style="margin-top: 24px; border-t: 1px solid #1f2937; padding-top: 16px; font-size: 11px; color: #6b7280; text-align: center;">
                ACADEMIC ADMISSIONS OFFICE • People & Youth<br/>
                🌐 <a href="https://www.peopleandyouth.org" style="color: #6b7280;">www.peopleandyouth.org</a>
              </div>
            </div>
          </div>
        `
      });

      // 2. Alert Email to Founder's Office
      await resend.emails.send({
        from: 'Academy System <contact@peopleandyouth.org>',
        to: ['contact@peopleandyouth.org'],
        subject: `[NEW ACADEMY ENROLLMENT] ${full_name} (${program_track || 'General'})`,
        html: `
          <div style="font-family: sans-serif; background-color: #030611; color: #f3f4f6; padding: 24px;">
            <div style="max-width: 550px; margin: 0 auto; background-color: #070b19; border: 1px solid #fbbf24; border-radius: 10px; padding: 24px;">
              <span style="color: #fbbf24; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
                NEW ACADEMY APPLICANT
              </span>
              <h2 style="color: #ffffff; margin-top: 6px; font-size: 18px;">Academy Enrollment Submission</h2>
              
              <div style="background-color: #030611; padding: 14px; border-radius: 8px; margin: 16px 0; font-size: 13px; border: 1px solid #1f2937;">
                <p style="margin: 0; color: #ffffff;"><strong>Applicant:</strong> ${full_name}</p>
                <p style="margin: 4px 0 0 0; color: #fbbf24;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 4px 0 0 0; color: #d1d5db;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p style="margin: 4px 0 0 0; color: #d1d5db;"><strong>Program:</strong> ${program_track || 'N/A'}</p>
                <p style="margin: 4px 0 0 0; color: #d1d5db;"><strong>Institution:</strong> ${institution_affiliation || 'N/A'}</p>
                <p style="margin: 8px 0 0 0; color: #9ca3af; font-style: italic;">"${statement_of_purpose || 'No statement provided.'}"</p>
              </div>

              <p style="font-size: 11px; color: #6b7280; margin: 0;">
                Logged at ${timestamp} via People & Youth Admissions API.
              </p>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Academy enrollment application submitted successfully.' 
    });

  } catch (error: any) {
    console.error('Academy enrollment API error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your application.', details: error.message }, 
      { status: 500 }
    );
  }
}