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
};

const EMPTY = {
  requester_name: '',
  requester_email: '',
  requester_phone: '',
  requester_organization: '',
  requester_designation: '',
  purpose: '',
  message: '',
  preferred_date: '',
  preferred_time: '',
  duration_minutes: 30,
};

export default function AppointmentRequestModal({
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
}: Props) {
  const [form, setForm] = useState({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function update<K extends keyof typeof EMPTY>(key: K, value: typeof EMPTY[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.requester_name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!form.requester_email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!form.purpose.trim()) {
      setError('Purpose is required.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/office/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          office_slug: officeSlug,
          requester_name: form.requester_name.trim(),
          requester_email: form.requester_email.trim(),
          requester_phone: form.requester_phone.trim() || null,
          requester_organization: form.requester_organization.trim() || null,
          requester_designation: form.requester_designation.trim() || null,
          purpose: form.purpose.trim(),
          message: form.message.trim() || null,
          preferred_date: form.preferred_date || null,
          preferred_time: form.preferred_time || null,
          duration_minutes: form.duration_minutes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Unable to submit request.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit request.');
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
              Request an Appointment
            </p>
            <h2 className="mt-1 text-lg font-black" style={{ color: heading }}>
              {officeName}
            </h2>
            <p className="mt-1 text-xs" style={{ color: textMuted }}>
              Your request will be reviewed by the officeholder.
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
              Request Submitted
            </h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: text }}>
              Your appointment request has been logged. The office will respond
              to {form.requester_email}.
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
              <Field label="Name *" theme={{ textMuted, text }}>
                <input
                  value={form.requester_name}
                  onChange={(e) => update('requester_name', e.target.value)}
                  required
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Email *" theme={{ textMuted, text }}>
                <input
                  type="email"
                  value={form.requester_email}
                  onChange={(e) => update('requester_email', e.target.value)}
                  required
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Phone" theme={{ textMuted, text }}>
                <input
                  value={form.requester_phone}
                  onChange={(e) => update('requester_phone', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Organisation" theme={{ textMuted, text }}>
                <input
                  value={form.requester_organization}
                  onChange={(e) => update('requester_organization', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Your Designation" theme={{ textMuted, text }}>
                <input
                  value={form.requester_designation}
                  onChange={(e) => update('requester_designation', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Duration (minutes)" theme={{ textMuted, text }}>
                <input
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  value={form.duration_minutes}
                  onChange={(e) => update('duration_minutes', Number(e.target.value) || 30)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Preferred Date" theme={{ textMuted, text }}>
                <input
                  type="date"
                  value={form.preferred_date}
                  onChange={(e) => update('preferred_date', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Preferred Time" theme={{ textMuted, text }}>
                <input
                  type="time"
                  value={form.preferred_time}
                  onChange={(e) => update('preferred_time', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>
            </div>

            <Field label="Purpose *" theme={{ textMuted, text }}>
              <input
                value={form.purpose}
                onChange={(e) => update('purpose', e.target.value)}
                required
                placeholder="Subject of your request"
                className="w-full rounded border p-2 text-xs outline-none"
                style={{ backgroundColor: bg, borderColor: border, color: text }}
              />
            </Field>

            <Field label="Message" theme={{ textMuted, text }}>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder="Additional context for the officeholder"
                className="w-full rounded border p-2 text-xs outline-none"
                style={{ backgroundColor: bg, borderColor: border, color: text }}
              />
            </Field>

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
                {submitting ? 'Submitting…' : 'Send Request'}
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