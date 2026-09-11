"use client";

import { useEffect, useMemo, useState } from "react";

type Investor = {
  id: string;
  full_name: string | null;
  email: string | null;
  organization: string | null;
  investor_type: string | null;
  proposed_ticket_inr: number | null;
  verification_status: string | null;
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
  details: string | null;
  occurred_at: string;
  due_at: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  assigned_admin: string | null;
  created_at: string;
  updated_at: string;
};

type QueueItem = Activity & {
  investor?: Investor;
};

type DueState = "overdue" | "today" | "approaching" | "upcoming" | "none";

type FilterValue =
  | "ALL"
  | "OVERDUE"
  | "TODAY"
  | "APPROACHING"
  | "UPCOMING";

const TYPE_LABELS: Record<string, string> = {
  NOTE: "Note",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  STAGE_CHANGE: "Stage Change",
  FOLLOW_UP: "Follow-up",
  KYC: "KYC",
  NDA: "NDA",
  DUE_DILIGENCE: "Due Diligence",
  COMMITMENT: "Commitment",
  INVESTMENT: "Investment",
  OTHER: "Other",
};

const TYPE_ICONS: Record<string, string> = {
  NOTE: "✦",
  CALL: "◉",
  EMAIL: "↗",
  MEETING: "◌",
  STAGE_CHANGE: "◆",
  FOLLOW_UP: "→",
  KYC: "✓",
  NDA: "◇",
  DUE_DILIGENCE: "◎",
  COMMITMENT: "₹",
  INVESTMENT: "●",
  OTHER: "•",
};

const STAGE_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  NDA: "NDA",
  DUE_DILIGENCE: "Due Diligence",
  COMMITMENT: "Commitment",
  INVESTED: "Invested",
};

function formatCurrency(value: number | null | undefined) {
  if (!value) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * 5B.14 — Extended due-state.
 *
 * "approaching" covers the operational 72-hour warning window that
 * precedes "today". Actions inside that window are neither overdue
 * nor due today but require the founder's attention.
 */
function getDueState(dueAt: string | null): DueState {
  if (!dueAt) return "none";

  const due = new Date(dueAt);
  const today = startOfToday();
  const end = endOfToday();

  if (due < today) return "overdue";
  if (due <= end) return "today";

  const hoursUntilDue =
    (due.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilDue <= 72) return "approaching";

  return "upcoming";
}

function tomorrowAtNine() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow;
}

