"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STAGES = [
  "PROSPECT",
  "CONTACTED",
  "INTERESTED",
  "NDA",
  "DUE_DILIGENCE",
  "COMMITMENT",
  "INVESTED",
] as const;

type Stage = (typeof STAGES)[number];

const STAGE_LABELS: Record<Stage, string> = {
  PROSPECT: "Prospect",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  NDA: "NDA",
  DUE_DILIGENCE: "Due Diligence",
  COMMITMENT: "Commitment",
  INVESTED: "Invested",
};

const STAGE_ACCENT: Record<Stage, string> = {
  PROSPECT: "bg-white/40",
  CONTACTED: "bg-cyan-300",
  INTERESTED: "bg-sky-300",
  NDA: "bg-violet-300",
  DUE_DILIGENCE: "bg-amber-300",
  COMMITMENT: "bg-emerald-300",
  INVESTED: "bg-green-300",
};

const DEFAULT_TARGET_RAISE_INR = 50000000;
const HIGH_VALUE_THRESHOLD = 500000;

type Investor = {
  id: string;
  full_name: string | null;
  email: string | null;
  organization: string | null;
  investor_type: string | null;
  proposed_ticket_inr: number | null;
  verification_status: string | null;
  access_level: string | null;
  created_at: string | null;
  crm?: {
    stage?: string | null;
    expected_investment_inr?: number | null;
    actual_investment_inr?: number | null;
    probability_percent?: number | null;
    last_contact_date?: string | null;
  } | null;
};

type Activity = {
  id: string;
  investor_id: string;
  activity_type: string;
  occurred_at: string;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
};

type AuditEvent = {
  id: string;
  investor_id: string | null;
  event_type: string;
  occurred_at: string;
  payload: Record<string, unknown> | null;
};

type TimeBucket = {
  label: string;
  start: Date;
  count: number;
};

function compactINR(value: number | null | undefined) {
  const amount = Number(value ?? 0);
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/*
 * Bucket events into the last N weeks.
 */
function bucketByWeek(
  dates: string[],
  weeksBack: number
): TimeBucket[] {
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  const buckets: TimeBucket[] = [];

  for (let i = weeksBack - 1; i >= 0; i -= 1) {
    const start = new Date(now);
    start.setDate(start.getDate() - i * 7 - 6);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const startLabel = start.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    buckets.push({
      label: startLabel,
      start,
      count: 0,
    });
  }

  for (const dateStr of dates) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) continue;

    for (let i = buckets.length - 1; i >= 0; i -= 1) {
      const bucket = buckets[i];
      const end = new Date(bucket.start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      if (d >= bucket.start && d <= end) {
        bucket.count += 1;
        break;
      }
    }
  }

  return buckets;
}

