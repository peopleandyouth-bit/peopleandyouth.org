"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STAGE_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  NDA: "NDA",
  DUE_DILIGENCE: "Due Diligence",
  COMMITMENT: "Commitment",
  INVESTED: "Invested",
};

type ScanRecord = {
  id: string;
  scan_type: string;
  triggered_by: "CRON" | "MANUAL";
  triggered_by_actor: string | null;
  status: "SUCCESS" | "FAILED";
  error_message: string | null;
  summary: Record<string, unknown> | null;
  duration_ms: number | null;
  occurred_at: string;
  created_at: string;
};

type ScanSummary = {
  generated_at: string;
  daily_review: {
    total_investors: number;
    active_relationships: number;
    open_actions: number;
    completed_actions_last_7d: number;
  };
  overdue_scan: {
    count: number;
    items: Array<{
      activity_id: string;
      investor_id: string;
      investor_name: string;
      subject: string | null;
      due_at: string;
      days_overdue: number;
    }>;
  };
  dormancy_scan: {
    count: number;
    items: Array<{
      investor_id: string;
      investor_name: string;
      stage: string;
      days_since_contact: number | null;
      threshold_days: number;
    }>;
  };
  pipeline_health: {
    stage_distribution: Array<{
      stage: string;
      count: number;
      value_inr: number;
    }>;
    blocked_stages: Array<{
      stage: string;
      count: number;
      avg_days_in_stage: number;
      threshold_days: number;
    }>;
  };
  raise_progress: {
    target_inr: number;
    weighted_pipeline_inr: number;
    proposed_inr: number;
    confirmed_inr: number;
    remaining_inr: number;
    coverage_percent: number;
  };
  executive_summary: {
    attention_items: number;
    opportunities: number;
    risks: number;
    narrative: string;
  };
};

