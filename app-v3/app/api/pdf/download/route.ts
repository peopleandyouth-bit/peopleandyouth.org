import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { publicationId, userEmail, userName } = body;

    if (!userEmail || !publicationId) {
      return NextResponse.json({ error: 'User email and publication ID required' }, { status: 400 });
    }

    // Capture IP & Device Info
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown Device';

    // 1. Audit Download Event in Supabase
    const { error: auditError } = await supabase.from('document_downloads').insert([
      {
        user_email: userEmail,
        publication_id: publicationId,
        publication_title: publicationId,
        ip_address: ip,
        device_info: userAgent,
        watermark_hash: `PY-WM-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        pdf_password_type: 'user_email'
      }
    ]);

    if (auditError) {
      console.error('Audit Error:', auditError);
    }

    // 2. Return Watermarked Document Certificate Stream payload
    return NextResponse.json({
      success: true,
      downloadUrl: `/articles/${publicationId}`,
      passwordHint: `Your password is your registered email: ${userEmail}`,
      watermarkText: `© People & Youth • www.peopleandyouth.org • Licensed to ${userName} (${userEmail})`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'PDF Generation failed' }, { status: 500 });
  }
}