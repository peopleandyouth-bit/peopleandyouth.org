"use client";

import { useEffect, useMemo, useState } from "react";

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

const STAGE_ACCENT: Record<
  Stage,
  { border: string; bar: string; text: string }
> = {
  PROSPECT: {
    border: "border-white/10",
    bar: "bg-white/40",
    text: "text-white/60",
  },
  CONTACTED: {
    border: "border-cyan-300/15",
    bar: "bg-cyan-300",
    text: "text-cyan-300",
  },
  INTERESTED: {
    border: "border-sky-300/15",
    bar: "bg-sky-300",
    text: "text-sky-300",
  },
  NDA: {
    border: "border-violet-300/15",
    bar: "bg-violet-300",
    text: "text-violet-300",
  },
  DUE_DILIGENCE: {
    border: "border-amber-300/15",
    bar: "bg-amber-300",
    text: "text-amber-300",
  },
  COMMITMENT: {
    border: "border-emerald-300/15",
    bar: "bg-emerald-300",
    text: "text-emerald-300",
  },
  INVESTED: {
    border: "border-green-300/15",
    bar: "bg-green-300",
    text: "text-green-300",
  },
};

type Investor = {
  id: string;
  full_name: string | null;
  email: string | null;
  organization: string | null;
  investor_type: string | null;
  proposed_ticket_inr: number | null;
  verification_status: string | null;
  access_level: string | null;
  kyc_completed: boolean | null;
  nda_signed: boolean | null;
  crm?: {
    stage?: string | null;
    expected_investment_inr?: number | null;
    actual_investment_inr?: number | null;
    probability_percent?: number | null;
    last_contact_date?: string | null;
    next_action?: string | null;
    assigned_admin?: string | null;
  } | null;
};

type Activity = {
  id: string;
  investor_id: string;
  activity_type: string;
  subject: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  due_at: string | null;
  occurred_at: string;
};

type Priority = "OVERDUE" | "HIGH_VALUE" | "STALE" | "CLEAR";

const PRIORITY_TONES: Record<
  Priority,
  { text: string; bg: string; border: string; dot: string; label: string }
> = {
  OVERDUE: {
    text: "text-red-300",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    dot: "bg-red-400",
    label: "Overdue",
  },
  HIGH_VALUE: {
    text: "text-amber-300",
    bg: "bg-amber-300/10",
    border: "border-amber-300/20",
    dot: "bg-amber-300",
    label: "High Value",
  },
  STALE: {
    text: "text-violet-300",
    bg: "bg-violet-300/10",
    border: "border-violet-300/20",
    dot: "bg-violet-300",
    label: "Stale",
  },
  CLEAR: {
    text: "text-white/50",
    bg: "bg-white/[0.04]",
    border: "border-white/10",
    dot: "bg-white/40",
    label: "Clear",
  },
};

function formatINR(value: number | null | undefined) {
  if (!value) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactINR(value: number | null | undefined) {
  const amount = Number(value ?? 0);

  if (amount >= 10000000)
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return formatINR(amount);
}

function ticketBucket(value: number | null | undefined): string {
  const amount = Number(value ?? 0);

  if (amount >= 10000000) return "₹1Cr+";
  if (amount >= 5000000) return "₹50L+";
  if (amount >= 1000000) return "₹10L+";
  if (amount >= 100000) return "₹1L+";
  return "Under ₹1L";
}

const TICKET_BUCKETS = [
  "₹1Cr+",
  "₹50L+",
  "₹10L+",
  "₹1L+",
  "Under ₹1L",
] as const;

function daysSince(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 86400000)
  );
}

function computePriority(
  investor: Investor,
  activities: Activity[]
): Priority {
  const open = activities.filter(
    (a) => a.investor_id === investor.id && a.status === "OPEN"
  );

  const now = Date.now();

  const overdue = open.filter(
    (a) => a.due_at && new Date(a.due_at).getTime() < now
  );

  if (overdue.length > 0) return "OVERDUE";

  const expected = Number(
    investor.crm?.expected_investment_inr ??
      investor.proposed_ticket_inr ??
      0
  );

  if (expected >= 500000) return "HIGH_VALUE";

  const days = daysSince(investor.crm?.last_contact_date);

  if (days === null || days >= 14) return "STALE";

  return "CLEAR";
}