function initials(name: string | null | undefined) {
  if (!name) return "IN";

  const parts = name.trim().split(/\s+/);

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function investorDisplayName(investor: Investor) {
  return (
    investor.full_name ||
    investor.organization ||
    investor.email ||
    "Investor"
  );
}

export default function InvestorOperationsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<FilterValue>("ALL");

  const [selectedInvestor, setSelectedInvestor] =
    useState<Investor | null>(null);

  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [saving, setSaving] = useState(false);

  const [showNewActivity, setShowNewActivity] = useState(false);
  const [showInvestorPicker, setShowInvestorPicker] = useState(false);
  const [investorSearch, setInvestorSearch] = useState("");

  const [form, setForm] = useState({
    activity_type: "FOLLOW_UP",
    subject: "",
    details: "",
    due_at: "",
    assigned_admin: "Founder",
  });

  /*
   * ============================================================
   * 4E — ACTION MANAGEMENT STATE
   * ============================================================
   */
  const [actionMenuActivity, setActionMenuActivity] =
    useState<Activity | null>(null);

  const [actionEditMode, setActionEditMode] = useState<
    "RESCHEDULE" | "REASSIGN" | null
  >(null);

  const [actionDueAt, setActionDueAt] = useState("");
  const [actionAssignedAdmin, setActionAssignedAdmin] = useState("");

  /*
   * ============================================================
   * 5B.16 — BULK OPERATIONAL ACTIONS STATE
   * ============================================================
   */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set()
  );

  const [bulkEditMode, setBulkEditMode] = useState<
    "RESCHEDULE" | "REASSIGN" | null
  >(null);

  const [bulkDueAt, setBulkDueAt] = useState("");
  const [bulkAssignedAdmin, setBulkAssignedAdmin] = useState("Founder");
  const [bulkError, setBulkError] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [crmResponse, activityResponse] = await Promise.all([
        fetch("/api/admin/investor-crm", {
          cache: "no-store",
        }),
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

      const nextInvestors: Investor[] = crmData.investors ?? [];
      const nextActivities: Activity[] = activityData.activities ?? [];

      setInvestors(nextInvestors);
      setActivities(nextActivities);

      /*
       * 5B.16 — Prune bulk selection.
       *
       * Any selected activity that is no longer OPEN (completed,
       * cancelled, or removed server-side) must be dropped from the
       * selection so the bulk bar only ever operates on real open
       * actions.
       */
      setSelectedIds((current) => {
        if (current.size === 0) return current;

        const stillOpen = new Set(
          nextActivities
            .filter((activity) => activity.status === "OPEN")
            .map((activity) => activity.id)
        );

        const pruned = new Set<string>();
        current.forEach((id) => {
          if (stillOpen.has(id)) pruned.add(id);
        });

        return pruned;
      });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load investor operations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const investorMap = useMemo(() => {
    return new Map(investors.map((investor) => [investor.id, investor]));
  }, [investors]);

  const filteredInvestors = useMemo(() => {
    const query = investorSearch.trim().toLowerCase();

    if (!query) return investors;

    return investors.filter((investor) => {
      const searchable = [
        investor.full_name,
        investor.organization,
        investor.email,
        investor.investor_type,
        investor.crm?.stage,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [investors, investorSearch]);

  const queue = useMemo<QueueItem[]>(() => {
    return activities
      .filter(
        (activity) =>
          activity.status === "OPEN" && activity.due_at
      )
      .map((activity) => ({
        ...activity,
        investor: investorMap.get(activity.investor_id),
      }))
      .sort(
        (a, b) =>
          new Date(a.due_at!).getTime() -
          new Date(b.due_at!).getTime()
      );
  }, [activities, investorMap]);

  const filteredQueue = useMemo(() => {
    if (filter === "ALL") return queue;

    const stateMap: Record<Exclude<FilterValue, "ALL">, DueState> = {
      OVERDUE: "overdue",
      TODAY: "today",
      APPROACHING: "approaching",
      UPCOMING: "upcoming",
    };

    return queue.filter(
      (item) => getDueState(item.due_at) === stateMap[filter]
    );
  }, [filter, queue]);

  const overdueCount = queue.filter(
    (item) => getDueState(item.due_at) === "overdue"
  ).length;

  const todayCount = queue.filter(
    (item) => getDueState(item.due_at) === "today"
  ).length;

  const approachingCount = queue.filter(
    (item) => getDueState(item.due_at) === "approaching"
  ).length;

  const upcomingCount = queue.filter(
    (item) => getDueState(item.due_at) === "upcoming"
  ).length;

  const completedCount = activities.filter(
    (activity) => activity.status === "COMPLETED"
  ).length;

  const recentActivities = useMemo(() => {
    return [...activities]
      .sort(
        (a, b) =>
          new Date(b.occurred_at).getTime() -
          new Date(a.occurred_at).getTime()
      )
      .slice(0, 12);
  }, [activities]);

  async function updateActivity(
    activityId: string,
    payload: Record<string, unknown>
  ) {
    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/investor-crm/activities",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: activityId,
            ...payload,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to update activity."
        );
      }

      await loadData();

      if (selectedActivity?.id === activityId) {
        setSelectedActivity(data.activity);
      }

      return data.activity;
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to update activity."
      );
      return null;
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * 4E — ACTION MANAGEMENT
   * ============================================================
   */
  function closeActionEditor() {
    setActionMenuActivity(null);
    setActionEditMode(null);
    setActionDueAt("");
    setActionAssignedAdmin("");
  }

  function openActionEditor(activity: Activity) {
    setActionMenuActivity(activity);
    setActionEditMode(null);

    setActionDueAt(
      activity.due_at
        ? new Date(activity.due_at)
            .toISOString()
            .slice(0, 16)
        : ""
    );

    setActionAssignedAdmin(
      activity.assigned_admin || "Founder"
    );
  }

  async function completeAction(activity: Activity) {
    await updateActivity(activity.id, {
      status: "COMPLETED",
    });
  }

  async function cancelAction(activity: Activity) {
    const confirmed = window.confirm(
      "Cancel this action? It will remain in the institutional history."
    );

    if (!confirmed) return;

    const updated = await updateActivity(activity.id, {
      status: "CANCELLED",
    });

    if (updated) {
      closeActionEditor();
    }
  }

  async function rescheduleAction() {
    if (!actionMenuActivity) return;

    if (!actionDueAt) {
      alert("Please select a new deadline.");
      return;
    }

    const selectedDate = new Date(actionDueAt);

    if (Number.isNaN(selectedDate.getTime())) {
      alert("Please select a valid deadline.");
      return;
    }

    const updated = await updateActivity(
      actionMenuActivity.id,
      {
        due_at: selectedDate.toISOString(),
        status: "OPEN",
      }
    );

    if (updated) {
      closeActionEditor();
    }
  }

  async function reassignAction() {
    if (!actionMenuActivity) return;

    const owner = actionAssignedAdmin.trim();

    if (!owner) {
      alert("Please enter an owner.");
      return;
    }

    const updated = await updateActivity(
      actionMenuActivity.id,
      {
        assigned_admin: owner,
      }
    );

    if (updated) {
      closeActionEditor();
    }
  }

  /*
   * ============================================================
   * 5B.15 — ONE-CLICK OVERDUE RESCHEDULE
   *
   * A dedicated fast path for overdue items. Instead of opening the
   * full action management modal, the founder can push an overdue
   * action to tomorrow at 09:00 with a single click.
   * ============================================================
   */
  async function rescheduleToTomorrow(activity: Activity) {
    await updateActivity(activity.id, {
      due_at: tomorrowAtNine().toISOString(),
      status: "OPEN",
    });
  }

  /*
   * ============================================================
   * 5B.16 — BULK OPERATIONAL ACTIONS
   * ============================================================
   */
  function toggleSelection(activityId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }

      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function selectAllVisible() {
    const visibleIds = filteredQueue.map((item) => item.id);
    setSelectedIds(new Set(visibleIds));
  }

  function closeBulkEditor() {
    setBulkEditMode(null);
    setBulkDueAt("");
    setBulkAssignedAdmin("Founder");
    setBulkError("");
    setBulkProgress(null);
  }

  async function runBulkPatch(
    ids: string[],
    payloadBuilder: (id: string) => Record<string, unknown>
  ) {
    setBulkProgress({ completed: 0, total: ids.length });
    setBulkError("");

    try {
      for (let index = 0; index < ids.length; index += 1) {
        const id = ids[index];

        const response = await fetch(
          "/api/admin/investor-crm/activities",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id,
              ...payloadBuilder(id),
            }),
          }
        );

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => null);

          throw new Error(
            data?.error ??
              "A bulk operation failed. Please refresh and retry."
          );
        }

        setBulkProgress({
          completed: index + 1,
          total: ids.length,
        });
      }

      clearSelection();
      await loadData();
      return true;
    } catch (err) {
      setBulkError(
        err instanceof Error
          ? err.message
          : "Bulk operation failed."
      );
      return false;
    } finally {
      setBulkProgress(null);
    }
  }

  async function bulkComplete() {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    await runBulkPatch(ids, () => ({
      status: "COMPLETED",
    }));
  }

  async function bulkCancel() {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    const confirmed = window.confirm(
      `Cancel ${ids.length} action${ids.length === 1 ? "" : "s"}? They will remain in the institutional history.`
    );

    if (!confirmed) return;

    await runBulkPatch(ids, () => ({
      status: "CANCELLED",
    }));
  }

  async function bulkReschedule() {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    if (!bulkDueAt) {
      setBulkError("Please select a new deadline.");
      return;
    }

    const selectedDate = new Date(bulkDueAt);

    if (Number.isNaN(selectedDate.getTime())) {
      setBulkError("Please select a valid deadline.");
      return;
    }

    const success = await runBulkPatch(ids, () => ({
      due_at: selectedDate.toISOString(),
      status: "OPEN",
    }));

    if (success) {
      closeBulkEditor();
    }
  }

  async function bulkReassign() {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    const owner = bulkAssignedAdmin.trim();

    if (!owner) {
      setBulkError("Please enter an owner.");
      return;
    }

    const success = await runBulkPatch(ids, () => ({
      assigned_admin: owner,
    }));

    if (success) {
      closeBulkEditor();
    }
  }

  /*
   * ============================================================
   * ACTIVITY CREATION
   * ============================================================
   */
  function beginNewActivity(investor: Investor) {
    setSelectedInvestor(investor);
    setSelectedActivity(null);
    setShowInvestorPicker(false);
    setInvestorSearch("");

    setForm({
      activity_type: "FOLLOW_UP",
      subject: "",
      details: "",
      due_at: "",
      assigned_admin:
        investor.crm?.assigned_admin || "Founder",
    });

    setShowNewActivity(true);
  }

  function openNewActivityPicker() {
    setSelectedInvestor(null);
    setSelectedActivity(null);
    setInvestorSearch("");
    setShowInvestorPicker(true);
  }

  async function createActivity() {
    if (!selectedInvestor) return;

    if (!form.subject.trim()) {
      alert("Please enter an activity subject.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/investor-crm/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investor_id: selectedInvestor.id,
            activity_type: form.activity_type,
            subject: form.subject,
            details: form.details,
            due_at: form.due_at
              ? new Date(form.due_at).toISOString()
              : null,
            status: form.due_at ? "OPEN" : "COMPLETED",
            assigned_admin: form.assigned_admin,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to create activity."
        );
      }

      setShowNewActivity(false);

      setForm({
        activity_type: "FOLLOW_UP",
        subject: "",
        details: "",
        due_at: "",
        assigned_admin: "Founder",
      });

      await loadData();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to create activity."
      );
    } finally {
      setSaving(false);
    }
  }

  function openInvestor(investorId: string) {
    const investor = investorMap.get(investorId);

    if (investor) {
      setSelectedInvestor(investor);
      setSelectedActivity(null);
    }
  }

  const selectedInvestorActivities = selectedInvestor
    ? activities
        .filter(
          (activity) =>
            activity.investor_id === selectedInvestor.id
        )
        .sort(
          (a, b) =>
            new Date(b.occurred_at).getTime() -
            new Date(a.occurred_at).getTime()
        )
    : [];

  const allVisibleSelected =
    filteredQueue.length > 0 &&
    filteredQueue.every((item) => selectedIds.has(item.id));

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  Institutional Operations
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Investor Operations
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                The operating layer for investor relationships —
                actions, deadlines, ownership and institutional
                history.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={openNewActivityPicker}
                disabled={
                  loading || investors.length === 0
                }
                className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_24px_rgba(34,211,238,0.12)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                + New Activity
              </button>

              <button
                onClick={loadData}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Refresh
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

        {/* METRICS — 5B.14 adds Approaching */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Overdue"
            value={overdueCount}
            detail="Requires immediate attention"
            tone="red"
            active={filter === "OVERDUE"}
            onClick={() => setFilter("OVERDUE")}
          />

          <MetricCard
            label="Due Today"
            value={todayCount}
            detail="Today's operating queue"
            tone="amber"
            active={filter === "TODAY"}
            onClick={() => setFilter("TODAY")}
          />

          <MetricCard
            label="Approaching"
            value={approachingCount}
            detail="Due within the next 72 hours"
            tone="violet"
            active={filter === "APPROACHING"}
            onClick={() => setFilter("APPROACHING")}
          />

          <MetricCard
            label="Upcoming"
            value={upcomingCount}
            detail="Scheduled future actions"
            tone="cyan"
            active={filter === "UPCOMING"}
            onClick={() => setFilter("UPCOMING")}
          />

          <MetricCard
            label="Completed"
            value={completedCount}
            detail="Recorded institutional activities"
            tone="green"
            active={false}
            onClick={() => setFilter("ALL")}
          />
        </section>

        {/* MAIN GRID */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.85fr)]">
          {/* ACTION QUEUE */}
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    Operating Queue
                  </h2>

                  <p className="mt-1 text-xs text-white/40">
                    Prioritized by operational deadline
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
                    {(
                      [
                        "ALL",
                        "OVERDUE",
                        "TODAY",
                        "APPROACHING",
                        "UPCOMING",
                      ] as const
                    ).map((item) => (
                      <button
                        key={item}
                        onClick={() => setFilter(item)}
                        className={`rounded-lg px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition ${
                          filter === item
                            ? "bg-white text-black"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  {/* 5B.16 — Bulk selection controls */}
                  {filteredQueue.length > 0 && (
                    <button
                      onClick={
                        allVisibleSelected
                          ? clearSelection
                          : selectAllVisible
                      }
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/55 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      {allVisibleSelected
                        ? "Clear Selection"
                        : "Select All Visible"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {loading ? (
                <LoadingRows />
              ) : filteredQueue.length === 0 ? (
                <EmptyQueue
                  filter={filter}
                  onNewActivity={openNewActivityPicker}
                />
              ) : (
                filteredQueue.map((item) => (
                  <QueueRow
                    key={item.id}
                    item={item}
                    selected={selectedIds.has(item.id)}
                    onToggleSelection={() =>
                      toggleSelection(item.id)
                    }
                    onOpenInvestor={openInvestor}
                    onOpenActivity={(activity) =>
                      setSelectedActivity(activity)
                    }
                    onComplete={(id) =>
                      updateActivity(id, {
                        status: "COMPLETED",
                      })
                    }
                    onManage={openActionEditor}
                    onQuickReschedule={rescheduleToTomorrow}
                    saving={saving}
                  />
                ))
              )}
            </div>
          </section>

          {/* RECENT ACTIVITY */}
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-white/40">
                Institutional relationship record
              </p>
            </div>

            <div className="px-6 py-4">
              {loading ? (
                <LoadingRows compact />
              ) : recentActivities.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] text-lg text-cyan-300">
                    ✦
                  </div>

                  <p className="mt-4 text-sm text-white/35">
                    No activities recorded yet.
                  </p>

                  {investors.length > 0 && (
                    <button
                      onClick={openNewActivityPicker}
                      className="mt-3 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                    >
                      Record the first activity →
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute bottom-3 left-[15px] top-3 w-px bg-white/10" />

                  <div className="space-y-1">
                    {recentActivities.map((activity) => {
                      const investor = investorMap.get(
                        activity.investor_id
                      );

                      return (
                        <button
                          key={activity.id}
                          onClick={() => {
                            if (investor) {
                              setSelectedInvestor(investor);
                            }
                            setSelectedActivity(activity);
                          }}
                          className="group relative flex w-full gap-4 rounded-2xl px-1 py-3 text-left transition hover:bg-white/[0.035]"
                        >
                          <span className="relative z-10 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-[#0b101c] text-xs text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
                            {TYPE_ICONS[
                              activity.activity_type
                            ] ?? "•"}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-3">
                              <span className="truncate text-sm font-medium text-white/85 group-hover:text-white">
                                {activity.subject ||
                                  TYPE_LABELS[
                                    activity.activity_type
                                  ] ||
                                  "Activity"}
                              </span>

                              <span className="shrink-0 text-[10px] text-white/30">
                                {formatDateTime(
                                  activity.occurred_at
                                )}
                              </span>
                            </span>

                            <span className="mt-1 block truncate text-xs text-white/40">
                              {investor?.full_name ||
                                investor?.organization ||
                                "Investor"}
                            </span>

                            <span className="mt-1 block text-[10px] uppercase tracking-wider text-cyan-300/60">
                              {TYPE_LABELS[
                                activity.activity_type
                              ] ?? activity.activity_type}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ============================================================
          5B.16 — BULK ACTION BAR
         ============================================================ */}
      {selectedIds.size > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-[#0b101c]/95 px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-white/60">
              {selectedIds.size} selected
            </span>

            <button
              onClick={bulkComplete}
              disabled={Boolean(bulkProgress)}
              className="rounded-lg border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-300/[0.12] disabled:opacity-40"
            >
              Complete All
            </button>

            <button
              onClick={() => {
                setBulkEditMode("RESCHEDULE");
                setBulkDueAt("");
                setBulkError("");
                setBulkProgress(null);
              }}
              disabled={Boolean(bulkProgress)}
              className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-300/[0.12] disabled:opacity-40"
            >
              Reschedule All
            </button>

            <button
              onClick={() => {
                setBulkEditMode("REASSIGN");
                setBulkAssignedAdmin("Founder");
                setBulkError("");
                setBulkProgress(null);
              }}
              disabled={Boolean(bulkProgress)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
            >
              Reassign All
            </button>

            <button
              onClick={bulkCancel}
              disabled={Boolean(bulkProgress)}
              className="rounded-lg border border-red-400/20 bg-red-400/[0.05] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-300 transition hover:bg-red-400/[0.1] disabled:opacity-40"
            >
              Cancel All
            </button>

            <button
              onClick={clearSelection}
              disabled={Boolean(bulkProgress)}
              className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/40 transition hover:text-white disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          5B.16 — BULK RESCHEDULE / REASSIGN MODAL
         ============================================================ */}
      {bulkEditMode && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <button
            aria-label="Close bulk editor"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              if (!bulkProgress) closeBulkEditor();
            }}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0c111d] shadow-2xl">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                Bulk Operation
              </div>

              <h2 className="mt-1 text-lg font-semibold">
                {bulkEditMode === "RESCHEDULE"
                  ? "Reschedule selected actions"
                  : "Reassign selected actions"}
              </h2>

              <p className="mt-1 text-xs text-white/40">
                {selectedIds.size} action
                {selectedIds.size === 1 ? "" : "s"} will be updated.
              </p>
            </div>

            <div className="space-y-4 px-6 py-6">
              {bulkEditMode === "RESCHEDULE" && (
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    New Deadline
                  </div>

                  <input
                    type="datetime-local"
                    value={bulkDueAt}
                    onChange={(event) => {
                      setBulkDueAt(event.target.value);
                      setBulkError("");
                    }}
                    disabled={Boolean(bulkProgress)}
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                  />

                  <p className="mt-2 text-[10px] leading-4 text-white/25">
                    All selected open actions will retain OPEN status
                    with this new deadline.
                  </p>
                </div>
              )}

              {bulkEditMode === "REASSIGN" && (
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    New Owner
                  </div>

                  <input
                    type="text"
                    value={bulkAssignedAdmin}
                    onChange={(event) => {
                      setBulkAssignedAdmin(event.target.value);
                      setBulkError("");
                    }}
                    disabled={Boolean(bulkProgress)}
                    placeholder="Founder"
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/40"
                  />
                </div>
              )}

              {bulkError && (
                <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                  {bulkError}
                </div>
              )}

              {bulkProgress && (
                <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-2 text-xs text-cyan-200">
                  Updating {bulkProgress.completed} of{" "}
                  {bulkProgress.total}…
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-5">
              <button
                type="button"
                disabled={Boolean(bulkProgress)}
                onClick={closeBulkEditor}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={Boolean(bulkProgress)}
                onClick={
                  bulkEditMode === "RESCHEDULE"
                    ? bulkReschedule
                    : bulkReassign
                }
                className="rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {bulkProgress
                  ? "Applying…"
                  : bulkEditMode === "RESCHEDULE"
                    ? "Apply New Deadline"
                    : "Apply New Owner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVESTOR PICKER */}
      {showInvestorPicker && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <button
            aria-label="Close investor selector"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              setShowInvestorPicker(false);
              setInvestorSearch("");
            }}
          />

          <div className="relative z-10 flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0f19] shadow-2xl">
            <div className="border-b border-white/10 px-6 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                    Relationship Operations
                  </div>

                  <h2 className="text-xl font-semibold">
                    Select Investor
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Choose the institutional relationship for
                    the activity you want to record.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowInvestorPicker(false);
                    setInvestorSearch("");
                  }}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xl leading-none text-white/35 transition hover:bg-white/[0.05] hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="relative mt-5">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/25">
                  ⌕
                </span>

                <input
                  autoFocus
                  value={investorSearch}
                  onChange={(event) =>
                    setInvestorSearch(event.target.value)
                  }
                  placeholder="Search name, organization, email or type…"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 py-3.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/40 focus:bg-black/35"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {filteredInvestors.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/20">
                    ⌕
                  </div>

                  <p className="mt-4 text-sm text-white/45">
                    No investors match your search.
                  </p>

                  <button
                    onClick={() => setInvestorSearch("")}
                    className="mt-3 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredInvestors.map((investor) => {
                    const displayName =
                      investorDisplayName(investor);

                    const stage =
                      STAGE_LABELS[
                        investor.crm?.stage ?? "PROSPECT"
                      ] ?? "Prospect";

                    const activityCount = activities.filter(
                      (activity) =>
                        activity.investor_id === investor.id
                    ).length;

                    return (
                      <button
                        key={investor.id}
                        onClick={() =>
                          beginNewActivity(investor)
                        }
                        className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.04]"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-xs font-semibold text-cyan-200">
                          {initials(investor.full_name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="truncate text-sm font-semibold text-white/85 group-hover:text-white">
                              {displayName}
                            </div>

                            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white/35">
                              {stage}
                            </span>
                          </div>

                          <div className="mt-1 truncate text-xs text-white/35">
                            {investor.organization ||
                              investor.email ||
                              investor.investor_type ||
                              "Institutional relationship"}
                          </div>

                          <div className="mt-2 flex items-center gap-3 text-[10px] text-white/25">
                            <span>
                              {investor.investor_type ||
                                "Investor"}
                            </span>

                            <span>•</span>

                            <span>
                              {activityCount}{" "}
                              {activityCount === 1
                                ? "activity"
                                : "activities"}
                            </span>
                          </div>
                        </div>

                        <span className="shrink-0 text-lg text-white/20 transition group-hover:translate-x-0.5 group-hover:text-cyan-300">
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-6 py-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-white/25">
                <span>
                  {filteredInvestors.length} investors shown
                </span>

                <span>Secure admin operation</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVESTOR DRAWER */}
      {selectedInvestor && !showNewActivity && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <button
            aria-label="Close"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              setSelectedInvestor(null);
              setSelectedActivity(null);
            }}
          />

          <aside className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-white/10 bg-[#0a0e18] shadow-2xl">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] text-sm font-semibold text-cyan-200">
                    {initials(selectedInvestor.full_name)}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">
                      {investorDisplayName(selectedInvestor)}
                    </h2>

                    <p className="mt-1 text-xs text-white/40">
                      {selectedInvestor.organization ||
                        selectedInvestor.email ||
                        "Institutional relationship"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedInvestor(null);
                    setSelectedActivity(null);
                  }}
                  className="rounded-xl border border-white/10 px-3 py-2 text-white/50 hover:bg-white/[0.05] hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <MiniStat
                  label="Stage"
                  value={
                    STAGE_LABELS[
                      selectedInvestor.crm?.stage ??
                        "PROSPECT"
                    ] ?? "Prospect"
                  }
                />

                <MiniStat
                  label="Expected"
                  value={formatCurrency(
                    selectedInvestor.crm
                      ?.expected_investment_inr ??
                      selectedInvestor.proposed_ticket_inr
                  )}
                />

                <MiniStat
                  label="Probability"
                  value={`${
                    selectedInvestor.crm
                      ?.probability_percent ?? 10
                  }%`}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Relationship Timeline
                    </h3>

                    <p className="mt-1 text-[11px] text-white/35">
                      {selectedInvestorActivities.length}{" "}
                      recorded activities
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      beginNewActivity(selectedInvestor)
                    }
                    className="rounded-xl bg-cyan-300 px-3 py-2 text-xs font-semibold text-black transition hover:bg-cyan-200"
                  >
                    + Activity
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                {selectedInvestorActivities.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center">
                    <div className="text-2xl text-white/20">
                      ✦
                    </div>

                    <p className="mt-3 text-sm text-white/45">
                      No institutional activity recorded yet.
                    </p>

                    <button
                      onClick={() =>
                        beginNewActivity(selectedInvestor)
                      }
                      className="mt-4 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                    >
                      Record the first activity →
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute bottom-5 left-[15px] top-5 w-px bg-white/10" />

                    <div className="space-y-6">
                      {selectedInvestorActivities.map(
                        (activity) => {
                          const dueState = getDueState(
                            activity.due_at
                          );

                          return (
                            <div
                              key={activity.id}
                              className="relative flex gap-4"
                            >
                              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0a0e18] text-xs text-cyan-300">
                                {TYPE_ICONS[
                                  activity.activity_type
                                ] ?? "•"}
                              </div>

                              <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-medium text-white/85">
                                      {activity.subject ||
                                        TYPE_LABELS[
                                          activity.activity_type
                                        ] ||
                                        "Activity"}
                                    </div>

                                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-cyan-300/60">
                                      {TYPE_LABELS[
                                        activity.activity_type
                                      ] ??
                                        activity.activity_type}
                                    </div>
                                  </div>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${
                                      activity.status ===
                                      "COMPLETED"
                                        ? "bg-emerald-400/10 text-emerald-300"
                                        : activity.status ===
                                            "OPEN"
                                          ? dueState ===
                                            "overdue"
                                            ? "bg-red-400/10 text-red-300"
                                            : "bg-amber-400/10 text-amber-300"
                                          : "bg-white/10 text-white/35"
                                    }`}
                                  >
                                    {activity.status}
                                  </span>
                                </div>

                                {activity.details && (
                                  <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-white/45">
                                    {activity.details}
                                  </p>
                                )}

                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-white/30">
                                  <span>
                                    {formatDateTime(
                                      activity.occurred_at
                                    )}
                                  </span>

                                  {activity.assigned_admin && (
                                    <span>
                                      Owner:{" "}
                                      {activity.assigned_admin}
                                    </span>
                                  )}

                                  {activity.due_at && (
                                    <span
                                      className={
                                        dueState ===
                                        "overdue"
                                          ? "text-red-300"
                                          : dueState ===
                                              "today"
                                            ? "text-amber-300"
                                            : dueState ===
                                                "approaching"
                                              ? "text-violet-300"
                                              : "text-white/30"
                                      }
                                    >
                                      Due{" "}
                                      {formatDateTime(
                                        activity.due_at
                                      )}
                                    </span>
                                  )}
                                </div>

                                {activity.status ===
                                  "OPEN" && (
                                  <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                                    <button
                                      disabled={saving}
                                      onClick={() =>
                                        completeAction(
                                          activity
                                        )
                                      }
                                      className="rounded-lg border border-emerald-300/15 bg-emerald-300/[0.05] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-300/[0.1] disabled:opacity-40"
                                    >
                                      Mark Complete
                                    </button>

                                    <button
                                      disabled={saving}
                                      onClick={() =>
                                        openActionEditor(
                                          activity
                                        )
                                      }
                                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/55 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-40"
                                    >
                                      Manage
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* NEW ACTIVITY MODAL */}
      {showNewActivity && selectedInvestor && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c111d] shadow-2xl">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                    Relationship Activity
                  </div>

                  <h2 className="mt-1 text-lg font-semibold">
                    Record Activity
                  </h2>

                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] px-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] text-[10px] font-semibold text-cyan-200">
                      {initials(selectedInvestor.full_name)}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-white/75">
                        {investorDisplayName(
                          selectedInvestor
                        )}
                      </div>

                      <div className="truncate text-[10px] text-white/30">
                        {selectedInvestor.organization ||
                          selectedInvestor.email ||
                          "Institutional relationship"}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowNewActivity(false);
                        setShowInvestorPicker(true);
                        setInvestorSearch("");
                      }}
                      className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wider text-cyan-300/70 hover:text-cyan-200"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setShowNewActivity(false)
                  }
                  className="shrink-0 text-xl text-white/35 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Activity Type
                </label>

                <select
                  value={form.activity_type}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      activity_type: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
                >
                  {Object.entries(TYPE_LABELS).map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                        className="bg-[#0c111d]"
                      >
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Subject
                </label>

                <input
                  value={form.subject}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      subject: event.target.value,
                    })
                  }
                  placeholder="e.g. Send revised investment memorandum"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-300/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Details
                </label>

                <textarea
                  rows={4}
                  value={form.details}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      details: event.target.value,
                    })
                  }
                  placeholder="Record the institutional context, discussion or next step…"
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-300/40"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Due Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    value={form.due_at}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        due_at: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
                  />

                  <p className="mt-2 text-[10px] leading-4 text-white/25">
                    Adding a deadline creates an open
                    operating action.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Owner
                  </label>

                  <input
                    value={form.assigned_admin}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        assigned_admin: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">
              <button
                onClick={() =>
                  setShowNewActivity(false)
                }
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 hover:bg-white/[0.04] hover:text-white"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                onClick={createActivity}
                className="rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200 disabled:opacity-40"
              >
                {saving ? "Saving..." : "Record Activity"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY DETAIL */}
      {selectedActivity && !selectedInvestor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c111d] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                  {TYPE_LABELS[
                    selectedActivity.activity_type
                  ] ?? selectedActivity.activity_type}
                </div>

                <h2 className="mt-2 text-xl font-semibold">
                  {selectedActivity.subject || "Activity"}
                </h2>
              </div>

              <button
                onClick={() => setSelectedActivity(null)}
                className="text-xl text-white/30 hover:text-white"
              >
                ×
              </button>
            </div>

            {selectedActivity.details && (
              <p className="mt-6 whitespace-pre-wrap text-sm leading-6 text-white/50">
                {selectedActivity.details}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat
                label="Status"
                value={selectedActivity.status}
              />

              <MiniStat
                label="Owner"
                value={
                  selectedActivity.assigned_admin ||
                  "Unassigned"
                }
              />

              <MiniStat
                label="Occurred"
                value={formatDate(
                  selectedActivity.occurred_at
                )}
              />

              <MiniStat
                label="Due"
                value={formatDate(
                  selectedActivity.due_at
                )}
              />
            </div>

            {selectedActivity.status === "OPEN" && (
              <div className="mt-6 flex gap-2">
                <button
                  disabled={saving}
                  onClick={() =>
                    completeAction(selectedActivity)
                  }
                  className="flex-1 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-200 disabled:opacity-40"
                >
                  {saving ? "Updating..." : "Mark Complete"}
                </button>

                <button
                  disabled={saving}
                  onClick={() =>
                    openActionEditor(selectedActivity)
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
                >
                  Manage
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          4E — ACTION MANAGEMENT MODAL
         ======================================================== */}
      {actionMenuActivity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <button
            aria-label="Close action management"
            className="absolute inset-0 cursor-default"
            onClick={closeActionEditor}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0c111d] shadow-2xl">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                    Action Management
                  </div>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    {actionMenuActivity.subject ||
                      TYPE_LABELS[
                        actionMenuActivity.activity_type
                      ] ||
                      "Operational Action"}
                  </h2>

                  <p className="mt-1 text-xs text-white/35">
                    Manage the lifecycle of this operational
                    action without creating a duplicate record.
                  </p>
                </div>

                <button
                  onClick={closeActionEditor}
                  className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xl leading-none text-white/35 transition hover:bg-white/[0.05] hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 px-6 py-6">
              <div className="grid grid-cols-2 gap-3">
                <MiniStat
                  label="Status"
                  value={actionMenuActivity.status}
                />

                <MiniStat
                  label="Type"
                  value={
                    TYPE_LABELS[
                      actionMenuActivity.activity_type
                    ] ??
                    actionMenuActivity.activity_type
                  }
                />

                <MiniStat
                  label="Owner"
                  value={
                    actionMenuActivity.assigned_admin ||
                    "Unassigned"
                  }
                />

                <MiniStat
                  label="Due"
                  value={formatDate(
                    actionMenuActivity.due_at
                  )}
                />
              </div>

              {!actionEditMode &&
                actionMenuActivity.status === "OPEN" && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActionEditMode("RESCHEDULE")
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-4 text-left transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.04]"
                    >
                      <div className="text-sm font-semibold text-white/85">
                        Reschedule
                      </div>

                      <div className="mt-1 text-xs leading-5 text-white/35">
                        Move the deadline while preserving
                        the same operational action.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActionEditMode("REASSIGN")
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-4 text-left transition hover:border-cyan-300/20 hover:bg-cyan-300/[0.04]"
                    >
                      <div className="text-sm font-semibold text-white/85">
                        Reassign Owner
                      </div>

                      <div className="mt-1 text-xs leading-5 text-white/35">
                        Change the person responsible for
                        executing this action.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        cancelAction(actionMenuActivity)
                      }
                      disabled={saving}
                      className="w-full rounded-2xl border border-red-400/15 bg-red-400/[0.035] px-4 py-4 text-left transition hover:border-red-400/25 hover:bg-red-400/[0.06] disabled:opacity-40"
                    >
                      <div className="text-sm font-semibold text-red-300">
                        Cancel Action
                      </div>

                      <div className="mt-1 text-xs leading-5 text-red-300/50">
                        Remove it from the open queue while
                        preserving the institutional history.
                      </div>
                    </button>
                  </div>
                )}

              {actionMenuActivity.status !== "OPEN" &&
                !actionEditMode && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
                      Action Closed
                    </div>

                    <p className="mt-2 text-sm leading-5 text-white/45">
                      This action is already{" "}
                      {actionMenuActivity.status.toLowerCase()}
                      . Lifecycle management is only available
                      for open actions.
                    </p>
                  </div>
                )}

              {actionEditMode === "RESCHEDULE" && (
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                      New Deadline
                    </div>

                    <input
                      type="datetime-local"
                      value={actionDueAt}
                      onChange={(event) =>
                        setActionDueAt(event.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                    />

                    <p className="mt-2 text-[10px] leading-4 text-white/25">
                      The existing action will remain OPEN with
                      this new deadline.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        setActionEditMode(null)
                      }
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      disabled={saving || !actionDueAt}
                      onClick={rescheduleAction}
                      className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saving ? "Saving..." : "Save Deadline"}
                    </button>
                  </div>
                </div>
              )}

              {actionEditMode === "REASSIGN" && (
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                      Action Owner
                    </div>

                    <input
                      type="text"
                      value={actionAssignedAdmin}
                      onChange={(event) =>
                        setActionAssignedAdmin(
                          event.target.value
                        )
                      }
                      placeholder="Founder"
                      className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/40"
                    />

                    <p className="mt-2 text-[10px] leading-4 text-white/25">
                      This updates the operational owner of
                      the existing action.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        setActionEditMode(null)
                      }
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      disabled={
                        saving ||
                        !actionAssignedAdmin.trim()
                      }
                      onClick={reassignAction}
                      className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saving ? "Saving..." : "Save Owner"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!actionEditMode && (
              <div className="flex justify-end border-t border-white/10 px-6 py-4">
                <button
                  type="button"
                  onClick={closeActionEditor}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "red" | "amber" | "cyan" | "green" | "violet";
  active: boolean;
  onClick: () => void;
}) {
  const tones = {
    red: {
      text: "text-red-300",
      dot: "bg-red-300",
      glow: "shadow-red-500/10",
    },
    amber: {
      text: "text-amber-300",
      dot: "bg-amber-300",
      glow: "shadow-amber-500/10",
    },
    cyan: {
      text: "text-cyan-300",
      dot: "bg-cyan-300",
      glow: "shadow-cyan-500/10",
    },
    green: {
      text: "text-emerald-300",
      dot: "bg-emerald-300",
      glow: "shadow-emerald-500/10",
    },
    violet: {
      text: "text-violet-300",
      dot: "bg-violet-300",
      glow: "shadow-violet-500/10",
    },
  };

  const selected = tones[tone];

  return (
    <button
      onClick={onClick}
      className={`group rounded-3xl border p-5 text-left transition ${
        active
          ? "border-white/20 bg-white/[0.07]"
          : "border-white/10 bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.05]"
      } shadow-xl ${selected.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
          {label}
        </span>

        <span
          className={`h-2 w-2 rounded-full ${selected.dot} shadow-[0_0_12px_currentColor]`}
        />
      </div>

      <div
        className={`mt-5 text-3xl font-semibold ${selected.text}`}
      >
        {value}
      </div>

      <div className="mt-2 text-xs text-white/35">
        {detail}
      </div>
    </button>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3">
      <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-medium text-white/70">
        {value}
      </div>
    </div>
  );
}

function QueueRow({
  item,
  selected,
  onToggleSelection,
  onOpenInvestor,
  onOpenActivity,
  onComplete,
  onManage,
  onQuickReschedule,
  saving,
}: {
  item: QueueItem;
  selected: boolean;
  onToggleSelection: () => void;
  onOpenInvestor: (id: string) => void;
  onOpenActivity: (activity: Activity) => void;
  onComplete: (id: string) => void;
  onManage: (activity: Activity) => void;
  onQuickReschedule: (activity: Activity) => void;
  saving: boolean;
}) {
  const state = getDueState(item.due_at);

  const stateStyles = {
    overdue: {
      line: "bg-red-400",
      badge:
        "bg-red-400/10 text-red-300 border-red-400/15",
      label: "OVERDUE",
    },
    today: {
      line: "bg-amber-300",
      badge:
        "bg-amber-300/10 text-amber-300 border-amber-300/15",
      label: "TODAY",
    },
    approaching: {
      line: "bg-violet-300",
      badge:
        "bg-violet-300/10 text-violet-300 border-violet-300/15",
      label: "APPROACHING",
    },
    upcoming: {
      line: "bg-cyan-300",
      badge:
        "bg-cyan-300/10 text-cyan-300 border-cyan-300/15",
      label: "UPCOMING",
    },
    none: {
      line: "bg-white/20",
      badge: "bg-white/5 text-white/40 border-white/10",
      label: "OPEN",
    },
  }[state];

  return (
    <div
      className={`group relative px-6 py-5 transition hover:bg-white/[0.025] ${
        selected ? "bg-cyan-300/[0.04]" : ""
      }`}
    >
      <div
        className={`absolute bottom-0 left-0 top-0 w-[2px] ${stateStyles.line}`}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* 5B.16 — Selection checkbox */}
        <label className="flex shrink-0 cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelection}
            className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/[0.04] accent-cyan-300"
            aria-label="Select action"
          />
        </label>

        <div className="flex min-w-0 flex-1 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-sm text-cyan-300">
            {TYPE_ICONS[item.activity_type] ?? "•"}
          </div>

          <div className="min-w-0">
            <button
              onClick={() => onOpenActivity(item)}
              className="truncate text-left text-sm font-semibold text-white/85 hover:text-cyan-200"
            >
              {item.subject ||
                TYPE_LABELS[item.activity_type] ||
                "Investor activity"}
            </button>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/35">
              <button
                onClick={() =>
                  item.investor &&
                  onOpenInvestor(item.investor.id)
                }
                className="hover:text-white/70"
              >
                {item.investor?.full_name ||
                  item.investor?.organization ||
                  "Investor"}
              </button>

              <span>•</span>

              <span>
                {item.investor?.crm?.stage
                  ? STAGE_LABELS[
                      item.investor.crm.stage
                    ] ?? item.investor.crm.stage
                  : "Prospect"}
              </span>

              {item.assigned_admin && (
                <>
                  <span>•</span>
                  <span>{item.assigned_admin}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:shrink-0">
          <div className="text-right">
            <div
              className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${stateStyles.badge}`}
            >
              {stateStyles.label}
            </div>

            <div className="mt-1 text-[10px] text-white/30">
              {formatDateTime(item.due_at)}
            </div>
          </div>

          {/* 5B.15 — One-click overdue reschedule */}
          {state === "overdue" && (
            <button
              disabled={saving}
              onClick={() => onQuickReschedule(item)}
              className="rounded-xl border border-red-400/20 bg-red-400/[0.05] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-300 transition hover:bg-red-400/[0.1] disabled:opacity-30"
              title="Reschedule to tomorrow at 09:00"
            >
              Tomorrow
            </button>
          )}

          <button
            disabled={saving}
            onClick={() => onManage(item)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/55 opacity-0 transition hover:bg-white/[0.08] hover:text-white group-hover:opacity-100 disabled:opacity-30"
          >
            Manage
          </button>

          <button
            disabled={saving}
            onClick={() => onComplete(item.id)}
            className="rounded-xl border border-emerald-300/10 bg-emerald-300/[0.04] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 opacity-0 transition hover:bg-emerald-300/[0.1] group-hover:opacity-100 disabled:opacity-30"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingRows({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2" : ""}>
      {Array.from({
        length: compact ? 6 : 5,
      }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse ${
            compact
              ? "h-16 rounded-2xl bg-white/[0.025]"
              : "h-24 border-b border-white/[0.05] bg-white/[0.01]"
          }`}
        />
      ))}
    </div>
  );
}

function EmptyQueue({
  filter,
  onNewActivity,
}: {
  filter: FilterValue;
  onNewActivity: () => void;
}) {
  const messages = {
    ALL: "No open operational actions.",
    OVERDUE:
      "Excellent. There are no overdue actions.",
    TODAY: "No actions are due today.",
    APPROACHING:
      "No actions are approaching within the 72-hour window.",
    UPCOMING:
      "No upcoming actions are scheduled.",
  };

  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] text-xl text-emerald-300">
        ✓
      </div>

      <h3 className="mt-5 text-sm font-semibold text-white/70">
        Queue clear
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/30">
        {messages[filter]}
      </p>

      {filter === "ALL" && (
        <button
          onClick={onNewActivity}
          className="mt-4 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
        >
          Create an activity →
        </button>
      )}
    </div>
  );
}