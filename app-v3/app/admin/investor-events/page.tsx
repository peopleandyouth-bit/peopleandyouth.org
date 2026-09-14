"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type AuditEvent = {
  id: string;
  investor_id: string | null;
  activity_id: string | null;
  event_type: string;
  actor_email: string | null;
  actor_role: string | null;
  source: string | null;
  summary: string | null;
  payload: Record<string, unknown> | null;
  occurred_at: string;
};

type Activity = {
  id: string;
  investor_id: string;
  activity_type: string;
  subject: string | null;
  details: string | null;
  occurred_at: string;
  due_at: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  assigned_admin: string | null;
};

type Investor = {
  id: string;
  full_name: string | null;
  email: string | null;
  organization: string | null;
};

type EventCategory =
  | "INVESTOR_CREATED"
  | "STATUS_CHANGE"
  | "DOCUMENT_ACCESS"
  | "INTERACTION"
  | "ACTION_CREATED"
  | "ACTION_OVERDUE"
  | "COMMITMENT";

type UnifiedEvent = {
  id: string;
  category: EventCategory;
  investorId: string | null;
  investorName: string;
  summary: string;
  actorEmail: string | null;
  actorRole: string | null;
  source: string | null;
  occurredAt: string;
  details?: string | null;
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  INVESTOR_CREATED: "Investor Created",
  STATUS_CHANGE: "Status Change",
  DOCUMENT_ACCESS: "Document Access",
  INTERACTION: "Interaction",
  ACTION_CREATED: "Action Created",
  ACTION_OVERDUE: "Action Overdue",
  COMMITMENT: "Commitment",
};

const CATEGORY_TONES: Record<
  EventCategory,
  { text: string; bg: string; border: string; dot: string }
> = {
  INVESTOR_CREATED: {
    text: "text-sky-300",
    bg: "bg-sky-300/[0.07]",
    border: "border-sky-300/20",
    dot: "bg-sky-300",
  },
  STATUS_CHANGE: {
    text: "text-violet-300",
    bg: "bg-violet-300/[0.07]",
    border: "border-violet-300/20",
    dot: "bg-violet-300",
  },
  DOCUMENT_ACCESS: {
    text: "text-amber-300",
    bg: "bg-amber-300/[0.07]",
    border: "border-amber-300/20",
    dot: "bg-amber-300",
  },
  INTERACTION: {
    text: "text-cyan-300",
    bg: "bg-cyan-300/[0.07]",
    border: "border-cyan-300/20",
    dot: "bg-cyan-300",
  },
  ACTION_CREATED: {
    text: "text-emerald-300",
    bg: "bg-emerald-300/[0.07]",
    border: "border-emerald-300/20",
    dot: "bg-emerald-300",
  },
  ACTION_OVERDUE: {
    text: "text-red-300",
    bg: "bg-red-300/[0.07]",
    border: "border-red-300/20",
    dot: "bg-red-300",
  },
  COMMITMENT: {
    text: "text-green-300",
    bg: "bg-green-300/[0.07]",
    border: "border-green-300/20",
    dot: "bg-green-300",
  },
};

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

  const diffSec = Math.floor((Date.now() - then) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return "";
}

function investorName(
  investorId: string | null,
  map: Map<string, Investor>
): string {
  if (!investorId) return "Unknown";

  const investor = map.get(investorId);

  return (
    investor?.full_name ||
    investor?.organization ||
    investor?.email ||
    "Unknown"
  );
}

/*
 * Categorise an audit event into a 9A event type.
 * Returns null if the event doesn't fit any of the seven categories.
 */
