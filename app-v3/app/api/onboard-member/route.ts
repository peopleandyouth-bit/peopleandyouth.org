import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, email, designation, department, office } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY missing in environment variables.' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const recipientName = name || 'Team Member';
    const recipientRole = designation || 'Institutional Member';
    const recipientDept = department || 'Executive Board';
    const recipientOffice = office || 'Global Secretariat & Executive Offices';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #030611; color: #f3f4f6; padding: 32px 16px;">
        <div style="max-width: 650px; margin: 0 auto; background-color: #070b19; border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 32px; font-size: 13px; line-height: 1.7; color: #d1d5db;">
          
          <!-- TOP BANNER: FORMAL CONSENT ACTION REQUIRED -->
          <div style="margin-bottom: 28px; padding: 18px; background-color: #030611; border: 1px solid #fbbf24; border-radius: 10px; text-align: center;">
            <span style="color: #fbbf24; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px;">
              📌 FORMAL ACTION REQUIRED
            </span>
            <p style="color: #ffffff; font-size: 12px; margin: 0 0 12px 0;">
              Please review and submit your official Institutional Appointment Consent Form:
            </p>
            <a href="https://www.peopleandyouth.org/consent" style="display: inline-block; background-color: #fbbf24; color: #030611; font-weight: 900; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-size: 11px; text-transform: uppercase;">
              COMPLETE APPOINTMENT CONSENT →
            </a>
          </div>

          <!-- HEADER TITLE -->
          <div style="text-align: center; border-bottom: 1px solid #1f2937; padding-bottom: 20px; margin-bottom: 24px;">
            <span style="color: #fbbf24; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 6px;">
              CONFIRMATION OF INSTITUTIONAL APPOINTMENT
            </span>
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 900; text-transform: uppercase;">
              People & Youth
            </h2>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 4px; font-style: italic;">
              Building a generation that questions with integrity, reflects with humility, and acts with purpose.
            </p>
          </div>

          <!-- VERBATIM LETTER BODY -->
          <p style="color: #ffffff; font-weight: bold;">Dear ${recipientName},</p>

          <p>
            We are pleased to formally welcome you to the institutional network of People & Youth. Following the completion and review of your application, we are pleased to confirm your appointment as:
          </p>

          <div style="padding: 16px; background-color: #030611; border-left: 3px solid #fbbf24; margin: 16px 0; font-size: 13px;">
            <strong style="color: #ffffff; font-size: 15px; display: block; margin-bottom: 4px;">${recipientRole}</strong>
            <span style="color: #d1d5db; display: block;">Department: ${recipientDept}</span>
            <span style="color: #d1d5db; display: block;">Office / Division: ${recipientOffice}</span>
            <span style="color: #fbbf24; display: block; margin-top: 4px;">Institutional Profile: <a href="https://www.peopleandyouth.org/leadership" style="color: #fbbf24;">https://www.peopleandyouth.org/leadership</a></span>
          </div>

          <p>
            Your appointment represents more than the addition of another name to an organizational directory. People & Youth is being built as a growing institutional ecosystem in which individuals contribute through knowledge, leadership, research, partnerships, public engagement, and execution. Your role has therefore been established with a defined place within our institutional architecture.
          </p>

          <h3 style="color: #fbbf24; font-size: 12px; font-weight: 900; text-transform: uppercase; margin-top: 24px;">
            YOUR ROLE WITHIN PEOPLE & YOUTH
          </h3>

          <p>
            As ${recipientRole}, your responsibilities may include contributing to the development of the institution within your designated area, collaborating with other members of the network, participating in institutional initiatives, and helping translate ideas into measurable outcomes.
          </p>

          <p style="margin-bottom: 4px; font-weight: bold; color: #ffffff;">Depending upon your mandate, your work may involve:</p>
          <ul style="margin-top: 4px; padding-left: 20px; color: #d1d5db;">
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

          <p style="font-style: italic; color: #9ca3af; font-size: 12px;">
            * Your specific responsibilities remain governed by the mandate associated with your position and may evolve as the institution develops.
          </p>

          <hr style="border: 0; border-top: 1px solid #1f2937; margin: 24px 0;" />

          <h3 style="color: #fbbf24; font-size: 12px; font-weight: 900; text-transform: uppercase;">
            YOUR PLACE IN THE NETWORK
          </h3>
          <p>
            People & Youth is designed around the principle that institutions become stronger when responsibility is distributed among capable people while purpose remains shared. You will therefore have the opportunity to work across our developing ecosystem, including:
          </p>
          <p>
            <strong>Dissent Dias:</strong> A platform for essays, ideas, reflections and public discourse.<br/>
            <strong>The Renaissance Series:</strong> Our growing research and publication ecosystem spanning multiple disciplines.<br/>
            <strong>Knowledge Realms & Knowledge Caves:</strong> Curated intellectual and research environments designed to make knowledge accessible, organized and useful.<br/>
            <strong>People & Youth Advisory:</strong> Strategic, policy, institutional, market and organizational advisory initiatives.<br/>
            <strong>Leadership & Civic Network:</strong> A growing network of youth ambassadors, coordinators, researchers, consultants, campaigners and institutional contributors.<br/>
            <strong>Research & Public Policy:</strong> Research, policy analysis, field studies, institutional reports and evidence-driven public engagement
          </p>

          <hr style="border: 0; border-top: 1px solid #1f2937; margin: 24px 0;" />

          <h3 style="color: #fbbf24; font-size: 12px; font-weight: 900; text-transform: uppercase;">
            WHAT WE EXPECT FROM OUR MEMBERS
          </h3>
          <p>
            Membership and appointment within People & Youth carry an expectation of professionalism, integrity and institutional responsibility. We expect every member to:
          </p>
          <ol style="padding-left: 20px; color: #d1d5db;">
            <li><strong>Think independently:</strong> Question assumptions and contribute ideas with intellectual honesty.</li>
            <li><strong>Work with integrity:</strong> Represent People & Youth responsibly in professional and public settings.</li>
            <li><strong>Respect evidence:</strong> Distinguish research, opinion, experience and verified information.</li>
            <li><strong>Collaborate generously:</strong> Recognize that institutional progress is rarely the work of one individual.</li>
            <li><strong>Take ownership:</strong> Where responsibility is accepted, execution matters as much as intention.</li>
            <li><strong>Protect institutional trust:</strong> Safeguard confidential information, intellectual property, member information and institutional resources.</li>
          </ol>

          <hr style="border: 0; border-top: 1px solid #1f2937; margin: 24px 0;" />

          <h3 style="color: #fbbf24; font-size: 12px; font-weight: 900; text-transform: uppercase;">
            YOUR NEXT STEPS
          </h3>
          <p>
            <strong>01 Review your profile:</strong> Visit your leadership profile at <a href="https://www.peopleandyouth.org/leadership" style="color: #fbbf24;">peopleandyouth.org/leadership</a> and verify your information.<br/>
            <strong>02 Understand your mandate:</strong> Review the responsibilities associated with your designation.<br/>
            <strong>03 Connect with your team:</strong> Coordinate with relevant department heads, partners or colleagues.<br/>
            <strong>04 Begin contributing:</strong> Participate in relevant projects, publications, campaigns, research or institutional initiatives.<br/>
            <strong>05 Keep your profile current:</strong> Share relevant professional achievements, publications, projects and institutional contributions with the appropriate office.
          </p>

          <hr style="border: 0; border-top: 1px solid #1f2937; margin: 24px 0;" />

          <h3 style="color: #fbbf24; font-size: 12px; font-weight: 900; text-transform: uppercase;">
            A NOTE FROM THE FOUNDER'S OFFICE
          </h3>
          <p>
            People & Youth is still young. That is precisely why every person who joins at this stage matters. The systems, publications, research networks, advisory practices, chapters and institutions that may eventually emerge from this platform are being built today-one idea, one contribution, one relationship and one responsible decision at a time.
          </p>
          <p>
            We do not ask you merely to occupy a position. We invite you to give that position meaning. If you believe that knowledge should empower, dialogue should unite, leadership should serve, and institutions should create public value, then there is meaningful work ahead.
          </p>
          <p>
            Welcome to People & Youth. We look forward to building with you.
          </p>

          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #1f2937; text-align: center; font-size: 11px; color: #9ca3af;">
            <p style="font-weight: bold; color: #ffffff; margin-bottom: 4px;">
              OFFICE OF THE FOUNDER & CHIEF EXECUTIVE OFFICER
            </p>
            <p style="margin: 0;">People & Youth</p>
            <p style="margin: 4px 0;">
              <a href="https://www.peopleandyouth.org" style="color: #fbbf24; text-decoration: none;">www.peopleandyouth.org</a> | 
              <a href="mailto:contact@peopleandyouth.org" style="color: #fbbf24; text-decoration: none;">contact@peopleandyouth.org</a>
            </p>
            <p style="margin-top: 4px;">
              Leadership Directory: <a href="https://www.peopleandyouth.org/leadership" style="color: #fbbf24; text-decoration: none;">peopleandyouth.org/leadership</a>
            </p>
            
            <!-- BOTTOM BANNER: WORKSPACE & PASSWORD SETUP -->
            <div style="margin-top: 20px; padding: 16px; background-color: #030611; border: 1px solid #1f2937; border-radius: 8px;">
              <p style="color: #d1d5db; font-size: 12px; margin-bottom: 10px;">
                Access your workspace, set up your password, or sign in via Magic Link here:
              </p>
              <a href="https://www.peopleandyouth.org/admin/login" style="display: inline-block; background-color: #fbbf24; color: #030611; font-weight: 900; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 11px; text-transform: uppercase;">
                HTTPS://WWW.PEOPLEANDYOUTH.ORG/ADMIN/LOGIN →
              </a>
            </div>
          </div>

        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'People & Youth Executive Office <contact@peopleandyouth.org>',
      to: [email],
      subject: 'Welcome to People & Youth - Your Institutional Appointment Has Been Confirmed',
      html: emailHtml
    });

    return NextResponse.json({ success: true, message: 'Onboarding email dispatched.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to dispatch email.' }, { status: 500 });
  }
}