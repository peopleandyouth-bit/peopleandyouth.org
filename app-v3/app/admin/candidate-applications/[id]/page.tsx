"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const HAPPY_PATH_STAGES = [
  "APPLICATION_SUBMITTED",
  "INITIAL_SCREENING",
  "SKILL_ASSESSMENT",
  "HR_INTERACTION",
  "DOMAIN_INTERVIEW",
  "LEADERSHIP_INTERVIEW",
  "REFERENCE_VERIFICATION",
  "FINAL_DECISION",
  "OFFER_AND_ONBOARDING",
] as const;

const TERMINAL_STAGES = ["REJECTED", "WITHDRAWN", "ARCHIVED"] as const;

const ALL_STATUSES = [
  ...HAPPY_PATH_STAGES,
  ...TERMINAL_STAGES,
] as const;

const STATUS_LABELS: Record<string, string> = {
  APPLICATION_SUBMITTED: "Application Submitted",
  INITIAL_SCREENING: "Initial Screening",
  SKILL_ASSESSMENT: "Skill Assessment",
  HR_INTERACTION: "HR Interaction",
  DOMAIN_INTERVIEW: "Domain Interview",
  LEADERSHIP_INTERVIEW: "Leadership Interview",
  REFERENCE_VERIFICATION: "Reference Verification",
  FINAL_DECISION: "Final Decision",
  OFFER_AND_ONBOARDING: "Offer & Onboarding",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  ARCHIVED: "Archived",
};

type Application = {
  id: string;
  candidate_id: string;
  application_id: string;
  opportunity_id: string | null;
  opportunity_type: string;
  department: string;
  role_title: string;
  location: string | null;
  full_name: string;
  dob: string | null;
  email: string;
  phone: string | null;
  district: string | null;
  linkedin_url: string | null;
  qualification: string | null;
  institution: string | null;
  experience_years: number | null;
  resume_url: string | null;
  technical_skills: string | null;
  preferred_role_type: string | null;
  availability_date: string | null;
  compensation_expectation: string | null;
  why_py_essay: string | null;
  leadership_essay: string | null;
  sop_sample: string | null;
  reference_1: string | null;
  reference_2: string | null;
  verification_consent: boolean;
  digital_signature: string | null;
  agreed_terms: boolean;
  status: string;
  admin_notes: string | null;
  assigned_admin: string | null;
  rejection_reason: string | null;
  submitted_at: string;
  last_status_change_at: string;
  created_at: string;
  updated_at: string;
};

type AuditEvent = {
  id: string;
  event_type: string;
  actor_email: string | null;
  actor_role: string | null;
  source: string | null;
  summary: string | null;
  payload: Record<string, unknown> | null;
  occurred_at: string;
};

