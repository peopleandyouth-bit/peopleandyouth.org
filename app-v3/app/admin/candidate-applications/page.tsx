"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ManualApplicantModal from '@/components/ManualApplicantModal';

const HAPPY_PATH_STAGES = [
  "APPLICATION_SUBMITTED",
  "INITIAL_SCREENING",
  "SKILL_ASSESSMENT",
  "HR_INTERACTION",
  "DOMAIN_INTERVIEW",
  "LEADERSHIP_INTERVIEW",
  "REFERENCE_VERIFICATION",
  "FINAL_DECISION",
  "OFFER_AND_ONBOARDING",
] as const;

type HappyStage = (typeof HAPPY_PATH_STAGES)[number];

const TERMINAL_STAGES = ["REJECTED", "WITHDRAWN", "ARCHIVED"] as const;
type TerminalStage = (typeof TERMINAL_STAGES)[number];

const ALL_STATUS_LABELS: Record<string, string> = {
  APPLICATION_SUBMITTED: "Application Submitted",
  INITIAL_SCREENING: "Initial Screening",
  SKILL_ASSESSMENT: "Skill Assessment",
  HR_INTERACTION: "HR Interaction",
  DOMAIN_INTERVIEW: "Domain Interview",
  LEADERSHIP_INTERVIEW: "Leadership Interview",
  REFERENCE_VERIFICATION: "Reference Verification",
  FINAL_DECISION: "Final Decision",
  OFFER_AND_ONBOARDING: "Offer & Onboarding",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  ARCHIVED: "Archived",
};

const STAGE_ACCENTS: Record<
  string,
  { border: string; dot: string; text: string; bg: string }
> = {
  APPLICATION_SUBMITTED: {
    border: "border-slate-700",
    dot: "bg-slate-400",
    text: "text-slate-300",
    bg: "bg-slate-400/[0.06]",
  },
  INITIAL_SCREENING: {
    border: "border-cyan-700/60",
    dot: "bg-cyan-400",
    text: "text-cyan-300",
    bg: "bg-cyan-400/[0.06]",
  },
  SKILL_ASSESSMENT: {
    border: "border-sky-700/60",
    dot: "bg-sky-400",
    text: "text-sky-300",
    bg: "bg-sky-400/[0.06]",
  },
  HR_INTERACTION: {
    border: "border-violet-700/60",
    dot: "bg-violet-400",
    text: "text-violet-300",
    bg: "bg-violet-400/[0.06]",
  },
  DOMAIN_INTERVIEW: {
    border: "border-indigo-700/60",
    dot: "bg-indigo-400",
    text: "text-indigo-300",
    bg: "bg-indigo-400/[0.06]",
  },
  LEADERSHIP_INTERVIEW: {
    border: "border-amber-700/60",
    dot: "bg-amber-400",
    text: "text-amber-300",
    bg: "bg-amber-400/[0.06]",
  },
  REFERENCE_VERIFICATION: {
    border: "border-orange-700/60",
    dot: "bg-orange-400",
    text: "text-orange-300",
    bg: "bg-orange-400/[0.06]",
  },
  FINAL_DECISION: {
    border: "border-pink-700/60",
    dot: "bg-pink-400",
    text: "text-pink-300",
    bg: "bg-pink-400/[0.06]",
  },
  OFFER_AND_ONBOARDING: {
    border: "border-emerald-700/60",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-400/[0.06]",
  },
};

type Application = {
  id: string;
  candidate_id: string;
  application_id: string;
  opportunity_type: string;
  department: string;
  role_title: string;
  location: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  district: string | null;
  qualification: string | null;
  experience_years: number | null;
  status: string;
  assigned_admin: string | null;
  submitted_at: string;
  last_status_change_at: string;
};

type ListResponse = {
  success: boolean;
  applications: Application[];
  total: number;
  status_counts: Record<string, number>;
  status_labels: Record<string, string>;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function daysSince(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value).getTime();
  if (Number.isNaN(d)) return null;
  return Math.max(0, Math.floor((Date.now() - d) / 86400000));
}

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

type TerminalTab = TerminalStage | null;

