"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResolutionModal,
  type ResolutionTarget,
} from "./ResolutionModal";
import { InvestorAuditPanel } from "./InvestorAuditPanel";
import { DataRoomOperationsPanel } from "./DataRoomOperationsPanel";

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

type InvestorProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  investor_type: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  geography: string | null;
  proposed_ticket_inr: number | null;
  verification_status: string | null;
  kyc_completed: boolean | null;
  nda_signed: boolean | null;
  nda_signed_at: string | null;
  access_level: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  crm: CRMRecord | null;
};

type CRMRecord = {
  id: string;
  investor_id: string;
  stage: Stage;
  expected_investment_inr: number | null;
  actual_investment_inr: number | null;
  probability_percent: number | null;
  last_contact_date: string | null;
  next_action: string | null;
  meeting_notes: string | null;
  assigned_admin: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type FormState = {
  stage: Stage;
  expected_investment_inr: string;
  actual_investment_inr: string;
  probability_percent: string;
  last_contact_date: string;
  next_action: string;
  meeting_notes: string;
  assigned_admin: string;
};

type DecisionSignal = {
  signal_type: string;
  title: string;
  severity: string;
  reason?: string;
  description?: string;
  recommended_action?: string;
};

type DecisionActivity = {
  id: string;
  activity_type: string;
  subject: string | null;
  details: string | null;
  due_at?: string | null;
  occurred_at?: string | null;
  created_at?: string | null;
  status?: string | null;
};

type DecisionContext = {
  relationship: {
    health: string;
    days_since_last_contact: number | null;
    recent_activity_count: number;
  };
  decision: {
    recommended_action: string;
    priority: string;
    reason: string;
  };
  decision_intelligence: {
    recommendedAction: string | null;
    recommendationReason: string | null;
    priority: string;
    riskLevel: string;
    attentionReason: string | null;
    relationshipHealth: string | null;
    daysSinceLastContact: number | null;
    activityCount: number;
    expectedInvestmentInr: number;
    weightedInvestmentInr: number;
    probabilityPercent: number;
    obligations: string[];
    signals: string[];
  };
  crm_timeline: Array<{
    id: string;
    investorId: string;
    activityType: string;
    subject: string | null;
    details: string | null;
    occurredAt: string;
    dueAt: string | null;
    status: string;
    assignedAdmin: string | null;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  investor_score: {
    score: number;
    band: string;
    reasons: string[];
    breakdown: Record<string, number>;
  };
  action_recommendation: {
    actionType: string;
    urgency: string;
    title: string;
    reason: string;
    source: string;
    dueWithinHours: number | null;
  };
  capital: {
    expected_investment_inr: number;
    weighted_pipeline_inr: number;
    probability_percent: number;
  };
  obligations: {
    open_count: number;
    overdue_count: number;
    items: DecisionActivity[];
  };
  intelligence: {
    signals: DecisionSignal[];
  };
  recent_activities: DecisionActivity[];
};

type InteractionType = "CALL" | "EMAIL" | "MEETING" | "NOTE" | "OTHER";

const INTERACTION_TYPES: Array<{
  value: InteractionType;
  label: string;
}> = [
  { value: "CALL", label: "Call" },
  { value: "EMAIL", label: "Email" },
  { value: "MEETING", label: "Meeting" },
  { value: "NOTE", label: "Note" },
  { value: "OTHER", label: "Other" },
];

type ComposerType =
  | "CALL"
  | "MEETING"
  | "EMAIL"
  | "DOCUMENT"
  | "COMMITMENT"
  | "OBJECTION"
  | "NEXT_STEP";

const COMPOSER_TABS: Array<{
  value: ComposerType;
  label: string;
  step: string;
}> = [
  { value: "CALL", label: "Call", step: "5B.7" },
  { value: "MEETING", label: "Meeting", step: "5B.8" },
  { value: "EMAIL", label: "Email", step: "5B.9" },
  { value: "DOCUMENT", label: "Document", step: "5B.10" },
  { value: "COMMITMENT", label: "Commitment", step: "5B.11" },
  { value: "OBJECTION", label: "Objection", step: "5B.12" },
  { value: "NEXT_STEP", label: "Next Step", step: "5B.13" },
];

type CallOutcome =
  | "CONNECTED"
  | "NO_ANSWER"
  | "LEFT_MESSAGE"
  | "CALLBACK_REQUESTED";

type EmailDirection = "OUTBOUND" | "INBOUND";

type DocumentAction = "SENT" | "VIEWED" | "DISCUSSED" | "REQUESTED";

type ObjectionCategory =
  | "VALUATION"
  | "TIMING"
  | "TEAM"
  | "MARKET"
  | "STRUCTURE"
  | "OTHER";

type ObjectionSeverity = "LOW" | "MEDIUM" | "HIGH";

function formatINR(value: number | null | undefined) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dateForInput(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function dateTimeForInput(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 16);
}

function initialForm(investor: InvestorProfile): FormState {
  const crm = investor.crm;

  return {
    stage: crm?.stage || "PROSPECT",
    expected_investment_inr:
      crm?.expected_investment_inr != null
        ? String(crm.expected_investment_inr)
        : investor.proposed_ticket_inr != null
          ? String(investor.proposed_ticket_inr)
          : "",
    actual_investment_inr:
      crm?.actual_investment_inr != null
        ? String(crm.actual_investment_inr)
        : "",
    probability_percent:
      crm?.probability_percent != null
        ? String(crm.probability_percent)
        : "10",
    last_contact_date: dateForInput(crm?.last_contact_date),
    next_action: crm?.next_action || "",
    meeting_notes: crm?.meeting_notes || "",
    assigned_admin: crm?.assigned_admin || "Founder",
  };
}

function displayText(value: string | null | undefined) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function InvestorCRMPage() {
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedInvestorId, setSelectedInvestorId] =
    useState<string | null>(null);

  const [form, setForm] = useState<FormState | null>(null);

  const [decisionContext, setDecisionContext] =
    useState<DecisionContext | null>(null);

  const [loadingDecisionContext, setLoadingDecisionContext] =
    useState(false);

  // 5B.1 — Follow-up action
  const [followUpSubject, setFollowUpSubject] = useState("");
  const [followUpDetails, setFollowUpDetails] = useState("");
  const [followUpDueAt, setFollowUpDueAt] = useState("");
  const [creatingFollowUp, setCreatingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState("");

  // 5B.2 — Follow-up action assignment
  const [followUpAssignedAdmin, setFollowUpAssignedAdmin] =
    useState("Founder");

  async function loadCRM() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/investor-crm", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load Investor CRM."
        );
      }

      setInvestors(data.investors || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Investor CRM."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadDecisionContext(investorId: string) {
    setLoadingDecisionContext(true);
    setDecisionContext(null);

    try {
      const response = await fetch(
        `/api/admin/investor-intelligence/context?investor_id=${encodeURIComponent(
          investorId
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to load investor decision context."
        );
      }

      setDecisionContext(data as DecisionContext);
    } catch (err) {
      console.error("Decision context error:", err);
      setDecisionContext(null);
    } finally {
      setLoadingDecisionContext(false);
    }
  }

  useEffect(() => {
    void loadCRM();
  }, []);

  const selectedInvestor = useMemo(
    () =>
      investors.find(
        (investor) => investor.id === selectedInvestorId
      ) || null,
    [investors, selectedInvestorId]
  );

  function openInvestor(investor: InvestorProfile) {
    setSelectedInvestorId(investor.id);
    setForm(initialForm(investor));

    setFollowUpSubject("");
    setFollowUpDetails("");
    setFollowUpDueAt("");
    setFollowUpAssignedAdmin(
      investor.crm?.assigned_admin?.trim() || "Founder"
    );
    setFollowUpError("");

    void loadDecisionContext(investor.id);
  }

  async function createFollowUp() {
    if (!selectedInvestor) return;

    const subject = followUpSubject.trim();
    const details = followUpDetails.trim();
    const assignedAdmin =
      followUpAssignedAdmin.trim() || "Founder";

    if (!subject) {
      setFollowUpError("A subject is required.");
      return;
    }

    if (!followUpDueAt) {
      setFollowUpError("A due date and time are required.");
      return;
    }

    const dueDate = new Date(followUpDueAt);

    if (Number.isNaN(dueDate.getTime())) {
      setFollowUpError("The due date and time are invalid.");
      return;
    }

    setCreatingFollowUp(true);
    setFollowUpError("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin/investor-crm/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investor_id: selectedInvestor.id,
            activity_type: "FOLLOW_UP",
            subject,
            details: details || null,
            due_at: dueDate.toISOString(),
            status: "OPEN",
            assigned_admin: assignedAdmin,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create follow-up action."
        );
      }

      setFollowUpSubject("");
      setFollowUpDetails("");
      setFollowUpDueAt("");
      setFollowUpAssignedAdmin("Founder");

      alert("Follow-up action created.");

      await loadDecisionContext(selectedInvestor.id);
      await loadCRM();
    } catch (err) {
      setFollowUpError(
        err instanceof Error
          ? err.message
          : "Unable to create follow-up action."
      );
    } finally {
      setCreatingFollowUp(false);
    }
  }

  function closeInvestor() {
    if (saving) return;

    setSelectedInvestorId(null);
    setForm(null);
    setDecisionContext(null);
    setLoadingDecisionContext(false);
  }

  async function saveInvestor() {
    if (!selectedInvestor || !form) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/investor-crm", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          investor_id: selectedInvestor.id,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save CRM record."
        );
      }

      setInvestors((current) =>
        current.map((investor) =>
          investor.id === selectedInvestor.id
            ? {
                ...investor,
                crm: data.crm,
              }
            : investor
        )
      );

      alert("Investor CRM record saved.");

      await loadDecisionContext(selectedInvestor.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save CRM record."
      );
    } finally {
      setSaving(false);
    }
  }

  const metrics = useMemo(() => {
    const totalInvestors = investors.length;

    const pipelineValue = investors.reduce(
      (sum, investor) =>
        sum +
        Number(
          investor.crm?.expected_investment_inr ||
            investor.proposed_ticket_inr ||
            0
        ),
      0
    );

    const weightedPipeline = investors.reduce(
      (sum, investor) => {
        const expected = Number(
          investor.crm?.expected_investment_inr ||
            investor.proposed_ticket_inr ||
            0
        );

        const probability = Number(
          investor.crm?.probability_percent || 10
        );

        return sum + expected * (probability / 100);
      },
      0
    );

    const committedCapital = investors.reduce(
      (sum, investor) => {
        if (investor.crm?.stage !== "COMMITMENT") {
          return sum;
        }

        return (
          sum +
          Number(
            investor.crm?.expected_investment_inr ||
              investor.proposed_ticket_inr ||
              0
          )
        );
      },
      0
    );

    const investedCapital = investors.reduce(
      (sum, investor) =>
        sum +
        Number(
          investor.crm?.actual_investment_inr || 0
        ),
      0
    );

    const dueDiligence = investors.filter(
      (investor) =>
        investor.crm?.stage === "DUE_DILIGENCE"
    ).length;

    const followUpsDue = investors.filter(
      (investor) => {
        const date =
          investor.crm?.last_contact_date;

        const nextAction =
          investor.crm?.next_action;

        if (!nextAction) return false;

        if (!date) return true;

        const contactDate = new Date(date);

        if (Number.isNaN(contactDate.getTime())) {
          return true;
        }

        const daysSinceContact =
          (Date.now() - contactDate.getTime()) /
          (1000 * 60 * 60 * 24);

        return daysSinceContact >= 7;
      }
    ).length;

    return {
      totalInvestors,
      pipelineValue,
      weightedPipeline,
      committedCapital,
      investedCapital,
      dueDiligence,
      followUpsDue,
    };
  }, [investors]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1800px] px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
              People & Youth
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Investor Relations CRM
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Founder-facing pipeline for investor
              relationships, diligence, capital
              formation and follow-up.
            </p>
          </div>

          <button
            onClick={() => void loadCRM()}
            disabled={loading}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh CRM"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <Metric
            label="Total Investors"
            value={String(metrics.totalInvestors)}
          />

          <Metric
            label="Pipeline Value"
            value={formatINR(metrics.pipelineValue)}
          />

          <Metric
            label="Weighted Pipeline"
            value={formatINR(metrics.weightedPipeline)}
          />

          <Metric
            label="Committed"
            value={formatINR(metrics.committedCapital)}
          />

          <Metric
            label="Invested"
            value={formatINR(metrics.investedCapital)}
          />

          <Metric
            label="Due Diligence"
            value={String(metrics.dueDiligence)}
          />

          <Metric
            label="Follow-ups Due"
            value={String(metrics.followUpsDue)}
          />
        </section>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Loading Investor CRM...
          </div>
        ) : investors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-12 text-center">
            <p className="text-lg font-medium text-slate-200">
              No investor applications yet.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              New investor profiles will appear here
              automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-6">
            <div className="grid min-w-[1700px] grid-cols-7 gap-4">
              {STAGES.map((stage) => {
                const stageInvestors =
                  investors.filter(
                    (investor) =>
                      (investor.crm?.stage ||
                        "PROSPECT") === stage
                  );

                const stageValue =
                  stageInvestors.reduce(
                    (sum, investor) =>
                      sum +
                      Number(
                        investor.crm
                          ?.expected_investment_inr ||
                          investor.proposed_ticket_inr ||
                          0
                      ),
                    0
                  );

                return (
                  <section
                    key={stage}
                    className="min-h-[500px] rounded-2xl border border-slate-800 bg-slate-900/80"
                  >
                    <div className="border-b border-slate-800 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-xs font-bold tracking-[0.14em] text-slate-200">
                          {stage}
                        </h2>

                        <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-400">
                          {stageInvestors.length}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {formatINR(stageValue)}
                      </p>
                    </div>

                    <div className="space-y-3 p-3">
                      {stageInvestors.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-600">
                          Empty
                        </div>
                      ) : (
                        stageInvestors.map((investor) => (
                          <InvestorCard
                            key={investor.id}
                            investor={investor}
                            onClick={() =>
                              openInvestor(investor)
                            }
                          />
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedInvestor && form && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-6xl rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Investor Relationship
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  {selectedInvestor.full_name}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {selectedInvestor.organization ||
                    selectedInvestor.email}
                </p>
              </div>

              <button
                onClick={closeInvestor}
                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close investor"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-1">
                <InfoSection title="Investor Profile">
                  <Info
                    label="Email"
                    value={selectedInvestor.email}
                  />

                  <Info
                    label="Phone"
                    value={selectedInvestor.phone}
                  />

                  <Info
                    label="Organisation"
                    value={selectedInvestor.organization}
                  />

                  <Info
                    label="Investor Type"
                    value={selectedInvestor.investor_type}
                  />

                  <Info
                    label="Geography"
                    value={selectedInvestor.geography}
                  />

                  <Info
                    label="Proposed Ticket"
                    value={formatINR(
                      selectedInvestor.proposed_ticket_inr
                    )}
                  />
                </InfoSection>

                <InfoSection title="Qualification">
                  <Info
                    label="Verification"
                    value={
                      selectedInvestor.verification_status
                    }
                  />

                  <Info
                    label="KYC"
                    value={
                      selectedInvestor.kyc_completed
                        ? "Completed"
                        : "Pending"
                    }
                  />

                  <Info
                    label="NDA"
                    value={
                      selectedInvestor.nda_signed
                        ? "Signed"
                        : "Not signed"
                    }
                  />

                  <Info
                    label="Access"
                    value={selectedInvestor.access_level}
                  />
                </InfoSection>

                {selectedInvestor.notes && (
                  <InfoSection title="Investor Notes">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {selectedInvestor.notes}
                    </p>
                  </InfoSection>
                )}
              </div>

              <div className="space-y-5 lg:col-span-2">
                <InfoSection title="Relationship & Capital">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Pipeline Stage">
                      <select
                        value={form.stage}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            stage:
                              event.target.value as Stage,
                          })
                        }
                        className="input"
                      >
                        {STAGES.map((stage) => (
                          <option
                            key={stage}
                            value={stage}
                          >
                            {stage}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Assigned Admin">
                      <input
                        value={form.assigned_admin}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            assigned_admin:
                              event.target.value,
                          })
                        }
                        className="input"
                      />
                    </Field>

                    <Field label="Expected Investment (₹)">
                      <input
                        type="number"
                        min="0"
                        value={
                          form.expected_investment_inr
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            expected_investment_inr:
                              event.target.value,
                          })
                        }
                        className="input"
                      />
                    </Field>

                    <Field label="Actual Investment (₹)">
                      <input
                        type="number"
                        min="0"
                        value={
                          form.actual_investment_inr
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            actual_investment_inr:
                              event.target.value,
                          })
                        }
                        className="input"
                      />
                    </Field>

                    <Field label="Probability (%)">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                          form.probability_percent
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            probability_percent:
                              event.target.value,
                          })
                        }
                        className="input"
                      />
                    </Field>

                    <Field label="Last Contact">
                      <input
                        type="date"
                        value={
                          form.last_contact_date
                        }
                        onChange={(event) =>
                          setForm({
                            ...form,
                            last_contact_date:
                              event.target.value,
                          })
                        }
                        className="input"
                      />
                    </Field>
                  </div>
                </InfoSection>

                <InfoSection title="Follow-up">
                  <Field label="Next Action">
                    <input
                      value={form.next_action}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          next_action:
                            event.target.value,
                        })
                      }
                      placeholder="e.g. Send institutional overview"
                      className="input"
                    />
                  </Field>

                  <Field label="Meeting Notes">
                    <textarea
                      value={form.meeting_notes}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          meeting_notes:
                            event.target.value,
                        })
                      }
                      rows={6}
                      placeholder="Record relationship context, meetings, diligence questions and important follow-up."
                      className="input resize-y"
                    />
                  </Field>
                </InfoSection>

                <InfoSection title="Create Follow-up Action">
                  <div className="space-y-4">
                    <Field label="Subject">
                      <input
                        value={followUpSubject}
                        onChange={(event) => {
                          setFollowUpSubject(
                            event.target.value
                          );
                          setFollowUpError("");
                        }}
                        placeholder="e.g. Follow up on investment discussion"
                        className="input"
                        maxLength={300}
                        disabled={creatingFollowUp}
                      />
                    </Field>

                    <Field label="Due Date & Time">
                      <input
                        type="datetime-local"
                        value={followUpDueAt}
                        onChange={(event) => {
                          setFollowUpDueAt(
                            event.target.value
                          );
                          setFollowUpError("");
                        }}
                        className="input"
                        disabled={creatingFollowUp}
                      />
                    </Field>

                    <Field label="Details">
                      <textarea
                        value={followUpDetails}
                        onChange={(event) => {
                          setFollowUpDetails(
                            event.target.value
                          );
                          setFollowUpError("");
                        }}
                        rows={4}
                        placeholder="Add the context or intended outcome for this follow-up."
                        className="input resize-y"
                        disabled={creatingFollowUp}
                      />
                    </Field>

                    <Field label="Assign To">
                      <input
                        value={followUpAssignedAdmin}
                        onChange={(event) => {
                          setFollowUpAssignedAdmin(
                            event.target.value
                          );
                          setFollowUpError("");
                        }}
                        placeholder="e.g. Founder"
                        className="input"
                        maxLength={200}
                        disabled={creatingFollowUp}
                      />
                    </Field>

                    {followUpError && (
                      <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                        {followUpError}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          void createFollowUp()
                        }
                        disabled={
                          creatingFollowUp ||
                          !followUpSubject.trim() ||
                          !followUpDueAt
                        }
                        className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {creatingFollowUp
                          ? "Creating..."
                          : "Create Follow-up"}
                      </button>
                    </div>
                  </div>
                </InfoSection>

                <DecisionContextPanel
                  investorId={selectedInvestor.id}
                  context={decisionContext}
                  loading={loadingDecisionContext}
                  onActivityUpdated={() => {
                    void loadDecisionContext(
                      selectedInvestor.id
                    );
                  }}
                />

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={closeInvestor}
                    disabled={saving}
                    className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => void saveInvestor()}
                    disabled={saving}
                    className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save CRM Record"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid rgb(51 65 85);
          background: rgb(15 23 42);
          padding: 0.65rem 0.75rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
        }

        .input:focus {
          border-color: rgb(34 211 238);
          box-shadow: 0 0 0 1px rgb(34 211 238);
        }

        select.input {
          color-scheme: dark;
        }
      `}</style>
    </main>
  );
}

function DecisionContextPanel({
  investorId,
  context,
  loading,
  onActivityUpdated,
}: {
  investorId: string;
  context: DecisionContext | null;
  loading: boolean;
  onActivityUpdated: () => void;
}) {
  const [activityDueDates, setActivityDueDates] =
    useState<Record<string, string>>({});
  const [updatingDueDateId, setUpdatingDueDateId] =
    useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState("");

  // 5C.4 / 5C.5 — Resolution modal target
  const [resolutionTarget, setResolutionTarget] =
    useState<ResolutionTarget | null>(null);

  // 5B.5 — Record investor interaction
  const [interactionType, setInteractionType] =
    useState<InteractionType>("CALL");
  const [interactionSubject, setInteractionSubject] =
    useState("");
  const [interactionDetails, setInteractionDetails] =
    useState("");
  const [interactionOccurredAt, setInteractionOccurredAt] =
    useState("");
  const [recordingInteraction, setRecordingInteraction] =
    useState(false);
  const [interactionError, setInteractionError] = useState("");
  const [interactionSuccess, setInteractionSuccess] =
    useState("");

  // 5B.6 — Add internal CRM note
  const [noteBody, setNoteBody] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [noteSuccess, setNoteSuccess] = useState("");

  // 5B.7 — 5B.13 — Unified Activity Composer
  const [composerTab, setComposerTab] =
    useState<ComposerType>("CALL");

  const [composerSubject, setComposerSubject] = useState("");
  const [composerDetails, setComposerDetails] = useState("");
  const [composerOccurredAt, setComposerOccurredAt] = useState("");

  const [callOutcome, setCallOutcome] =
    useState<CallOutcome>("CONNECTED");
  const [callDurationMinutes, setCallDurationMinutes] =
    useState("");

  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingAttendees, setMeetingAttendees] = useState("");

  const [emailDirection, setEmailDirection] =
    useState<EmailDirection>("OUTBOUND");

  const [documentAction, setDocumentAction] =
    useState<DocumentAction>("SENT");
  const [documentName, setDocumentName] = useState("");

  const [commitmentAmount, setCommitmentAmount] = useState("");
  const [commitmentExpectedDate, setCommitmentExpectedDate] =
    useState("");

  const [objectionCategory, setObjectionCategory] =
    useState<ObjectionCategory>("VALUATION");
  const [objectionSeverity, setObjectionSeverity] =
    useState<ObjectionSeverity>("MEDIUM");

  const [nextStepDueAt, setNextStepDueAt] = useState("");
  const [nextStepAssignee, setNextStepAssignee] = useState("Founder");

  const [submittingComposer, setSubmittingComposer] = useState(false);
  const [composerError, setComposerError] = useState("");
  const [composerSuccess, setComposerSuccess] = useState("");

  useEffect(() => {
    if (!context) {
      setActivityDueDates({});
      return;
    }

    const nextDueDates: Record<string, string> = {};

    context.obligations.items.forEach((activity) => {
      nextDueDates[activity.id] = dateTimeForInput(
        activity.due_at
      );
    });

    setActivityDueDates(nextDueDates);
    setDueDateError("");
  }, [context]);

  function clearComposerMessages() {
    setComposerError("");
    setComposerSuccess("");
  }

  function resetComposerAfterSuccess() {
    setComposerSubject("");
    setComposerDetails("");
    setComposerOccurredAt("");
    setCallOutcome("CONNECTED");
    setCallDurationMinutes("");
    setMeetingLocation("");
    setMeetingAttendees("");
    setEmailDirection("OUTBOUND");
    setDocumentAction("SENT");
    setDocumentName("");
    setCommitmentAmount("");
    setCommitmentExpectedDate("");
    setObjectionCategory("VALUATION");
    setObjectionSeverity("MEDIUM");
    setNextStepDueAt("");
    setNextStepAssignee("Founder");
  }

  async function setActivityDueDate(activityId: string) {
    const dueAtInput =
      activityDueDates[activityId]?.trim() || "";

    if (!dueAtInput) {
      setDueDateError(
        "A due date and time are required."
      );
      return;
    }

    const dueDate = new Date(dueAtInput);

    if (Number.isNaN(dueDate.getTime())) {
      setDueDateError(
        "The due date and time are invalid."
      );
      return;
    }

    setUpdatingDueDateId(activityId);
    setDueDateError("");

    try {
      const response = await fetch(
        "/api/admin/investor-crm/activities",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: activityId,
            due_at: dueDate.toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update the action due date."
        );
      }

      if (!data.activity) {
        throw new Error(
          "The action due date update was not confirmed."
        );
      }

      onActivityUpdated();
    } catch (err) {
      setDueDateError(
        err instanceof Error
          ? err.message
          : "Unable to update the action due date."
      );
    } finally {
      setUpdatingDueDateId(null);
    }
  }

  /*
   * 5B.5 — Record Investor Interaction
   */
  async function recordInteraction() {
    const subject = interactionSubject.trim();

    if (!subject) {
      setInteractionError("A subject is required.");
      return;
    }

    let occurredAtIso: string | undefined;

    if (interactionOccurredAt) {
      const occurredDate = new Date(interactionOccurredAt);

      if (Number.isNaN(occurredDate.getTime())) {
        setInteractionError(
          "The interaction date and time are invalid."
        );
        return;
      }

      occurredAtIso = occurredDate.toISOString();
    }

    setRecordingInteraction(true);
    setInteractionError("");
    setInteractionSuccess("");

    try {
      const response = await fetch(
        "/api/admin/investor-crm/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investor_id: investorId,
            activity_type: interactionType,
            subject,
            details: interactionDetails.trim() || null,
            occurred_at: occurredAtIso,
            status: "COMPLETED",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to record the interaction."
        );
      }

      setInteractionSubject("");
      setInteractionDetails("");
      setInteractionOccurredAt("");
      setInteractionSuccess("Interaction recorded.");

      onActivityUpdated();
    } catch (err) {
      setInteractionError(
        err instanceof Error
          ? err.message
          : "Unable to record the interaction."
      );
    } finally {
      setRecordingInteraction(false);
    }
  }

  /*
   * 5B.6 — Add Internal CRM Note
   */
  async function saveInternalNote() {
    const body = noteBody.trim();

    if (!body) {
      setNoteError("A note is required.");
      return;
    }

    const firstLine = body.split("\n")[0].trim();
    const subject =
      firstLine.length > 120
        ? `${firstLine.slice(0, 117)}...`
        : firstLine || "Internal note";

    setSavingNote(true);
    setNoteError("");
    setNoteSuccess("");

    try {
      const response = await fetch(
        "/api/admin/investor-crm/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investor_id: investorId,
            activity_type: "NOTE",
            subject,
            details: body,
            status: "COMPLETED",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save the internal note."
        );
      }

      setNoteBody("");
      setNoteSuccess("Internal note saved.");

      onActivityUpdated();
    } catch (err) {
      setNoteError(
        err instanceof Error
          ? err.message
          : "Unable to save the internal note."
      );
    } finally {
      setSavingNote(false);
    }
  }

  /*
   * 5B.7 — 5B.13 — Submit the Activity Composer
   */
  async function submitComposer() {
    const subject = composerSubject.trim();

    if (!subject) {
      setComposerError("A subject is required.");
      return;
    }

    let occurredAtIso: string | undefined;

    if (composerOccurredAt) {
      const occurredDate = new Date(composerOccurredAt);

      if (Number.isNaN(occurredDate.getTime())) {
        setComposerError(
          "The occurred date and time are invalid."
        );
        return;
      }

      occurredAtIso = occurredDate.toISOString();
    }

    let activityType:
      | "CALL"
      | "MEETING"
      | "EMAIL"
      | "NOTE"
      | "COMMITMENT"
      | "FOLLOW_UP" = "NOTE";

    let status: "OPEN" | "COMPLETED" = "COMPLETED";

    let dueAtIso: string | undefined;
    let assignedAdmin: string | undefined;

    const headerLines: string[] = [];
    const detailLines: string[] = [];

    switch (composerTab) {
      case "CALL": {
        activityType = "CALL";

        headerLines.push("[CALL]");
        headerLines.push(`Outcome: ${callOutcome}`);

        const duration = callDurationMinutes.trim();

        if (duration) {
          const minutes = Number(duration);

          if (
            !Number.isFinite(minutes) ||
            minutes < 0
          ) {
            setComposerError(
              "Call duration must be a positive number of minutes."
            );
            return;
          }

          headerLines.push(`Duration: ${minutes} minutes`);
        }
        break;
      }

      case "MEETING": {
        activityType = "MEETING";

        headerLines.push("[MEETING]");

        const location = meetingLocation.trim();
        const attendees = meetingAttendees.trim();

        if (location) {
          headerLines.push(`Location: ${location}`);
        }

        if (attendees) {
          headerLines.push(`Attendees: ${attendees}`);
        }
        break;
      }

      case "EMAIL": {
        activityType = "EMAIL";

        headerLines.push("[EMAIL]");
        headerLines.push(`Direction: ${emailDirection}`);
        break;
      }

      case "DOCUMENT": {
        activityType = "NOTE";

        headerLines.push("[DOCUMENT]");
        headerLines.push(`Action: ${documentAction}`);

        const docName = documentName.trim();

        if (docName) {
          headerLines.push(`Document: ${docName}`);
        }
        break;
      }

      case "COMMITMENT": {
        activityType = "COMMITMENT";

        headerLines.push("[COMMITMENT]");

        const amount = commitmentAmount.trim();

        if (amount) {
          const value = Number(amount);

          if (!Number.isFinite(value) || value < 0) {
            setComposerError(
              "Commitment amount must be a positive number."
            );
            return;
          }

          headerLines.push(
            `Amount: ₹${value.toLocaleString("en-IN")}`
          );
        }

        if (commitmentExpectedDate) {
          const expectedDate = new Date(
            commitmentExpectedDate
          );

          if (Number.isNaN(expectedDate.getTime())) {
            setComposerError(
              "The expected date is invalid."
            );
            return;
          }

          headerLines.push(
            `Expected: ${expectedDate.toISOString().slice(0, 10)}`
          );
        }
        break;
      }

      case "OBJECTION": {
        activityType = "NOTE";

        headerLines.push("[OBJECTION]");
        headerLines.push(`Category: ${objectionCategory}`);
        headerLines.push(`Severity: ${objectionSeverity}`);
        break;
      }

      case "NEXT_STEP": {
        activityType = "FOLLOW_UP";
        status = "OPEN";

        if (!nextStepDueAt) {
          setComposerError(
            "A due date and time are required for a next step."
          );
          return;
        }

        const dueDate = new Date(nextStepDueAt);

        if (Number.isNaN(dueDate.getTime())) {
          setComposerError(
            "The next step due date and time are invalid."
          );
          return;
        }

        dueAtIso = dueDate.toISOString();

        const assignee = nextStepAssignee.trim() || "Founder";

        assignedAdmin = assignee;

        headerLines.push("[NEXT_STEP]");
        headerLines.push(`Owner: ${assignee}`);
        break;
      }
    }

    if (composerDetails.trim()) {
      detailLines.push(composerDetails.trim());
    }

    const composedDetails = [
      ...headerLines,
      "",
      ...detailLines,
    ]
      .join("\n")
      .trim();

    setSubmittingComposer(true);
    setComposerError("");
    setComposerSuccess("");

    try {
      const response = await fetch(
        "/api/admin/investor-crm/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investor_id: investorId,
            activity_type: activityType,
            subject,
            details: composedDetails || null,
            occurred_at: occurredAtIso,
            due_at: dueAtIso,
            status,
            assigned_admin: assignedAdmin,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to record the activity."
        );
      }

      setComposerSuccess(
        composerTab === "NEXT_STEP"
          ? "Next step created and added to the operations queue."
          : "Activity recorded."
      );

      resetComposerAfterSuccess();

      onActivityUpdated();
    } catch (err) {
      setComposerError(
        err instanceof Error
          ? err.message
          : "Unable to record the activity."
      );
    } finally {
      setSubmittingComposer(false);
    }
  }

  const composerSubmitLabel = (() => {
    switch (composerTab) {
      case "CALL":
        return "Record Call";
      case "MEETING":
        return "Record Meeting";
      case "EMAIL":
        return "Record Email";
      case "DOCUMENT":
        return "Record Document";
      case "COMMITMENT":
        return "Record Commitment";
      case "OBJECTION":
        return "Record Objection";
      case "NEXT_STEP":
        return "Create Next Step";
      default:
        return "Record";
    }
  })();

  const composerDisabled =
    submittingComposer ||
    !composerSubject.trim() ||
    (composerTab === "NEXT_STEP" && !nextStepDueAt);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            4G Decision Intelligence
          </p>

          <h3 className="mt-1 text-lg font-semibold text-white">
            Investor Decision Context
          </h3>
        </div>

        {context && (
          <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">
            {displayText(context.relationship.health)}
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">
          Loading decision context…
        </div>
      ) : !context ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">
          Decision context unavailable.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recommended next decision
                </p>

                <p className="mt-1 text-base font-bold text-white">
                  {displayText(
                    context.decision.recommended_action
                  )}
                </p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">
                {displayText(context.decision.priority)}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {context.decision.reason}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <DecisionMetric
              label="Expected"
              value={formatINR(
                context.capital.expected_investment_inr
              )}
            />

            <DecisionMetric
              label="Weighted"
              value={formatINR(
                context.capital.weighted_pipeline_inr
              )}
            />

            <DecisionMetric
              label="Probability"
              value={`${context.capital.probability_percent}%`}
            />

            <DecisionMetric
              label="Open Actions"
              value={String(
                context.obligations.open_count
              )}
              suffix={
                context.obligations.overdue_count > 0
                  ? `${context.obligations.overdue_count} overdue`
                  : undefined
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Relationship
              </p>

              <div className="mt-3 space-y-3 text-sm">
                <DecisionRow
                  label="Relationship health"
                  value={displayText(
                    context.relationship.health
                  )}
                />

                <DecisionRow
                  label="Last contact"
                  value={
                    context.relationship
                      .days_since_last_contact === null
                      ? "Not recorded"
                      : `${context.relationship.days_since_last_contact} days ago`
                  }
                />

                <DecisionRow
                  label="Recent activities"
                  value={String(
                    context.relationship
                      .recent_activity_count
                  )}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Intelligence Signals
              </p>

              {context.intelligence.signals.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No active relationship risks detected.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {context.intelligence.signals
                    .slice(0, 4)
                    .map((signal, index) => (
                      <div
                        key={`${signal.signal_type}-${index}`}
                        className="rounded-lg border border-slate-800 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-200">
                            {signal.title}
                          </span>

                          <span className="text-[10px] font-bold uppercase text-slate-500">
                            {signal.severity}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {signal.reason ||
                            signal.description ||
                            signal.recommended_action ||
                            "Relationship signal detected."}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Investor Score
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {context.investor_score.score}
                    <span className="ml-1 text-sm font-medium text-slate-500">
                      / 100
                    </span>
                  </p>
                </div>

                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                  {displayText(context.investor_score.band)}
                </span>
              </div>

              {context.investor_score.reasons.length > 0 && (
                <div className="mt-3 space-y-1">
                  {context.investor_score.reasons
                    .slice(0, 3)
                    .map((reason, index) => (
                      <p
                        key={`${reason}-${index}`}
                        className="text-xs leading-5 text-slate-400"
                      >
                        • {reason}
                      </p>
                    ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Recommended Action
                  </p>

                  <p className="mt-1 text-base font-bold text-white">
                    {displayText(
                      context.action_recommendation.title
                    )}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">
                  {displayText(
                    context.action_recommendation.urgency
                  )}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {context.action_recommendation.reason}
              </p>

              {context.action_recommendation.dueWithinHours !== null && (
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Suggested window:{" "}
                  {context.action_recommendation
                    .dueWithinHours < 24
                    ? `${context.action_recommendation.dueWithinHours} hours`
                    : `${Math.round(
                        context.action_recommendation
                          .dueWithinHours / 24
                      )} days`}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Risk & Attention
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {displayText(
                    context.decision_intelligence.riskLevel
                  )}
                </p>
              </div>

              {context.decision_intelligence.attentionReason && (
                <p className="max-w-xl text-sm leading-6 text-slate-400">
                  {
                    context.decision_intelligence
                      .attentionReason
                  }
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                CRM Timeline
              </p>

              <span className="text-xs text-slate-500">
                {context.crm_timeline.length} event
                {context.crm_timeline.length === 1
                  ? ""
                  : "s"}
              </span>
            </div>

            {context.crm_timeline.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No CRM activity has been recorded yet.
              </p>
            ) : (
              <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                {context.crm_timeline
                  .slice(0, 10)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="border-l border-slate-700 pl-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-200">
                          {displayText(
                            item.activityType
                          )}
                        </p>

                        <span className="text-xs text-slate-500">
                          {new Date(
                            item.occurredAt
                          ).toLocaleString()}
                        </span>
                      </div>

                      {item.subject && (
                        <p className="mt-1 text-sm text-slate-300">
                          {item.subject}
                        </p>
                      )}

                      {item.details && (
                        <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-500">
                          {item.details}
                        </p>
                      )}

                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                        {displayText(item.status)}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {context.obligations.items.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Open Operational Obligations
                </p>

                <a
                  href="/admin/investor-operations"
                  className="text-xs font-semibold text-cyan-400 underline"
                >
                  Open Operations
                </a>
              </div>

              {dueDateError && (
                <div className="mt-3 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                  {dueDateError}
                </div>
              )}

              <div className="mt-3 space-y-3">
                {context.obligations.items
                  .slice(0, 4)
                  .map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-lg border border-slate-800 p-3"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200">
                            {activity.subject ||
                              displayText(
                                activity.activity_type
                              )}
                          </p>

                          {activity.details && (
                            <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500">
                              {activity.details}
                            </p>
                          )}
                        </div>

                        <div className="w-full lg:max-w-sm">
                          <Field label="Due Date & Time">
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input
                                type="datetime-local"
                                value={
                                  activityDueDates[
                                    activity.id
                                  ] || ""
                                }
                                onChange={(event) => {
                                  setActivityDueDates(
                                    (current) => ({
                                      ...current,
                                      [activity.id]:
                                        event.target.value,
                                    })
                                  );
                                  setDueDateError("");
                                }}
                                className="input"
                                disabled={
                                  updatingDueDateId ===
                                  activity.id
                                }
                              />

                              <button
                                onClick={() =>
                                  void setActivityDueDate(
                                    activity.id
                                  )
                                }
                                disabled={
                                  updatingDueDateId ===
                                    activity.id ||
                                  !(
                                    activityDueDates[
                                      activity.id
                                    ] || ""
                                  ).trim()
                                }
                                className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updatingDueDateId ===
                                activity.id
                                  ? "Saving..."
                                  : "Set Due Date"}
                              </button>
                            </div>

                            <p className="mt-1 text-[11px] text-slate-600">
                              Current:{" "}
                              {activity.due_at
                                ? formatDateTime(
                                    activity.due_at
                                  )
                                : "No due date"}
                            </p>
                          </Field>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                setResolutionTarget({
                                  id: activity.id,
                                  subject:
                                    activity.subject ||
                                    activity.activity_type,
                                  action: "COMPLETED",
                                })
                              }
                              disabled={
                                updatingDueDateId ===
                                activity.id
                              }
                              className="rounded-lg border border-emerald-700/60 bg-emerald-950/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:border-emerald-500 hover:bg-emerald-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Mark Completed
                            </button>

                            <button
                              onClick={() =>
                                setResolutionTarget({
                                  id: activity.id,
                                  subject:
                                    activity.subject ||
                                    activity.activity_type,
                                  action: "CANCELLED",
                                })
                              }
                              disabled={
                                updatingDueDateId ===
                                activity.id
                              }
                              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 hover:border-slate-600 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Cancel Action
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 5B.5 — Record Investor Interaction */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Record Investor Interaction
              </p>

              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                5B.5
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Interaction Type">
                  <select
                    value={interactionType}
                    onChange={(event) => {
                      setInteractionType(
                        event.target.value as InteractionType
                      );
                      setInteractionError("");
                      setInteractionSuccess("");
                    }}
                    className="input"
                    disabled={recordingInteraction}
                  >
                    {INTERACTION_TYPES.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Occurred At (optional)">
                  <input
                    type="datetime-local"
                    value={interactionOccurredAt}
                    onChange={(event) => {
                      setInteractionOccurredAt(
                        event.target.value
                      );
                      setInteractionError("");
                      setInteractionSuccess("");
                    }}
                    className="input"
                    disabled={recordingInteraction}
                  />
                </Field>
              </div>

              <Field label="Subject">
                <input
                  value={interactionSubject}
                  onChange={(event) => {
                    setInteractionSubject(event.target.value);
                    setInteractionError("");
                    setInteractionSuccess("");
                  }}
                  placeholder="e.g. Introductory call with investment team"
                  className="input"
                  maxLength={300}
                  disabled={recordingInteraction}
                />
              </Field>

              <Field label="Details">
                <textarea
                  value={interactionDetails}
                  onChange={(event) => {
                    setInteractionDetails(event.target.value);
                    setInteractionError("");
                    setInteractionSuccess("");
                  }}
                  rows={4}
                  placeholder="Record what was discussed, agreed, or observed."
                  className="input resize-y"
                  disabled={recordingInteraction}
                />
              </Field>

              {interactionError && (
                <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                  {interactionError}
                </div>
              )}

              {interactionSuccess && (
                <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
                  {interactionSuccess}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => void recordInteraction()}
                  disabled={
                    recordingInteraction ||
                    !interactionSubject.trim()
                  }
                  className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {recordingInteraction
                    ? "Recording..."
                    : "Record Interaction"}
                </button>
              </div>
            </div>
          </div>

          {/* 5B.6 — Add Internal CRM Note */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Add Internal CRM Note
              </p>

              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                5B.6
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Internal commentary visible to the founder and team
              only. No interaction with the investor is implied.
            </p>

            <div className="mt-4 space-y-3">
              <Field label="Note">
                <textarea
                  value={noteBody}
                  onChange={(event) => {
                    setNoteBody(event.target.value);
                    setNoteError("");
                    setNoteSuccess("");
                  }}
                  rows={4}
                  placeholder="Record an internal observation, decision context, or reminder."
                  className="input resize-y"
                  disabled={savingNote}
                  maxLength={10000}
                />
              </Field>

              {noteError && (
                <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                  {noteError}
                </div>
              )}

              {noteSuccess && (
                <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
                  {noteSuccess}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => void saveInternalNote()}
                  disabled={savingNote || !noteBody.trim()}
                  className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          </div>

          {/* 5B.7 — 5B.13 — Unified Activity Composer */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Activity Composer
              </p>

              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                5B.7 — 5B.13
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Record a specific kind of institutional activity.
              Each tab captures the fields relevant to that activity
              type and preserves them in the CRM timeline.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {COMPOSER_TABS.map((tab) => {
                const active = composerTab === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setComposerTab(tab.value);
                      clearComposerMessages();
                    }}
                    disabled={submittingComposer}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      active
                        ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-200"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        active
                          ? "bg-cyan-400/20 text-cyan-100"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {tab.step}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-4">
              {composerTab === "CALL" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Call Outcome">
                    <select
                      value={callOutcome}
                      onChange={(event) => {
                        setCallOutcome(
                          event.target.value as CallOutcome
                        );
                        clearComposerMessages();
                      }}
                      className="input"
                      disabled={submittingComposer}
                    >
                      <option value="CONNECTED">Connected</option>
                      <option value="NO_ANSWER">No Answer</option>
                      <option value="LEFT_MESSAGE">
                        Left Message
                      </option>
                      <option value="CALLBACK_REQUESTED">
                        Callback Requested
                      </option>
                    </select>
                  </Field>

                  <Field label="Duration (minutes, optional)">
                    <input
                      type="number"
                      min="0"
                      value={callDurationMinutes}
                      onChange={(event) => {
                        setCallDurationMinutes(
                          event.target.value
                        );
                        clearComposerMessages();
                      }}
                      placeholder="e.g. 30"
                      className="input"
                      disabled={submittingComposer}
                    />
                  </Field>
                </div>
              )}

              {composerTab === "MEETING" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Location (optional)">
                    <input
                      value={meetingLocation}
                      onChange={(event) => {
                        setMeetingLocation(
                          event.target.value
                        );
                        clearComposerMessages();
                      }}
                      placeholder="e.g. Virtual / Mumbai office"
                      className="input"
                      maxLength={200}
                      disabled={submittingComposer}
                    />
                  </Field>

                  <Field label="Attendees (optional)">
                    <input
                      value={meetingAttendees}
                      onChange={(event) => {
                        setMeetingAttendees(
                          event.target.value
                        );
                        clearComposerMessages();
                      }}
                      placeholder="e.g. Founder, Investment Lead"
                      className="input"
                      maxLength={300}
                      disabled={submittingComposer}
                    />
                  </Field>
                </div>
              )}

              {composerTab === "EMAIL" && (
                <Field label="Direction">
                  <select
                    value={emailDirection}
                    onChange={(event) => {
                      setEmailDirection(
                        event.target.value as EmailDirection
                      );
                      clearComposerMessages();
                    }}
                    className="input"
                    disabled={submittingComposer}
                  >
                    <option value="OUTBOUND">
                      Outbound (sent to investor)
                    </option>
                    <option value="INBOUND">
                      Inbound (received from investor)
                    </option>
                  </select>
                </Field>
              )}

              {composerTab === "DOCUMENT" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Document Action">
                    <select
                      value={documentAction}
                      onChange={(event) => {
                        setDocumentAction(
                          event.target.value as DocumentAction
                        );
                        clearComposerMessages();
                      }}
                      className="input"
                      disabled={submittingComposer}
                    >
                      <option value="SENT">Sent</option>
                      <option value="VIEWED">Viewed</option>
                      <option value="DISCUSSED">Discussed</option>
                      <option value="REQUESTED">Requested</option>
                    </select>
                  </Field>

                  <Field label="Document Name (optional)">
                    <input
                      value={documentName}
                      onChange={(event) => {
                        setDocumentName(
                          event.target.value
                        );
                        clearComposerMessages();
                      }}
                      placeholder="e.g. Institutional Overview PDF"
                      className="input"
                      maxLength={200}
                      disabled={submittingComposer}
                    />
                  </Field>
                </div>
              )}

              {composerTab === "COMMITMENT" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Commitment Amount (₹, optional)">
                    <input
                      type="number"
                      min="0"
                      value={commitmentAmount}
                      onChange={(event) => {
                        setCommitmentAmount(
                          event.target.value
                        );
                        clearComposerMessages();
                      }}
                      placeholder="e.g. 5000000"
                      className="input"
                      disabled={submittingComposer}
                    />
                  </Field>

                  <Field label="Expected Date (optional)">
                    <input
                      type="date"
                      value={commitmentExpectedDate}
                      onChange={(event) => {
                        setCommitmentExpectedDate(
                          event.target.value
                        );
                        clearComposerMessages();
                      }}
                      className="input"
                      disabled={submittingComposer}
                    />
                  </Field>
                </div>
              )}

              {composerTab === "OBJECTION" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Objection Category">
                    <select
                      value={objectionCategory}
                      onChange={(event) => {
                        setObjectionCategory(
                          event.target
                            .value as ObjectionCategory
                        );
                        clearComposerMessages();
                      }}
                      className="input"
                      disabled={submittingComposer}
                    >
                      <option value="VALUATION">Valuation</option>
                      <option value="TIMING">Timing</option>
                      <option value="TEAM">Team</option>
                      <option value="MARKET">Market</option>
                      <option value="STRUCTURE">Structure</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </Field>

                  <Field label="Severity">
                    <select
                      value={objectionSeverity}
                      onChange={(event) => {
                        setObjectionSeverity(
                          event.target
                            .value as ObjectionSeverity
                        );
                        clearComposerMessages();
                      }}
                      className="input"
                      disabled={submittingComposer}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </Field>
                </div>
              )}

              {composerTab === "NEXT_STEP" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Due Date & Time">
                    <input
                      type="datetime-local"
                      value={nextStepDueAt}
                      onChange={(event) => {
                        setNextStepDueAt(
                          event.target.value
                        );
                        clearComposerMessages();
                      }}
                      className="input"
                      disabled={submittingComposer}
                    />
                  </Field>

                  <Field label="Owner">
                    <input
                      value={nextStepAssignee}
                      onChange={(event) => {
                        setNextStepAssignee(
                          event.target.value
                        );
                        clearComposerMessages();
                      }}
                      placeholder="e.g. Founder"
                      className="input"
                      maxLength={200}
                      disabled={submittingComposer}
                    />
                  </Field>
                </div>
              )}

              <Field label="Subject">
                <input
                  value={composerSubject}
                  onChange={(event) => {
                    setComposerSubject(event.target.value);
                    clearComposerMessages();
                  }}
                  placeholder={
                    composerTab === "CALL"
                      ? "e.g. Follow-up call with investment team"
                      : composerTab === "MEETING"
                        ? "e.g. Diligence meeting with fund partners"
                        : composerTab === "EMAIL"
                          ? "e.g. Sent financial model update"
                          : composerTab === "DOCUMENT"
                            ? "e.g. Sent updated investor memorandum"
                            : composerTab === "COMMITMENT"
                              ? "e.g. Verbal commitment received"
                              : composerTab === "OBJECTION"
                                ? "e.g. Valuation concerns raised"
                                : "e.g. Share cap table with counsel"
                  }
                  className="input"
                  maxLength={300}
                  disabled={submittingComposer}
                />
              </Field>

              <Field
                label={
                  composerTab === "NEXT_STEP"
                    ? "Context (optional)"
                    : "Details (optional)"
                }
              >
                <textarea
                  value={composerDetails}
                  onChange={(event) => {
                    setComposerDetails(event.target.value);
                    clearComposerMessages();
                  }}
                  rows={4}
                  placeholder={
                    composerTab === "OBJECTION"
                      ? "Record the objection, how it was framed, and any response already given."
                      : composerTab === "NEXT_STEP"
                        ? "Add the operational context for this next step."
                        : "Record the context, key discussion points, and outcomes."
                  }
                  className="input resize-y"
                  disabled={submittingComposer}
                  maxLength={10000}
                />
              </Field>

              <Field label="Occurred At (optional)">
                <input
                  type="datetime-local"
                  value={composerOccurredAt}
                  onChange={(event) => {
                    setComposerOccurredAt(event.target.value);
                    clearComposerMessages();
                  }}
                  className="input"
                  disabled={submittingComposer}
                />
              </Field>

              {composerTab === "NEXT_STEP" && (
                <p className="text-[11px] leading-5 text-slate-500">
                  Next steps are saved as operational actions and
                  will immediately appear in the Investor
                  Operations queue.
                </p>
              )}

              {composerError && (
                <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                  {composerError}
                </div>
              )}

              {composerSuccess && (
                <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
                  {composerSuccess}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => void submitComposer()}
                  disabled={composerDisabled}
                  className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingComposer
                    ? "Recording..."
                    : composerSubmitLabel}
                </button>
              </div>
            </div>
          </div>

          {context.recent_activities.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Recent Relationship History
              </p>

              <div className="mt-3 divide-y divide-slate-800">
                {context.recent_activities
                  .slice(0, 6)
                  .map((activity) => (
                    <div
                      key={activity.id}
                      className="py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-400">
                          {displayText(
                            activity.activity_type
                          )}
                        </span>

                        <span className="text-[11px] text-slate-600">
                          {formatDateTime(
                            activity.occurred_at ||
                              activity.created_at
                          )}
                        </span>
                      </div>

                      {activity.subject && (
                        <p className="mt-1 text-sm font-medium text-slate-300">
                          {activity.subject}
                        </p>
                      )}

                      {activity.details && (
                        <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-500">
                          {activity.details}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 5C.13 — Per-investor audit panel */}
          <InvestorAuditPanel investorId={investorId} />

          {/* 3.5D — Data room operations summary */}
          <DataRoomOperationsPanel investorId={investorId} />

          <div className="flex flex-wrap gap-2">
            <a
              href="/admin/investor-operations"
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Operations
            </a>

            <a
              href="/admin/investor-audit"
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Audit Trail
            </a>

            <a
              href="/admin/investor-communications"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
            >
              Communications
            </a>
          </div>
        </div>
      )}

      {/* 5C.4 / 5C.5 — Resolution Modal */}
      <ResolutionModal
        target={resolutionTarget}
        onClose={() => setResolutionTarget(null)}
        onSuccess={() => {
          onActivityUpdated();
        }}
      />
    </section>
  );
}

function DecisionMetric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 font-bold text-slate-200">
        {value}
      </p>

      {suffix && (
        <p className="mt-1 text-[10px] font-semibold text-red-400">
          {suffix}
        </p>
      )}
    </div>
  );
}

function DecisionRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>

      <span className="text-right font-medium text-slate-300">
        {value}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 truncate text-lg font-semibold text-slate-100">
        {value}
      </p>
    </div>
  );
}

function InvestorCard({
  investor,
  onClick,
}: {
  investor: InvestorProfile;
  onClick: () => void;
}) {
  const crm = investor.crm;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-100">
            {investor.full_name}
          </h3>

          <p className="mt-1 truncate text-xs text-slate-500">
            {investor.organization ||
              investor.investor_type ||
              "Investor"}
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-slate-700 px-2 py-1 text-[10px] text-slate-400">
          {investor.verification_status ||
            "PENDING"}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <Row
          label="Expected"
          value={formatINR(
            crm?.expected_investment_inr ??
              investor.proposed_ticket_inr
          )}
        />

        <Row
          label="Probability"
          value={`${crm?.probability_percent ?? 10}%`}
        />

        <Row
          label="Last contact"
          value={formatDate(
            crm?.last_contact_date
          )}
        />
      </div>

      {crm?.next_action && (
        <div className="mt-4 rounded-lg bg-slate-900 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Next action
          </p>

          <p className="mt-1 line-clamp-2 text-xs text-slate-300">
            {crm.next_action}
          </p>
        </div>
      )}
    </button>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-600">
        {label}
      </span>

      <span className="truncate text-right text-slate-300">
        {value}
      </span>
    </div>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </h3>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800/70 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-600">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-xs text-slate-300">
        {value || "—"}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-slate-500">
        {label}
      </span>

      {children}
    </label>
  );
}