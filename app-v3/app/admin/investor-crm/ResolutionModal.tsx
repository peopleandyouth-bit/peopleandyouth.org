"use client";

import { useState } from "react";

export type ResolutionAction = "COMPLETED" | "CANCELLED";

export interface ResolutionTarget {
  id: string;
  subject: string;
  action: ResolutionAction;
}

export function ResolutionModal({
  target,
  onClose,
  onSuccess,
}: {
  target: ResolutionTarget | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [outcome, setOutcome] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!target) return null;

  const isComplete = target.action === "COMPLETED";

  async function submit() {
    if (!target) return;

    const trimmed = reason.trim();

    if (!trimmed) {
      setError("A resolution reason is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/investor-crm/activities",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: target.id,
            status: target.action,
            resolution_reason: trimmed,
            outcome: outcome.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to record resolution."
        );
      }

      setReason("");
      setOutcome("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to record resolution."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <button
        aria-label="Close resolution"
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!submitting) onClose();
        }}
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0c111d] shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
            {isComplete
              ? "Resolution — Completion"
              : "Resolution — Cancellation"}
          </div>

          <h2 className="mt-1 text-lg font-semibold">
            {isComplete
              ? "Complete operational action"
              : "Cancel operational action"}
          </h2>

          <p className="mt-1 text-xs text-white/40">
            {target.subject || "Operational activity"}
          </p>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Resolution reason <span className="text-red-400">*</span>
            </label>

            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError("");
              }}
              rows={3}
              maxLength={2000}
              disabled={submitting}
              placeholder={
                isComplete
                  ? "What was the outcome that justified completion?"
                  : "Why is this action being cancelled?"
              }
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-cyan-300/40 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Outcome (optional)
            </label>

            <textarea
              value={outcome}
              onChange={(event) => {
                setOutcome(event.target.value);
                setError("");
              }}
              rows={3}
              maxLength={2000}
              disabled={submitting}
              placeholder="Record the concrete result, decision, or next implication."
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-cyan-300/40 disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <p className="text-[10px] leading-5 text-white/25">
            The resolution reason and outcome are permanently recorded
            in the audit trail. This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-5">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting || !reason.trim()}
            onClick={submit}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              isComplete
                ? "bg-emerald-300 text-black hover:bg-emerald-200"
                : "bg-red-400 text-black hover:bg-red-300"
            }`}
          >
            {submitting
              ? "Recording…"
              : isComplete
                ? "Complete Action"
                : "Cancel Action"}
          </button>
        </div>
      </div>
    </div>
  );
}