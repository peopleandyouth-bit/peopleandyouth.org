"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type GovernanceSnapshot = {
  generated_at: string;
  iam: {
    admin_count: number;
    active_admin_count: number;
    roles: string[];
  };
  rls: Array<{
    table_name: string;
    rls_enabled: boolean;
    policy_count: number;
  }>;
  grants: Array<{
    grantee: string;
    table_name: string;
    privilege_type: string;
  }>;
  audit: {
    total_events: number;
    latest_event_at: string | null;
    event_type_count: number;
    distinct_actors: number;
    event_type_breakdown: Array<{
      event_type: string;
      count: number;
    }>;
  };
  automation: {
    total_runs: number;
    last_cron_at: string | null;
    last_manual_at: string | null;
    failed_runs: number;
    successful_runs: number;
  };
  investors: {
    total_investors: number;
    verified_approved: number;
    with_crm_records: number;
  };
};

type GovernanceResponse = {
  success: boolean;
  snapshot: GovernanceSnapshot;
  secrets: {
    service_role_configured: boolean;
    cron_secret_configured: boolean;
    supabase_url_configured: boolean;
  };
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

function relativeTime(value: string | null | undefined) {
  if (!value) return "";

  const then = new Date(value).getTime();

  if (Number.isNaN(then)) return "";

  const diffSec = Math.floor((Date.now() - then) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return "";
}

export default function InvestorGovernancePage() {
  const [data, setData] = useState<GovernanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/investor-governance",
        { cache: "no-store" }
      );

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(
          payload?.error ?? "Unable to load governance snapshot."
        );
      }

      setData(payload as GovernanceResponse);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load governance snapshot."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  const posture = useMemo(() => {
    if (!data) {
      return {
        status: "UNKNOWN" as const,
        checks: [] as Array<{
          label: string;
          status: "PASS" | "WARN" | "FAIL";
          detail: string;
        }>,
      };
    }

    const { snapshot, secrets } = data;

    const checks: Array<{
      label: string;
      status: "PASS" | "WARN" | "FAIL";
      detail: string;
    }> = [];

    // Service-role isolation
    checks.push({
      label: "Service-role key configured server-side only",
      status: secrets.service_role_configured ? "PASS" : "FAIL",
      detail: secrets.service_role_configured
        ? "Present in server env"
        : "Missing — server routes will fail",
    });

    // Cron secret
    checks.push({
      label: "CRON_SECRET configured",
      status: secrets.cron_secret_configured ? "PASS" : "WARN",
      detail: secrets.cron_secret_configured
        ? "Vercel cron authorized"
        : "Cron will not authenticate until CRON_SECRET is set",
    });

    // Supabase URL
    checks.push({
      label: "Supabase URL configured",
      status: secrets.supabase_url_configured ? "PASS" : "FAIL",
      detail: secrets.supabase_url_configured
        ? "Client and server both configured"
        : "Missing — cannot reach Supabase",
    });

    // IAM
    checks.push({
      label: "Active admin identity present",
      status: snapshot.iam.active_admin_count > 0 ? "PASS" : "FAIL",
      detail: `${snapshot.iam.active_admin_count} active of ${snapshot.iam.admin_count} total`,
    });

    // RLS on every investor table
    const rlsGaps = snapshot.rls.filter((t) => !t.rls_enabled);
    checks.push({
      label: "RLS enabled on all investor tables",
      status: rlsGaps.length === 0 ? "PASS" : "FAIL",
      detail:
        rlsGaps.length === 0
          ? `${snapshot.rls.length} tables protected`
          : `Missing on: ${rlsGaps.map((t) => t.table_name).join(", ")}`,
    });

    // Anonymous/authenticated write grants
    checks.push({
      label: "No anon/authenticated write grants",
      status: snapshot.grants.length === 0 ? "PASS" : "FAIL",
      detail:
        snapshot.grants.length === 0
          ? "All writes are service-role only"
          : `${snapshot.grants.length} residual grant${snapshot.grants.length === 1 ? "" : "s"}`,
    });

    // Audit trail active
    checks.push({
      label: "Audit trail recording events",
      status: snapshot.audit.total_events > 0 ? "PASS" : "WARN",
      detail:
        snapshot.audit.total_events > 0
          ? `${snapshot.audit.total_events} events from ${snapshot.audit.distinct_actors} actors`
          : "No events yet — record a mutation to populate",
    });

    // Automation
    checks.push({
      label: "Automation cron has fired",
      status: snapshot.automation.last_cron_at ? "PASS" : "WARN",
      detail: snapshot.automation.last_cron_at
        ? `Last cron ${relativeTime(snapshot.automation.last_cron_at)}`
        : "No cron execution recorded yet",
    });

    // Failure check
    checks.push({
      label: "No failed automation runs",
      status: snapshot.automation.failed_runs === 0 ? "PASS" : "WARN",
      detail:
        snapshot.automation.failed_runs === 0
          ? "All runs succeeded"
          : `${snapshot.automation.failed_runs} failed run${snapshot.automation.failed_runs === 1 ? "" : "s"}`,
    });

    const hasFail = checks.some((c) => c.status === "FAIL");
    const hasWarn = checks.some((c) => c.status === "WARN");

    const status = hasFail
      ? ("DEGRADED" as const)
      : hasWarn
        ? ("WARNING" as const)
        : ("HEALTHY" as const);

    return { status, checks };
  }, [data]);

  const postureTone = {
    HEALTHY: {
      text: "text-emerald-300",
      bg: "bg-emerald-300/[0.06]",
      border: "border-emerald-300/20",
      label: "Healthy",
    },
    WARNING: {
      text: "text-amber-300",
      bg: "bg-amber-300/[0.06]",
      border: "border-amber-300/20",
      label: "Warning",
    },
    DEGRADED: {
      text: "text-red-300",
      bg: "bg-red-300/[0.06]",
      border: "border-red-300/20",
      label: "Degraded",
    },
    UNKNOWN: {
      text: "text-white/40",
      bg: "bg-white/[0.04]",
      border: "border-white/10",
      label: "Unknown",
    },
  }[posture.status];

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1700px] px-6 py-8 lg:px-10">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">
                  Governance
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Institutional Governance Posture
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Live verification of IAM, RLS, storage hygiene, grant
                discipline, audit coverage and automation execution.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => void loadSnapshot()}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                {loading ? "Verifying..." : "Re-verify now"}
              </button>

              <a
                href="/admin/investor-audit"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Audit Trail
              </a>

              <a
                href="/admin/investor-automation/scans"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Automation
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* POSTURE BANNER */}
        <section
          className={`mb-8 rounded-3xl border p-6 shadow-2xl shadow-black/20 ${postureTone.border} ${postureTone.bg}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Overall Posture
              </div>
              <div
                className={`mt-2 text-4xl font-semibold ${postureTone.text}`}
              >
                {postureTone.label}
              </div>
              <div className="mt-2 text-xs text-white/45">
                {data?.snapshot.generated_at
                  ? `Verified ${formatDateTime(data.snapshot.generated_at)}`
                  : "Awaiting first verification"}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-right">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-white/35">
                  Passing
                </div>
                <div className="mt-1 text-2xl font-semibold text-emerald-300">
                  {posture.checks.filter((c) => c.status === "PASS").length}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-white/35">
                  Warnings
                </div>
                <div className="mt-1 text-2xl font-semibold text-amber-300">
                  {posture.checks.filter((c) => c.status === "WARN").length}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-white/35">
                  Failures
                </div>
                <div className="mt-1 text-2xl font-semibold text-red-300">
                  {posture.checks.filter((c) => c.status === "FAIL").length}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHECKS */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-lg font-semibold">Verification Checks</h2>
            <p className="mt-1 text-xs text-white/40">
              Live posture verification — every check is recomputed on
              page load.
            </p>
          </div>

          {loading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-2xl bg-white/[0.025]"
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {posture.checks.map((check) => (
                <div
                  key={check.label}
                  className="flex flex-wrap items-center gap-4 px-6 py-4"
                >
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                      check.status === "PASS"
                        ? "border-emerald-300/30 bg-emerald-300/[0.1] text-emerald-300"
                        : check.status === "WARN"
                          ? "border-amber-300/30 bg-amber-300/[0.1] text-amber-300"
                          : "border-red-300/30 bg-red-300/[0.1] text-red-300"
                    }`}
                  >
                    {check.status === "PASS"
                      ? "✓"
                      : check.status === "WARN"
                        ? "!"
                        : "✕"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white/85">
                      {check.label}
                    </div>
                    <div className="mt-0.5 text-xs text-white/45">
                      {check.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SNAPSHOT DETAIL */}
        {data && (
          <div className="space-y-6">
            {/* IAM */}
            <Panel title="IAM Status">
              <div className="grid grid-cols-3 gap-4">
                <Stat
                  label="Admins"
                  value={data.snapshot.iam.admin_count}
                />
                <Stat
                  label="Active"
                  value={data.snapshot.iam.active_admin_count}
                  tone="emerald"
                />
                <Stat
                  label="Roles"
                  value={data.snapshot.iam.roles.join(", ") || "—"}
                />
              </div>
            </Panel>

            {/* RLS */}
            <Panel title="Row-Level Security">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {data.snapshot.rls.map((t) => (
                  <div
                    key={t.table_name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-mono text-xs text-white/70">
                        {t.table_name}
                      </div>
                      <div className="mt-0.5 text-[10px] text-white/35">
                        {t.policy_count} polic
                        {t.policy_count === 1 ? "y" : "ies"}
                      </div>
                    </div>
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        t.rls_enabled
                          ? "bg-emerald-300"
                          : "bg-red-300"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </Panel>

            {/* Grants */}
            <Panel title="Anonymous / Authenticated Write Grants">
              {data.snapshot.grants.length === 0 ? (
                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] px-4 py-3 text-sm text-emerald-200">
                  ✓ Zero residual write grants. All investor mutations
                  flow through service-role only.
                </div>
              ) : (
                <div className="space-y-2">
                  {data.snapshot.grants.map((g, i) => (
                    <div
                      key={`${g.grantee}-${g.table_name}-${g.privilege_type}-${i}`}
                      className="rounded-xl border border-red-300/15 bg-red-300/[0.05] px-3 py-2 font-mono text-xs text-red-200"
                    >
                      {g.grantee} · {g.table_name} · {g.privilege_type}
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Audit */}
            <Panel title="Audit Coverage">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat
                  label="Total Events"
                  value={data.snapshot.audit.total_events}
                />
                <Stat
                  label="Event Types"
                  value={data.snapshot.audit.event_type_count}
                />
                <Stat
                  label="Actors"
                  value={data.snapshot.audit.distinct_actors}
                />
                <Stat
                  label="Latest"
                  value={
                    data.snapshot.audit.latest_event_at
                      ? relativeTime(data.snapshot.audit.latest_event_at)
                      : "—"
                  }
                />
              </div>

              {data.snapshot.audit.event_type_breakdown.length > 0 && (
                <div className="mt-4 space-y-2">
                  {data.snapshot.audit.event_type_breakdown.map((row) => {
                    const max = Math.max(
                      ...data.snapshot.audit.event_type_breakdown.map(
                        (r) => r.count
                      )
                    );

                    return (
                      <div key={row.event_type}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-mono text-white/55">
                            {row.event_type}
                          </span>
                          <span className="font-semibold text-white/75">
                            {row.count}
                          </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-amber-300/70"
                            style={{
                              width: `${Math.max(
                                5,
                                (row.count / max) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* Automation */}
            <Panel title="Automation Execution">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <Stat
                  label="Total Runs"
                  value={data.snapshot.automation.total_runs}
                />
                <Stat
                  label="Successful"
                  value={data.snapshot.automation.successful_runs}
                  tone="emerald"
                />
                <Stat
                  label="Failed"
                  value={data.snapshot.automation.failed_runs}
                  tone={
                    data.snapshot.automation.failed_runs > 0
                      ? "red"
                      : undefined
                  }
                />
                <Stat
                  label="Last Cron"
                  value={
                    data.snapshot.automation.last_cron_at
                      ? relativeTime(
                          data.snapshot.automation.last_cron_at
                        )
                      : "Never"
                  }
                />
                <Stat
                  label="Last Manual"
                  value={
                    data.snapshot.automation.last_manual_at
                      ? relativeTime(
                          data.snapshot.automation.last_manual_at
                        )
                      : "Never"
                  }
                />
              </div>
            </Panel>

            {/* Investor data */}
            <Panel title="Investor Data Posture">
              <div className="grid grid-cols-3 gap-4">
                <Stat
                  label="Total Investors"
                  value={data.snapshot.investors.total_investors}
                />
                <Stat
                  label="Verified + Approved"
                  value={data.snapshot.investors.verified_approved}
                  tone="emerald"
                />
                <Stat
                  label="With CRM Records"
                  value={data.snapshot.investors.with_crm_records}
                />
              </div>
            </Panel>
          </div>
        )}
      </div>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "emerald" | "red";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-300"
      : tone === "red"
        ? "text-red-300"
        : "text-white/85";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        {label}
      </div>
      <div className={`mt-2 text-lg font-semibold ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}