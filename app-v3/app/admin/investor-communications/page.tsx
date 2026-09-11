"use client";

import { useEffect, useMemo, useState } from "react";

type Investor = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  investor_type: string | null;
  geography: string | null;
  verification_status: string | null;
  kyc_completed: boolean | null;
  nda_signed: boolean | null;
  access_level: string | null;
  proposed_ticket_inr: number | null;
  created_at: string;
  updated_at: string;
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
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

const MESSAGE_TEMPLATES = [
  {
    name: "Follow-up",
    subject: "People & Youth — Investor Relations Follow-up",
    message:
      "Dear Investor,\n\nI am writing to follow up on our recent engagement with People & Youth and to continue the conversation regarding our institutional development and investment opportunity.\n\nWe would be pleased to share any additional information required and discuss the next steps at a convenient time.\n\nWarm regards,\nInvestor Relations Office",
  },
  {
    name: "Introduction",
    subject: "People & Youth — Institutional Introduction",
    message:
      "Dear Investor,\n\nThank you for your interest in People & Youth.\n\nWe are building an institutional platform focused on knowledge, youth, civic participation, leadership and long-term institutional development. I would be pleased to continue the conversation and understand your interests in greater detail.\n\nWarm regards,\nInvestor Relations Office",
  },
  {
    name: "Due Diligence",
    subject: "People & Youth — Due Diligence Materials",
    message:
      "Dear Investor,\n\nThank you for progressing your engagement with People & Youth.\n\nWe are pleased to support your due diligence process and can provide the relevant institutional, operational and financial materials through the secure investor data room.\n\nPlease let us know if there are specific materials or clarifications you would like us to address.\n\nWarm regards,\nInvestor Relations Office",
  },
  {
    name: "Next Steps",
    subject: "People & Youth — Next Steps",
    message:
      "Dear Investor,\n\nThank you for your continued engagement with People & Youth.\n\nWe would like to discuss the next steps in our conversation, including the proposed investment structure, timeline and any outstanding diligence requirements.\n\nPlease share a suitable time for a conversation.\n\nWarm regards,\nInvestor Relations Office",
  },
];

