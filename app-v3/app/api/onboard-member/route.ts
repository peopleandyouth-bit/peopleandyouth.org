import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { name, email, designation, department } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'No email provided, skipping notification' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY missing, unable to send onboarding email.');
      return NextResponse.json({ message: 'Email API key missing' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: 'People & Youth <contact@peopleandyouth.org>',
      to: [email],
      subject: `Welcome to People & Youth — Official Institutional Appointment (${designation || 'Team Member'})`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #030611; color: #f3f4f6; padding: 40px 20px; border-radius: 12px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #070b19; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 32px;">
            <div style="border-b: 1px solid #1f2937; padding-bottom: 16px; margin-bottom: 24px;">
              <span style="color: #fbbf24; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
                OFFICIAL APPOINTMENT NOTICE
              </span>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 8px; margin-bottom: 0;">
                Welcome to People & Youth
              </h1>
            </div>

            <p style="font-size: 15px; color: #e5e7eb; line-height: 1.6;">
              Dear <strong>${name}</strong>,
            </p>

            <p style="font-size: 14px; color: #d1d5db; line-height: 1.6;">
              We are pleased to formally welcome you to the institutional team at <strong>People & Youth</strong>. Your profile has been officially created and integrated into our leadership registry.
            </p>

            <div style="background-color: #030611; border: 1px solid #1f2937; border-left: 4px solid #fbbf24; padding: 16px; margin: 24px 0; border-radius: 6px;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">Designation / Role:</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: bold; color: #fbbf24;">${designation || 'Team Member'}</p>
              ${department ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">Department: <strong style="color: #ffffff;">${department}</strong></p>` : ''}
            </div>

            <p style="font-size: 14px; color: #d1d5db; line-height: 1.6;">
              Your profile is now live across our institutional network and public leadership directory. You can view your record directly at <a href="https://www.peopleandyouth.org/leadership" style="color: #fbbf24; text-decoration: underline;">peopleandyouth.org/leadership</a>.
            </p>

            <p style="font-size: 14px; color: #d1d5db; line-height: 1.6;">
              For any editorial updates, publication submissions, or administrative queries, feel free to reply directly to this email or reach out to the Founder's Office.
            </p>

            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #1f2937; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; font-weight: bold; margin: 0;">
                OFFICE OF THE FOUNDER & MANAGING DESK
              </p>
              <p style="font-size: 11px; color: #6b7280; margin-top: 4px;">
                People & Youth • <a href="https://www.peopleandyouth.org" style="color: #6b7280;">www.peopleandyouth.org</a>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Onboarding email sent successfully' });
  } catch (error: any) {
    console.error('Onboarding email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}