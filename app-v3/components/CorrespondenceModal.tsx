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
  sender_name: '',
  sender_email: '',
  sender_phone: '',
  sender_organization: '',
  sender_designation: '',
  category: '',
  subject: '',
  body: '',
};

const CATEGORIES = [
  'General Enquiry',
  'Collaboration',
  'Media / Press',
  'Proposal',
  'Speaking Request',
  'Research',
  'Fellowship',
  'Other',
];

export default function CorrespondenceModal({
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

  function update<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.sender_name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!form.sender_email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!form.subject.trim()) {
      setError('Subject is required.');
      return;
    }
    if (!form.body.trim()) {
      setError('Message is required.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/office/correspondence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          office_slug: officeSlug,
          sender_name: form.sender_name.trim(),
          sender_email: form.sender_email.trim(),
          sender_phone: form.sender_phone.trim() || null,
          sender_organization: form.sender_organization.trim() || null,
          sender_designation: form.sender_designation.trim() || null,
          category: form.category || null,
          subject: form.subject.trim(),
          body: form.body.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Unable to send message.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
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
              Contact the Office
            </p>
            <h2 className="mt-1 text-lg font-black" style={{ color: heading }}>
              {officeName}
            </h2>
            <p className="mt-1 text-xs" style={{ color: textMuted }}>
              For enquiries, proposals, collaborations, and all non-appointment correspondence.
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
              Message Delivered
            </h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: text }}>
              Your message has been recorded in the office&apos;s correspondence desk.
              A response will be sent to {form.sender_email}.
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
                  value={form.sender_name}
                  onChange={(e) => update('sender_name', e.target.value)}
                  required
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Email *" theme={{ textMuted, text }}>
                <input
                  type="email"
                  value={form.sender_email}
                  onChange={(e) => update('sender_email', e.target.value)}
                  required
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Phone" theme={{ textMuted, text }}>
                <input
                  value={form.sender_phone}
                  onChange={(e) => update('sender_phone', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Organisation" theme={{ textMuted, text }}>
                <input
                  value={form.sender_organization}
                  onChange={(e) => update('sender_organization', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Your Designation" theme={{ textMuted, text }}>
                <input
                  value={form.sender_designation}
                  onChange={(e) => update('sender_designation', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                />
              </Field>

              <Field label="Category" theme={{ textMuted, text }}>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full rounded border p-2 text-xs outline-none"
                  style={{ backgroundColor: bg, borderColor: border, color: text }}
                >
                  <option value="">— Select —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Subject *" theme={{ textMuted, text }}>
              <input
                value={form.subject}
                onChange={(e) => update('subject', e.target.value)}
                required
                className="w-full rounded border p-2 text-xs outline-none"
                style={{ backgroundColor: bg, borderColor: border, color: text }}
              />
            </Field>

            <Field label="Message *" theme={{ textMuted, text }}>
              <textarea
                rows={6}
                value={form.body}
                onChange={(e) => update('body', e.target.value)}
                required
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
                {submitting ? 'Sending…' : 'Send Message'}
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