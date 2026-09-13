"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  COMMUNICATION_TEMPLATES,
  TEMPLATE_CATEGORY_LABELS,
  type CommunicationTemplate,
  type TemplateCategory,
} from "@/lib/investor-communication-templates";

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
    assigned_admin?: string | null;
    next_action?: string | null;
    last_contact_date?: string | null;
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
};

type Tab = "templates" | "reminders" | "approvals" | "dataroom";

const TAB_LABELS: Record<Tab, string> = {
  templates: "Template Library",
  reminders: "Action Reminders",
  approvals: "Approval Notifications",
  dataroom: "Data Room Notifications",
};

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

function dueState(value: string | null) {
  if (!value) return "no-due";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "no-due";

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const end = new Date(todayStart);
  end.setHours(23, 59, 59, 999);

  if (date < todayStart) return "overdue";
  if (date <= end) return "today";
  return "upcoming";
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

export default function CommunicationActionsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("templates");

  // Template browser
  const [templateCategoryFilter, setTemplateCategoryFilter] =
    useState<TemplateCategory | "ALL">("ALL");
  const [previewTemplateId, setPreviewTemplateId] = useState<
    string | null
  >(null);
  const [previewInvestorId, setPreviewInvestorId] =
    useState<string>("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewBody, setPreviewBody] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  // Action state
  const [applyingTemplateId, setApplyingTemplateId] = useState<
    string | null
  >(null);
  const [applyError, setApplyError] = useState("");

  const loadAll = useCallback(async () => {
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
        throw new Error("Unable to load investors.");
      }

      if (!activityResponse.ok) {
        throw new Error("Unable to load activities.");
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
          : "Unable to load communication workspace."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Group activities per investor for quick lookups
  const activitiesByInvestor = useMemo(() => {
    const map = new Map<string, Activity[]>();

    for (const activity of activities) {
      const list = map.get(activity.investor_id) ?? [];
      list.push(activity);
      map.set(activity.investor_id, list);
    }

    return map;
  }, [activities]);

  // Detect already-sent notifications via [TEMPLATE:...] markers
  function hasTemplateActivity(
    investorId: string,
    templateId: string
  ) {
    const list = activitiesByInvestor.get(investorId) ?? [];
    const marker = `[TEMPLATE:${templateId}]`;

    return list.some(
      (activity) =>
        activity.details?.includes(marker) &&
        activity.status !== "CANCELLED"
    );
  }

  const filteredTemplates = useMemo(() => {
    if (templateCategoryFilter === "ALL") {
      return COMMUNICATION_TEMPLATES;
    }

    return COMMUNICATION_TEMPLATES.filter(
      (template) => template.category === templateCategoryFilter
    );
  }, [templateCategoryFilter]);

  const templateCategories = useMemo(() => {
    const set = new Set<TemplateCategory>();

    COMMUNICATION_TEMPLATES.forEach((template) => {
      set.add(template.category);
    });

    return Array.from(set).sort();
  }, []);

  // 7C.6 — Reminders
  const reminders = useMemo(() => {
    const now = Date.now();
    const reminders: Array<{
      activity: Activity;
      investor: Investor | undefined;
      dueState: string;
    }> = [];

    activities.forEach((activity) => {
      if (activity.status !== "OPEN") return;
      if (activity.activity_type !== "FOLLOW_UP") return;
      if (!activity.due_at) return;

      const due = new Date(activity.due_at).getTime();

      if (Number.isNaN(due)) return;

      // Show overdue + due within next 14 days
      if (due > now + 14 * 86400000) return;

      reminders.push({
        activity,
        investor: investors.find(
          (inv) => inv.id === activity.investor_id
        ),
        dueState: dueState(activity.due_at),
      });
    });

    return reminders.sort((a, b) => {
      const aTime = a.activity.due_at
        ? new Date(a.activity.due_at).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bTime = b.activity.due_at
        ? new Date(b.activity.due_at).getTime()
        : Number.MAX_SAFE_INTEGER;

      return aTime - bTime;
    });
  }, [activities, investors]);

  // 7C.3 — Approval notifications
  const approvalCandidates = useMemo(() => {
    return investors.filter((investor) => {
      const verification = investor.verification_status ?? "";
      const access = investor.access_level ?? "";

      const eligible =
        verification === "VERIFIED" && access === "APPROVED";

      if (!eligible) return false;

      return !hasTemplateActivity(investor.id, "APPROVAL_01");
    });
  }, [investors, activitiesByInvestor]);

  // 7C.4 — Data room notifications
  const dataroomCandidates = useMemo(() => {
    return investors.filter((investor) => {
      const stage = investor.crm?.stage ?? "PROSPECT";

      const eligible = [
        "NDA",
        "DUE_DILIGENCE",
        "COMMITMENT",
      ].includes(stage);

      if (!eligible) return false;

      return !hasTemplateActivity(investor.id, "DATAROOM_01");
    });
  }, [investors, activitiesByInvestor]);

  async function loadPreview(
    templateId: string,
    investorId: string
  ) {
    if (!templateId || !investorId) return;

    setPreviewLoading(true);
    setPreviewError("");
    setPreviewSubject("");
    setPreviewBody("");

    try {
      const response = await fetch(
        "/api/admin/investor-communications/actions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "PREVIEW",
            investor_id: investorId,
            template_id: templateId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ?? "Unable to render template."
        );
      }

      setPreviewSubject(data.rendered?.subject ?? "");
      setPreviewBody(data.rendered?.body ?? "");
    } catch (err) {
      setPreviewError(
        err instanceof Error
          ? err.message
          : "Unable to render template."
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  useEffect(() => {
    if (previewTemplateId && previewInvestorId) {
      void loadPreview(previewTemplateId, previewInvestorId);
    } else {
      setPreviewSubject("");
      setPreviewBody("");
      setPreviewError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewTemplateId, previewInvestorId]);

  async function applyTemplate(
    templateId: string,
    investorId: string,
    mode: "RECORD" | "REMIND" = "RECORD"
  ) {
    setApplyingTemplateId(`${templateId}:${investorId}`);
    setApplyError("");
    setNotice("");

    try {
      const payload: Record<string, unknown> = {
        mode: "CREATE",
        investor_id: investorId,
        template_id: templateId,
        create_status: mode === "REMIND" ? "OPEN" : "COMPLETED",
      };

      if (mode === "REMIND") {
        const template = COMMUNICATION_TEMPLATES.find(
          (t) => t.id === templateId
        );

        const days = template?.suggestedDueDays ?? 3;

        payload.due_at = new Date(
          Date.now() + days * 86400000
        ).toISOString();
      }

      const response = await fetch(
        "/api/admin/investor-communications/actions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ?? "Unable to apply template."
        );
      }

      setNotice(
        mode === "REMIND"
          ? `Reminder created for ${data.template?.name ?? "template"}.`
          : `${data.template?.name ?? "Template"} recorded as communication activity.`
      );

      await loadAll();
    } catch (err) {
      setApplyError(
        err instanceof Error
          ? err.message
          : "Unable to apply template."
      );
    } finally {
      setApplyingTemplateId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  Communication Actions
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Institutional Outreach Workspace
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Apply templated communication, generate reminder actions,
                and queue approval and data-room notifications — all
                recorded in the CRM timeline and audit trail.
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
                href="/admin/investor-communications"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Compose Email
              </a>

              <a
                href="/admin/investor-audit"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Audit Trail
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4 text-sm text-emerald-200">
            {notice}
          </div>
        )}

        {/* METRICS */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="Templates"
            value={String(COMMUNICATION_TEMPLATES.length)}
            detail="In the library"
            tone="cyan"
          />
          <MetricTile
            label="Reminders"
            value={String(reminders.length)}
            detail="Active operational"
            tone="amber"
          />
          <MetricTile
            label="Approval Queue"
            value={String(approvalCandidates.length)}
            detail="Awaiting notification"
            tone="green"
          />
          <MetricTile
            label="Data Room Queue"
            value={String(dataroomCandidates.length)}
            detail="Material updates"
            tone="violet"
          />
        </section>

        {/* TABS */}
        <section className="mb-6 flex flex-wrap gap-2">
          {(
            [
              "templates",
              "reminders",
              "approvals",
              "dataroom",
            ] as Tab[]
          ).map((tab) => {
            const active = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "border-cyan-300/40 bg-cyan-300/[0.08] text-cyan-200"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </section>

        {applyError && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
            {applyError}
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === "templates" && (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
              <div className="border-b border-white/10 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">
                    Template Library
                  </h2>

                  <select
                    value={templateCategoryFilter}
                    onChange={(e) =>
                      setTemplateCategoryFilter(
                        e.target.value as TemplateCategory | "ALL"
                      )
                    }
                    className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white outline-none focus:border-cyan-300/40"
                  >
                    <option value="ALL" className="bg-[#0c111d]">
                      All categories
                    </option>
                    {templateCategories.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                        className="bg-[#0c111d]"
                      >
                        {TEMPLATE_CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="max-h-[640px] divide-y divide-white/[0.06] overflow-y-auto">
                {filteredTemplates.map((template) => {
                  const active = previewTemplateId === template.id;

                  return (
                    <button
                      key={template.id}
                      onClick={() => setPreviewTemplateId(template.id)}
                      className={`flex w-full items-start gap-4 px-6 py-4 text-left transition ${
                        active
                          ? "bg-cyan-300/[0.06]"
                          : "hover:bg-white/[0.025]"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                        {template.activityType.slice(0, 3)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white/90">
                            {template.name}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/45">
                            {
                              TEMPLATE_CATEGORY_LABELS[
                                template.category
                              ]
                            }
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/40">
                          {template.description}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                          {template.suggestedStages.map((stage) => (
                            <span
                              key={stage}
                              className="rounded-full border border-white/10 px-2 py-0.5 uppercase tracking-wider text-white/35"
                            >
                              {stage}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
              <div className="border-b border-white/10 px-6 py-5">
                <h2 className="text-lg font-semibold">Template Preview</h2>
                <p className="mt-1 text-xs text-white/40">
                  Render this template against any investor to see the
                  exact message that will be recorded.
                </p>
              </div>

              {!previewTemplateId ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg text-white/25">
                    ◇
                  </div>
                  <p className="mt-4 text-sm text-white/55">
                    Select a template to preview.
                  </p>
                </div>
              ) : (
                <div className="px-6 py-5">
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Investor
                  </label>

                  <select
                    value={previewInvestorId}
                    onChange={(e) =>
                      setPreviewInvestorId(e.target.value)
                    }
                    className="mb-5 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
                  >
                    <option value="" className="bg-[#0c111d]">
                      Select investor to preview…
                    </option>
                    {investors.map((investor) => (
                      <option
                        key={investor.id}
                        value={investor.id}
                        className="bg-[#0c111d]"
                      >
                        {investorDisplayName(investor)}
                      </option>
                    ))}
                  </select>

                  {previewLoading ? (
                    <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-xs text-white/45">
                      Rendering…
                    </div>
                  ) : previewError ? (
                    <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-xs text-red-200">
                      {previewError}
                    </div>
                  ) : previewSubject ? (
                    <>
                      <div className="rounded-xl border border-white/[0.06] bg-black/25 p-4">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                          Subject
                        </div>
                        <p className="mt-1 text-sm font-medium text-white/85">
                          {previewSubject}
                        </p>
                      </div>

                      <div className="mt-3 max-h-[340px] overflow-y-auto rounded-xl border border-white/[0.06] bg-black/25 p-4">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                          Body
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/65">
                          {previewBody}
                        </p>
                      </div>

                      {previewInvestorId && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              void applyTemplate(
                                previewTemplateId,
                                previewInvestorId,
                                "RECORD"
                              )
                            }
                            disabled={
                              applyingTemplateId ===
                              `${previewTemplateId}:${previewInvestorId}`
                            }
                            className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.08] px-4 py-2.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-300/[0.14] disabled:opacity-40"
                          >
                            {applyingTemplateId ===
                            `${previewTemplateId}:${previewInvestorId}`
                              ? "Recording…"
                              : "Record as Email"}
                          </button>

                          <button
                            onClick={() =>
                              void applyTemplate(
                                previewTemplateId,
                                previewInvestorId,
                                "REMIND"
                              )
                            }
                            disabled={
                              applyingTemplateId ===
                              `${previewTemplateId}:${previewInvestorId}`
                            }
                            className="rounded-xl border border-amber-300/20 bg-amber-300/[0.08] px-4 py-2.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-300/[0.14] disabled:opacity-40"
                          >
                            {applyingTemplateId ===
                            `${previewTemplateId}:${previewInvestorId}`
                              ? "Creating…"
                              : "Create Reminder"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center text-xs text-white/35">
                      Select an investor above to render this template.
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* REMINDERS TAB */}
        {activeTab === "reminders" && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold">
                7C.6 — Action Reminder Center
              </h2>
              <p className="mt-1 text-xs text-white/40">
                Open follow-ups due within the next 14 days. Apply the
                relationship follow-up template to record the outreach.
              </p>
            </div>

            {loading ? (
              <div className="space-y-2 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-white/[0.025]"
                  />
                ))}
              </div>
            ) : reminders.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] text-xl text-emerald-300">
                  ✓
                </div>
                <p className="mt-5 text-sm font-semibold text-white/70">
                  No active reminders
                </p>
                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/30">
                  All operational follow-ups are beyond the 14-day
                  window or already resolved.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {reminders.map(({ activity, investor, dueState: ds }) => {
                  const investorId = activity.investor_id;

                  const applyKey = `FOLLOW_UP_01:${investorId}`;
                  const applying =
                    applyingTemplateId === applyKey;

                  return (
                    <div
                      key={activity.id}
                      className="flex flex-wrap items-center gap-4 px-6 py-5 transition hover:bg-white/[0.02]"
                    >
                      <span
                        className={`h-10 w-1 shrink-0 rounded-full ${
                          ds === "overdue"
                            ? "bg-red-300"
                            : ds === "today"
                              ? "bg-amber-300"
                              : "bg-cyan-300"
                        }`}
                      />

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-xs font-semibold text-cyan-200">
                        {initials(investor?.full_name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white/85">
                            {investor
                              ? investorDisplayName(investor)
                              : "Investor"}
                          </span>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                              ds === "overdue"
                                ? "border-red-300/20 bg-red-300/[0.08] text-red-300"
                                : ds === "today"
                                  ? "border-amber-300/20 bg-amber-300/[0.08] text-amber-300"
                                  : "border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-300"
                            }`}
                          >
                            {ds === "overdue"
                              ? "Overdue"
                              : ds === "today"
                                ? "Due today"
                                : "Upcoming"}
                          </span>
                        </div>

                        <div className="mt-1 truncate text-xs text-white/55">
                          {activity.subject || "Follow-up activity"}
                        </div>

                        <div className="mt-1 text-[10px] text-white/30">
                          Due {formatDateTime(activity.due_at)}
                          {activity.assigned_admin
                            ? ` · Owner: ${activity.assigned_admin}`
                            : ""}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          onClick={() =>
                            void applyTemplate(
                              "FOLLOW_UP_01",
                              investorId,
                              "RECORD"
                            )
                          }
                          disabled={Boolean(applyingTemplateId)}
                          className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-200 transition hover:bg-cyan-300/[0.12] disabled:opacity-40"
                        >
                          {applying ? "…" : "Record Follow-up"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* APPROVALS TAB */}
        {activeTab === "approvals" && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold">
                7C.3 — Approval Notification Queue
              </h2>
              <p className="mt-1 text-xs text-white/40">
                Investors who are verified and approved but have not yet
                received an approval notification.
              </p>
            </div>

            {approvalCandidates.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] text-xl text-emerald-300">
                  ✓
                </div>
                <p className="mt-5 text-sm font-semibold text-white/70">
                  All approvals notified
                </p>
                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/30">
                  Every verified and approved investor has received an
                  approval notification.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {approvalCandidates.map((investor) => {
                  const applyKey = `APPROVAL_01:${investor.id}`;
                  const applying =
                    applyingTemplateId === applyKey;

                  return (
                    <div
                      key={investor.id}
                      className="flex flex-wrap items-center gap-4 px-6 py-5 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] text-xs font-semibold text-emerald-200">
                        {initials(investor.full_name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white/85">
                            {investorDisplayName(investor)}
                          </span>
                          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                            {investor.access_level}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-white/45">
                          {investor.email || "—"}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          void applyTemplate(
                            "APPROVAL_01",
                            investor.id,
                            "RECORD"
                          )
                        }
                        disabled={Boolean(applyingTemplateId)}
                        className="shrink-0 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-300/[0.12] disabled:opacity-40"
                      >
                        {applying ? "…" : "Record Notification"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* DATAROOM TAB */}
        {activeTab === "dataroom" && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold">
                7C.4 — Data Room Notification Queue
              </h2>
              <p className="mt-1 text-xs text-white/40">
                Investors in NDA, Due Diligence or Commitment stage who
                may benefit from a data room material update.
              </p>
            </div>

            {dataroomCandidates.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] text-xl text-emerald-300">
                  ✓
                </div>
                <p className="mt-5 text-sm font-semibold text-white/70">
                  No pending data room notifications
                </p>
                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/30">
                  All eligible investors have received a data room
                  update notification.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {dataroomCandidates.map((investor) => {
                  const applyKey = `DATAROOM_01:${investor.id}`;
                  const applying =
                    applyingTemplateId === applyKey;

                  return (
                    <div
                      key={investor.id}
                      className="flex flex-wrap items-center gap-4 px-6 py-5 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-300/[0.06] text-xs font-semibold text-violet-200">
                        {initials(investor.full_name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white/85">
                            {investorDisplayName(investor)}
                          </span>
                          <span className="rounded-full border border-violet-300/20 bg-violet-300/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-violet-300">
                            {investor.crm?.stage || "PROSPECT"}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-white/45">
                          {investor.email || "—"}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          void applyTemplate(
                            "DATAROOM_01",
                            investor.id,
                            "RECORD"
                          )
                        }
                        disabled={Boolean(applyingTemplateId)}
                        className="shrink-0 rounded-lg border border-violet-300/20 bg-violet-300/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-violet-200 transition hover:bg-violet-300/[0.12] disabled:opacity-40"
                      >
                        {applying ? "…" : "Record Notification"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
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
  tone: "cyan" | "violet" | "green" | "amber";
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