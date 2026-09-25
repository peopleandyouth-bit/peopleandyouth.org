'use client';

import { useState } from 'react';
import {
  GLOBAL_CAREER_ROLES,
  CANDIDATE_DEPARTMENTS,
  PREFERRED_ROLE_TYPES,
} from '@/lib/career-roles';

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

const EMPTY = {
  full_name: '',
  email: '',
  phone: '',
  district: '',
  linkedin_url: '',
  qualification: "Bachelor's Degree",
  institution: '',
  experience_years: '',
  resume_url: '',
  technical_skills: '',
  preferred_role_type: 'Full-Time',
  availability_date: 'Immediate',
  compensation_expectation: '',
  why_py_essay: '',
  leadership_essay: '',
  sop_sample: '',
  reference_1: '',
  reference_2: '',
  role_title: GLOBAL_CAREER_ROLES[0],
  department: CANDIDATE_DEPARTMENTS[0],
};

export default function ManualApplicantModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [verificationConsent, setVerificationConsent] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.full_name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!digitalSignature.trim()) {
      setError('Digital signature is required.');
      return;
    }
    if (!agreedTerms) {
      setError('Terms must be agreed.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: 'MANUAL_ENTRY',
          opportunity_type: 'MANUAL',
          department: form.department,
          role_title: form.role_title,
          location: 'Global / Remote',

          full_name: form.full_name.trim(),
          dob: null,
          email: form.email.trim(),
          phone: form.phone || null,
          district: form.district || null,
          linkedin_url: form.linkedin_url || null,

          qualification: form.qualification,
          institution: form.institution || null,
          experience_years:
            form.experience_years && !Number.isNaN(Number(form.experience_years))
              ? Number(form.experience_years)
              : null,
          resume_url: form.resume_url || null,
          technical_skills: form.technical_skills || null,

          preferred_role_type: form.preferred_role_type || null,
          availability_date: form.availability_date || null,
          compensation_expectation: form.compensation_expectation || null,

          why_py_essay: form.why_py_essay || null,
          leadership_essay: form.leadership_essay || null,
          sop_sample: form.sop_sample || null,

          reference_1: form.reference_1 || null,
          reference_2: form.reference_2 || null,
          verification_consent: verificationConsent,

          digital_signature: digitalSignature.trim(),
          agreed_terms: agreedTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Unable to log applicant.');
      }

      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log applicant.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="mx-auto my-8 max-w-4xl rounded-2xl border border-amber-500/30 bg-[#070b19] p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Manual Intake
            </p>
            <h2 className="mt-1 text-lg font-black text-white">
              Log Applicant
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Creates an application in the pipeline. Same schema as the public
              careers form.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1 — Identity */}
          <Section title="Identity & Contact">
            <Field label="Full Legal Name *">
              <input
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                required
              />
            </Field>
            <Field label="Email *">
              <input
                type="email"
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
              />
            </Field>
            <Field label="Phone / WhatsApp">
              <input
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </Field>
            <Field label="State & District">
              <input
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.district}
                onChange={(e) => update('district', e.target.value)}
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                type="url"
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.linkedin_url}
                onChange={(e) => update('linkedin_url', e.target.value)}
              />
            </Field>
          </Section>

          {/* Section 2 — Role */}
          <Section title="Role & Department">
            <Field label="Role / Fellowship *">
              <select
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.role_title}
                onChange={(e) => update('role_title', e.target.value)}
              >
                {GLOBAL_CAREER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Department">
              <select
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
              >
                {CANDIDATE_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Preferred Role Type">
              <select
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.preferred_role_type}
                onChange={(e) => update('preferred_role_type', e.target.value)}
              >
                {PREFERRED_ROLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Availability">
              <input
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.availability_date}
                onChange={(e) => update('availability_date', e.target.value)}
              />
            </Field>
            <Field label="Compensation Expectation">
              <input
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.compensation_expectation}
                onChange={(e) =>
                  update('compensation_expectation', e.target.value)
                }
              />
            </Field>
          </Section>

          {/* Section 3 — Background */}
          <Section title="Education & Experience">
            <Field label="Qualification">
              <select
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.qualification}
                onChange={(e) => update('qualification', e.target.value)}
              >
                <option value="Undergraduate Student">Undergraduate Student</option>
                <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                <option value="Master's / MBA / LLM">Master&apos;s / MBA / LLM</option>
                <option value="Ph.D. / Post-Doctoral">Ph.D. / Post-Doctoral</option>
              </select>
            </Field>
            <Field label="Institution">
              <input
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.institution}
                onChange={(e) => update('institution', e.target.value)}
              />
            </Field>
            <Field label="Experience (Years)">
              <input
                type="number"
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.experience_years}
                onChange={(e) => update('experience_years', e.target.value)}
              />
            </Field>
            <Field label="Technical Skills">
              <input
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.technical_skills}
                onChange={(e) => update('technical_skills', e.target.value)}
              />
            </Field>
            <Field label="Resume / CV URL">
              <input
                type="url"
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.resume_url}
                onChange={(e) => update('resume_url', e.target.value)}
              />
            </Field>
          </Section>

          {/* Section 4 — Assessment */}
          <Section title="Purpose & Assessment">
            <Field label="Why People & Youth?" full>
              <textarea
                rows={3}
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.why_py_essay}
                onChange={(e) => update('why_py_essay', e.target.value)}
              />
            </Field>
            <Field label="Leadership Essay" full>
              <textarea
                rows={3}
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.leadership_essay}
                onChange={(e) => update('leadership_essay', e.target.value)}
              />
            </Field>
            <Field label="Statement of Purpose / Sample URL" full>
              <input
                type="url"
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.sop_sample}
                onChange={(e) => update('sop_sample', e.target.value)}
              />
            </Field>
          </Section>

          {/* Section 5 — References */}
          <Section title="References & Verification">
            <Field label="Reference 1">
              <input
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.reference_1}
                onChange={(e) => update('reference_1', e.target.value)}
              />
            </Field>
            <Field label="Reference 2">
              <input
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={form.reference_2}
                onChange={(e) => update('reference_2', e.target.value)}
              />
            </Field>
            <Field label="Verification Consent" full>
              <label className="flex items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={verificationConsent}
                  onChange={(e) => setVerificationConsent(e.target.checked)}
                />
                Consent to background verification.
              </label>
            </Field>
          </Section>

          {/* Section 6 — Declaration */}
          <Section title="Declaration">
            <Field label="Digital Signature *" full>
              <input
                className="input w-full bg-[#030611] border border-white/15 rounded p-2 text-xs text-white"
                value={digitalSignature}
                onChange={(e) => setDigitalSignature(e.target.value)}
                placeholder="Type full legal name"
                required
              />
            </Field>
            <Field label="Terms & Conditions" full>
              <label className="flex items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                />
                I declare that the details provided are accurate.
              </label>
            </Field>
          </Section>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-amber-400 px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-300 disabled:opacity-50"
            >
              {submitting ? 'Logging…' : 'Log Applicant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#030611] p-4">
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}