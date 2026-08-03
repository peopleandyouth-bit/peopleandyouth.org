import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'py_webhook_secret_2026';

    // Verify Razorpay Webhook Signature
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyText)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(bodyText);
    const paymentEntity = payload.payload?.payment?.entity;

    if (paymentEntity && (payload.event === 'payment.captured' || payload.event === 'order.paid')) {
      const holderName = paymentEntity.notes?.name || paymentEntity.email?.split('@')[0] || 'Civic Fellow';
      const email = paymentEntity.email || '';
      const phone = paymentEntity.contact || '';
      const paymentId = paymentEntity.id || 'pay_manual';
      const passportId = `PY-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      // Save to Supabase
      const { error } = await supabase.from('civic_passports').insert([
        {
          passport_id: passportId,
          holder_name: holderName,
          email: email,
          phone: phone,
          payment_id: paymentId,
          amount_paid: '₹499',
          status: 'Active'
        }
      ]);

      if (error) console.error('Supabase Passport Insert Error:', error);

      // Trigger Confirmation Email if Resend key is set
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY && email) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'People & Youth <contact@peopleandyouth.org>',
            to: [email],
            subject: `Civic Passport Issued: ${passportId} | People & Youth`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #070b19; color: #ffffff; padding: 30px; border-radius: 16px; border: 2px solid #06b6d4;">
                <h2 style="color: #38bdf8; margin-top: 0;">Sovereign Civic Passport Issued</h2>
                <p>Dear <strong>${holderName}</strong>,</p>
                <p>Your official digital identity credential has been verified and registered into the People &amp; Youth institutional ledger.</p>
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
                  <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;">Passport ID: <strong style="color: #38bdf8; font-family: monospace;">${passportId}</strong></p>
                  <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;">Tier: <strong style="color: #34d399;">Verified Tier 1 Fellow</strong></p>
                  <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;">Access Level: <strong>Lifetime Free Access</strong></p>
                  <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;">Payment Reference: <span style="font-family: monospace;">${paymentId}</span></p>
                </div>
                <p style="font-size: 13px; color: #cbd5e1;">You can view and present your digital card on the <a href="https://www.peopleandyouth.org/about" style="color: #38bdf8;">People &amp; Youth Portal</a>.</p>
                <p style="font-size: 12px; color: #64748b; margin-top: 30px;">People &amp; Youth Digital Institution (VNJCM) • contact@peopleandyouth.org</p>
              </div>
            `
          }),
        });
      }

      return NextResponse.json({ success: true, passportId });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
