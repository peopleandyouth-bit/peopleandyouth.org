import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY missing in environment variables.' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const firstName = name ? name.trim().split(' ')[0] : 'Member';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #030611; color: #f3f4f6; padding: 32px 16px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #070b19; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 32px; font-size: 13px; line-height: 1.7; color: #d1d5db;">
          
          <div style="text-align: center; border-bottom: 1px solid #1f2937; padding-bottom: 20px; margin-bottom: 24px;">
            <span style="color: #fbbf24; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px;">
              PEOPLE & YOUTH • ACCOUNT OFFBOARDING
            </span>
            <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase;">
              Account Deletion Confirmation
            </h2>
          </div>

          <p style="color: #ffffff; font-weight: bold;">Dear ${firstName},</p>

          <p>
            This is to confirm that your People & Youth account has been successfully deleted as requested.
          </p>

          <p>
            Your association with the platform has now been closed, and you will no longer be able to access your account or member-specific features associated with it.
          </p>

          <p>
            We understand that leaving an institution is sometimes simply a matter of moving on. Nevertheless, we are grateful that, for a part of your journey, you chose to spend some of your time, thought, or curiosity with People & Youth.
          </p>

          <div style="text-align: center; margin: 28px 0; padding: 16px; background-color: #030611; border: 1px solid #1f2937; border-radius: 8px;">
            <p style="margin: 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">
              Our work is built around a simple belief:
            </p>
            <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 900; color: #fbbf24; letter-spacing: 1px;">
              Question. Reflect. Act.
            </p>
          </div>

          <p>
            We hope that whatever you explored, read, questioned, or contributed here remains useful beyond the boundaries of the platform.
          </p>

          <p>
            If you believe this deletion was made in error, or if you have any questions concerning your account or associated data, please contact us at <a href="mailto:contact@peopleandyouth.org" style="color: #fbbf24; text-decoration: none;">contact@peopleandyouth.org</a>.
          </p>

          <p style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #1f2937;">
            Until our paths cross again,<br/><br/>
            <strong style="color: #ffffff; font-size: 14px;">People & Youth</strong><br/>
            <span style="color: #3b82f6; font-size: 12px; font-weight: bold;">At the Heart of Change 💙</span><br/>
            <span style="color: #9ca3af; font-size: 11px;">Ideas • Society • Humanity</span><br/>
            <a href="https://www.peopleandyouth.org" style="color: #fbbf24; text-decoration: none; font-size: 11px;">peopleandyouth.org</a>
          </p>

        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'People & Youth Executive Office <contact@peopleandyouth.org>',
      to: [email],
      subject: 'Confirmation of Account Deletion — People & Youth',
      html: emailHtml
    });

    return NextResponse.json({ success: true, message: 'Offboarding email dispatched.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to dispatch email.' }, { status: 500 });
  }
}