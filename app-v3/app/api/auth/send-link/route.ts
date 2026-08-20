import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://www.peopleandyouth.org';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const rawEmail = body.email || '';
    const requestedType = body.type || 'MAGIC_LINK';

    const email = String(rawEmail).trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!['MAGIC_LINK', 'RESET_PASSWORD'].includes(requestedType)) {
      return NextResponse.json(
        { error: 'Invalid authentication request type.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables on Vercel.' },
        { status: 500 }
      );
    }

    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'Missing RESEND_API_KEY on Vercel.' },
        { status: 500 }
      );
    }

    /*
     * SERVICE-ROLE CLIENT
     * Server only. Never expose this client to the browser.
     */
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    /*
     * ============================================================
     * 1. VERIFY DIRECTORY MEMBERSHIP
     * ============================================================
     */

    const { data: authorData, error: authorError } =
      await supabaseAdmin
        .from('authors')
        .select('id, name, email')
        .ilike('email', email)
        .maybeSingle();

    if (authorError) {
      console.error('Directory lookup error:', authorError);

      return NextResponse.json(
        { error: 'Unable to verify your Directory record.' },
        { status: 500 }
      );
    }

    if (!authorData) {
      return NextResponse.json(
        {
          error:
            "Access Denied: This email address is not registered in the Directory. Please contact the Founder's Office for onboarding.",
        },
        { status: 403 }
      );
    }

    /*
     * ============================================================
     * 2. ENSURE SUPABASE AUTH USER EXISTS
     * ============================================================
     *
     * Your authors table currently contains 12 people, while
     * auth.users contains only the Founder.
     *
     * We therefore provision the Auth user automatically the
     * first time an authorised Directory member requests access.
     */

    let authUserId: string | null = null;

    const {
      data: existingUsers,
      error: listUsersError,
    } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listUsersError) {
      console.error('Auth user lookup error:', listUsersError);

      return NextResponse.json(
        { error: 'Unable to access the authentication directory.' },
        { status: 500 }
      );
    }

    const existingUser = existingUsers.users.find(
      (user) =>
        user.email?.trim().toLowerCase() === email
    );

    if (existingUser) {
      authUserId = existingUser.id;
    } else {
      /*
       * Auto-confirm because the email address has already been
       * approved by the People & Youth authors directory.
       *
       * The actual authentication still requires possession of
       * the email inbox through the generated link.
       */
      const {
        data: createdUser,
        error: createUserError,
      } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          name: authorData.name || '',
          directory_author_id: authorData.id,
          source: 'peopleandyouth-authors-directory',
        },
      });

      if (createUserError || !createdUser.user) {
        console.error('Auth user creation error:', createUserError);

        return NextResponse.json(
          {
            error:
              createUserError?.message ||
              'Unable to create your authentication account.',
          },
          { status: 500 }
        );
      }

      authUserId = createdUser.user.id;
    }

    /*
     * ============================================================
     * 3. GENERATE SUPABASE AUTH TOKEN
     * ============================================================
     *
     * We use generateLink() only to obtain the secure token hash.
     * The email itself continues to be delivered through Resend.
     */

    const isMagicLink = requestedType === 'MAGIC_LINK';

    const verificationType = isMagicLink
      ? 'magiclink'
      : 'recovery';

    const nextPath = isMagicLink
      ? '/admin/command-centre'
      : '/admin/reset-password';

    const {
      data: linkData,
      error: linkError,
    } = await supabaseAdmin.auth.admin.generateLink({
      type: verificationType,
      email,
      options: {
        redirectTo: `${SITE_URL}/api/auth/confirm`,
      },
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('Generate authentication link error:', linkError);

      return NextResponse.json(
        {
          error:
            linkError?.message ||
            'Unable to generate authentication link.',
        },
        { status: 500 }
      );
    }

    /*
     * IMPORTANT:
     *
     * We intentionally do NOT send Supabase's raw action_link.
     *
     * We send the token hash to our own server-side confirmation
     * endpoint, which verifies it and establishes the SSR session.
     */

    const tokenHash = linkData.properties.hashed_token;

    const confirmationLink =
      `${SITE_URL}/api/auth/confirm` +
      `?token_hash=${encodeURIComponent(tokenHash)}` +
      `&type=${encodeURIComponent(verificationType)}` +
      `&next=${encodeURIComponent(nextPath)}`;

    /*
     * ============================================================
     * 4. SEND THROUGH RESEND
     * ============================================================
     */

    const resend = new Resend(resendApiKey);

    const subject = isMagicLink
      ? 'One-Click Admin Access — People & Youth Console'
      : 'Set / Reset Your Password — People & Youth Console';

    const heading = isMagicLink
      ? 'One-Click Console Login'
      : 'Console Password Configuration';

    const description = isMagicLink
      ? 'access your Command Centre workspace'
      : 'configure your personal account password';

    const buttonText = isMagicLink
      ? '✨ Access Admin Console Now'
      : '🔑 Set / Update Your Password';

    const { error: resendError } = await resend.emails.send({
      from: 'People & Youth Security <contact@peopleandyouth.org>',
      to: [email],
      subject,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;background:#030611;color:#f3f4f6;padding:32px 16px;">
          <div style="max-width:550px;margin:0 auto;background:#070b19;border:1px solid rgba(251,191,36,.3);border-radius:12px;padding:28px;text-align:center;">

            <div style="color:#fbbf24;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
              SECURITY & AUTHENTICATION PORTAL
            </div>

            <h2 style="color:#ffffff;margin:12px 0 16px;font-size:20px;">
              ${heading}
            </h2>

            <p style="font-size:13px;color:#d1d5db;line-height:1.6;margin-bottom:24px;">
              Dear ${authorData.name || 'Team Member'},
              <br/><br/>
              Click the button below to ${description}.
            </p>

            <a
              href="${confirmationLink}"
              style="
                display:inline-block;
                background:#fbbf24;
                color:#030611;
                font-weight:900;
                font-size:12px;
                text-transform:uppercase;
                letter-spacing:1px;
                padding:14px 28px;
                border-radius:8px;
                text-decoration:none;
              "
            >
              ${buttonText} →
            </a>

            <p style="font-size:10px;color:#6b7280;line-height:1.5;margin-top:24px;">
              This secure authentication link is single-use and expires
              according to the authentication policy configured for
              People & Youth.
            </p>

          </div>
        </div>
      `,
    });

    if (resendError) {
      console.error('Resend error:', resendError);

      return NextResponse.json(
        {
          error:
            resendError.message ||
            'Unable to send authentication email.',
        },
        { status: 500 }
      );
    }

    /*
     * authUserId is intentionally retained here for future
     * directory/auth mapping if you later add an auth_user_id
     * column to authors.
     */
    void authUserId;

    return NextResponse.json({
      success: true,
      message: isMagicLink
        ? '✨ One-click login link sent! Check your email inbox.'
        : '📧 Password setup email sent! Check your inbox to configure your password.',
    });

  } catch (err: any) {
    console.error('send-link fatal error:', err);

    return NextResponse.json(
      {
        error:
          err?.message ||
          'Server error occurred.',
      },
      { status: 500 }
    );
  }
}