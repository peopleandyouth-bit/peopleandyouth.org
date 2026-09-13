"use client";

import { useEffect, useMemo, useState } from "react";

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
  created_at: string;
};

type AuditResponse = {
  success: boolean;
  events: AuditEvent[];
  total: number;
  limit: number;
  offset: number;
  event_types: string[];
};

type IntegrityIssue = {
  severity: "HIGH" | "MEDIUM" | "LOW";
  code: string;
  message: string;
  count: number;
  sample_ids: string[];
};

type IntegrityResponse = {
  success: boolean;
  checked_at: string;
  investor_count: number;
  crm_log_count: number;
  activity_count: number;
  audit_event_count: number;
  issues: IntegrityIssue[];
  status: "HEALTHY" | "WARNING" | "DEGRADED";
};

const PAGE_SIZE = 100;

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

const EVENT_TONES: Record<
  string,
  { text: string; bg: string; border: string; dot: string }
> = {
  STAGE_TRANSITION: {
    text: "text-violet-300",
    bg: "bg-violet-300/[0.07]",
    border: "border-violet-300/15",
    dot: "bg-violet-300",
  },
  CRM_CAPITAL_UPDATED: {
    text: "text-emerald-300",
    bg: "bg-emerald-300/[0.07]",
    border: "border-emerald-300/15",
    dot: "bg-emerald-300",
  },
  CRM_PROBABILITY_UPDATED: {
    text: "text-amber-300",
    bg: "bg-amber-300/[0.07]",
    border: "border-amber-300/15",
    dot: "bg-amber-300",
  },
  CRM_NEXT_ACTION_UPDATED: {
    text: "text-cyan-300",
    bg: "bg-cyan-300/[0.07]",
    border: "border-cyan-300/15",
    dot: "bg-cyan-300",
  },
  CRM_CONTACT_RECORDED: {
    text: "text-sky-300",
    bg: "bg-sky-300/[0.07]",
    border: "border-sky-300/15",
    dot: "bg-sky-300",
  },
  ACTIVITY_COMPLETED: {
    text: "text-emerald-300",
    bg: "bg-emerald-300/[0.07]",
    border: "border-emerald-300/15",
    dot: "bg-emerald-300",
  },
  ACTIVITY_CANCELLED: {
    text: "text-red-300",
    bg: "bg-red-300/[0.07]",
    border: "border-red-300/15",
    dot: "bg-red-300",
  },
  ACTIVITY_CREATED: {
    text: "text-cyan-300",
    bg: "bg-cyan-300/[0.07]",
    border: "border-cyan-300/15",
    dot: "bg-cyan-300",
  },
  ACTIVITY_RESCHEDULED: {
    text: "text-amber-300",
    bg: "bg-amber-300/[0.07]",
    border: "border-amber-300/15",
    dot: "bg-amber-300",
  },
  ACTIVITY_REASSIGNED: {
    text: "text-sky-300",
    bg: "bg-sky-300/[0.07]",
    border: "border-sky-300/15",
    dot: "bg-sky-300",
  },
};

const DEFAULT_TONE = {
  text: "text-white/60",
  bg: "bg-white/[0.04]",
  border: "border-white/10",
  dot: "bg-white/40",
};

function tone(eventType: string) {
  return EVENT_TONES[eventType] ?? DEFAULT_TONE;
}

