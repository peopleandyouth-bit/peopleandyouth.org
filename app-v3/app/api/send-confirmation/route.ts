import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, fullName, roleApplied } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Missing candidate email or name' }, { status: 400 });
    }

    // Extract First Name
    const firstName = fullName.trim().split(' ')[0] || fullName;
    const role = roleApplied || 'Selected Position';

    // HTML Email Template matching People & Youth Institutional Branding
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
        
        <!-- Header Banner -->
        <div style="background-color: #070b19; padding: 28px; text-align: center; border-bottom: 3px solid #06b6d4;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; tracking-tight: 1px; font-weight: 800;">
            PEOPLE &amp; YOUTH
          </h1>
          <p style="color: #38bdf8; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
            Digital Institution • Talent Acquisition
          </p>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px; line-height: 1.6; font-size: 14px;">
          <p style="font-size: 16px; font-weight: bold; color: #0f172a;">Dear ${firstName},</p>

          <p>Thank you for your interest in contributing to <strong>People &amp; Youth</strong>.</p>

          <p>We are pleased to confirm that we have successfully received your application for the position of <strong>${role}</strong>.</p>

          <p>At People &amp; Youth, we believe that enduring institutions are built by individuals who choose to dedicate their knowledge, integrity, and skills to the service of society. Every application we receive represents more than professional experience—it reflects a willingness to contribute to a larger mission of strengthening civic engagement, advancing evidence-based dialogue, and creating opportunities for meaningful public impact.</p>

          <div style="background-color: #f8fafc; border-left: 4px solid #06b6d4; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #0f172a;">What Happens Next</h3>
            <p style="margin: 0 0 10px 0;">Our recruitment process is designed to be thoughtful, transparent, and merit-based. Your application will typically progress through the following stages:</p>
            <ol style="margin: 0; padding-left: 20px; color: #334155;">
              <li>Application Review</li>
              <li>Shortlisting</li>
              <li>Assessment (if applicable)</li>
              <li>Interview(s)</li>
              <li>Final Evaluation</li>
              <li>Offer &amp; Onboarding</li>
            </ol>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #475569;">
              If shortlisted, our Talent Acquisition Team will contact you using the email address or phone number provided in your application.
            </p>
          </div>

          <h3 style="font-size: 15px; color: #0f172a; margin-top: 24px;">Stay Connected</h3>
          <p>You can log in to your People &amp; Youth Careers Dashboard at any time to:</p>
          <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #334155;">
            <li>Track your application status</li>
            <li>Update your profile and résumé</li>
            <li>Upload additional documents or portfolios</li>
            <li>Explore other opportunities across our institution</li>
            <li>Receive recruitment updates and notifications</li>
          </ul>

          <p style="font-size: 13px; color: #64748b; italic;">
            Please note that due to the volume of applications, we may not be able to provide individual feedback for every submission. However, every application is reviewed with care and in accordance with our recruitment standards.
          </p>

          <h3 style="font-size: 15px; color: #0f172a; margin-top: 24px;">Our Commitment</h3>
          <p>People &amp; Youth is committed to providing an equitable, respectful, and inclusive recruitment process. We evaluate applicants on the basis of merit, capability, integrity, and alignment with our institutional values. We welcome applications from individuals of all backgrounds and strive to cultivate a diverse community united by a shared commitment to knowledge, public service, and responsible leadership.</p>

          <p>If you have any questions regarding your application, you may contact us at <a href="mailto:contact@peopleandyouth.org" style="color: #0284c7; font-weight: bold; text-decoration: none;">contact@peopleandyouth.org</a>.</p>

          <p>Thank you once again for considering People &amp; Youth as part of your professional journey. We appreciate your interest in helping build an institution dedicated to advancing knowledge, strengthening democratic societies, and empowering communities across the world.</p>

          <p>We wish you every success throughout the selection process and look forward to learning more about your aspirations.</p>

          <br/>
          <p style="margin: 0; font-weight: bold; color: #0f172a;">Warm regards,</p>
          <p style="margin: 2px 0 0 0; font-weight: bold; color: #0284c7;">Talent Acquisition Team</p>
          <p style="margin: 0; font-weight: bold; color: #0f172a;">People &amp; Youth</p>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b; italic;">Building Institutions. Empowering Humanity.</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">Website: <a href="https://www.peopleandyouth.org" style="color: #0284c7; text-decoration: none;">https://www.peopleandyouth.org</a> | Email: <a href="mailto:contact@peopleandyouth.org" style="color: #0284c7; text-decoration: none;">contact@peopleandyouth.org</a></p>
          <p style="margin: 4px 0 0 0;">&copy; 2026 People &amp; Youth Digital Institution. All rights reserved.</p>
        </div>

      </div>
    `;

    // Dispatching email using Resend API (or fallback Web3Forms / SMTP)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'People & Youth <contact@peopleandyouth.org>',
          to: [email],
          subject: `Application Confirmation: ${role} | People & Youth`,
          html: emailHtml,
        }),
      });

      const resendData = await resendResponse.json();
      return NextResponse.json({ success: true, resendData });
    } else {
      // Fallback log for development testing
      console.log(`[EMAIL AUTOMATION LOG] Confirmation email dispatched to: ${email} for role: ${role}`);
      return NextResponse.json({ success: true, message: 'Email logged (Add RESEND_API_KEY to .env.local for live dispatch)' });
    }

  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