type DetailResponse = {
  success: boolean;
  application: Application;
  audit_events: AuditEvent[];
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function CandidateApplicationDetailPage() {
  const params = useParams();
  const applicationId =
    typeof params?.id === "string" ? params.id : "";

  const [application, setApplication] = useState<Application | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [statusDraft, setStatusDraft] = useState("");
  const [assignedDraft, setAssignedDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [rejectionDraft, setRejectionDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const loadDetail = useCallback(async () => {
    if (!applicationId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setNotFound(false);

    try {
      const response = await fetch(
        `/api/admin/candidate-applications/${encodeURIComponent(
          applicationId
        )}`,
        { cache: "no-store" }
      );

      if (response.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const data: DetailResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load application.");
      }

      setApplication(data.application);
      setAuditEvents(data.audit_events ?? []);
      setStatusDraft(data.application.status);
      setAssignedDraft(data.application.assigned_admin ?? "");
      setNotesDraft(data.application.admin_notes ?? "");
      setRejectionDraft(data.application.rejection_reason ?? "");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load application."
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const dirty = useMemo(() => {
    if (!application) return false;
    return (
      statusDraft !== application.status ||
      assignedDraft !== (application.assigned_admin ?? "") ||
      notesDraft !== (application.admin_notes ?? "") ||
      rejectionDraft !== (application.rejection_reason ?? "")
    );
  }, [application, statusDraft, assignedDraft, notesDraft, rejectionDraft]);

  async function saveChanges() {
    if (!application) return;
    setSaving(true);
    setSaveMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin/candidate-applications",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: application.id,
            status: statusDraft,
            assigned_admin: assignedDraft || null,
            admin_notes: notesDraft || null,
            rejection_reason: rejectionDraft || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? "Unable to save changes.");
      }

      setSaveMessage("Changes saved.");
      await loadDetail();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070a12] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="h-8 w-64 animate-pulse rounded bg-white/[0.03]" />
          <div className="mt-8 h-96 animate-pulse rounded-3xl bg-white/[0.025]" />
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#070a12] text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl text-white/40">
            ?
          </div>
          <h1 className="mt-6 text-2xl font-semibold">
            Application not found
          </h1>
          <a
            href="/admin/candidate-applications"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Back to Applications Board
          </a>
        </div>
      </main>
    );
  }

  if (error || !application) {
    return (
      <main className="min-h-screen bg-[#070a12] text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-sm text-red-200">{error}</p>
          <button
            onClick={() => void loadDetail()}
            className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/[0.08]"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        {/* HEADER */}
        <header className="mb-8">
          <div className="mb-4">
            <a
              href="/admin/candidate-applications"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300 hover:text-amber-200"
            >
              ← Applications Board
            </a>
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] text-lg font-semibold text-amber-200">
                {initials(application.full_name)}
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {application.full_name}
                </h1>
                <p className="mt-1 text-sm text-white/50">
                  {application.role_title} · {application.department}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-white/55">
                    {application.candidate_id}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-white/55">
                    {application.application_id}
                  </span>
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2 py-0.5 font-semibold text-amber-300">
                    {STATUS_LABELS[application.status] ?? application.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {saveMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4 text-sm text-emerald-200">
            {saveMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* LEFT COLUMN — APPLICATION */}
          <div className="space-y-5">
            <Panel title="Contact">
              <Detail label="Email" value={application.email} />
              <Detail label="Phone" value={application.phone} />
              <Detail label="District" value={application.district} />
              <Detail
                label="LinkedIn"
                value={application.linkedin_url}
                link
              />
            </Panel>

            <Panel title="Background">
              <Detail
                label="Qualification"
                value={application.qualification}
              />
              <Detail
                label="Institution"
                value={application.institution}
              />
              <Detail
                label="Experience (years)"
                value={
                  application.experience_years !== null
                    ? String(application.experience_years)
                    : null
                }
              />
              <Detail
                label="Date of birth"
                value={application.dob}
              />
              <Detail
                label="Resume"
                value={application.resume_url}
                link
              />
            </Panel>

            <Panel title="Role alignment">
              <Detail
                label="Preferred role type"
                value={application.preferred_role_type}
              />
              <Detail
                label="Availability"
                value={application.availability_date}
              />
              <Detail
                label="Compensation expectation"
                value={application.compensation_expectation}
              />
            </Panel>

            {application.why_py_essay && (
              <Panel title="Why People & Youth?">
                <p className="whitespace-pre-wrap text-sm leading-6 text-white/75">
                  {application.why_py_essay}
                </p>
              </Panel>
            )}

            {application.leadership_essay && (
              <Panel title="Leadership Essay">
                <p className="whitespace-pre-wrap text-sm leading-6 text-white/75">
                  {application.leadership_essay}
                </p>
              </Panel>
            )}

            {application.sop_sample && (
              <Panel title="Statement of Purpose / Sample">
                <a
                  href={application.sop_sample}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-cyan-300 hover:text-cyan-200 underline"
                >
                  {application.sop_sample}
                </a>
              </Panel>
            )}

            <Panel title="References">
              <Detail
                label="Reference 1"
                value={application.reference_1}
              />
              <Detail
                label="Reference 2"
                value={application.reference_2}
              />
              <Detail
                label="Verification consent"
                value={
                  application.verification_consent ? "Granted" : "Not granted"
                }
              />
            </Panel>

            <Panel title="Declaration">
              <Detail
                label="Signed as"
                value={application.digital_signature}
              />
              <Detail
                label="Terms agreed"
                value={application.agreed_terms ? "Yes" : "No"}
              />
              <Detail
                label="Submitted"
                value={formatDateTime(application.submitted_at)}
              />
            </Panel>
          </div>

          {/* RIGHT COLUMN — ADMIN CONTROLS + TIMELINE */}
          <div className="space-y-5">
            <Panel title="Pipeline Status">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Current stage
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/40"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-[#0c111d]">
                        {STATUS_LABELS[s] ?? s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Assigned admin
                  </label>
                  <input
                    value={assignedDraft}
                    onChange={(e) => setAssignedDraft(e.target.value)}
                    placeholder="e.g. Founder"
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-300/40"
                  />
                </div>

                {statusDraft === "REJECTED" && (
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                      Rejection reason
                    </label>
                    <textarea
                      value={rejectionDraft}
                      onChange={(e) => setRejectionDraft(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-red-300/40"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Admin notes
                  </label>
                  <textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    rows={5}
                    placeholder="Internal notes visible to admins only."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-300/40"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => void loadDetail()}
                    disabled={saving}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/55 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => void saveChanges()}
                    disabled={saving || !dirty}
                    className="rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>

                <p className="text-[10px] text-white/25">
                  Last status change:{" "}
                  {formatDateTime(application.last_status_change_at)}
                </p>
              </div>
            </Panel>

            <Panel title="Timeline">
              {auditEvents.length === 0 ? (
                <p className="text-xs text-white/40">
                  No history recorded yet.
                </p>
              ) : (
                <ol className="relative space-y-4 border-l border-white/10 pl-5">
                  {auditEvents.map((event) => (
                    <li key={event.id} className="relative">
                      <span className="absolute -left-[27px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border border-amber-300/50 bg-[#070a12]">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/55">
                          {event.event_type}
                        </span>
                        <span className="text-[10px] text-white/35">
                          {formatDateTime(event.occurred_at)}
                        </span>
                      </div>
                      {event.summary && (
                        <p className="mt-1 text-xs leading-5 text-white/65">
                          {event.summary}
                        </p>
                      )}
                      {event.actor_email && (
                        <p className="mt-1 text-[10px] text-white/30">
                          {event.actor_email}
                          {event.actor_role
                            ? ` · ${event.actor_role}`
                            : ""}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Detail({
  label,
  value,
  link,
}: {
  label: string;
  value: string | null | undefined;
  link?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-white/40">{label}</span>
      {value ? (
        link ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="max-w-[65%] truncate text-right text-xs text-cyan-300 underline hover:text-cyan-200"
          >
            {value}
          </a>
        ) : (
          <span className="max-w-[65%] break-words text-right text-xs text-white/75">
            {value}
          </span>
        )
      ) : (
        <span className="text-xs text-white/25">—</span>
      )}
    </div>
  );
}