function categorizeAuditEvent(
  event: AuditEvent
): EventCategory | null {
  switch (event.event_type) {
    case "CRM_CAPITAL_UPDATED": {
      const initialised =
        event.payload &&
        typeof event.payload === "object" &&
        "initialised" in event.payload &&
        event.payload.initialised === true;
      return initialised ? "INVESTOR_CREATED" : "COMMITMENT";
    }
    case "STAGE_TRANSITION":
      return "STATUS_CHANGE";
    case "CRM_PROBABILITY_UPDATED":
    case "CRM_NEXT_ACTION_UPDATED":
    case "CRM_CONTACT_RECORDED":
    case "INVESTOR_NOTES_UPDATED":
      return "STATUS_CHANGE";
    case "ACTIVITY_CREATED":
      return "ACTION_CREATED";
    case "ACTIVITY_COMPLETED":
    case "ACTIVITY_CANCELLED":
    case "ACTIVITY_RESCHEDULED":
    case "ACTIVITY_REASSIGNED":
    case "ACTIVITY_DETAILS_UPDATED":
      return "ACTION_CREATED";
    default:
      return null;
  }
}

/*
 * Categorise an activity into a 9A event type.
 * Used when the activity corresponds to a category not present in the
 * audit log — particularly document access and interaction events.
 */
function categorizeActivity(
  activity: Activity
): EventCategory | null {
  if (activity.activity_type === "NOTE" && activity.details?.includes("[DOCUMENT]")) {
    return "DOCUMENT_ACCESS";
  }
  if (["CALL", "EMAIL", "MEETING"].includes(activity.activity_type)) {
    return "INTERACTION";
  }
  if (activity.activity_type === "FOLLOW_UP") {
    return "ACTION_CREATED";
  }
  if (activity.activity_type === "COMMITMENT") {
    return "COMMITMENT";
  }
  return null;
}

