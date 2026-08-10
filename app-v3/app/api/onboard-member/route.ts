import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, email, designation, department, office, profile_url } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'No email provided' }, { status: 400 });
    }

    // 1. AUTO INVITE TO SUPABASE AUTH (auth.users)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: 'https://www.peopleandyouth.org/admin'
      });
    }

    // 2. DISPATCH VERBATIM INSTITUTIONAL APPOINTMENT LETTER
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const resolvedOffice = office || 'Global Secretariat & Executive Offices';
      const resolvedProfileUrl = profile_url || 'https://www.peopleandyouth.org/leadership';
      const consentUrl = `https://www.peopleandyouth.org/consent?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

      await resend.emails.send({
        from: 'People & Youth <contact@peopleandyouth.org>',
        to: [email],
        subject: 'Welcome to People & Youth — Your Institutional Appointment Has Been Confirmed',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030611; color: #f3f4f6; padding: 40px 16px;">
            <div style="max-width: 680px; margin: 0 auto; background-color: #070b19; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 36px 28px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
              
              <!-- HEADER BADGE -->
              <div style="border-b: 1px solid #1f2937; padding-bottom: 20px; margin-bottom: 24px; text-align: center;">
                <span style="color: #fbbf24; font-size: 11px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; display: block; margin-bottom: 6px;">
                  CONFIRMATION OF INSTITUTIONAL APPOINTMENT
                </span>
                <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 0;">
                  People & Youth
                </h1>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 4px; margin-bottom: 0;">
                  Building a generation that questions with integrity, reflects with humility, and acts with purpose.
                </p>
              </div>

              <!-- TOP MANDATORY CONSENT BANNER -->
              <div style="background-color: rgba(251, 191, 36, 0.1); border: 1px solid #fbbf24; border-radius: 10px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <span style="color: #fbbf24; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 8px;">
                  ⚠️ MANDATORY ACTION REQUIRED: INSTITUTIONAL CONSENT & ACCEPTANCE
                </span>
                <p style="font-size: 13px; color: #e5e7eb; margin: 0 0 14px 0; line-height: 1.5;">
                  In accordance with People & Youth governance standards, all onboarded members are required to review our institutional terms and record their formal consent prior to assuming active duties.
                </p>
                <a href="${consentUrl}" style="display: inline-block; background-color: #fbbf24; color: #030611; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
                  👉 Review Terms & Provide Institutional Consent →
                </a>
              </div>

              <!-- CARD 1: WELCOME & APPOINTMENT -->
              <div style="background-color: #030611; border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <p style="font-size: 15px; color: #ffffff; font-weight: 700; margin-top: 0; margin-bottom: 12px;">
                  Dear ${name},
                </p>
                <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin-bottom: 16px;">
                  We are pleased to formally welcome you to the institutional network of People & Youth. Following the completion and review of your application, we are pleased to confirm your appointment as:
                </p>

                <div style="background-color: #070b19; border-left: 4px solid #fbbf24; padding: 16px; border-radius: 6px;">
                  <p style="margin: 0; font-size: 18px; font-weight: 900; color: #fbbf24;">${designation || 'Institutional Member'}</p>
                  <p style="margin: 6px 0 0 0; font-size: 13px; color: #e5e7eb;"><strong>Department:</strong> ${department || 'Executive Board'}</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #e5e7eb;"><strong>Office / Division:</strong> ${resolvedOffice}</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #e5e7eb;"><strong>Institutional Profile:</strong> <a href="${resolvedProfileUrl}" style="color: #fbbf24; text-decoration: underline;">${resolvedProfileUrl}</a></p>
                </div>

                <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin-top: 16px; margin-bottom: 0;">
                  Your appointment represents more than the addition of another name to an organizational directory. People & Youth is being built as a growing institutional ecosystem in which individuals contribute through knowledge, leadership, research, partnerships, public engagement, and execution. Your role has therefore been established with a defined place within our institutional architecture.
                </p>
              </div>

              <!-- CARD 2: YOUR ROLE WITHIN PEOPLE & YOUTH -->
              <div style="background-color: #030611; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <h2 style="font-size: 13px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 0; margin-bottom: 12px;">
                  YOUR ROLE WITHIN PEOPLE & YOUTH
                </h2>
                <p style="font-size: 13.5px; color: #d1d5db; line-height: 1.6; margin-bottom: 12px;">
                  As <strong>${designation || 'a team member'}</strong>, your responsibilities may include contributing to the development of the institution within your designated area, collaborating with other members of the network, participating in institutional initiatives, and helping translate ideas into measurable outcomes.
                </p>
                <p style="font-size: 13px; color: #9ca3af; margin-bottom: 8px;">Depending upon your mandate, your work may involve:</p>
                <ul style="font-size: 13px; color: #d1d5db; line-height: 1.8; padding-left: 20px; margin: 0 0 12px 0;">
                  <li>Institutional development and execution</li>
                  <li>Research, analysis and knowledge creation</li>
                  <li>Strategic partnerships and external engagement</li>
                  <li>Campaigns and public communication</li>
                  <li>Youth leadership and civic participation</li>
                  <li>Business development and organizational growth</li>
                  <li>Editorial and intellectual contributions</li>
                  <li>Events, programmes and institutional initiatives</li>
                  <li>Regional, national or international expansion</li>
                </ul>
                <p style="font-size: 12px; color: #6b7280; margin: 0;">
                  Your specific responsibilities remain governed by the mandate associated with your position and may evolve as the institution develops.
                </p>
              </div>

              <!-- CARD 3: YOUR PLACE IN THE NETWORK -->
              <div style="background-color: #030611; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <h2 style="font-size: 13px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 0; margin-bottom: 12px;">
                  YOUR PLACE IN THE NETWORK
                </h2>
                <p style="font-size: 13.5px; color: #d1d5db; line-height: 1.6; margin-bottom: 16px;">
                  People & Youth is designed around the principle that institutions become stronger when responsibility is distributed among capable people while purpose remains shared. You will therefore have the opportunity to work across our developing ecosystem, including:
                </p>
                <div style="font-size: 13px; color: #d1d5db; line-height: 1.6;">
                  <p style="margin: 0 0 10px 0;"><strong style="color: #fbbf24;">Dissent Dias:</strong> A platform for essays, ideas, reflections and public discourse.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #fbbf24;">The Renaissance Series:</strong> Our growing research and publication ecosystem spanning multiple disciplines.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #fbbf24;">Knowledge Realms & Knowledge Caves:</strong> Curated intellectual and research environments designed to make knowledge accessible, organized and useful.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #fbbf24;">People & Youth Advisory:</strong> Strategic, policy, institutional, market and organizational advisory initiatives.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #fbbf24;">Leadership & Civic Network:</strong> A growing network of youth ambassadors, coordinators, researchers, consultants, campaigners and institutional contributors.</p>
                  <p style="margin: 0;"><strong style="color: #fbbf24;">Research & Public Policy:</strong> Research, policy analysis, field studies, institutional reports and evidence-driven public engagement.</p>
                </div>
              </div>

              <!-- CARD 4: WHAT WE EXPECT FROM OUR MEMBERS -->
              <div style="background-color: #030611; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <h2 style="font-size: 13px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 0; margin-bottom: 12px;">
                  WHAT WE EXPECT FROM OUR MEMBERS
                </h2>
                <p style="font-size: 13.5px; color: #d1d5db; line-height: 1.6; margin-bottom: 16px;">
                  Membership and appointment within People & Youth carry an expectation of professionalism, integrity and institutional responsibility. We expect every member to:
                </p>
                <div style="font-size: 13px; color: #d1d5db; line-height: 1.6;">
                  <p style="margin: 0 0 10px 0;"><strong style="color: #ffffff;">Think independently:</strong> Question assumptions and contribute ideas with intellectual honesty.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #ffffff;">Work with integrity:</strong> Represent People & Youth responsibly in professional and public settings.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #ffffff;">Respect evidence:</strong> Distinguish research, opinion, experience and verified information.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #ffffff;">Collaborate generously:</strong> Recognize that institutional progress is rarely the work of one individual.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #ffffff;">Take ownership:</strong> Where responsibility is accepted, execution matters as much as intention.</p>
                  <p style="margin: 0;"><strong style="color: #ffffff;">Protect institutional trust:</strong> Safeguard confidential information, intellectual property, member information and institutional resources.</p>
                </div>
              </div>

              <!-- CARD 5: BUILDING SOMETHING THAT OUTLASTS US -->
              <div style="background-color: #030611; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <h2 style="font-size: 13px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 0; margin-bottom: 12px;">
                  BUILDING SOMETHING THAT OUTLASTS US
                </h2>
                <p style="font-size: 13.5px; color: #d1d5db; line-height: 1.6; margin-bottom: 12px;">
                  People & Youth is being built with a long-term institutional ambition. Its purpose is not simply to create another website, community, publication or professional network.
                </p>
                <p style="font-size: 13.5px; color: #d1d5db; line-height: 1.6; margin-bottom: 12px;">
                  The larger objective is to create an ecosystem where knowledge can become action, young people can become institutional leaders, research can inform decisions, and individuals from very different social and geographic backgrounds can participate in building something larger than themselves.
                </p>
                <p style="font-size: 13.5px; color: #d1d5db; line-height: 1.6; margin-bottom: 12px;">
                  From a student, researcher or young professional beginning their journey to an experienced consultant, academic, entrepreneur, policy professional or institutional leader—the network is intended to create meaningful pathways for contribution.
                </p>
                <p style="font-size: 13.5px; color: #fbbf24; font-weight: 700; line-height: 1.6; margin: 0;">
                  Institutions endure not merely because of those who establish them, but because of those who strengthen them. You are now part of that effort.
                </p>
              </div>

              <!-- CARD 6: YOUR NEXT STEPS -->
              <div style="background-color: #030611; border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <h2 style="font-size: 13px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 0; margin-bottom: 12px;">
                  YOUR NEXT STEPS
                </h2>
                <p style="font-size: 13px; color: #9ca3af; margin-bottom: 12px;">You may now:</p>
                <div style="font-size: 13px; color: #e5e7eb; line-height: 1.6;">
                  <p style="margin: 0 0 10px 0;"><strong style="color: #fbbf24;">01 — Review your profile:</strong> Visit your leadership profile and verify your information.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #fbbf24;">02 — Understand your mandate:</strong> Review the responsibilities associated with your designation.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #fbbf24;">03 — Connect with your institutional team:</strong> Coordinate with relevant department heads, partners or colleagues.</p>
                  <p style="margin: 0 0 10px 0;"><strong style="color: #fbbf24;">04 — Begin contributing:</strong> Participate in relevant projects, publications, campaigns, research or institutional initiatives.</p>
                  <p style="margin: 0;"><strong style="color: #fbbf24;">05 — Keep your profile current:</strong> Share relevant professional achievements, publications, projects and institutional contributions with the appropriate office.</p>
                </div>
              </div>

              <!-- CARD 7: A NOTE FROM THE FOUNDER'S OFFICE -->
              <div style="background-color: #030611; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; margin-bottom: 28px;">
                <h2 style="font-size: 13px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 0; margin-bottom: 12px;">
                  A NOTE FROM THE FOUNDER'S OFFICE
                </h2>
                <p style="font-size: 13.5px; color: #d1d5db; line-height: 1.6; margin-bottom: 12px;">
                  People & Youth is still young. That is precisely why every person who joins at this stage matters. The systems, publications, research networks, advisory practices, chapters and institutions that may eventually emerge from this platform are being built today—one idea, one contribution, one relationship and one responsible decision at a time.
                </p>
                <p style="font-size: 13.5px; color: #d1d5db; line-height: 1.6; margin-bottom: 12px;">
                  We do not ask you merely to occupy a position. We invite you to give that position meaning. If you believe that knowledge should empower, dialogue should unite, leadership should serve, and institutions should create public value, then there is meaningful work ahead.
                </p>
                <p style="font-size: 14px; font-weight: 700; color: #fbbf24; margin: 0;">
                  Welcome to People & Youth. We look forward to building with you.
                </p>
              </div>

              <!-- FOOTER SIGN-OFF -->
              <div style="border-t: 1px solid #1f2937; padding-top: 20px; text-align: center; font-size: 12px; color: #9ca3af; line-height: 1.6;">
                <p style="font-weight: 900; color: #ffffff; letter-spacing: 1px; margin: 0 0 4px 0; text-transform: uppercase;">
                  OFFICE OF THE FOUNDER & CHIEF EXECUTIVE OFFICER
                </p>
                <p style="color: #fbbf24; font-weight: 700; margin: 0 0 8px 0;">People & Youth</p>
                <p style="font-size: 12px; color: #d1d5db; margin: 0 0 12px 0;">
                  Building a generation that questions with integrity, reflects with humility, and acts with purpose.
                </p>
                <p style="font-size: 11px; color: #6b7280; margin: 0 0 8px 0;">
                  🌐 <a href="https://www.peopleandyouth.org" style="color: #6b7280; text-decoration: none;">www.peopleandyouth.org</a> &nbsp;|&nbsp; 📧 <a href="mailto:contact@peopleandyouth.org" style="color: #6b7280; text-decoration: none;">contact@peopleandyouth.org</a>
                </p>
                <p style="font-size: 11px; color: #4b5563; margin: 0;">
                  Leadership Directory: <a href="https://www.peopleandyouth.org/leadership" style="color: #6b7280; text-decoration: underline;">peopleandyouth.org/leadership</a>
                </p>
              </div>

            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true, message: 'Verbatim onboarding email with consent banner dispatched' });
  } catch (error: any) {
    console.error('Onboarding letter error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}