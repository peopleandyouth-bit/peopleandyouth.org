export interface EmailPayload {
  scenario: 'registration' | 'career' | 'research' | 'fellowship' | 'event' | 'consulting' | 'payment';
  email: string;
  firstName?: string;
  authorName?: string;
  organisationName?: string;
  memberId?: string;
  applicationId?: string;
  paperId?: string;
  transactionId?: string;
  roleName?: string;
  journalName?: string;
  paperTitle?: string;
  programmeName?: string;
  eventName?: string;
  serviceName?: string;
  department?: string;
  amount?: string;
  purpose?: string;
  date?: string;
}

export function generateInstitutionalEmail(payload: EmailPayload): { subject: string; text: string; html: string; office: string } {
  const dateStr = payload.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const firstName = payload.firstName || 'Member';

  switch (payload.scenario) {
    case 'registration':
      return {
        office: 'Membership Office',
        subject: 'Welcome to People & Youth — Your Journey Begins Here',
        text: `Dear ${firstName},\n\nWelcome to People & Youth.\n\nWe are delighted to welcome you to our growing global community of students, researchers, professionals, entrepreneurs, educators, policymakers, and changemakers committed to strengthening knowledge, leadership, institutions, and civic engagement.\n\nYour registration has been successfully completed.\n\nYour Member Details\n• Member ID: ${payload.memberId || 'PY-MEM-2026-8841'}\n• Registered Email: ${payload.email}\n• Registration Date: ${dateStr}\n\nYour account now provides access to the People & Youth ecosystem, including opportunities to participate in publications, research initiatives, leadership programmes, events, fellowships, career opportunities, and future institutional initiatives.\n\nAs our platform continues to evolve, additional features and resources will become available through your member dashboard.\n\nThank you for choosing to become part of this journey. We look forward to building enduring institutions and meaningful impact together.\n\nWarm regards,\nMembership Office\nPeople & Youth\ncontact@peopleandyouth.org\nwww.peopleandyouth.org`,
        html: `<div style="font-family: Georgia, serif; color: #030611; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C59B27; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #0B192C; font-size: 20px; border-b: 2px solid #C59B27; padding-bottom: 8px;">PEOPLE & YOUTH</h2>
          <p>Dear ${firstName},</p>
          <p>Welcome to People & Youth.</p>
          <p>We are delighted to welcome you to our growing global community of students, researchers, professionals, entrepreneurs, educators, policymakers, and changemakers committed to strengthening knowledge, leadership, institutions, and civic engagement.</p>
          <p>Your registration has been successfully completed.</p>
          <div style="background-color: #070b19; color: #ffffff; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; margin: 15px 0;">
            <p style="margin: 3px 0; color: #C59B27;"><strong>YOUR MEMBER DETAILS</strong></p>
            <p style="margin: 3px 0;">• Member ID: ${payload.memberId || 'PY-MEM-2026-8841'}</p>
            <p style="margin: 3px 0;">• Registered Email: ${payload.email}</p>
            <p style="margin: 3px 0;">• Registration Date: ${dateStr}</p>
          </div>
          <p>Thank you for choosing to become part of this journey. We look forward to building enduring institutions and meaningful impact together.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #555555; margin: 0;">Warm regards,</p>
          <p style="font-size: 13px; font-weight: bold; color: #0B192C; margin: 2px 0;">Membership Office</p>
          <p style="font-size: 12px; color: #555555; margin: 0;">People & Youth &middot; contact@peopleandyouth.org &middot; www.peopleandyouth.org</p>
        </div>`
      };

    case 'career':
      return {
        office: 'Talent Acquisition Office',
        subject: 'Your Application Has Been Successfully Received',
        text: `Dear ${firstName},\n\nThank you for your interest in joining People & Youth.\n\nWe have successfully received your application for the position of ${payload.roleName || 'Position'}.\n\nApplication Summary\n• Application ID: ${payload.applicationId || 'PY-APP-2026-1001'}\n• Position: ${payload.roleName || 'Position'}\n• Department: ${payload.department || 'General'}\n• Date Submitted: ${dateStr}\n\nYour application will now progress through our structured recruitment process, which may include eligibility screening, application review, domain evaluation, interviews, reference verification, and final selection.\n\nIf shortlisted, our Recruitment Team will contact you with further instructions.\n\nWe sincerely appreciate the time and effort you invested in your application and wish you the very best throughout the selection process.\n\nRegards,\nTalent Acquisition Office\nPeople & Youth\ncontact@peopleandyouth.org`,
        html: `<div style="font-family: Georgia, serif; color: #030611; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C59B27; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #0B192C; font-size: 20px; border-bottom: 2px solid #C59B27; padding-bottom: 8px;">PEOPLE & YOUTH</h2>
          <p>Dear ${firstName},</p>
          <p>Thank you for your interest in joining People & Youth.</p>
          <p>We have successfully received your application for the position of <strong>${payload.roleName || 'Position'}</strong>.</p>
          <div style="background-color: #070b19; color: #ffffff; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; margin: 15px 0;">
            <p style="margin: 3px 0; color: #C59B27;"><strong>APPLICATION SUMMARY</strong></p>
            <p style="margin: 3px 0;">• Application ID: ${payload.applicationId || 'PY-APP-2026-1001'}</p>
            <p style="margin: 3px 0;">• Position: ${payload.roleName || 'Position'}</p>
            <p style="margin: 3px 0;">• Department: ${payload.department || 'General'}</p>
            <p style="margin: 3px 0;">• Date Submitted: ${dateStr}</p>
          </div>
          <p>If shortlisted, our Recruitment Team will contact you with further instructions.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #555555; margin: 0;">Regards,</p>
          <p style="font-size: 13px; font-weight: bold; color: #0B192C; margin: 2px 0;">Talent Acquisition Office</p>
          <p style="font-size: 12px; color: #555555; margin: 0;">People & Youth &middot; contact@peopleandyouth.org</p>
        </div>`
      };

    case 'research':
      return {
        office: 'Editorial Office',
        subject: 'Research Submission Successfully Received',
        text: `Dear ${payload.authorName || firstName},\n\nThank you for submitting your manuscript to People & Youth Publications.\n\nYour paper has been successfully received and has entered our editorial workflow.\n\nSubmission Details\n• Submission ID: ${payload.paperId || 'PY-PUB-2026-501'}\n• Journal: ${payload.journalName || 'Policy Renaissance'}\n• Manuscript Title: ${payload.paperTitle || 'Manuscript'}\n• Date Received: ${dateStr}\n\nYour manuscript will undergo an initial editorial assessment to ensure compliance with our submission requirements. Eligible manuscripts may subsequently proceed through peer review in accordance with the editorial policies of the respective publication.\n\nYou will receive updates as your submission progresses through each stage of the review process.\n\nWe appreciate your contribution to evidence-based scholarship and thank you for considering People & Youth as a platform for your research.\n\nKind regards,\nEditorial Office\nPeople & Youth Publications\ncontact@peopleandyouth.org`,
        html: `<div style="font-family: Georgia, serif; color: #030611; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C59B27; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #0B192C; font-size: 20px; border-bottom: 2px solid #C59B27; padding-bottom: 8px;">PEOPLE & YOUTH PUBLICATIONS</h2>
          <p>Dear ${payload.authorName || firstName},</p>
          <p>Thank you for submitting your manuscript to People & Youth Publications.</p>
          <p>Your paper has been successfully received and has entered our editorial workflow.</p>
          <div style="background-color: #070b19; color: #ffffff; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; margin: 15px 0;">
            <p style="margin: 3px 0; color: #C59B27;"><strong>SUBMISSION DETAILS</strong></p>
            <p style="margin: 3px 0;">• Submission ID: ${payload.paperId || 'PY-PUB-2026-501'}</p>
            <p style="margin: 3px 0;">• Journal: ${payload.journalName || 'Policy Renaissance'}</p>
            <p style="margin: 3px 0;">• Title: ${payload.paperTitle || 'Manuscript'}</p>
            <p style="margin: 3px 0;">• Date Received: ${dateStr}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #555555; margin: 0;">Kind regards,</p>
          <p style="font-size: 13px; font-weight: bold; color: #0B192C; margin: 2px 0;">Editorial Office</p>
          <p style="font-size: 12px; color: #555555; margin: 0;">People & Youth Publications &middot; contact@peopleandyouth.org</p>
        </div>`
      };

    case 'fellowship':
      return {
        office: 'Programme Office',
        subject: 'Fellowship Application Confirmation',
        text: `Dear ${firstName},\n\nThank you for applying to the ${payload.programmeName || 'Fellowship Programme'} at People & Youth.\n\nYour application has been successfully submitted and is now under review.\n\nWe carefully evaluate every application on the basis of merit, commitment, leadership potential, and alignment with the objectives of the programme.\n\nYou will be informed regarding the next stage of the selection process once the evaluation has been completed.\n\nWe appreciate your interest in contributing to our institutional mission.\n\nBest wishes,\nProgramme Office\nPeople & Youth`,
        html: `<div style="font-family: Georgia, serif; color: #030611; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C59B27; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #0B192C; font-size: 20px; border-bottom: 2px solid #C59B27; padding-bottom: 8px;">PEOPLE & YOUTH</h2>
          <p>Dear ${firstName},</p>
          <p>Thank you for applying to the <strong>${payload.programmeName || 'Fellowship Programme'}</strong> at People & Youth.</p>
          <p>Your application has been successfully submitted and is now under review.</p>
          <p>We carefully evaluate every application on the basis of merit, commitment, leadership potential, and alignment with the objectives of the programme.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #555555; margin: 0;">Best wishes,</p>
          <p style="font-size: 13px; font-weight: bold; color: #0B192C; margin: 2px 0;">Programme Office</p>
          <p style="font-size: 12px; color: #555555; margin: 0;">People & Youth &middot; contact@peopleandyouth.org</p>
        </div>`
      };

    case 'event':
      return {
        office: 'Events Office',
        subject: 'Registration Confirmed',
        text: `Dear ${firstName},\n\nThank you for registering for ${payload.eventName || 'Annual Summit'}.\n\nYour registration has been successfully confirmed.\n\nFurther information regarding schedules, venue details, joining instructions, and event resources will be shared closer to the event date.\n\nWe look forward to welcoming you.\n\nKind regards,\nEvents Office\nPeople & Youth`,
        html: `<div style="font-family: Georgia, serif; color: #030611; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C59B27; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #0B192C; font-size: 20px; border-bottom: 2px solid #C59B27; padding-bottom: 8px;">PEOPLE & YOUTH</h2>
          <p>Dear ${firstName},</p>
          <p>Thank you for registering for <strong>${payload.eventName || 'Annual Summit'}</strong>.</p>
          <p>Your registration has been successfully confirmed.</p>
          <p>Further information regarding schedules, venue details, joining instructions, and event resources will be shared closer to the event date.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #555555; margin: 0;">Kind regards,</p>
          <p style="font-size: 13px; font-weight: bold; color: #0B192C; margin: 2px 0;">Events Office</p>
          <p style="font-size: 12px; color: #555555; margin: 0;">People & Youth &middot; contact@peopleandyouth.org</p>
        </div>`
      };

    case 'consulting':
      return {
        office: 'People & Youth Advisory',
        subject: 'Consultation Request Received',
        text: `Dear ${payload.organisationName || firstName},\n\nThank you for contacting People & Youth Advisory.\n\nWe have received your enquiry regarding ${payload.serviceName || 'Institutional Consulting'}.\n\nOur advisory team will review your request and contact you to understand your objectives, timelines, and institutional requirements before proposing an appropriate engagement.\n\nWe appreciate the opportunity to explore how we may support your organisation.\n\nSincerely,\nPeople & Youth Advisory\ncontact@peopleandyouth.org`,
        html: `<div style="font-family: Georgia, serif; color: #030611; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C59B27; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #0B192C; font-size: 20px; border-bottom: 2px solid #C59B27; padding-bottom: 8px;">PEOPLE & YOUTH ADVISORY</h2>
          <p>Dear ${payload.organisationName || firstName},</p>
          <p>Thank you for contacting People & Youth Advisory.</p>
          <p>We have received your enquiry regarding <strong>${payload.serviceName || 'Institutional Consulting'}</strong>.</p>
          <p>Our advisory team will review your request and contact you to understand your objectives, timelines, and institutional requirements before proposing an appropriate engagement.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #555555; margin: 0;">Sincerely,</p>
          <p style="font-size: 13px; font-weight: bold; color: #0B192C; margin: 2px 0;">People & Youth Advisory</p>
          <p style="font-size: 12px; color: #555555; margin: 0;">contact@peopleandyouth.org &middot; www.peopleandyouth.org</p>
        </div>`
      };

    case 'payment':
    default:
      return {
        office: 'Finance Office',
        subject: 'Payment Successfully Received',
        text: `Dear ${firstName},\n\nThank you for your payment.\n\nWe confirm that your transaction has been successfully processed.\n\nTransaction Summary\n• Transaction ID: ${payload.transactionId || 'PY-TXN-2026-9021'}\n• Amount: ₹${payload.amount || '499'}\n• Date: ${dateStr}\n• Purpose: ${payload.purpose || 'Civic Passport Membership'}\n\nYour support contributes to the continued development of People & Youth's educational, research, leadership, and institutional initiatives.\n\nAn official receipt has been generated and is available in your dashboard.\n\nThank you for your trust and support.\n\nWarm regards,\nFinance Office\nPeople & Youth`,
        html: `<div style="font-family: Georgia, serif; color: #030611; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C59B27; border-radius: 12px; background-color: #faf8f5;">
          <h2 style="color: #0B192C; font-size: 20px; border-bottom: 2px solid #C59B27; padding-bottom: 8px;">PEOPLE & YOUTH</h2>
          <p>Dear ${firstName},</p>
          <p>Thank you for your payment.</p>
          <p>We confirm that your transaction has been successfully processed.</p>
          <div style="background-color: #070b19; color: #ffffff; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; margin: 15px 0;">
            <p style="margin: 3px 0; color: #C59B27;"><strong>TRANSACTION SUMMARY</strong></p>
            <p style="margin: 3px 0;">• Transaction ID: ${payload.transactionId || 'PY-TXN-2026-9021'}</p>
            <p style="margin: 3px 0;">• Amount: ₹${payload.amount || '499'}</p>
            <p style="margin: 3px 0;">• Date: ${dateStr}</p>
            <p style="margin: 3px 0;">• Purpose: ${payload.purpose || 'Civic Passport Membership'}</p>
          </div>
          <p>An official receipt has been generated and is available in your candidate dashboard.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #555555; margin: 0;">Warm regards,</p>
          <p style="font-size: 13px; font-weight: bold; color: #0B192C; margin: 2px 0;">Finance Office</p>
          <p style="font-size: 12px; color: #555555; margin: 0;">People & Youth &middot; contact@peopleandyouth.org</p>
        </div>`
      };
  }
}