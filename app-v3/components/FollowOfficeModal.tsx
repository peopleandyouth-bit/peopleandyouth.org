'use client';

import { useState } from 'react';

type Props = {
  officeSlug: string;
  officeName: string;
  accent: string;
  accentSoft: string;
  border: string;
  surface: string;
  heading: string;
  text: string;
  textMuted: string;
  bg: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const INTERESTS = [
  'Governance',
  'Research',
  'Publications',
  'Policy',
  'Technology',
  'Rural',
  'Education',
  'Youth',
];

const HOW_HEARD = [
  'Website',
  'Referral',
  'Social Media',
  'Event',
  'Publication',
  'Other',
];

const EMPTY = {
  full_name: '',
  email: '',
  district: '',
  phone: '',
  organization: '',
  designation: '',
  linkedin_url: '',
  how_did_you_hear: '',
};

export default function FollowOfficeModal({
  officeSlug,
  officeName,
  accent,
  accentSoft,
  border,
  surface,
  heading,
  text,
  textMuted,
  bg,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [interests, setInterests] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function update<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  }

  function toggleInterest(i: string) {
    setInterests((cur) =>
      cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]
    );
    setError('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.full_name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!form.district.trim()) {
      setError('District is required.');
      return;
    }
    if (interests.length === 0) {
      setError('Select at least one interest.');
      return;
    }
    if (!consent) {
      setError('Please consent to receive updates.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/office/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          office_slug: officeSlug,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          district: form.district.trim(),
          interests,
          consent: true,
          phone: form.phone.trim() || null,
          organization: form.organization.trim() || null,
          designation: form.designation.trim() || null,
          linkedin_url: form.linkedin_url.trim() || null,
          how_did_you_hear: form.how_did_you_hear || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Unable to complete signup.');
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete signup.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-4 backdrop-blur-sm">
      <div
        className="mx-auto my-8 max-w-2xl rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: surface, borderColor: border }}
      >
        <div className="mb-6 flex items-start justify-between border-b pb-4" style={{ borderColor: border }}>
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.28em]"
              style={{ color: accent }}
            >
              Follow the Office
            </p>
            <h2 className="mt-1 text-lg font-black" style={{ color: heading }}>
              {officeName}
            </h2>
            <p className="mt-1 text-xs" style={{ color: textMuted }}>
              Receive a weekly digest of this office&apos;s published work.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 hover:bg-white/5"
            style={{ color: textMuted }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border text-2xl"
              style={{ borderColor: border, backgroundColor: accentSoft, color: accent }}
            >
              ✓
            </div>
            <h3 className="text-lg font-black" style={{ color: heading }}>
              Confirmation Sent
            </h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: text }}>
              A confirmation email has been sent to <strong>{form.email}</strong>.
              Click the link inside to activate your follow.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: accent, color: bg }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name *" theme={{ textMuted, text }}>
                <input
                  value={form.full_name}
                  onChange={(e) => update('full_name', e.target.value)}
                  required
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Email *" theme={{ textMuted, text }}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="District / City *" theme={{ textMuted, text }}>
                <input
                  value={form.district}
                  onChange={(e) => update('district', e.target.value)}
                  required
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Phone" theme={{ textMuted, text }}>
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Organisation" theme={{ textMuted, text }}>
                <input
                  value={form.organization}
                  onChange={(e) => update('organization', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Designation" theme={{ textMuted, text }}>
                <input
                  value={form.designation}
                  onChange={(e) => update('designation', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="LinkedIn URL" theme={{ textMuted, text }}>
                <input
                  type="url"
                  value={form.linkedin_url}
                  onChange={(e) => update('linkedin_url', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="How did you hear?" theme={{ textMuted, text }}>
                <select
                  value={form.how_did_you_hear}
                  onChange={(e) => update('how_did_you_hear', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                >
                  <option value="">— Select —</option>
                  {HOW_HEARD.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div>
              <label
                className="mb-2 block text-[10px] font-bold uppercase tracking-wider"
                style={{ color: textMuted }}
              >
                Interests * (select one or more)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => {
                  const active = interests.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className="rounded-full border px-3 py-1.5 text-[11px] transition"
                      style={{
                        borderColor: active ? accent : border,
                        backgroundColor: active ? accentSoft : 'transparent',
                        color: active ? accent : text,
                      }}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  setError('');
                }}
                className="mt-0.5"
              />
              <span style={{ color: text }}>
                I consent to receive a weekly digest from People &amp; Youth. I
                understand I can unsubscribe at any time.
              </span>
            </label>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-4" style={{ borderColor: border }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                style={{ borderColor: border, color: text }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                style={{ backgroundColor: accent, color: bg }}
              >
                {submitting ? 'Submitting…' : 'Follow Office'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  theme,
  children,
}: {
  label: string;
  theme: { textMuted: string; text: string };
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1 block text-[10px] font-bold uppercase tracking-wider"
        style={{ color: theme.textMuted }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}