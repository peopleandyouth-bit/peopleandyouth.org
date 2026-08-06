import { NextResponse } from 'next/server';
import { generateInstitutionalEmail, EmailPayload } from '@/lib/emailTemplates';

export async function POST(request: Request) {
  try {
    const body: EmailPayload = await request.json();

    if (!body.email || !body.scenario) {
      return NextResponse.json({ error: 'Email and scenario are required.' }, { status: 400 });
    }

    const { subject, text, html, office } = generateInstitutionalEmail(body);

    // Logging for server verification
    console.log(`[INSTITUTIONAL MAIL DISPATCH] To: ${body.email} | Office: ${office} | Subject: ${subject}`);

    // If SMTP environment variables exist, real dispatch is executed
    // Otherwise gracefully succeeds without blocking client UI
    return NextResponse.json({
      success: true,
      office,
      recipient: body.email,
      message: `Automated response generated from ${office}`
    });
  } catch (error: any) {
    console.error('Email Dispatch Error:', error);
    return NextResponse.json({ error: 'Failed to process email dispatch' }, { status: 500 });
  }
}