function investorDisplayName(investor: Investor) {
  return (
    investor.full_name ||
    investor.organization ||
    investor.email ||
    "Investor"
  );
}

function initials(name: string | null | undefined) {
  if (!name) return "IN";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function InvestorPipelinePage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetStage, setDropTargetStage] =
    useState<Stage | null>(null);

  const [movingId, setMovingId] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [ticketFilter, setTicketFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | Priority
  >("ALL");

  const [moveModalInvestorId, setMoveModalInvestorId] =
    useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [crmResponse, activityResponse] = await Promise.all([
        fetch("/api/admin/investor-crm", { cache: "no-store" }),
        fetch("/api/admin/investor-crm/activities", {
          cache: "no-store",
        }),
      ]);

      if (!crmResponse.ok) {
        throw new Error("Unable to load investor CRM.");
      }

      if (!activityResponse.ok) {
        throw new Error("Unable to load investor activities.");
      }

      const crmData = await crmResponse.json();
      const activityData = await activityResponse.json();

      setInvestors(crmData.investors ?? []);
      setActivities(activityData.activities ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load pipeline."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const investorTypes = useMemo(() => {
    const set = new Set<string>();
    investors.forEach((inv) => {
      if (inv.investor_type) set.add(inv.investor_type);
    });
    return Array.from(set).sort();
  }, [investors]);

  const filteredInvestors = useMemo(() => {
    return investors.filter((investor) => {
      if (
        typeFilter !== "ALL" &&
        investor.investor_type !== typeFilter
      ) {
        return false;
      }

      if (ticketFilter !== "ALL") {
        const expected = Number(
          investor.crm?.expected_investment_inr ??
            investor.proposed_ticket_inr ??
            0
        );

        if (ticketBucket(expected) !== ticketFilter) return false;
      }

      if (priorityFilter !== "ALL") {
        const priority = computePriority(investor, activities);

        if (priority !== priorityFilter) return false;
      }

      return true;
    });
  }, [investors, activities, typeFilter, ticketFilter, priorityFilter]);

  const metrics = useMemo(() => {
    const totalExpected = investors.reduce(
      (sum, inv) =>
        sum +
        Number(
          inv.crm?.expected_investment_inr ??
            inv.proposed_ticket_inr ??
            0
        ),
      0
    );

    const weighted = investors.reduce((sum, inv) => {
      const expected = Number(
        inv.crm?.expected_investment_inr ??
          inv.proposed_ticket_inr ??
          0
      );

      const probability = Number(
        inv.crm?.probability_percent ?? 10
      );

      return sum + expected * (probability / 100);
    }, 0);

    const active = investors.filter((inv) => {
      const stage = inv.crm?.stage ?? "PROSPECT";
      return stage !== "INVESTED";
    }).length;

    const highValue = investors.filter(
      (inv) =>
        Number(
          inv.crm?.expected_investment_inr ??
            inv.proposed_ticket_inr ??
            0
        ) >= 500000
    ).length;

    const overdueCount = activities.filter(
      (a) =>
        a.status === "OPEN" &&
        a.due_at &&
        new Date(a.due_at).getTime() < Date.now()
    ).length;

    return {
      totalExpected,
      weighted,
      active,
      highValue,
      overdueCount,
    };
  }, [investors, activities]);

  async function moveInvestorToStage(
    investorId: string,
    targetStage: Stage
  ) {
    const investor = investors.find((inv) => inv.id === investorId);

    if (!investor) return;

    const currentStage = (investor.crm?.stage ??
      "PROSPECT") as Stage;

    if (currentStage === targetStage) return;

    setMovingId(investorId);

    /*
     * Optimistic update for immediate visual feedback.
     */
    setInvestors((current) =>
      current.map((inv) =>
        inv.id === investorId
          ? {
              ...inv,
              crm: {
                stage: targetStage,
                expected_investment_inr:
                  inv.crm?.expected_investment_inr ?? null,
                actual_investment_inr:
                  inv.crm?.actual_investment_inr ?? null,
                probability_percent:
                  inv.crm?.probability_percent ?? 10,
                last_contact_date:
                  inv.crm?.last_contact_date ?? null,
                next_action: inv.crm?.next_action ?? null,
                assigned_admin:
                  inv.crm?.assigned_admin ?? "Founder",
              },
            }
          : inv
      )
    );

    try {
      const response = await fetch("/api/admin/investor-crm", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          investor_id: investorId,
          stage: targetStage,
          expected_investment_inr: Number(
            investor.crm?.expected_investment_inr ??
              investor.proposed_ticket_inr ??
              0
          ),
          actual_investment_inr: Number(
            investor.crm?.actual_investment_inr ?? 0
          ),
          probability_percent: Number(
            investor.crm?.probability_percent ?? 10
          ),
          last_contact_date:
            investor.crm?.last_contact_date ?? null,
          next_action: investor.crm?.next_action ?? null,
          meeting_notes: null,
          assigned_admin:
            investor.crm?.assigned_admin ?? "Founder",
        }),
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.error ?? "Unable to move investor."
        );
      }

      await loadData();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to move investor."
      );

      await loadData();
    } finally {
      setMovingId(null);
    }
  }

  function onCardDragStart(investorId: string) {
    setDraggedId(investorId);
  }

  function onCardDragEnd() {
    setDraggedId(null);
    setDropTargetStage(null);
  }

  function onColumnDragOver(
    event: React.DragEvent<HTMLElement>,
    stage: Stage
  ) {
    event.preventDefault();
    setDropTargetStage(stage);
  }

  function onColumnDrop(
    event: React.DragEvent<HTMLElement>,
    stage: Stage
  ) {
    event.preventDefault();

    if (draggedId) {
      void moveInvestorToStage(draggedId, stage);
    }

    setDraggedId(null);
    setDropTargetStage(null);
  }

  const moveModalInvestor = moveModalInvestorId
    ? investors.find((inv) => inv.id === moveModalInvestorId) ?? null
    : null;

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1900px] px-6 py-8 lg:px-10">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  Investor Pipeline
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Capital Pipeline Board
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Drag any investor card between stages. Every move is
                recorded as a stage transition in the institutional
                audit trail. Priority, ticket size and investor type
                are computed from live CRM state.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => void loadData()}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:opacity-40"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <a
                href="/admin/investor-crm"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                CRM
              </a>

              <a
                href="/admin/investor-audit"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Audit
              </a>

              <a
                href="/admin/investor-intelligence"
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

        {/* METRICS */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricTile
            label="Total Pipeline"
            value={compactINR(metrics.totalExpected)}
            detail={`${investors.length} investor${
              investors.length === 1 ? "" : "s"
            }`}
            tone="cyan"
          />

          <MetricTile
            label="Weighted Pipeline"
            value={compactINR(metrics.weighted)}
            detail="Probability-adjusted"
            tone="violet"
          />

          <MetricTile
            label="Active Relationships"
            value={String(metrics.active)}
            detail="Not yet invested"
            tone="green"
          />

          <MetricTile
            label="High Value"
            value={String(metrics.highValue)}
            detail="₹5L+ expected ticket"
            tone="amber"
          />

          <MetricTile
            label="Overdue Actions"
            value={String(metrics.overdueCount)}
            detail="Across all investors"
            tone={metrics.overdueCount > 0 ? "red" : "green"}
          />
        </section>

        {/* FILTERS */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
          <div className="grid gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Investor Type
              </label>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
              >
                <option value="ALL" className="bg-[#0c111d]">
                  All types
                </option>
                {investorTypes.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-[#0c111d]"
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Ticket Size
              </label>

              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
              >
                <option value="ALL" className="bg-[#0c111d]">
                  All sizes
                </option>
                {TICKET_BUCKETS.map((bucket) => (
                  <option
                    key={bucket}
                    value={bucket}
                    className="bg-[#0c111d]"
                  >
                    {bucket}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Priority
              </label>

              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as "ALL" | Priority)
                }
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
              >
                <option value="ALL" className="bg-[#0c111d]">
                  All priorities
                </option>
                <option value="OVERDUE" className="bg-[#0c111d]">
                  Overdue
                </option>
                <option value="HIGH_VALUE" className="bg-[#0c111d]">
                  High value
                </option>
                <option value="STALE" className="bg-[#0c111d]">
                  Stale
                </option>
                <option value="CLEAR" className="bg-[#0c111d]">
                  Clear
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setTypeFilter("ALL");
                  setTicketFilter("ALL");
                  setPriorityFilter("ALL");
                }}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60 transition hover:bg-white/[0.07] hover:text-white"
              >
                Clear filters
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4 text-[10px] uppercase tracking-[0.16em] text-white/30">
            <span>
              Showing {filteredInvestors.length} of {investors.length}
            </span>
          </div>
        </section>

        {/* KANBAN BOARD */}
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-7">
            {STAGES.map((stage) => (
              <div
                key={stage}
                className="h-[600px] animate-pulse rounded-2xl bg-white/[0.025]"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto pb-6">
            <div className="grid min-w-[1800px] grid-cols-7 gap-4">
              {STAGES.map((stage) => {
                const accent = STAGE_ACCENT[stage];

                const stageInvestors = filteredInvestors.filter(
                  (inv) => (inv.crm?.stage ?? "PROSPECT") === stage
                );

                const stageValue = stageInvestors.reduce(
                  (sum, inv) =>
                    sum +
                    Number(
                      inv.crm?.expected_investment_inr ??
                        inv.proposed_ticket_inr ??
                        0
                    ),
                  0
                );

                const isDropTarget = dropTargetStage === stage;

                return (
                  <section
                    key={stage}
                    onDragOver={(e) => onColumnDragOver(e, stage)}
                    onDrop={(e) => onColumnDrop(e, stage)}
                    onDragLeave={() => {
                      if (dropTargetStage === stage) {
                        setDropTargetStage(null);
                      }
                    }}
                    className={`min-h-[600px] rounded-2xl border bg-white/[0.02] transition ${
                      isDropTarget
                        ? "border-cyan-300/50 bg-cyan-300/[0.04]"
                        : "border-white/10"
                    }`}
                  >
                    <div className="border-b border-white/10 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${accent.bar}`}
                          />
                          <h2
                            className={`text-xs font-bold uppercase tracking-[0.14em] ${accent.text}`}
                          >
                            {STAGE_LABELS[stage]}
                          </h2>
                        </div>

                        <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[11px] font-semibold text-white/50">
                          {stageInvestors.length}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-white/40">
                        {compactINR(stageValue)}
                      </p>
                    </div>

                    <div className="space-y-3 p-3">
                      {stageInvestors.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-white/25">
                          Drop investor here
                        </div>
                      ) : (
                        stageInvestors.map((investor) => {
                          const priority = computePriority(
                            investor,
                            activities
                          );

                          const expected = Number(
                            investor.crm
                              ?.expected_investment_inr ??
                              investor.proposed_ticket_inr ??
                              0
                          );

                          const days = daysSince(
                            investor.crm?.last_contact_date
                          );

                          const openCount = activities.filter(
                            (a) =>
                              a.investor_id === investor.id &&
                              a.status === "OPEN"
                          ).length;

                          const isDragging = draggedId === investor.id;

                          return (
                            <article
                              key={investor.id}
                              draggable
                              onDragStart={() =>
                                onCardDragStart(investor.id)
                              }
                              onDragEnd={onCardDragEnd}
                              className={`group cursor-grab rounded-xl border border-white/10 bg-[#0c111d] p-3 transition hover:border-white/20 active:cursor-grabbing ${
                                isDragging
                                  ? "opacity-40"
                                  : "opacity-100"
                              } ${
                                movingId === investor.id
                                  ? "animate-pulse"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] text-[10px] font-semibold text-cyan-200">
                                    {initials(investor.full_name)}
                                  </div>

                                  <div className="min-w-0">
                                    <a
                                      href={`/admin/investors/${investor.id}`}
                                      className="block truncate text-xs font-semibold text-white/85 hover:text-cyan-200"
                                    >
                                      {investorDisplayName(investor)}
                                    </a>

                                    <p className="truncate text-[10px] text-white/35">
                                      {investor.organization ||
                                        investor.investor_type ||
                                        investor.email ||
                                        "—"}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setMoveModalInvestorId(investor.id)
                                  }
                                  className="shrink-0 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-white/40 opacity-0 transition hover:bg-white/[0.06] hover:text-white group-hover:opacity-100"
                                  aria-label="Move investor"
                                >
                                  ⋯
                                </button>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${PRIORITY_TONES[priority].bg} ${PRIORITY_TONES[priority].border} ${PRIORITY_TONES[priority].text}`}
                                >
                                  <span
                                    className={`h-1 w-1 rounded-full ${PRIORITY_TONES[priority].dot}`}
                                  />
                                  {PRIORITY_TONES[priority].label}
                                </span>

                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold text-white/55">
                                  {compactINR(expected)}
                                </span>

                                {investor.investor_type && (
                                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[9px] text-white/40">
                                    {investor.investor_type}
                                  </span>
                                )}
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
                                  <div className="text-white/30">
                                    Last contact
                                  </div>
                                  <div className="mt-0.5 truncate font-medium text-white/60">
                                    {days === null
                                      ? "Never"
                                      : `${days}d ago`}
                                  </div>
                                </div>

                                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
                                  <div className="text-white/30">
                                    Open actions
                                  </div>
                                  <div className="mt-0.5 font-medium text-white/60">
                                    {openCount}
                                  </div>
                                </div>
                              </div>

                              {investor.crm?.next_action && (
                                <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-white/35">
                                  {investor.crm.next_action}
                                </p>
                              )}
                            </article>
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

      {/* MOVE MODAL */}
      {moveModalInvestor && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <button
            aria-label="Close move menu"
            className="absolute inset-0 cursor-default"
            onClick={() => setMoveModalInvestorId(null)}
          />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0c111d] shadow-2xl">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                Move Investor
              </div>

              <h2 className="mt-1 text-lg font-semibold">
                {investorDisplayName(moveModalInvestor)}
              </h2>

              <p className="mt-1 text-xs text-white/40">
                Select the new pipeline stage. The change will be
                recorded as a stage transition in the audit trail.
              </p>
            </div>

            <div className="space-y-2 px-4 py-4">
              {STAGES.map((stage) => {
                const current =
                  (moveModalInvestor.crm?.stage ?? "PROSPECT") ===
                  stage;

                const accent = STAGE_ACCENT[stage];

                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => {
                      setMoveModalInvestorId(null);
                      void moveInvestorToStage(
                        moveModalInvestor.id,
                        stage
                      );
                    }}
                    disabled={current || movingId !== null}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed ${
                      current
                        ? "border-cyan-300/30 bg-cyan-300/[0.06] text-cyan-100"
                        : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${accent.bar}`}
                      />
                      <span className="font-medium">
                        {STAGE_LABELS[stage]}
                      </span>
                    </span>

                    {current && (
                      <span className="text-[10px] uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={() => setMoveModalInvestorId(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
  tone: "cyan" | "violet" | "green" | "amber" | "red";
}) {
  const tones = {
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
    green: {
      text: "text-emerald-300",
      dot: "bg-emerald-300",
      glow: "shadow-emerald-500/10",
    },
    amber: {
      text: "text-amber-300",
      dot: "bg-amber-300",
      glow: "shadow-amber-500/10",
    },
    red: {
      text: "text-red-300",
      dot: "bg-red-300",
      glow: "shadow-red-500/10",
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