function eventLabel(eventType: string) {
  return EVENT_LABELS[eventType] ?? eventType;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function relativeTime(value: string) {
  const then = new Date(value).getTime();

  if (Number.isNaN(then)) return "";

  const diffMs = Date.now() - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return "";
}

function shortId(value: string | null | undefined) {
  if (!value) return "—";
  return value.slice(0, 8);
}

function renderPrimitive(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "true" : "false";
  return JSON.stringify(value);
}

export default function InvestorAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [eventTypeFilter, setEventTypeFilter] = useState<string>("ALL");
  const [actorFilter, setActorFilter] = useState("");
  const [investorFilter, setInvestorFilter] = useState("");

  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [integrity, setIntegrity] = useState<IntegrityResponse | null>(null);
  const [integrityLoading, setIntegrityLoading] = useState(true);
  const [integrityError, setIntegrityError] = useState("");

  async function loadEvents(currentOffset: number) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (eventTypeFilter !== "ALL") {
        params.set("event_type", eventTypeFilter);
      }

      if (investorFilter.trim()) {
        params.set("investor_id", investorFilter.trim());
      }

      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(currentOffset));

      const response = await fetch(
        `/api/admin/investor-audit?${params.toString()}`,
        { cache: "no-store" }
      );

      const data: AuditResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load audit trail.");
      }

      let filtered = data.events;

      if (actorFilter.trim()) {
        const needle = actorFilter.trim().toLowerCase();
        filtered = filtered.filter((event) =>
          (event.actor_email ?? "").toLowerCase().includes(needle)
        );
      }

      setEvents(filtered);
      setTotal(data.total);
      setEventTypes(data.event_types);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load audit trail."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadIntegrity() {
    setIntegrityLoading(true);
    setIntegrityError("");

    try {
      const response = await fetch(
        "/api/admin/investor-audit/integrity",
        { cache: "no-store" }
      );

      const data: IntegrityResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load integrity status.");
      }

      setIntegrity(data);
    } catch (err) {
      console.error(err);
      setIntegrityError(
        err instanceof Error
          ? err.message
          : "Unable to load integrity status."
      );
    } finally {
      setIntegrityLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents(0);
    void loadIntegrity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypeFilter]);

  const metrics = useMemo(() => {
    const uniqueActors = new Set(
      events.map((e) => e.actor_email ?? e.actor_id ?? "unknown")
    ).size;

    const byType: Record<string, number> = {};

    events.forEach((event) => {
      byType[event.event_type] = (byType[event.event_type] ?? 0) + 1;
    });

    const typeBreakdown = Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      uniqueActors,
      typeBreakdown,
      loadedCount: events.length,
    };
  }, [events]);

  const integrityStatusTone = (() => {
    if (!integrity) return "text-white/40";
    if (integrity.status === "HEALTHY") return "text-emerald-300";
    if (integrity.status === "WARNING") return "text-amber-300";
    return "text-red-300";
  })();

  const integrityStatusBg = (() => {
    if (!integrity) return "bg-white/[0.04] border-white/10";
    if (integrity.status === "HEALTHY")
      return "bg-emerald-300/[0.06] border-emerald-300/15";
    if (integrity.status === "WARNING")
      return "bg-amber-300/[0.06] border-amber-300/15";
    return "bg-red-300/[0.06] border-red-300/15";
  })();

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1700px] px-6 py-8 lg:px-10">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">
                  Institutional Audit
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Investor CRM Audit Trail
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Immutable record of every mutation against investor CRM
                entities. Actor, timestamp, before/after state and
                decision provenance are preserved for institutional
                continuity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  void loadEvents(offset);
                  void loadIntegrity();
                }}
                disabled={loading || integrityLoading}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:opacity-40"
              >
                {loading || integrityLoading ? "Refreshing..." : "Refresh"}
              </button>

              <a
                href="/admin/investor-crm"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Open CRM
              </a>
            </div>
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* INTEGRITY PANEL */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  CRM Integrity Verification
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  5C.15 — Structural consistency checks across the live
                  CRM state
                </p>
              </div>

              {integrity && (
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${integrityStatusBg} ${integrityStatusTone}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
                  {integrity.status}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {integrityLoading ? (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-2xl bg-white/[0.025]"
                  />
                ))}
              </>
            ) : integrityError ? (
              <div className="col-span-full rounded-2xl border border-red-400/20 bg-red-400/[0.04] px-5 py-4 text-sm text-red-200">
                {integrityError}
              </div>
            ) : (
              integrity && (
                <>
                  <IntegrityStat
                    label="Investors"
                    value={integrity.investor_count}
                  />
                  <IntegrityStat
                    label="CRM Records"
                    value={integrity.crm_log_count}
                  />
                  <IntegrityStat
                    label="Activities"
                    value={integrity.activity_count}
                  />
                  <IntegrityStat
                    label="Audit Events"
                    value={integrity.audit_event_count}
                  />
                </>
              )
            )}
          </div>

          {integrity && integrity.issues.length > 0 && (
            <div className="border-t border-white/10 px-6 py-5">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Structural Checks
              </div>

              <div className="space-y-2">
                {integrity.issues.map((issue) => (
                  <div
                    key={issue.code}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          issue.severity === "HIGH"
                            ? "bg-red-400/15 text-red-300"
                            : issue.severity === "MEDIUM"
                              ? "bg-amber-400/15 text-amber-300"
                              : "bg-cyan-400/15 text-cyan-300"
                        }`}
                      >
                        {issue.severity}
                      </span>

                      <span className="text-xs text-white/60">
                        {issue.message}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-white/70">
                      {issue.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {integrity && (
            <div className="border-t border-white/10 px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-white/25">
              Last verified {formatDateTime(integrity.checked_at)}
            </div>
          )}
        </section>

        {/* SUMMARY METRICS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="Total Events"
            value={total}
            detail="In the audit log"
          />
          <MetricTile
            label="Loaded"
            value={metrics.loadedCount}
            detail={`of ${total} total`}
          />
          <MetricTile
            label="Actors"
            value={metrics.uniqueActors}
            detail="Distinct identities in this page"
          />
          <MetricTile
            label="Event Types"
            value={eventTypes.length}
            detail="Recognised audit categories"
          />
        </section>

        {/* FILTERS */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Event Type
              </label>

              <select
                value={eventTypeFilter}
                onChange={(e) => {
                  setEventTypeFilter(e.target.value);
                  setOffset(0);
                }}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/40"
              >
                <option value="ALL" className="bg-[#0c111d]">
                  All events
                </option>
                {eventTypes.map((t) => (
                  <option key={t} value={t} className="bg-[#0c111d]">
                    {eventLabel(t)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Actor email (client-side filter)
              </label>

              <input
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                placeholder="e.g. contact@peopleandyouth.org"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-300/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Investor id (server-side filter)
              </label>

              <input
                value={investorFilter}
                onChange={(e) => {
                  setInvestorFilter(e.target.value);
                }}
                onBlur={() => {
                  setOffset(0);
                  void loadEvents(0);
                }}
                placeholder="Paste investor UUID"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-300/40"
              />
            </div>
          </div>

          {metrics.typeBreakdown.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.06] pt-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Top types in this page:
              </span>

              {metrics.typeBreakdown.map(([type, count]) => {
                const t = tone(type);
                return (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${t.bg} ${t.border} ${t.text}`}
                  >
                    {eventLabel(type)}
                    <span className="rounded-full bg-black/30 px-1.5">
                      {count}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </section>

        {/* AUDIT TIMELINE */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Audit Timeline</h2>
                <p className="mt-1 text-xs text-white/40">
                  Most recent events first. Click any row to inspect the
                  before/after payload.
                </p>
              </div>

              <div className="text-xs text-white/40">
                Showing {offset + 1}–{offset + events.length} of {total}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-white/[0.025]"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl text-white/30">
                ◇
              </div>
              <p className="mt-5 text-sm font-semibold text-white/70">
                No audit events yet
              </p>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/30">
                Every future mutation to the investor CRM will appear
                here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {events.map((event) => {
                const t = tone(event.event_type);
                const expanded = expandedId === event.id;
                const before =
                  (event.payload?.before as Record<string, unknown>) ??
                  null;
                const after =
                  (event.payload?.after as Record<string, unknown>) ??
                  null;
                const changedFields = Array.isArray(
                  event.payload?.changed_fields
                )
                  ? (event.payload?.changed_fields as string[])
                  : [];

                return (
                  <div key={event.id}>
                    <button
                      onClick={() =>
                        setExpandedId(expanded ? null : event.id)
                      }
                      className="group flex w-full items-start gap-4 px-6 py-5 text-left transition hover:bg-white/[0.025]"
                    >
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${t.dot} shadow-[0_0_12px_currentColor]`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${t.bg} ${t.border} ${t.text}`}
                          >
                            {eventLabel(event.event_type)}
                          </span>

                          <span className="text-xs text-white/50">
                            {event.summary ?? "—"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-white/35">
                          <span>
                            {event.actor_email ?? "unknown actor"}
                          </span>

                          {event.actor_role && (
                            <>
                              <span>•</span>
                              <span className="uppercase tracking-wider">
                                {event.actor_role}
                              </span>
                            </>
                          )}

                          {event.investor_id && (
                            <>
                              <span>•</span>
                              <span>
                                investor {shortId(event.investor_id)}
                              </span>
                            </>
                          )}

                          {event.activity_id && (
                            <>
                              <span>•</span>
                              <span>
                                activity {shortId(event.activity_id)}
                              </span>
                            </>
                          )}
                        </div>

                        {event.source && (
                          <div className="mt-1 text-[10px] font-mono text-white/25">
                            {event.source}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-xs text-white/55">
                          {formatDateTime(event.occurred_at)}
                        </div>
                        <div className="mt-1 text-[10px] text-white/25">
                          {relativeTime(event.occurred_at)}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 text-white/25 transition ${
                          expanded ? "rotate-90" : ""
                        }`}
                      >
                        ›
                      </span>
                    </button>

                    {expanded && (
                      <div className="border-t border-white/[0.06] bg-black/20 px-6 py-5">
                        <div className="grid gap-4 lg:grid-cols-3">
                          <div className="rounded-2xl border border-white/[0.06] bg-[#0c111d] p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                              Event Identity
                            </div>

                            <div className="mt-3 space-y-2 text-xs">
                              <DetailRow
                                label="Event ID"
                                value={event.id}
                              />
                              <DetailRow
                                label="Investor ID"
                                value={event.investor_id ?? "—"}
                              />
                              <DetailRow
                                label="Activity ID"
                                value={event.activity_id ?? "—"}
                              />
                              <DetailRow
                                label="Actor ID"
                                value={event.actor_id ?? "—"}
                              />
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/[0.06] bg-[#0c111d] p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                              Actor & Source
                            </div>

                            <div className="mt-3 space-y-2 text-xs">
                              <DetailRow
                                label="Email"
                                value={event.actor_email ?? "—"}
                              />
                              <DetailRow
                                label="Role"
                                value={event.actor_role ?? "—"}
                              />
                              <DetailRow
                                label="Source"
                                value={event.source ?? "—"}
                              />
                              <DetailRow
                                label="Occurred"
                                value={formatDateTime(event.occurred_at)}
                              />
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/[0.06] bg-[#0c111d] p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                              Decision Provenance
                            </div>

                            <p className="mt-3 text-xs leading-5 text-white/55">
                              {event.summary ?? "No summary recorded."}
                            </p>

                            {changedFields.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {changedFields.map((field) => (
                                  <span
                                    key={field}
                                    className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-mono text-white/45"
                                  >
                                    {field}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {(before || after) && (
                          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-[#0c111d] p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                              Before → After
                            </div>

                            <div className="mt-3 grid gap-4 lg:grid-cols-2">
                              <div className="rounded-xl border border-red-300/10 bg-red-300/[0.025] p-3">
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-red-300/70">
                                  Before
                                </div>
                                <div className="mt-2 space-y-1 text-xs">
                                  {before ? (
                                    Object.entries(before).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className="flex justify-between gap-3"
                                        >
                                          <span className="font-mono text-white/35">
                                            {key}
                                          </span>
                                          <span className="truncate text-right text-white/60">
                                            {renderPrimitive(value)}
                                          </span>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <div className="text-white/30">
                                      No prior state
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="rounded-xl border border-emerald-300/10 bg-emerald-300/[0.025] p-3">
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/70">
                                  After
                                </div>
                                <div className="mt-2 space-y-1 text-xs">
                                  {after ? (
                                    Object.entries(after).map(
                                      ([key, value]) => (
                                        <div
                                          key={key}
                                          className="flex justify-between gap-3"
                                        >
                                          <span className="font-mono text-white/35">
                                            {key}
                                          </span>
                                          <span className="truncate text-right text-white/60">
                                            {renderPrimitive(value)}
                                          </span>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <div className="text-white/30">
                                      No new state
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          {!loading && total > PAGE_SIZE && (
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
              <button
                onClick={() => {
                  const next = Math.max(0, offset - PAGE_SIZE);
                  setOffset(next);
                  void loadEvents(next);
                }}
                disabled={offset === 0}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white/60 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Previous
              </button>

              <span className="text-xs text-white/40">
                Page {Math.floor(offset / PAGE_SIZE) + 1} of{" "}
                {Math.max(1, Math.ceil(total / PAGE_SIZE))}
              </span>

              <button
                onClick={() => {
                  const next = offset + PAGE_SIZE;
                  if (next >= total) return;
                  setOffset(next);
                  void loadEvents(next);
                }}
                disabled={offset + events.length >= total}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white/60 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function IntegrityStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold text-white/85">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-amber-500/5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
        {label}
      </div>
      <div className="mt-5 text-3xl font-semibold text-amber-300">
        {value.toLocaleString()}
      </div>
      <div className="mt-2 text-xs text-white/35">{detail}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/35">{label}</span>
      <span className="truncate font-mono text-right text-white/60">
        {value}
      </span>
    </div>
  );
}