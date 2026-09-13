"use client";

import { useEffect, useState } from "react";

type AuditEvent = {
  id: string;
  investor_id: string | null;
  activity_id: string | null;
  event_type: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  source: string | null;
  summary: string | null;
  payload: Record<string, unknown> | null;
  occurred_at: string;
};

const EVENT_LABELS: Record<string, string> = {
  ACTIVITY_CREATED: "Activity Created",
  ACTIVITY_COMPLETED: "Activity Completed",
  ACTIVITY_CANCELLED: "Activity Cancelled",
  ACTIVITY_RESCHEDULED: "Activity Rescheduled",
  ACTIVITY_REASSIGNED: "Activity Reassigned",
  ACTIVITY_DETAILS_UPDATED: "Activity Updated",
  STAGE_TRANSITION: "Stage Transition",
  CRM_CAPITAL_UPDATED: "Capital Updated",
  CRM_PROBABILITY_UPDATED: "Probability Updated",
  CRM_NEXT_ACTION_UPDATED: "Next Action Updated",
  CRM_CONTACT_RECORDED: "Contact Recorded",
  INVESTOR_NOTES_UPDATED: "Notes Updated",
};

const EVENT_TONES: Record<string, string> = {
  STAGE_TRANSITION: "text-violet-300",
  CRM_CAPITAL_UPDATED: "text-emerald-300",
  CRM_PROBABILITY_UPDATED: "text-amber-300",
  CRM_NEXT_ACTION_UPDATED: "text-cyan-300",
  CRM_CONTACT_RECORDED: "text-sky-300",
  ACTIVITY_COMPLETED: "text-emerald-300",
  ACTIVITY_CANCELLED: "text-red-300",
  ACTIVITY_CREATED: "text-cyan-300",
  ACTIVITY_RESCHEDULED: "text-amber-300",
  ACTIVITY_REASSIGNED: "text-sky-300",
};

function eventLabel(eventType: string) {
  return EVENT_LABELS[eventType] ?? eventType;
}

function eventTone(eventType: string) {
  return EVENT_TONES[eventType] ?? "text-slate-400";
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function InvestorAuditPanel({
  investorId,
}: {
  investorId: string;
}) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/admin/investor-audit?investor_id=${encodeURIComponent(
            investorId
          )}&limit=10`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            "Unable to load audit events."
          );
        }

        if (!cancelled) {
          setEvents(data.events ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load audit events."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [investorId]);

  const visible = expanded ? events : events.slice(0, 4);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Audit Trail
        </p>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            5C.13
          </span>

          <a
            href="/admin/investor-audit"
            className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 hover:text-cyan-300"
          >
            Open Full
          </a>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-slate-900"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-3 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      ) : events.length === 0 ? (
        <p className="mt-3 text-xs text-slate-500">
          No audit events recorded yet for this investor.
        </p>
      ) : (
        <>
          <div className="mt-3 space-y-2">
            {visible.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${eventTone(
                      event.event_type
                    )}`}
                  >
                    {eventLabel(event.event_type)}
                  </span>

                  <span className="text-[10px] text-slate-500">
                    {formatDateTime(event.occurred_at)}
                  </span>
                </div>

                {event.summary && (
                  <p className="mt-1 text-xs text-slate-300">
                    {event.summary}
                  </p>
                )}

                <p className="mt-1 text-[10px] text-slate-600">
                  {event.actor_email ?? "unknown actor"}
                  {event.actor_role
                    ? ` • ${event.actor_role}`
                    : ""}
                </p>
              </div>
            ))}
          </div>

          {events.length > 4 && (
            <button
              onClick={() => setExpanded((value) => !value)}
              className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300"
            >
              {expanded
                ? "Show less"
                : `Show ${events.length - 4} more`}
            </button>
          )}
        </>
      )}
    </div>
  );
}