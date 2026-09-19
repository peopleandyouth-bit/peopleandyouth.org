import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  generateIds,
  type ApplicationStatus,
} from "@/lib/candidate-application";

export const dynamic = "force-dynamic";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server configuration is incomplete.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function cleanString(value: unknown, maxLength = 5000) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function cleanBool(value: unknown) {
  return value === true || value === "true";
}

function cleanInt(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) return null;
  return parsed;
}

function cleanDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * POST /api/careers/apply
 *
 * Public endpoint. Accepts the 6-stage application payload and writes
 * a durable row to candidate_applications. Sends confirmation email
 * via the existing /api/email route (fire-and-forget, non-blocking).
 *
 * The submitter is anonymous. No authentication required.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const fullName = cleanString(body.full_name, 300);
  const email = cleanString(body.email, 300);
  const roleTitle = cleanString(body.role_title, 300);
  const opportunityType = cleanString(body.opportunity_type, 200);
  const department = cleanString(body.department, 200);

  if (!fullName) {
    return NextResponse.json(
      { error: "Full legal name is required." },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { error: "Email is required." },
      { status: 400 }
    );
  }

  if (!roleTitle) {
    return NextResponse.json(
      { error: "Role title is required." },
      { status: 400 }
    );
  }

  const ids = generateIds();

  const insertRow: Record<string, unknown> = {
    candidate_id: ids.candidateId,
    application_id: ids.applicationId,

    opportunity_id: cleanString(body.opportunity_id, 200),
    opportunity_type: opportunityType ?? "Career",
    department: department ?? "Unspecified",
    role_title: roleTitle,
    location: cleanString(body.location, 200),

    full_name: fullName,
    dob: cleanDate(body.dob),
    email,
    phone: cleanString(body.phone, 60),
    district: cleanString(body.district, 200),
    linkedin_url: cleanString(body.linkedin_url, 500),

    qualification: cleanString(body.qualification, 300),
    institution: cleanString(body.institution, 300),
    experience_years: cleanInt(body.experience_years),
    resume_url: cleanString(body.resume_url, 1000),
    technical_skills: cleanString(body.technical_skills, 2000),

    preferred_role_type: cleanString(body.preferred_role_type, 100),
    availability_date: cleanString(body.availability_date, 100),
    compensation_expectation: cleanString(body.compensation_expectation, 200),

    why_py_essay: cleanString(body.why_py_essay, 5000),
    leadership_essay: cleanString(body.leadership_essay, 5000),
    sop_sample: cleanString(body.sop_sample, 1000),

    reference_1: cleanString(body.reference_1, 500),
    reference_2: cleanString(body.reference_2, 500),
    verification_consent: cleanBool(body.verification_consent),

    digital_signature: cleanString(body.digital_signature, 300),
    agreed_terms: cleanBool(body.agreed_terms),

    status: "APPLICATION_SUBMITTED" as ApplicationStatus,
  };

  const supabase = getAdminSupabase();

  const { data: application, error: insertError } = await supabase
    .from("candidate_applications")
    .insert(insertRow)
    .select("id, candidate_id, application_id, status, submitted_at")
    .single();

  if (insertError) {
    console.error("Candidate application insert error:", insertError);
    return NextResponse.json(
      { error: "Unable to record your application." },
      { status: 500 }
    );
  }

  // Best-effort audit entry.
  try {
    await supabase.from("candidate_application_audit_log").insert({
      application_id: application.id,
      event_type: "APPLICATION_CREATED",
      actor_email: email,
      actor_role: "applicant",
      source: "POST /api/careers/apply",
      summary: `Application submitted for ${roleTitle}`,
      payload: {
        opportunity_id: insertRow.opportunity_id,
        opportunity_type: insertRow.opportunity_type,
        department: insertRow.department,
        role_title: roleTitle,
      },
    });
  } catch (auditError) {
    console.error("Candidate audit insert error:", auditError);
  }

  // Fire-and-forget confirmation email.
  const isFellowship =
    (opportunityType ?? "").toLowerCase().includes("fellowship") ||
    (opportunityType ?? "").toLowerCase().includes("internship");

  fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.peopleandyouth.org"}/api/email`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario: isFellowship ? "fellowship" : "career",
        email,
        firstName: fullName.split(" ")[0],
        applicationId: application.application_id,
        roleName: roleTitle,
        department,
        programmeName: roleTitle,
      }),
    }
  ).catch((err) =>
    console.error("Confirmation email trigger error:", err)
  );

  return NextResponse.json(
    {
      success: true,
      application: {
        id: application.id,
        candidate_id: application.candidate_id,
        application_id: application.application_id,
        status: application.status,
        submitted_at: application.submitted_at,
      },
    },
    { status: 201 }
  );
}