export default function InvestorAnalyticsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [timeWindow, setTimeWindow] = useState<4 | 8 | 12 | 26>(12);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [crmRes, activityRes, auditRes] = await Promise.all([
        fetch("/api/admin/investor-crm", { cache: "no-store" }),
        fetch("/api/admin/investor-crm/activities", {
          cache: "no-store",
        }),
        fetch("/api/admin/investor-audit?limit=2000", {
          cache: "no-store",
        }),
      ]);

      if (!crmRes.ok) throw new Error("Unable to load investors.");
      if (!activityRes.ok) throw new Error("Unable to load activities.");
      if (!auditRes.ok) throw new Error("Unable to load audit trail.");

      const crmData = await crmRes.json();
      const activityData = await activityRes.json();
      const auditData = await auditRes.json();

      setInvestors(crmData.investors ?? []);
      setActivities(activityData.activities ?? []);
      setAuditEvents(auditData.events ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // ---------- 10A.1 Acquisition trend ----------
  const acquisitionTrend = useMemo(() => {
    const dates = investors
      .map((i) => i.created_at)
      .filter((v): v is string => Boolean(v));

    return bucketByWeek(dates, timeWindow);
  }, [investors, timeWindow]);

  // ---------- 10A.2 – 10A.4 Conversion funnel ----------
  const conversionFunnel = useMemo(() => {
    const total = investors.length;

    if (total === 0) {
      return {
        registered: 0,
        progressed: 0,
        verified: 0,
        approved: 0,
        engaged: 0,
        committed: 0,
        rates: {
          progress: 0,
          verification: 0,
          approval: 0,
          engagement: 0,
          commitment: 0,
        },
      };
    }

    const progressed = investors.filter((i) => {
      const stage = i.crm?.stage ?? "PROSPECT";
      return stage !== "PROSPECT";
    }).length;

    const verified = investors.filter(
      (i) => i.verification_status === "VERIFIED"
    ).length;

    const approved = investors.filter(
      (i) => i.access_level === "APPROVED"
    ).length;

    const engaged = investors.filter((i) => {
      const stage = i.crm?.stage ?? "PROSPECT";
      return [
        "INTERESTED",
        "NDA",
        "DUE_DILIGENCE",
        "COMMITMENT",
        "INVESTED",
      ].includes(stage);
    }).length;

    const committed = investors.filter((i) => {
      const stage = i.crm?.stage ?? "PROSPECT";
      return ["COMMITMENT", "INVESTED"].includes(stage);
    }).length;

    return {
      registered: total,
      progressed,
      verified,
      approved,
      engaged,
      committed,
      rates: {
        progress: Math.round((progressed / total) * 100),
        verification: Math.round((verified / total) * 100),
        approval: Math.round((approved / total) * 100),
        engagement: Math.round((engaged / total) * 100),
        commitment: Math.round((committed / total) * 100),
      },
    };
  }, [investors]);

  // ---------- 10A.5 Stage conversion ----------
  const stageConversion = useMemo(() => {
    const transitions: Record<string, Record<string, number>> = {};

    for (const event of auditEvents) {
      if (event.event_type !== "STAGE_TRANSITION") continue;
      if (!event.payload) continue;

      const before = (event.payload.before as Record<string, unknown>)
        ?.stage;
      const after = (event.payload.after as Record<string, unknown>)
        ?.stage;

      if (typeof before !== "string" || typeof after !== "string") {
        continue;
      }

      const key = `${before}->${after}`;
      const [from] = key.split("->");

      if (!transitions[from]) transitions[from] = {};
      transitions[from][after] =
        (transitions[from][after] ?? 0) + 1;
    }

    return transitions;
  }, [auditEvents]);

  // ---------- 10A.6 Stage velocity (avg days per stage from audit) ----------
  const stageVelocity = useMemo(() => {
    const dwellTime: Record<string, number[]> = {};

    // For each investor, walk through STAGE_TRANSITION events ordered by time
    const investorTransitions: Record<
      string,
      Array<{ stage: string; at: number }>
    > = {};

    for (const event of auditEvents) {
      if (event.event_type !== "STAGE_TRANSITION") continue;
      if (!event.investor_id) continue;
      if (!event.payload) continue;

      const after = (event.payload.after as Record<string, unknown>)
        ?.stage;

      if (typeof after !== "string") continue;

      const at = new Date(event.occurred_at).getTime();
      if (Number.isNaN(at)) continue;

      if (!investorTransitions[event.investor_id]) {
        investorTransitions[event.investor_id] = [];
      }

      investorTransitions[event.investor_id].push({
        stage: after,
        at,
      });
    }

    for (const investorId of Object.keys(investorTransitions)) {
      const events = investorTransitions[investorId].sort(
        (a, b) => a.at - b.at
      );

      for (let i = 1; i < events.length; i += 1) {
        const prev = events[i - 1];
        const curr = events[i];
        const dwellDays =
          (curr.at - prev.at) / (1000 * 60 * 60 * 24);

        if (dwellDays < 0 || dwellDays > 365) continue;

        const stage = prev.stage;

        if (!dwellTime[stage]) dwellTime[stage] = [];
        dwellTime[stage].push(dwellDays);
      }
    }

    const result: Array<{
      stage: Stage;
      avgDays: number;
      samples: number;
    }> = [];

    for (const stage of STAGES) {
      const times = dwellTime[stage] ?? [];

      if (times.length === 0) {
        result.push({ stage, avgDays: 0, samples: 0 });
        continue;
      }

      const avg =
        times.reduce((sum, v) => sum + v, 0) / times.length;

      result.push({
        stage,
        avgDays: Math.round(avg * 10) / 10,
        samples: times.length,
      });
    }

    return result;
  }, [auditEvents]);

  // ---------- 10A.7 Engagement over time ----------
  const engagementTrend = useMemo(() => {
    const dates = activities.map((a) => a.occurred_at);
    return bucketByWeek(dates, timeWindow);
  }, [activities, timeWindow]);

  // ---------- 10B.1 – 10B.5 Capital analytics ----------
  const capital = useMemo(() => {
    const total = investors.reduce(
      (sum, i) =>
        sum +
        Number(
          i.crm?.expected_investment_inr ??
            i.proposed_ticket_inr ??
            0
        ),
      0
    );

    const weighted = investors.reduce((sum, i) => {
      const expected = Number(
        i.crm?.expected_investment_inr ??
          i.proposed_ticket_inr ??
          0
      );
      const probability = Number(
        i.crm?.probability_percent ?? 10
      );
      return sum + expected * (probability / 100);
    }, 0);

    const committed = investors.reduce((sum, i) => {
      if (i.crm?.stage !== "COMMITMENT") return sum;
      return (
        sum +
        Number(
          i.crm?.expected_investment_inr ??
            i.proposed_ticket_inr ??
            0
        )
      );
    }, 0);

    const invested = investors.reduce(
      (sum, i) =>
        sum + Number(i.crm?.actual_investment_inr ?? 0),
      0
    );

    const coverage =
      DEFAULT_TARGET_RAISE_INR > 0
        ? (weighted / DEFAULT_TARGET_RAISE_INR) * 100
        : 0;

    // ticket distribution
    const ticketBuckets: Record<string, number> = {
      "₹1 Cr+": 0,
      "₹50L+": 0,
      "₹10L+": 0,
      "₹5L+": 0,
      "₹1L+": 0,
      "Under ₹1L": 0,
    };

    investors.forEach((i) => {
      const expected = Number(
        i.crm?.expected_investment_inr ??
          i.proposed_ticket_inr ??
          0
      );
      if (expected >= 10000000) ticketBuckets["₹1 Cr+"] += 1;
      else if (expected >= 5000000) ticketBuckets["₹50L+"] += 1;
      else if (expected >= 1000000) ticketBuckets["₹10L+"] += 1;
      else if (expected >= 500000) ticketBuckets["₹5L+"] += 1;
      else if (expected >= 100000) ticketBuckets["₹1L+"] += 1;
      else ticketBuckets["Under ₹1L"] += 1;
    });

    // type distribution
    const typeDistribution: Record<string, number> = {};
    investors.forEach((i) => {
      const key = i.investor_type || "Unspecified";
      typeDistribution[key] = (typeDistribution[key] ?? 0) + 1;
    });

    return {
      total,
      weighted,
      committed,
      invested,
      coverage,
      remaining: Math.max(
        0,
        DEFAULT_TARGET_RAISE_INR - committed - invested
      ),
      ticketBuckets,
      typeDistribution,
    };
  }, [investors]);

  // ---------- 10B.6 Forecast ----------
  const forecast = useMemo(() => {
    const weeks = acquisitionTrend.filter((b) => b.count > 0);
    if (weeks.length < 2) {
      return {
        weeklyRate: 0,
        projectedDaysToTarget: null,
        projectedWeeksToTarget: null,
        confidence: "LOW",
      };
    }

    const recent = acquisitionTrend.slice(-6);
    const totalRecent = recent.reduce((sum, b) => sum + b.count, 0);
    const weeklyRate = totalRecent / recent.length;

    const remaining =
      DEFAULT_TARGET_RAISE_INR -
      capital.committed -
      capital.invested;

    if (remaining <= 0 || capital.weighted <= 0) {
      return {
        weeklyRate,
        projectedDaysToTarget: null,
        projectedWeeksToTarget: null,
        confidence: "LOW",
      };
    }

    const avgTicket =
      investors.length > 0
        ? capital.total / investors.length
        : 0;

    if (avgTicket <= 0 || weeklyRate <= 0) {
      return {
        weeklyRate,
        projectedDaysToTarget: null,
        projectedWeeksToTarget: null,
        confidence: "LOW",
      };
    }

    // Simple linear projection: weekly new investors × avg ticket × 20% conversion
    const weeklyCapital = weeklyRate * avgTicket * 0.2;
    const weeksToTarget = weeklyCapital > 0
      ? remaining / weeklyCapital
      : null;

    const confidence =
      recent.length >= 6 && weeklyRate > 0
        ? "MEDIUM"
        : recent.length >= 3
          ? "LOW"
          : "VERY LOW";

    return {
      weeklyRate,
      projectedDaysToTarget:
        weeksToTarget !== null
          ? Math.round(weeksToTarget * 7)
          : null,
      projectedWeeksToTarget:
        weeksToTarget !== null
          ? Math.round(weeksToTarget * 10) / 10
          : null,
      confidence,
    };
  }, [acquisitionTrend, capital, investors]);

  const maxAcquisition = Math.max(
    1,
    ...acquisitionTrend.map((b) => b.count)
  );

  const maxEngagement = Math.max(
    1,
    ...engagementTrend.map((b) => b.count)
  );

  const maxVelocity = Math.max(
    1,
    ...stageVelocity.map((s) => s.avgDays)
  );

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1800px] px-6 py-8 lg:px-10">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-300">
                  Analytics
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Investor Analytics
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Acquisition, conversion, velocity and capital analytics —
                computed from live CRM state and the institutional
                audit trail.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={timeWindow}
                onChange={(e) =>
                  setTimeWindow(
                    Number(e.target.value) as 4 | 8 | 12 | 26
                  )
                }
                className="rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm text-white/70 outline-none focus:border-sky-300/40"
              >
                <option value={4} className="bg-[#0c111d]">
                  Last 4 weeks
                </option>
                <option value={8} className="bg-[#0c111d]">
                  Last 8 weeks
                </option>
                <option value={12} className="bg-[#0c111d]">
                  Last 12 weeks
                </option>
                <option value={26} className="bg-[#0c111d]">
                  Last 26 weeks
                </option>
              </select>

              <button
                onClick={() => void loadAll()}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <a
                href="/admin/investor-reports"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Reports
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* CAPITAL KPI BAR */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPI
            label="Total Pipeline"
            value={compactINR(capital.total)}
            detail={`${investors.length} investors`}
            tone="sky"
          />
          <KPI
            label="Weighted"
            value={compactINR(capital.weighted)}
            detail="Probability-adjusted"
            tone="violet"
          />
          <KPI
            label="Committed"
            value={compactINR(capital.committed)}
            detail="Commitment stage"
            tone="emerald"
          />
          <KPI
            label="Invested"
            value={compactINR(capital.invested)}
            detail="Actual capital"
            tone="green"
          />
          <KPI
            label="Raise Coverage"
            value={`${capital.coverage.toFixed(0)}%`}
            detail={`Remaining ${compactINR(capital.remaining)}`}
            tone={
              capital.coverage >= 100
                ? "emerald"
                : capital.coverage >= 60
                  ? "amber"
                  : "red"
            }
          />
        </section>

        <div className="space-y-6">
          {/* CONVERSION FUNNEL */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                  10A.2 · 10A.3 · 10A.4
                </div>
                <h2 className="mt-1 text-lg font-semibold">
                  Conversion Funnel
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  Registered → Progressed → Verified → Approved → Engaged →
                  Committed
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <FunnelRow
                label="Registered"
                count={conversionFunnel.registered}
                max={conversionFunnel.registered}
                rate={100}
                tone="bg-sky-300"
              />
              <FunnelRow
                label="Progressed beyond prospect"
                count={conversionFunnel.progressed}
                max={conversionFunnel.registered}
                rate={conversionFunnel.rates.progress}
                tone="bg-cyan-300"
              />
              <FunnelRow
                label="Verified"
                count={conversionFunnel.verified}
                max={conversionFunnel.registered}
                rate={conversionFunnel.rates.verification}
                tone="bg-violet-300"
              />
              <FunnelRow
                label="Approved"
                count={conversionFunnel.approved}
                max={conversionFunnel.registered}
                rate={conversionFunnel.rates.approval}
                tone="bg-amber-300"
              />
              <FunnelRow
                label="Engaged (Interested+)"
                count={conversionFunnel.engaged}
                max={conversionFunnel.registered}
                rate={conversionFunnel.rates.engagement}
                tone="bg-emerald-300"
              />
              <FunnelRow
                label="Committed / Invested"
                count={conversionFunnel.committed}
                max={conversionFunnel.registered}
                rate={conversionFunnel.rates.commitment}
                tone="bg-green-300"
              />
            </div>
          </section>

          {/* TIME SERIES */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartPanel
              step="10A.1"
              title="Acquisition Trend"
              description={`New investor registrations per week (last ${timeWindow} weeks).`}
              buckets={acquisitionTrend}
              max={maxAcquisition}
              tone="bg-sky-300"
            />
            <ChartPanel
              step="10A.7"
              title="Engagement Trend"
              description={`Recorded activities per week (last ${timeWindow} weeks).`}
              buckets={engagementTrend}
              max={maxEngagement}
              tone="bg-cyan-300"
            />
          </div>

          {/* STAGE VELOCITY */}
          <Panel step="10A.6" title="Stage Velocity">
            <p className="mb-4 text-xs text-white/40">
              Average days spent in each stage, computed from the audit
              trail of stage transitions.
            </p>

            {stageVelocity.every((s) => s.samples === 0) ? (
              <EmptyState
                title="No stage transitions recorded yet"
                hint="Velocity is computed from STAGE_TRANSITION audit events. Move an investor between stages to populate this view."
              />
            ) : (
              <div className="space-y-3">
                {stageVelocity.map((row) => {
                  const tone = STAGE_ACCENT[row.stage];
                  const pct =
                    maxVelocity > 0
                      ? (row.avgDays / maxVelocity) * 100
                      : 0;

                  return (
                    <div key={row.stage}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-white/55">
                          {STAGE_LABELS[row.stage]}
                        </span>
                        <span className="text-white/40">
                          {row.samples > 0
                            ? `${row.avgDays}d avg · ${row.samples} sample${
                                row.samples === 1 ? "" : "s"
                              }`
                            : "no data"}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full ${tone}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* CONVERSION MATRIX */}
          <Panel step="10A.5" title="Pipeline Conversion Matrix">
            <p className="mb-4 text-xs text-white/40">
              Stage-to-stage transition counts observed in the audit
              trail.
            </p>

            {Object.keys(stageConversion).length === 0 ? (
              <EmptyState
                title="No transitions recorded yet"
                hint="Move investors between pipeline stages to populate the conversion matrix."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                        From
                      </th>
                      {STAGES.map((s) => (
                        <th
                          key={s}
                          className="py-2 pr-4 text-[10px] font-semibold uppercase tracking-wider text-white/35"
                        >
                          → {STAGE_LABELS[s]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STAGES.map((from) => {
                      const row = stageConversion[from] ?? {};

                      return (
                        <tr
                          key={from}
                          className="border-b border-white/[0.04]"
                        >
                          <td className="py-2 pr-4 text-xs font-semibold text-white/65">
                            {STAGE_LABELS[from]}
                          </td>
                          {STAGES.map((to) => {
                            const count = row[to] ?? 0;

                            return (
                              <td
                                key={to}
                                className={`py-2 pr-4 text-xs ${
                                  count > 0
                                    ? "font-semibold text-emerald-300"
                                    : "text-white/20"
                                }`}
                              >
                                {count > 0 ? count : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* CAPITAL DISTRIBUTION */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel step="10B.3" title="Ticket Size Distribution">
              <div className="space-y-3">
                {Object.entries(capital.ticketBuckets).map(
                  ([bucket, count]) => {
                    const total = investors.length || 1;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <div key={bucket}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-white/55">
                            {bucket}
                          </span>
                          <span className="font-semibold text-white/75">
                            {count}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-violet-300/70"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </Panel>

            <Panel step="10B.4" title="Investor Type Distribution">
              {Object.keys(capital.typeDistribution).length === 0 ? (
                <EmptyState
                  title="No investors yet"
                  hint="Investor type distribution appears once investors are registered."
                />
              ) : (
                <div className="space-y-3">
                  {Object.entries(capital.typeDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => {
                      const total = investors.length || 1;
                      const pct = Math.round((count / total) * 100);

                      return (
                        <div key={type}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="text-white/55">
                              {type}
                            </span>
                            <span className="font-semibold text-white/75">
                              {count}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-cyan-300/70"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </Panel>
          </div>

          {/* FORECAST */}
          <Panel step="10B.6" title="Conversion Forecasting">
            <div className="grid gap-4 sm:grid-cols-3">
              <ForecastStat
                label="Weekly Rate"
                value={`${forecast.weeklyRate.toFixed(
                  1
                )} investors`}
                detail="Recent average"
              />
              <ForecastStat
                label="Projected Days to Close"
                value={
                  forecast.projectedDaysToTarget !== null
                    ? `${forecast.projectedDaysToTarget} days`
                    : "Insufficient data"
                }
                detail="Linear projection"
              />
              <ForecastStat
                label="Confidence"
                value={forecast.confidence}
                detail="Based on sample size"
                tone={
                  forecast.confidence === "MEDIUM"
                    ? "emerald"
                    : forecast.confidence === "LOW"
                      ? "amber"
                      : "red"
                }
              />
            </div>
            <p className="mt-4 text-[10px] leading-5 text-white/30">
              Projection assumes recent weekly acquisition rate continues,
              weighted by average ticket and 20% conversion to committed.
              Directional only — not a commitment.
            </p>
          </Panel>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function KPI({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "sky" | "violet" | "emerald" | "green" | "amber" | "red";
}) {
  const tones = {
    sky: { text: "text-sky-300", dot: "bg-sky-300" },
    violet: { text: "text-violet-300", dot: "bg-violet-300" },
    emerald: { text: "text-emerald-300", dot: "bg-emerald-300" },
    green: { text: "text-green-300", dot: "bg-green-300" },
    amber: { text: "text-amber-300", dot: "bg-amber-300" },
    red: { text: "text-red-300", dot: "bg-red-300" },
  };

  const selected = tones[tone];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/10">
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

function Panel({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
          {step}
        </span>
      </div>
      {children}
    </section>
  );
}

function ChartPanel({
  step,
  title,
  description,
  buckets,
  max,
  tone,
}: {
  step: string;
  title: string;
  description: string;
  buckets: TimeBucket[];
  max: number;
  tone: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-white/40">{description}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
          {step}
        </span>
      </div>

      {buckets.every((b) => b.count === 0) ? (
        <EmptyState
          title="No data in this window"
          hint="Widen the time window or record new activity."
        />
      ) : (
        <div className="flex h-48 items-end gap-1">
          {buckets.map((bucket, i) => {
            const height = max > 0 ? (bucket.count / max) * 100 : 0;

            return (
              <div
                key={i}
                className="group relative flex flex-1 flex-col items-center justify-end"
              >
                <div className="absolute -top-6 text-[10px] font-semibold text-white/0 transition group-hover:text-white">
                  {bucket.count}
                </div>
                <div
                  className={`w-full rounded-t ${tone} transition-all hover:opacity-100`}
                  style={{
                    height: `${Math.max(2, height)}%`,
                    opacity: 0.7,
                  }}
                  title={`${bucket.label}: ${bucket.count}`}
                />
                {i % 3 === 0 && (
                  <div className="mt-2 origin-top-left rotate-45 text-[9px] text-white/30">
                    {bucket.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FunnelRow({
  label,
  count,
  max,
  rate,
  tone,
}: {
  label: string;
  count: number;
  max: number;
  rate: number;
  tone: string;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white/75">
            {count}
          </span>
          <span className="w-10 text-right text-[10px] text-white/35">
            {rate}%
          </span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ForecastStat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "emerald" | "amber" | "red";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-300"
      : tone === "amber"
        ? "text-amber-300"
        : tone === "red"
          ? "text-red-300"
          : "text-white/80";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        {label}
      </div>
      <div className={`mt-3 text-xl font-semibold ${toneClass}`}>
        {value}
      </div>
      <div className="mt-1 text-[10px] text-white/35">{detail}</div>
    </div>
  );
}

function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg text-white/25">
        ◇
      </div>
      <p className="mt-4 text-sm font-semibold text-white/60">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/30">
        {hint}
      </p>
    </div>
  );
}