export default function InvestorEventsPage() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryFilter, setCategoryFilter] = useState<
    EventCategory | "ALL"
  >("ALL");
  const [search, setSearch] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [auditRes, activityRes, crmRes] = await Promise.all([
        fetch("/api/admin/investor-audit?limit=300", {
          cache: "no-store",
        }),
        fetch("/api/admin/investor-crm/activities", {
          cache: "no-store",
        }),
        fetch("/api/admin/investor-crm", { cache: "no-store" }),
      ]);

      if (!auditRes.ok) throw new Error("Unable to load events.");
      if (!activityRes.ok)
        throw new Error("Unable to load activities.");
      if (!crmRes.ok) throw new Error("Unable to load investors.");

      const auditData = await auditRes.json();
      const activityData = await activityRes.json();
      const crmData = await crmRes.json();

      setAuditEvents(auditData.events ?? []);
      setActivities(activityData.activities ?? []);

      const list: Investor[] = (crmData.investors ?? []).map(
        (inv: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          organization?: string | null;
        }) => ({
          id: inv.id,
          full_name: inv.full_name ?? null,
          email: inv.email ?? null,
          organization: inv.organization ?? null,
        })
      );

      setInvestors(list);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load event engine."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const investorMap = useMemo(() => {
    const map = new Map<string, Investor>();
    investors.forEach((inv) => map.set(inv.id, inv));
    return map;
  }, [investors]);

  /*
   * Build the unified event timeline from:
   *  - audit events (categorised via categorizeAuditEvent)
   *  - activities (categorised via categorizeActivity)
   *  - derived overdue events (open, past-due activities)
   *
   * Deduplicate: audit ACTIVITY_CREATED and activity rows both exist;
   * keep the audit version (richer actor data).
   */
  const unifiedEvents: UnifiedEvent[] = useMemo(() => {
    const events: UnifiedEvent[] = [];
    const seenActivityIds = new Set<string>();

    for (const event of auditEvents) {
      const category = categorizeAuditEvent(event);
      if (!category) continue;

      if (
        (event.event_type === "ACTIVITY_CREATED" ||
          event.event_type.startsWith("ACTIVITY_")) &&
        event.activity_id
      ) {
        seenActivityIds.add(event.activity_id);
      }

      events.push({
        id: `audit:${event.id}`,
        category,
        investorId: event.investor_id,
        investorName: investorName(event.investor_id, investorMap),
        summary: event.summary ?? event.event_type,
        actorEmail: event.actor_email,
        actorRole: event.actor_role,
        source: event.source,
        occurredAt: event.occurred_at,
      });
    }

    for (const activity of activities) {
      if (seenActivityIds.has(activity.id)) continue;

      const category = categorizeActivity(activity);
      if (!category) continue;

      events.push({
        id: `activity:${activity.id}`,
        category,
        investorId: activity.investor_id,
        investorName: investorName(
          activity.investor_id,
          investorMap
        ),
        summary:
          activity.subject ||
          CATEGORY_LABELS[category],
        actorEmail: null,
        actorRole: null,
        source: "investor_crm_activities",
        occurredAt: activity.occurred_at,
        details: activity.details,
      });
    }

    // 9A.6 — ACTION_OVERDUE derived from open past-due activities
    const now = Date.now();

    for (const activity of activities) {
      if (activity.status !== "OPEN") continue;
      if (!activity.due_at) continue;

      const dueTime = new Date(activity.due_at).getTime();
      if (Number.isNaN(dueTime)) continue;
      if (dueTime >= now) continue;

      events.push({
        id: `overdue:${activity.id}`,
        category: "ACTION_OVERDUE",
        investorId: activity.investor_id,
        investorName: investorName(
          activity.investor_id,
          investorMap
        ),
        summary:
          activity.subject ||
          "Overdue operational action",
        actorEmail: activity.assigned_admin,
        actorRole: "owner",
        source: "operations_queue",
        occurredAt: activity.due_at,
      });
    }

    return events.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() -
        new Date(a.occurredAt).getTime()
    );
  }, [auditEvents, activities, investorMap]);

  const filteredEvents = useMemo(() => {
    let list = unifiedEvents;

    if (categoryFilter !== "ALL") {
      list = list.filter((e) => e.category === categoryFilter);
    }

    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      list = list.filter((e) =>
        [
          e.investorName,
          e.summary,
          e.actorEmail,
          CATEGORY_LABELS[e.category],
        ]
          .filter(Boolean)
          .some((v) =>
            String(v).toLowerCase().includes(needle)
          )
      );
    }

    return list;
  }, [unifiedEvents, categoryFilter, search]);

  const counts = useMemo(() => {
    const result: Record<EventCategory, number> = {
      INVESTOR_CREATED: 0,
      STATUS_CHANGE: 0,
      DOCUMENT_ACCESS: 0,
      INTERACTION: 0,
      ACTION_CREATED: 0,
      ACTION_OVERDUE: 0,
      COMMITMENT: 0,
    };

    unifiedEvents.forEach((e) => {
      result[e.category] += 1;
    });

    return result;
  }, [unifiedEvents]);

  const uniqueInvestors = useMemo(() => {
    const set = new Set<string>();
    unifiedEvents.forEach((e) => {
      if (e.investorId) set.add(e.investorId);
    });
    return set.size;
  }, [unifiedEvents]);

  const uniqueActors = useMemo(() => {
    const set = new Set<string>();
    unifiedEvents.forEach((e) => {
      if (e.actorEmail) set.add(e.actorEmail);
    });
    return set.size;
  }, [unifiedEvents]);

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1700px] px-6 py-8 lg:px-10">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-300">
                  Event Engine
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Institutional Event Stream
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Unified event stream across investor creation, status
                transitions, document access, interactions, operational
                actions, overdue escalations and commitments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => void loadAll()}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <a
                href="/admin/investor-audit"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Audit Trail
              </a>

              <a
                href="/admin/investor-executive"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Executive
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryTile
            label="Total Events"
            value={unifiedEvents.length}
            detail="Across all categories"
            tone="sky"
          />
          <SummaryTile
            label="Investors"
            value={uniqueInvestors}
            detail="With recorded activity"
            tone="cyan"
          />
          <SummaryTile
            label="Actors"
            value={uniqueActors}
            detail="Distinct institutional identities"
            tone="violet"
          />
          <SummaryTile
            label="Overdue"
            value={counts.ACTION_OVERDUE}
            detail="Actions past due"
            tone={counts.ACTION_OVERDUE > 0 ? "red" : "emerald"}
          />
        </section>

        {/* CATEGORY FILTER */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Search
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Investor, summary, actor"
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-sky-300/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter("ALL")}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                    categoryFilter === "ALL"
                      ? "border-sky-300/40 bg-sky-300/[0.1] text-sky-200"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }`}
                >
                  All ({unifiedEvents.length})
                </button>

                {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map(
                  (category) => {
                    const tone = CATEGORY_TONES[category];
                    const active = categoryFilter === category;

                    return (
                      <button
                        key={category}
                        onClick={() =>
                          setCategoryFilter(
                            active ? "ALL" : category
                          )
                        }
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                          active
                            ? `${tone.border} ${tone.bg} ${tone.text}`
                            : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                        }`}
                      >
                        {CATEGORY_LABELS[category]} ({counts[category]})
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-white/25">
            Showing {filteredEvents.length} of {unifiedEvents.length}
          </div>
        </section>

        {/* EVENT TIMELINE */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-lg font-semibold">Event Timeline</h2>
            <p className="mt-1 text-xs text-white/40">
              Most recent events first. Click any investor name to open
              their profile.
            </p>
          </div>

          {loading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-2xl bg-white/[0.025]"
                />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl text-white/25">
                ◇
              </div>
              <p className="mt-5 text-sm font-semibold text-white/70">
                No events match the current view
              </p>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/30">
                Clear the filter or record an activity to populate the
                event stream.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filteredEvents.slice(0, 100).map((event) => {
                const tone = CATEGORY_TONES[event.category];

                return (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-start gap-4 px-6 py-4 transition hover:bg-white/[0.02]"
                  >
                    <span
                      className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot} shadow-[0_0_12px_currentColor]`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tone.bg} ${tone.border} ${tone.text}`}
                        >
                          {CATEGORY_LABELS[event.category]}
                        </span>

                        {event.investorId && (
                          <a
                            href={`/admin/investors/${event.investorId}`}
                            className="truncate text-xs font-semibold text-white/85 hover:text-sky-200"
                          >
                            {event.investorName}
                          </a>
                        )}
                      </div>

                      <p className="mt-1.5 text-sm text-white/70">
                        {event.summary}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/30">
                        {event.actorEmail && (
                          <span>{event.actorEmail}</span>
                        )}
                        {event.actorRole && (
                          <>
                            <span>•</span>
                            <span className="uppercase tracking-wider">
                              {event.actorRole}
                            </span>
                          </>
                        )}
                        {event.source && (
                          <>
                            <span>•</span>
                            <span className="font-mono">
                              {event.source}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-[11px] text-white/50">
                        {formatDateTime(event.occurredAt)}
                      </div>
                      <div className="mt-0.5 text-[10px] text-white/25">
                        {relativeTime(event.occurredAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "sky" | "cyan" | "violet" | "red" | "emerald";
}) {
  const tones = {
    sky: {
      text: "text-sky-300",
      dot: "bg-sky-300",
      glow: "shadow-sky-500/10",
    },
    cyan: {
      text: "text-cyan-300",
      dot: "bg-cyan-300",
      glow: "shadow-cyan-500/10",
    },
    violet: {
      text: "text-violet-300",
      dot: "bg-violet-300",
      glow: "shadow-violet-500/10",
    },
    red: {
      text: "text-red-300",
      dot: "bg-red-300",
      glow: "shadow-red-500/10",
    },
    emerald: {
      text: "text-emerald-300",
      dot: "bg-emerald-300",
      glow: "shadow-emerald-500/10",
    },
  };

  const selected = tones[tone];

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl ${selected.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
          {label}
        </span>
        <span
          className={`h-2 w-2 rounded-full ${selected.dot} shadow-[0_0_12px_currentColor]`}
        />
      </div>

      <div className={`mt-5 text-2xl font-semibold ${selected.text}`}>
        {value}
      </div>

      <div className="mt-2 text-xs text-white/35">{detail}</div>
    </div>
  );
}