function compactINR(value: number | null | undefined) {
  const amount = Number(value ?? 0);

  if (amount >= 10000000)
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
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

  const diffSec = Math.floor((Date.now() - then) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return "";
}

export default function AutomationScansPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedScanId, setSelectedScanId] =
    useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "SUCCESS" | "FAILED"
  >("ALL");
  const [filterTrigger, setFilterTrigger] = useState<
    "ALL" | "CRON" | "MANUAL"
  >("ALL");

  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState("");
  const [runError, setRunError] = useState("");

  const loadScans = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("limit", "50");

      if (filterStatus !== "ALL") {
        params.set("status", filterStatus);
      }

      if (filterTrigger !== "ALL") {
        params.set("triggered_by", filterTrigger);
      }

      const response = await fetch(
        `/api/admin/investor-automation/scans?${params.toString()}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ?? "Unable to load automation scans."
        );
      }

      setScans(data.scans ?? []);
      setTotal(data.total ?? 0);

      if (!selectedScanId && data.scans?.length > 0) {
        setSelectedScanId(data.scans[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load automation scans."
      );
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterTrigger, selectedScanId]);

  useEffect(() => {
    void loadScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterTrigger]);

  async function runScanNow() {
    setRunning(true);
    setRunMessage("");
    setRunError("");

    try {
      const response = await fetch(
        "/api/admin/investor-automation/scan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ?? "Scan failed."
        );
      }

      const status =
        data.summary?.overdue_scan?.count === 0 &&
        data.summary?.dormancy_scan?.count === 0
          ? "clean"
          : "completed";

      setRunMessage(
        `Scan ${status} in ${
          data.scan?.duration_ms ?? 0
        }ms. Recorded at ${formatDateTime(
          data.scan?.occurred_at
        )}.`
      );

      setSelectedScanId(data.scan?.id ?? null);

      await loadScans();
    } catch (err) {
      setRunError(
        err instanceof Error ? err.message : "Scan failed."
      );
    } finally {
      setRunning(false);
    }
  }

  const selectedScan = useMemo(
    () => scans.find((s) => s.id === selectedScanId) ?? null,
    [scans, selectedScanId]
  );

  const selectedSummary: ScanSummary | null =
    selectedScan?.summary &&
    typeof selectedScan.summary === "object"
      ? (selectedScan.summary as unknown as ScanSummary)
      : null;

  const cronCount = scans.filter(
    (s) => s.triggered_by === "CRON"
  ).length;

  const manualCount = scans.filter(
    (s) => s.triggered_by === "MANUAL"
  ).length;

  const failedCount = scans.filter(
    (s) => s.status === "FAILED"
  ).length;

  const successRate =
    scans.length > 0
      ? Math.round(
          ((scans.length - failedCount) / scans.length) * 100
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1700px] px-6 py-8 lg:px-10">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                  Scheduled Operations
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Automation Scan History
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Daily review, overdue scan, dormancy scan, pipeline
                health, raise progress and executive summary — executed
                by Vercel Cron every day at 06:00 UTC, or on demand.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => void runScanNow()}
                disabled={running}
                className="rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {running ? "Running scan…" : "Run scan now"}
              </button>

              <button
                onClick={() => void loadScans()}
                disabled={loading || running}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>

              <a
                href="/admin/investor-automation"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Intelligence
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {runMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4 text-sm text-emerald-200">
            {runMessage}
          </div>
        )}

        {runError && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {runError}
          </div>
        )}

        {/* METRICS */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="Total Scans"
            value={String(total)}
            detail="Historical records"
            tone="emerald"
          />
          <MetricTile
            label="Cron Runs"
            value={String(cronCount)}
            detail="Automatic daily"
            tone="cyan"
          />
          <MetricTile
            label="Manual Runs"
            value={String(manualCount)}
            detail="On-demand"
            tone="violet"
          />
          <MetricTile
            label="Success Rate"
            value={`${successRate}%`}
            detail={`${failedCount} failed`}
            tone={failedCount === 0 ? "emerald" : "amber"}
          />
        </section>

        {/* FILTERS */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(["ALL", "SUCCESS", "FAILED"] as const).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                        filterStatus === s
                          ? "border-emerald-300/40 bg-emerald-300/[0.08] text-emerald-200"
                          : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Trigger
              </label>
              <div className="flex flex-wrap gap-2">
                {(["ALL", "CRON", "MANUAL"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterTrigger(t)}
                    className={`rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                      filterTrigger === t
                        ? "border-emerald-300/40 bg-emerald-300/[0.08] text-emerald-200"
                        : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SCAN LIST + DETAIL */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          {/* List */}
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold">
                Scan History
              </h2>
              <p className="mt-1 text-[10px] text-white/40">
                {scans.length} shown
              </p>
            </div>

            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-white/[0.025]"
                  />
                ))}
              </div>
            ) : scans.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-white/25">
                  ◇
                </div>
                <p className="mt-3 text-xs text-white/50">
                  No scans recorded yet.
                </p>
                <p className="mx-auto mt-1 max-w-[220px] text-[10px] leading-4 text-white/30">
                  Click &ldquo;Run scan now&rdquo; above or wait for the
                  next scheduled execution.
                </p>
              </div>
            ) : (
              <div className="max-h-[720px] overflow-y-auto">
                {scans.map((scan) => {
                  const active = scan.id === selectedScanId;
                  const isSuccess = scan.status === "SUCCESS";

                  return (
                    <button
                      key={scan.id}
                      onClick={() => setSelectedScanId(scan.id)}
                      className={`flex w-full flex-col gap-2 border-b border-white/[0.06] px-5 py-4 text-left transition ${
                        active
                          ? "bg-emerald-300/[0.06]"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            scan.triggered_by === "CRON"
                              ? "border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-300"
                              : "border-violet-300/20 bg-violet-300/[0.08] text-violet-300"
                          }`}
                        >
                          {scan.triggered_by}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            isSuccess
                              ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300"
                              : "border-red-300/20 bg-red-300/[0.08] text-red-300"
                          }`}
                        >
                          <span className="h-1 w-1 rounded-full bg-current" />
                          {scan.status}
                        </span>
                      </div>

                      <div className="text-xs text-white/60">
                        {formatDateTime(scan.occurred_at)}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-white/30">
                        <span className="truncate">
                          {scan.triggered_by_actor ?? "—"}
                        </span>
                        {scan.duration_ms !== null && (
                          <span>{scan.duration_ms}ms</span>
                        )}
                      </div>

                      {scan.summary &&
                        typeof scan.summary === "object" && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {typeof (scan.summary as Record<
                              string,
                              unknown
                            >).executive_summary === "object" &&
                              ((
                                scan.summary as Record<
                                  string,
                                  unknown
                                >
                              ).executive_summary as Record<
                                string,
                                number
                              >).risks > 0 && (
                                <span className="rounded border border-red-300/20 bg-red-300/[0.06] px-1.5 py-0.5 text-[9px] font-semibold text-red-300">
                                  {(
                                    (
                                      scan.summary as Record<
                                        string,
                                        unknown
                                      >
                                    ).executive_summary as Record<
                                      string,
                                      number
                                    >
                                  ).risks}{" "}
                                  risks
                                </span>
                              )}
                          </div>
                        )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Detail */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
            {!selectedScan ? (
              <div className="flex min-h-[400px] items-center justify-center text-center">
                <div className="max-w-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg text-white/25">
                    ◇
                  </div>
                  <p className="mt-4 text-sm text-white/60">
                    Select a scan to view the full summary.
                  </p>
                </div>
              </div>
            ) : selectedScan.status === "FAILED" ? (
              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-300">
                    Failed Scan
                  </div>
                  <h2 className="mt-1 text-lg font-semibold">
                    {formatDateTime(selectedScan.occurred_at)}
                  </h2>
                </div>

                <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-300">
                    Error
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-200">
                    {selectedScan.error_message ??
                      "Unknown error."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <DetailRow
                    label="Trigger"
                    value={selectedScan.triggered_by}
                  />
                  <DetailRow
                    label="Actor"
                    value={selectedScan.triggered_by_actor ?? "—"}
                  />
                  <DetailRow
                    label="Duration"
                    value={`${selectedScan.duration_ms ?? 0}ms`}
                  />
                  <DetailRow
                    label="Relative"
                    value={relativeTime(selectedScan.occurred_at)}
                  />
                </div>
              </div>
            ) : selectedSummary ? (
              <div className="space-y-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        Scan Summary
                      </div>
                      <h2 className="mt-1 text-lg font-semibold">
                        {formatDateTime(
                          selectedScan.occurred_at
                        )}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/55">
                        {selectedScan.triggered_by}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold text-white/55">
                        {selectedScan.duration_ms ?? 0}ms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Executive narrative */}
                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    9C.6 Executive Narrative
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    {selectedSummary.executive_summary.narrative}
                  </p>
                </div>

                {/* 9C.1 Daily review */}
                <Section title="9C.1 Daily CRM Review">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SmallStat
                      label="Investors"
                      value={selectedSummary.daily_review.total_investors}
                    />
                    <SmallStat
                      label="Active"
                      value={
                        selectedSummary.daily_review
                          .active_relationships
                      }
                    />
                    <SmallStat
                      label="Open actions"
                      value={selectedSummary.daily_review.open_actions}
                    />
                    <SmallStat
                      label="Completed 7d"
                      value={
                        selectedSummary.daily_review
                          .completed_actions_last_7d
                      }
                    />
                  </div>
                </Section>

                {/* 9C.2 Overdue */}
                <Section
                  title={`9C.2 Overdue-Action Scan (${selectedSummary.overdue_scan.count})`}
                >
                  {selectedSummary.overdue_scan.items.length === 0 ? (
                    <p className="text-xs text-emerald-300">
                      No overdue actions.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSummary.overdue_scan.items
                        .slice(0, 8)
                        .map((item) => (
                          <div
                            key={item.activity_id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-white/75">
                                {item.subject || "Overdue action"}
                              </div>
                              <div className="mt-0.5 text-[10px] text-white/40">
                                {item.investor_name} ·{" "}
                                {formatDateTime(item.due_at)}
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full border border-red-300/20 bg-red-300/[0.08] px-2 py-0.5 text-[10px] font-bold text-red-300">
                              {item.days_overdue}d overdue
                            </span>
                          </div>
                        ))}
                      {selectedSummary.overdue_scan.count > 8 && (
                        <p className="text-[10px] text-white/30">
                          +{" "}
                          {selectedSummary.overdue_scan.count - 8}{" "}
                          more
                        </p>
                      )}
                    </div>
                  )}
                </Section>

                {/* 9C.3 Dormancy */}
                <Section
                  title={`9C.3 Dormant-Investor Scan (${selectedSummary.dormancy_scan.count})`}
                >
                  {selectedSummary.dormancy_scan.items.length === 0 ? (
                    <p className="text-xs text-emerald-300">
                      No dormant relationships.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSummary.dormancy_scan.items
                        .slice(0, 8)
                        .map((item) => (
                          <div
                            key={item.investor_id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium text-white/75">
                                {item.investor_name}
                              </div>
                              <div className="mt-0.5 text-[10px] text-white/40">
                                {STAGE_LABELS[item.stage] ?? item.stage}{" "}
                                · threshold {item.threshold_days}d
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              {item.days_since_contact === null
                                ? "Never"
                                : `${item.days_since_contact}d`}
                            </span>
                          </div>
                        ))}
                      {selectedSummary.dormancy_scan.count > 8 && (
                        <p className="text-[10px] text-white/30">
                          +{" "}
                          {selectedSummary.dormancy_scan.count - 8}{" "}
                          more
                        </p>
                      )}
                    </div>
                  )}
                </Section>

                {/* 9C.4 Pipeline health */}
                <Section title="9C.4 Pipeline-Health Scan">
                  <div className="space-y-3">
                    {selectedSummary.pipeline_health.stage_distribution
                      .length === 0 ? (
                      <p className="text-xs text-white/40">
                        No pipeline data.
                      </p>
                    ) : (
                      selectedSummary.pipeline_health.stage_distribution.map(
                        (row) => (
                          <div
                            key={row.stage}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="text-xs text-white/55">
                              {STAGE_LABELS[row.stage] ?? row.stage}
                            </span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-white/35">
                                {row.count} inv
                              </span>
                              <span className="font-semibold text-white/75">
                                {compactINR(row.value_inr)}
                              </span>
                            </div>
                          </div>
                        )
                      )
                    )}

                    {selectedSummary.pipeline_health.blocked_stages
                      .length > 0 && (
                      <div className="mt-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                          Blocked stages
                        </div>
                        <div className="mt-2 space-y-1">
                          {selectedSummary.pipeline_health.blocked_stages.map(
                            (row) => (
                              <div
                                key={row.stage}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-white/70">
                                  {STAGE_LABELS[row.stage] ??
                                    row.stage}
                                </span>
                                <span className="text-amber-300">
                                  avg{" "}
                                  {Math.round(
                                    row.avg_days_in_stage
                                  )}
                                  d / {row.count} inv
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>

                {/* 9C.5 Raise progress */}
                <Section title="9C.5 Raise-Progress Calculation">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <SmallStat
                      label="Target"
                      value={compactINR(
                        selectedSummary.raise_progress.target_inr
                      )}
                    />
                    <SmallStat
                      label="Weighted"
                      value={compactINR(
                        selectedSummary.raise_progress
                          .weighted_pipeline_inr
                      )}
                    />
                    <SmallStat
                      label="Coverage"
                      value={`${selectedSummary.raise_progress.coverage_percent}%`}
                    />
                    <SmallStat
                      label="Proposed"
                      value={compactINR(
                        selectedSummary.raise_progress.proposed_inr
                      )}
                    />
                    <SmallStat
                      label="Confirmed"
                      value={compactINR(
                        selectedSummary.raise_progress.confirmed_inr
                      )}
                    />
                    <SmallStat
                      label="Remaining"
                      value={compactINR(
                        selectedSummary.raise_progress.remaining_inr
                      )}
                    />
                  </div>
                </Section>

                {/* 9C.6 Exec summary meta */}
                <Section title="9C.6 Executive Summary">
                  <div className="grid grid-cols-3 gap-3">
                    <SmallStat
                      label="Attention"
                      value={
                        selectedSummary.executive_summary
                          .attention_items
                      }
                      tone="amber"
                    />
                    <SmallStat
                      label="Opportunities"
                      value={
                        selectedSummary.executive_summary.opportunities
                      }
                      tone="emerald"
                    />
                    <SmallStat
                      label="Risks"
                      value={selectedSummary.executive_summary.risks}
                      tone="red"
                    />
                  </div>
                </Section>
              </div>
            ) : (
              <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-white/40">
                  Summary unavailable.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function MetricTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "cyan" | "violet" | "amber";
}) {
  const tones = {
    emerald: {
      text: "text-emerald-300",
      dot: "bg-emerald-300",
      glow: "shadow-emerald-500/10",
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
    amber: {
      text: "text-amber-300",
      dot: "bg-amber-300",
      glow: "shadow-amber-500/10",
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        {title}
      </div>
      {children}
    </div>
  );
}

function SmallStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
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
    <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-white/35">
        {label}
      </div>
      <div className={`mt-1 text-sm font-semibold ${toneClass}`}>
        {value}
      </div>
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
      <span className="text-white/35">{label}</span>
      <span className="truncate font-mono text-white/65">{value}</span>
    </div>
  );
}