export default function AdminCandidateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [terminalTab, setTerminalTab] = useState<TerminalTab>(null);

  // Manual applicant modal
  const [showManualModal, setShowManualModal] = useState(false);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/candidate-applications?limit=500",
        { cache: "no-store" }
      );

      const data: ListResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load applications.");
      }

      setApplications(data.applications ?? []);
      setCounts(data.status_counts ?? {});
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      if (a.department) set.add(a.department);
    });
    return Array.from(set).sort();
  }, [applications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (
        departmentFilter !== "ALL" &&
        a.department !== departmentFilter
      ) {
        return false;
      }
      if (!q) return true;
      return [a.full_name, a.email, a.role_title, a.department]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [applications, search, departmentFilter]);

  const byStatus = useMemo(() => {
    const map: Record<string, Application[]> = {};
    for (const stage of HAPPY_PATH_STAGES) {
      map[stage] = [];
    }
    for (const stage of TERMINAL_STAGES) {
      map[stage] = [];
    }
    for (const app of filtered) {
      const key = app.status in map ? app.status : "APPLICATION_SUBMITTED";
      map[key].push(app);
    }
    return map;
  }, [filtered]);

  const totalActive = useMemo(() => {
    return HAPPY_PATH_STAGES.reduce(
      (sum, stage) => sum + (counts[stage] ?? 0),
      0
    );
  }, [counts]);

  const terminalCounts = useMemo(() => {
    return {
      REJECTED: counts["REJECTED"] ?? 0,
      WITHDRAWN: counts["WITHDRAWN"] ?? 0,
      ARCHIVED: counts["ARCHIVED"] ?? 0,
    };
  }, [counts]);

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1900px] px-6 py-8 lg:px-10">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300">
                  Candidate Operations
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Applications Board
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Every application received through the careers portal,
                organised by the 9-stage hiring workflow. Click any card
                to view the full application.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowManualModal(true)}
                className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300"
              >
                + Log Applicant
              </button>

              <button
                onClick={() => void loadApplications()}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <a
                href="/admin/command-centre"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Command Centre
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* SUMMARY METRICS */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Active pipeline
            </p>
            <p className="mt-3 text-3xl font-semibold text-amber-300">
              {totalActive}
            </p>
            <p className="mt-1 text-xs text-white/35">
              across 9 stages
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Terminal
            </p>
            <p className="mt-3 text-3xl font-semibold text-white/80">
              {terminalCounts.REJECTED +
                terminalCounts.WITHDRAWN +
                terminalCounts.ARCHIVED}
            </p>
            <p className="mt-1 text-xs text-white/35">
              rejected · withdrawn · archived
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Total ever received
            </p>
            <p className="mt-3 text-3xl font-semibold text-white/80">
              {applications.length}
            </p>
            <p className="mt-1 text-xs text-white/35">
              including terminal
            </p>
          </div>
        </section>

        {/* FILTERS */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Search
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, role"
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-300/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-amber-300/40"
              >
                <option value="ALL" className="bg-[#0c111d]">
                  All departments
                </option>
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-[#0c111d]">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex w-full flex-wrap gap-2">
                <button
                  onClick={() => setTerminalTab(null)}
                  className={`flex-1 rounded-xl border px-3 py-3 text-[10px] font-semibold uppercase tracking-wider transition ${
                    terminalTab === null
                      ? "border-amber-300/40 bg-amber-300/[0.08] text-amber-200"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }`}
                >
                  Active pipeline
                </button>
                <button
                  onClick={() =>
                    setTerminalTab(terminalTab === "REJECTED" ? null : "REJECTED")
                  }
                  className={`flex-1 rounded-xl border px-3 py-3 text-[10px] font-semibold uppercase tracking-wider transition ${
                    terminalTab === "REJECTED"
                      ? "border-red-300/40 bg-red-300/[0.08] text-red-200"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }`}
                >
                  Rejected ({terminalCounts.REJECTED})
                </button>
                <button
                  onClick={() =>
                    setTerminalTab(terminalTab === "ARCHIVED" ? null : "ARCHIVED")
                  }
                  className={`flex-1 rounded-xl border px-3 py-3 text-[10px] font-semibold uppercase tracking-wider transition ${
                    terminalTab === "ARCHIVED"
                      ? "border-white/30 bg-white/[0.08] text-white/80"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }`}
                >
                  Archived ({terminalCounts.ARCHIVED})
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4 text-[10px] uppercase tracking-[0.16em] text-white/30">
            <span>
              Showing {filtered.length} of {applications.length}
            </span>
          </div>
        </section>

        {/* BOARD OR TERMINAL LIST */}
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-3xl bg-white/[0.025]"
              />
            ))}
          </div>
        ) : terminalTab !== null ? (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold">
                {ALL_STATUS_LABELS[terminalTab]}
              </h2>
              <p className="mt-1 text-xs text-white/40">
                Applications in this terminal state.
              </p>
            </div>

            {byStatus[terminalTab].length === 0 ? (
              <div className="px-6 py-20 text-center">
                <p className="text-sm text-white/50">
                  No applications in this state.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {byStatus[terminalTab].map((app) => (
                  <li key={app.id}>
                    <a
                      href={`/admin/candidate-applications/${app.id}`}
                      className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-white/60">
                        {initials(app.full_name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white/85">
                            {app.full_name}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/40">
                            {app.role_title}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-white/40">
                          {app.email} · {app.department}
                        </p>
                      </div>

                      <div className="shrink-0 text-right text-[10px] text-white/35">
                        <div>{formatDate(app.submitted_at)}</div>
                        <div className="mt-1 font-mono text-white/25">
                          {app.candidate_id}
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <div className="overflow-x-auto pb-6">
            <div className="grid min-w-[1800px] grid-cols-9 gap-3">
              {HAPPY_PATH_STAGES.map((stage) => {
                const accent = STAGE_ACCENTS[stage];
                const apps = byStatus[stage] ?? [];

                return (
                  <section
                    key={stage}
                    className={`min-h-[520px] rounded-2xl border bg-white/[0.02] ${accent.border}`}
                  >
                    <div className={`border-b border-white/[0.06] p-4 ${accent.bg}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${accent.dot} shadow-[0_0_12px_currentColor]`}
                          />
                          <h2
                            className={`text-[10px] font-bold uppercase tracking-[0.14em] ${accent.text}`}
                          >
                            {ALL_STATUS_LABELS[stage]}
                          </h2>
                        </div>

                        <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-white/60">
                          {apps.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 p-2">
                      {apps.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/[0.06] p-4 text-center text-[10px] text-white/25">
                          Empty
                        </div>
                      ) : (
                        apps.map((app) => {
                          const days = daysSince(app.last_status_change_at);

                          return (
                            <a
                              key={app.id}
                              href={`/admin/candidate-applications/${app.id}`}
                              className="block rounded-xl border border-white/[0.08] bg-[#0c111d] p-3 transition hover:border-white/20 hover:bg-[#0e1420]"
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-white/60">
                                  {initials(app.full_name)}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-semibold text-white/85">
                                    {app.full_name}
                                  </p>
                                  <p className="mt-0.5 truncate text-[10px] text-white/40">
                                    {app.role_title}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2 space-y-1 text-[10px] text-white/35">
                                <div className="flex justify-between gap-2">
                                  <span>Department</span>
                                  <span className="truncate text-right text-white/55">
                                    {app.department}
                                  </span>
                                </div>

                                {app.experience_years !== null && (
                                  <div className="flex justify-between gap-2">
                                    <span>Experience</span>
                                    <span className="text-white/55">
                                      {app.experience_years} yr
                                    </span>
                                  </div>
                                )}

                                <div className="flex justify-between gap-2">
                                  <span>Submitted</span>
                                  <span className="text-white/55">
                                    {formatDate(app.submitted_at)}
                                  </span>
                                </div>

                                {days !== null && days > 0 && (
                                  <div className="flex justify-between gap-2">
                                    <span>In stage</span>
                                    <span className="text-white/55">
                                      {days}d
                                    </span>
                                  </div>
                                )}
                              </div>

                              {app.assigned_admin && (
                                <p className="mt-2 truncate border-t border-white/[0.06] pt-2 text-[9px] uppercase tracking-wider text-white/30">
                                  Owner: {app.assigned_admin}
                                </p>
                              )}
                            </a>
                          );
                        })
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showManualModal && (
        <ManualApplicantModal
          onClose={() => setShowManualModal(false)}
          onCreated={() => {
            void loadApplications();
          }}
        />
      )}
    </main>
  );
}