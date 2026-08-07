import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import nodemailer from 'nodemailer';

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'contact@peopleandyouth.org',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, prompt_question, message, author_name, author_email, organization } = body;

    if (!message || !author_email) {
      return NextResponse.json(
        { error: 'Please provide your reflection message and a valid contact email.' },
        { status: 400 }
      );
    }

    // 1. Insert Reflection into Supabase
    const { data, error } = await supabase
      .from('reflections')
      .insert({
        category: category || '🖋 Reflection',
        prompt_question: prompt_question || null,
        message,
        author_name: author_name || 'Anonymous Reader',
        author_email,
        organization: organization || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Failed to record reflection in database.' },
        { status: 500 }
      );
    }

    // 2. Parse First Name for Email Template
    const fullName = (author_name || '').trim();
    const firstName = fullName ? fullName.split(' ')[0] : 'Reader';

    // 3. Build HTML Email Body
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030611; color: #f3f4f6; margin: 0; padding: 20px; }
          .container { max-width: 650px; margin: 0 auto; background-color: #070b19; border: 1px solid #d97706; border-radius: 16px; padding: 32px; color: #e5e7eb; }
          .header { border-b: 1px solid rgba(255,255,255,0.1); pb-4; margin-bottom: 24px; }
          .brand { font-size: 14px; font-weight: 900; color: #fbbf24; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; }
          h1 { font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 12px; }
          p { font-size: 14px; line-height: 1.6; color: #d1d5db; margin-bottom: 16px; }
          .section-title { font-size: 15px; font-weight: 800; color: #fbbf24; margin-top: 28px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
          .item-box { background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 14px; }
          .item-title { font-weight: 700; color: #ffffff; font-size: 14px; margin-bottom: 6px; }
          .footer { font-size: 11px; color: #9ca3af; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 32px; padding-top: 20px; line-height: 1.5; }
          a { color: #fbbf24; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="https://www.peopleandyouth.org" class="brand">PEOPLE & YOUTH</a>
          </div>

          <p>Dear ${firstName},</p>

          <p>Thank you for taking the time to share your thoughts through Reflections at People & Youth.</p>

          <p>Every meaningful institution is shaped not only by those who lead it, but also by those who contribute their ideas, questions, experiences, and constructive feedback. Your reflection has been received successfully and is now part of our review process.</p>

          <p>At People & Youth, we believe that thoughtful dialogue is the foundation of stronger institutions, informed societies, and responsible leadership. Whether your message is a suggestion, a critique, an appreciation, or a new perspective, it contributes to a culture of continuous learning and institutional improvement.</p>

          <p>Our team periodically reviews all submissions. Where appropriate, selected reflections may inspire future research, editorial discussions, policy conversations, publications, or institutional initiatives. If your submission requires a personal response or further engagement, a member of our team may reach out to you.</p>

          <p>We sincerely appreciate your trust in choosing People & Youth as a platform for meaningful civic and intellectual engagement.</p>

          <div class="section-title">Continue Exploring the People & Youth Institutional Ecosystem</div>

          <p>Our platform is designed as an interconnected ecosystem of knowledge, leadership, research, and civic engagement. We invite you to discover the initiatives that bring our mission to life:</p>

          <div class="item-box">
            <div class="item-title">🏛️ Dissent Dias</div>
            <p style="margin:0;">A forum for thoughtful essays, editorials, interviews, and public discourse where diverse perspectives meet evidence-based dialogue. Dedicated to fostering critical thinking, constitutional values, and meaningful conversations.</p>
          </div>

          <div class="item-box">
            <div class="item-title">📚 The Renaissance Series</div>
            <p style="margin:0;">A flagship collection of interdisciplinary journals and publications spanning public policy, education, trade, economics, governance, technology, sustainability, health, agriculture, business, and emerging sectors.</p>
          </div>

          <div class="item-box">
            <div class="item-title">🗻 Knowledge Realms, Knowledge Caves & Mountain Ranges</div>
            <p style="margin:0;">A structured digital knowledge repository housing curated research, policy papers, case studies, datasets, analytical reports, learning resources, and domain-specific insights.</p>
          </div>

          <div class="item-box">
            <div class="item-title">🏢 People & Youth Advisory</div>
            <p style="margin:0;">Strategic advisory and institution-building services supporting organizations, enterprises, public institutions, startups, and social initiatives through governance design, market insights, policy research, and innovation-driven consulting.</p>
          </div>

          <div class="item-box">
            <div class="item-title">🎓 People & Youth Academy</div>
            <p style="margin:0;">A learning and leadership platform offering fellowships, internships, executive education, skill development programmes, workshops, simulations, and experiential learning opportunities.</p>
          </div>

          <div class="item-box">
            <div class="item-title">🤝 Careers, Fellowships & Leadership Opportunities</div>
            <p style="margin:0;">Explore internships, full-time roles, fellowships, volunteer programmes, campus chapters, district coordinatorships, youth ambassador initiatives, and leadership positions.</p>
          </div>

          <div class="item-box">
            <div class="item-title">🌐 Become Part of the Journey</div>
            <p style="margin:0;">People & Youth is not merely a platform to join—it is an institution to build. Every contribution, whether through ideas, research, leadership, collaboration, or service, strengthens a shared vision.</p>
          </div>

          <p>Together, we build institutions that empower generations.</p>

          <p style="margin-top:24px;">With gratitude,<br>
          <strong>Office of Community Engagement</strong><br>
          People & Youth<br>
          🌐 <a href="https://www.peopleandyouth.org">www.peopleandyouth.org</a><br>
          📧 <a href="mailto:contact@peopleandyouth.org">contact@peopleandyouth.org</a></p>

          <div class="footer">
            This is an automated acknowledgement confirming that your reflection has been received successfully. Please do not reply directly to this email. If you wish to contact us, write to <a href="mailto:contact@peopleandyouth.org">contact@peopleandyouth.org</a>.
          </div>
        </div>
      </body>
      </html>
    `;

    // 4. Dispatch Email Async
    if (process.env.SMTP_PASS) {
      transporter.sendMail({
        from: '"People & Youth" <contact@peopleandyouth.org>',
        to: author_email,
        subject: 'Acknowledgement: Reflection Received | People & Youth',
        html: htmlEmail,
      }).catch((mailErr) => console.error('Auto-responder mail error:', mailErr));
    }

    return NextResponse.json({
      success: true,
      message: 'Your reflection has been transmitted to The Reader’s Desk. An acknowledgement email has been dispatched to your inbox.',
      reflection: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}