const ACTIVITY_LABELS: Record<string, string> = {
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

function formatCurrency(value: number | null) {
  if (!value) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusLabel(value: string | null) {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null) {
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

function dueState(value: string | null) {
  if (!value) return "No deadline";

  const due = new Date(value);

  if (Number.isNaN(due.getTime())) return "Invalid deadline";

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  if (due < todayStart) return "Overdue";
  if (due < tomorrowStart) return "Due today";

  return "Upcoming";
}

export default function InvestorCommunicationsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [template, setTemplate] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [sending, setSending] = useState(false);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [completeAfterSend, setCompleteAfterSend] = useState(true);

  async function loadInvestors() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/investor-communications",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load investors.");
      }

      setInvestors(data.investors ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load investors."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadActivities(investorId: string) {
    if (!investorId) {
      setActivities([]);
      return;
    }

    try {
      setLoadingActivities(true);

      const response = await fetch(
        `/api/admin/investor-crm/activities?investor_id=${encodeURIComponent(
          investorId
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to load investor activity."
        );
      }

      setActivities(data.activities ?? []);
    } catch (err) {
      setActivities([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load investor activity."
      );
    } finally {
      setLoadingActivities(false);
    }
  }

  useEffect(() => {
    loadInvestors();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setActivities([]);
      return;
    }

    loadActivities(selectedId);
  }, [selectedId]);

  const filteredInvestors = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return investors;

    return investors.filter((investor) =>
      [
        investor.full_name,
        investor.email,
        investor.organization,
        investor.investor_type,
        investor.geography,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        )
    );
  }, [investors, search]);

  const selectedInvestor =
    investors.find((investor) => investor.id === selectedId) ?? null;

  const openActions = useMemo(
    () =>
      activities
        .filter(
          (activity) =>
            activity.status === "OPEN" &&
            activity.activity_type === "FOLLOW_UP"
        )
        .sort((a, b) => {
          const aTime = a.due_at
            ? new Date(a.due_at).getTime()
            : Number.MAX_SAFE_INTEGER;
          const bTime = b.due_at
            ? new Date(b.due_at).getTime()
            : Number.MAX_SAFE_INTEGER;

          return aTime - bTime;
        }),
    [activities]
  );

  const recentActivities = useMemo(
    () =>
      [...activities]
        .sort(
          (a, b) =>
            new Date(b.occurred_at).getTime() -
            new Date(a.occurred_at).getTime()
        )
        .slice(0, 10),
    [activities]
  );

  const emailHistory = useMemo(
    () =>
      activities
        .filter((activity) => activity.activity_type === "EMAIL")
        .sort(
          (a, b) =>
            new Date(b.occurred_at).getTime() -
            new Date(a.occurred_at).getTime()
        )
        .slice(0, 8),
    [activities]
  );

  function applyTemplate(index: string) {
    setTemplate(index);

    if (!index) return;

    const selected = MESSAGE_TEMPLATES[Number(index)];

    if (!selected) return;

    setSubject(selected.subject);
    setMessage(selected.message);
  }

  function startFollowUpCommunication(activity: Activity) {
    setSelectedActivity(activity);
    setTemplate("0");

    const selected = MESSAGE_TEMPLATES[0];

    setSubject(selected.subject);
    setMessage(selected.message);

    setNotice("");
    setError("");
  }

  function clearComposer() {
    setSubject("");
    setMessage("");
    setTemplate("");
    setSelectedActivity(null);
    setCompleteAfterSend(true);
  }

  async function sendEmail() {
    if (!selectedInvestor) {
      setError("Select an investor first.");
      return;
    }

    if (!selectedInvestor.email) {
      setError("This investor does not have an email address.");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    if (
      selectedActivity &&
      (selectedActivity.status !== "OPEN" ||
        selectedActivity.activity_type !== "FOLLOW_UP")
    ) {
      setError(
        "The selected operational action is no longer an open follow-up."
      );
      return;
    }

    const actionText = selectedActivity
      ? completeAfterSend
        ? `\n\nThe selected open follow-up will also be marked completed after successful delivery.`
        : `\n\nThe selected open follow-up will remain open.`
      : "";

    const confirmed = window.confirm(
      `Send this institutional email to ${selectedInvestor.email}?${actionText}`
    );

    if (!confirmed) return;

    try {
      setSending(true);
      setError("");
      setNotice("");

      const response = await fetch(
        "/api/admin/investor-communications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investor_id: selectedInvestor.id,
            subject: subject.trim(),
            message: message.trim(),
            complete_activity_id:
              selectedActivity && completeAfterSend
                ? selectedActivity.id
                : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to send email."
        );
      }

      if (data.warning) {
        setNotice(data.warning);
      } else {
        setNotice(
          `Email successfully sent to ${selectedInvestor.email}.`
        );
      }

      setSubject("");
      setMessage("");
      setTemplate("");
      setSelectedActivity(null);
      setCompleteAfterSend(true);

      await loadActivities(selectedInvestor.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send email."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Investor Relations
            </div>

            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Investor Communications
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Institutional communication workspace connecting investor
              outreach, operational actions and relationship history.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadInvestors}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-40"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <a
              href="/admin/investor-crm"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
            >
              CRM
            </a>

            <a
              href="/admin/investor-operations"
              className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15"
            >
              Operations
            </a>
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-200">
            {notice}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Recipient
              </div>

              <div className="mt-1 text-lg font-semibold">
                Investor Directory
              </div>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, organisation, email..."
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
            />

            <div className="max-h-[680px] space-y-2 overflow-y-auto pr-1">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-500">
                  Loading investors...
                </div>
              ) : filteredInvestors.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-500">
                  No investors found.
                </div>
              ) : (
                filteredInvestors.map((investor) => {
                  const selected = investor.id === selectedId;

                  return (
                    <button
                      key={investor.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(investor.id);
                        setError("");
                        setNotice("");
                        clearComposer();
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-cyan-400/40 bg-cyan-400/[0.09]"
                          : "border-white/8 bg-black/10 hover:border-white/15 hover:bg-white/[0.035]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">
                            {investor.full_name ||
                              investor.organization ||
                              "Unnamed Investor"}
                          </div>

                          <div className="mt-1 truncate text-xs text-slate-500">
                            {investor.email || "No email"}
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-400">
                          {statusLabel(
                            investor.verification_status
                          )}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {investor.organization ||
                            investor.investor_type ||
                            "Investor"}
                        </span>

                        <span>
                          {formatCurrency(
                            investor.proposed_ticket_inr
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="min-w-0">
            {!selectedInvestor ? (
              <div className="flex min-h-[700px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035] text-center shadow-2xl shadow-black/20">
                <div className="max-w-md">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
                    ✉
                  </div>

                  <h2 className="text-xl font-semibold">
                    Select an investor
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Choose an investor from the relationship directory
                    to compose a communication and view the investor&apos;s
                    operational relationship history.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
                  <div className="mb-7 flex flex-col gap-5 border-b border-white/8 pb-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                        Active Recipient
                      </div>

                      <h2 className="mt-2 text-2xl font-semibold">
                        {selectedInvestor.full_name ||
                          selectedInvestor.organization ||
                          "Investor"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        {selectedInvestor.email || "No email address"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-[11px] text-slate-400">
                          {statusLabel(
                            selectedInvestor.verification_status
                          )}
                        </span>

                        <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-[11px] text-slate-400">
                          {selectedInvestor.access_level || "No access level"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div className="rounded-xl border border-white/8 bg-black/10 px-3 py-2">
                        <div className="text-slate-600">Type</div>
                        <div className="mt-1 text-slate-300">
                          {selectedInvestor.investor_type || "—"}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-black/10 px-3 py-2">
                        <div className="text-slate-600">KYC</div>
                        <div className="mt-1 text-slate-300">
                          {selectedInvestor.kyc_completed
                            ? "Complete"
                            : "Pending"}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-black/10 px-3 py-2">
                        <div className="text-slate-600">NDA</div>
                        <div className="mt-1 text-slate-300">
                          {selectedInvestor.nda_signed
                            ? "Signed"
                            : "Pending"}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-black/10 px-3 py-2">
                        <div className="text-slate-600">Ticket</div>
                        <div className="mt-1 text-slate-300">
                          {formatCurrency(
                            selectedInvestor.proposed_ticket_inr
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {openActions.length > 0 && (
                    <div className="mb-6 rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-4">
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                            Open Relationship Actions
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            Existing operational follow-ups for this investor.
                          </p>
                        </div>

                        <span className="rounded-full border border-amber-300/15 px-2.5 py-1 text-[10px] uppercase tracking-wide text-amber-200">
                          {openActions.length} open
                        </span>
                      </div>

                      <div className="space-y-2">
                        {openActions.map((activity) => (
                          <div
                            key={activity.id}
                            className="rounded-xl border border-white/8 bg-black/10 p-3"
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-slate-200">
                                  {activity.subject ||
                                    "Investor follow-up"}
                                </div>

                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                                  <span>
                                    {dueState(activity.due_at)}
                                  </span>

                                  <span>
                                    Due{" "}
                                    {formatDateTime(activity.due_at)}
                                  </span>

                                  <span>
                                    Owner:{" "}
                                    {activity.assigned_admin ||
                                      "Founder"}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  startFollowUpCommunication(activity)
                                }
                                disabled={!selectedInvestor.email}
                                className="shrink-0 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Respond by Email
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-5">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Communication Template
                      </label>

                      <select
                        value={template}
                        onChange={(event) =>
                          applyTemplate(event.target.value)
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#090d1c] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                      >
                        <option value="">
                          Start from scratch
                        </option>

                        {MESSAGE_TEMPLATES.map((item, index) => (
                          <option key={item.name} value={index}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedActivity && (
                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.035] p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                              Communication linked to follow-up
                            </div>

                            <div className="mt-1 text-sm font-medium text-slate-200">
                              {selectedActivity.subject ||
                                "Investor follow-up"}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              Due{" "}
                              {formatDateTime(
                                selectedActivity.due_at
                              )}{" "}
                              · Owner{" "}
                              {selectedActivity.assigned_admin ||
                                "Founder"}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedActivity(null);
                              setCompleteAfterSend(true);
                            }}
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
                          >
                            Remove Context
                          </button>
                        </div>

                        <label className="mt-4 flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={completeAfterSend}
                            onChange={(event) =>
                              setCompleteAfterSend(
                                event.target.checked
                              )
                            }
                            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/20 accent-cyan-300"
                          />

                          <span className="text-xs leading-5 text-slate-400">
                            Mark this open follow-up as completed after
                            the email is successfully delivered.
                          </span>
                        </label>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Subject
                      </label>

                      <input
                        value={subject}
                        onChange={(event) =>
                          setSubject(event.target.value)
                        }
                        placeholder="Institutional communication subject"
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Message
                      </label>

                      <textarea
                        value={message}
                        onChange={(event) =>
                          setMessage(event.target.value)
                        }
                        rows={16}
                        placeholder="Compose the institutional communication..."
                        className="w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                      />
                    </div>

                    <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-4 text-xs leading-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        Sending records a completed EMAIL activity against
                        this investor for CRM and Operations visibility.
                        {selectedActivity &&
                          completeAfterSend && (
                            <>
                              {" "}
                              The linked FOLLOW_UP will also be completed
                              after successful delivery.
                            </>
                          )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={clearComposer}
                          disabled={sending}
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-40"
                        >
                          Clear
                        </button>

                        <button
                          type="button"
                          onClick={sendEmail}
                          disabled={
                            sending ||
                            !selectedInvestor.email ||
                            !subject.trim() ||
                            !message.trim()
                          }
                          className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#06101b] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {sending
                            ? "Sending..."
                            : "Send Institutional Email"}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                          Communication History
                        </div>

                        <h3 className="mt-1 text-lg font-semibold">
                          Recent Emails
                        </h3>
                      </div>

                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-slate-500">
                        {emailHistory.length}
                      </span>
                    </div>

                    {loadingActivities ? (
                      <div className="rounded-2xl border border-white/8 bg-black/10 p-5 text-sm text-slate-500">
                        Loading communication history...
                      </div>
                    ) : emailHistory.length === 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-black/10 p-5 text-sm text-slate-500">
                        No institutional emails have been recorded for
                        this investor.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {emailHistory.map((activity) => (
                          <div
                            key={activity.id}
                            className="rounded-xl border border-white/8 bg-black/10 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-slate-200">
                                  {activity.subject ||
                                    "Institutional email"}
                                </div>

                                <div className="mt-1 text-[11px] text-slate-500">
                                  {formatDateTime(
                                    activity.occurred_at
                                  )}
                                </div>
                              </div>

                              <span className="shrink-0 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 text-[10px] uppercase tracking-wide text-emerald-300">
                                {activity.status}
                              </span>
                            </div>

                            {activity.details && (
                              <p className="mt-3 line-clamp-3 whitespace-pre-line text-xs leading-5 text-slate-500">
                                {activity.details}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
                    <div className="mb-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                        Relationship Timeline
                      </div>

                      <h3 className="mt-1 text-lg font-semibold">
                        Recent CRM Activity
                      </h3>
                    </div>

                    {loadingActivities ? (
                      <div className="rounded-2xl border border-white/8 bg-black/10 p-5 text-sm text-slate-500">
                        Loading activity...
                      </div>
                    ) : recentActivities.length === 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-black/10 p-5 text-sm text-slate-500">
                        No CRM activity recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="rounded-xl border border-white/8 bg-black/10 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase tracking-wide text-slate-500">
                                    {ACTIVITY_LABELS[
                                      activity.activity_type
                                    ] ||
                                      statusLabel(
                                        activity.activity_type
                                      )}
                                  </span>

                                  <span className="text-[11px] text-slate-600">
                                    {formatDateTime(
                                      activity.occurred_at
                                    )}
                                  </span>
                                </div>

                                <div className="mt-2 truncate text-sm font-medium text-slate-300">
                                  {activity.subject ||
                                    "CRM activity"}
                                </div>
                              </div>

                              <span
                                className={`shrink-0 rounded-full border px-2 py-1 text-[9px] uppercase tracking-wide ${
                                  activity.status === "OPEN"
                                    ? "border-amber-300/15 bg-amber-300/[0.05] text-amber-200"
                                    : activity.status ===
                                      "COMPLETED"
                                    ? "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300"
                                    : "border-red-400/15 bg-red-400/[0.05] text-red-300"
                                }`}
                              >
                                {activity.status}
                              </span>
                            </div>

                            {activity.activity_type ===
                              "FOLLOW_UP" &&
                              activity.status === "OPEN" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    startFollowUpCommunication(
                                      activity
                                    )
                                  }
                                  disabled={!selectedInvestor.email}
                                  className="mt-3 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Respond by Email
                                </button>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}