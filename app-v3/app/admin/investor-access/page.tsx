"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type InvestorRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  organization: string | null;
  verification_status: string | null;
  access_level: string | null;
  created_at: string | null;
  dd_access: {
    id: string;
    granted_at: string;
    granted_by: string | null;
    notes: string | null;
  } | null;
};

type AccessRequestRow = {
  id: string;
  investor_id: string;
  scope: string;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "DECLINED";
  decided_at: string | null;
  decided_by: string | null;
  created_at: string;
  investor: {
    id: string;
    full_name: string | null;
    email: string | null;
    organization: string | null;
  } | null;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function investorDisplayName(row: {
  full_name: string | null;
  email: string | null;
  organization: string | null;
}) {
  return row.full_name || row.organization || row.email || "Investor";
}

type Tab = "GRANTS" | "REQUESTS";

export default function AdminInvestorAccessPage() {
  const [investors, setInvestors] = useState<InvestorRow[]>([]);
  const [requests, setRequests] = useState<AccessRequestRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState<Tab>("GRANTS");
  const [search, setSearch] = useState("");
  const [grantsFilter, setGrantsFilter] = useState<
    "ALL" | "GRANTED" | "NOT_GRANTED"
  >("ALL");

  const [busyInvestorId, setBusyInvestorId] = useState<string | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);

  const [grantDialogInvestor, setGrantDialogInvestor] =
    useState<InvestorRow | null>(null);
  const [grantNotes, setGrantNotes] = useState("");
  const [grantError, setGrantError] = useState("");

  const [revokeDialogInvestor, setRevokeDialogInvestor] =
    useState<InvestorRow | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeError, setRevokeError] = useState("");

  const [decisionDialogRequest, setDecisionDialogRequest] =
    useState<AccessRequestRow | null>(null);
  const [decisionType, setDecisionType] = useState<
    "APPROVED" | "DECLINED"
  >("APPROVED");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [decisionError, setDecisionError] = useState("");

  const [notice, setNotice] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [grantsRes, requestsRes] = await Promise.all([
        fetch("/api/admin/investor-dd-access", { cache: "no-store" }),
        fetch("/api/admin/investor-access-requests", {
          cache: "no-store",
        }),
      ]);

      const grantsData = await grantsRes.json();
      const requestsData = await requestsRes.json();

      if (!grantsRes.ok || !grantsData.success) {
        throw new Error(
          grantsData?.error ?? "Unable to load DD access data."
        );
      }

      if (!requestsRes.ok || !requestsData.success) {
        throw new Error(
          requestsData?.error ?? "Unable to load access requests."
        );
      }

      setInvestors(grantsData.investors ?? []);
      setRequests(requestsData.requests ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load access control data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filteredInvestors = useMemo(() => {
    const q = search.trim().toLowerCase();

    return investors.filter((inv) => {
      if (grantsFilter === "GRANTED" && !inv.dd_access) return false;
      if (grantsFilter === "NOT_GRANTED" && inv.dd_access) return false;

      if (!q) return true;

      return [
        inv.full_name,
        inv.email,
        inv.organization,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [investors, search, grantsFilter]);

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "PENDING"),
    [requests]
  );
  const decidedRequests = useMemo(
    () => requests.filter((r) => r.status !== "PENDING"),
    [requests]
  );

  const grantedCount = investors.filter((i) => i.dd_access).length;

  async function submitGrant() {
    if (!grantDialogInvestor) return;
    setBusyInvestorId(grantDialogInvestor.id);
    setGrantError("");
    setNotice("");

    try {
      const response = await fetch(
        "/api/admin/investor-dd-access",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investor_id: grantDialogInvestor.id,
            notes: grantNotes.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? "Unable to grant DD access.");
      }

      setNotice(
        data.duplicate
          ? "DD access was already granted."
          : "DD access granted."
      );
      setGrantDialogInvestor(null);
      setGrantNotes("");
      await loadAll();
    } catch (err) {
      setGrantError(
        err instanceof Error
          ? err.message
          : "Unable to grant DD access."
      );
    } finally {
      setBusyInvestorId(null);
    }
  }

  async function submitRevoke() {
    if (!revokeDialogInvestor) return;
    setBusyInvestorId(revokeDialogInvestor.id);
    setRevokeError("");
    setNotice("");

    try {
      const response = await fetch(
        "/api/admin/investor-dd-access",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investor_id: revokeDialogInvestor.id,
            reason: revokeReason.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? "Unable to revoke DD access.");
      }

      setNotice("DD access revoked.");
      setRevokeDialogInvestor(null);
      setRevokeReason("");
      await loadAll();
    } catch (err) {
      setRevokeError(
        err instanceof Error
          ? err.message
          : "Unable to revoke DD access."
      );
    } finally {
      setBusyInvestorId(null);
    }
  }

  async function submitDecision() {
    if (!decisionDialogRequest) return;
    setBusyRequestId(decisionDialogRequest.id);
    setDecisionError("");
    setNotice("");

    try {
      const response = await fetch(
        "/api/admin/investor-access-requests",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: decisionDialogRequest.id,
            decision: decisionType,
            notes: decisionNotes.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ?? "Unable to record the decision."
        );
      }

      setNotice(
        decisionType === "APPROVED"
          ? "Access request approved."
          : "Access request declined."
      );
      setDecisionDialogRequest(null);
      setDecisionNotes("");
      await loadAll();
    } catch (err) {
      setDecisionError(
        err instanceof Error
          ? err.message
          : "Unable to record the decision."
      );
    } finally {
      setBusyRequestId(null);
    }
  }

  function openDecision(
    request: AccessRequestRow,
    decision: "APPROVED" | "DECLINED"
  ) {
    setDecisionDialogRequest(request);
    setDecisionType(decision);
    setDecisionNotes("");
    setDecisionError("");
  }

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300">
                  Investor Access Control
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Due Diligence Access
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Grant or revoke Due Diligence access. Review and decide on
                investor-initiated access requests. Every action writes an
                audit event.
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
                href="/admin/investor-crm"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Open CRM
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

        {/* Summary tiles */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Investors with DD access
            </p>
            <p className="mt-3 text-3xl font-semibold text-violet-300">
              {grantedCount}
            </p>
            <p className="mt-1 text-xs text-white/35">
              of {investors.length} total
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Pending requests
            </p>
            <p className="mt-3 text-3xl font-semibold text-amber-300">
              {pendingRequests.length}
            </p>
            <p className="mt-1 text-xs text-white/35">
              awaiting decision
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Decided requests
            </p>
            <p className="mt-3 text-3xl font-semibold text-white/80">
              {decidedRequests.length}
            </p>
            <p className="mt-1 text-xs text-white/35">
              lifetime
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTab("GRANTS")}
            className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
              tab === "GRANTS"
                ? "border-violet-300/40 bg-violet-300/[0.08] text-violet-200"
                : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white"
            }`}
          >
            Access grants ({investors.length})
          </button>
          <button
            onClick={() => setTab("REQUESTS")}
            className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
              tab === "REQUESTS"
                ? "border-violet-300/40 bg-violet-300/[0.08] text-violet-200"
                : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white"
            }`}
          >
            Access requests ({requests.length})
          </button>
        </section>

        {/* GRANTS TAB */}
        {tab === "GRANTS" && (
          <>
            <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Search
                  </label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name, email, or organisation"
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-300/40"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    DD Access
                  </label>
                  <select
                    value={grantsFilter}
                    onChange={(e) =>
                      setGrantsFilter(
                        e.target.value as
                          | "ALL"
                          | "GRANTED"
                          | "NOT_GRANTED"
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-violet-300/40"
                  >
                    <option value="ALL" className="bg-[#0c111d]">
                      All investors
                    </option>
                    <option value="GRANTED" className="bg-[#0c111d]">
                      With DD access
                    </option>
                    <option value="NOT_GRANTED" className="bg-[#0c111d]">
                      Without DD access
                    </option>
                  </select>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
              <div className="border-b border-white/10 px-6 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  {filteredInvestors.length} investor
                  {filteredInvestors.length === 1 ? "" : "s"}
                </p>
              </div>

              {loading ? (
                <div className="space-y-2 p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-2xl bg-white/[0.025]"
                    />
                  ))}
                </div>
              ) : filteredInvestors.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm text-white/50">
                    No investors match the current filter.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {filteredInvestors.map((inv) => {
                    const hasDd = Boolean(inv.dd_access);
                    const eligible =
                      inv.verification_status === "VERIFIED" &&
                      inv.access_level === "APPROVED";
                    const busy = busyInvestorId === inv.id;

                    return (
                      <li
                        key={inv.id}
                        className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-white/[0.02]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.06] text-xs font-semibold text-violet-200">
                          {(inv.full_name || inv.email || "?")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-white/85">
                              {investorDisplayName(inv)}
                            </span>

                            {hasDd ? (
                              <span className="rounded-full border border-violet-300/25 bg-violet-300/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-violet-200">
                                DD Access
                              </span>
                            ) : (
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/40">
                                No DD
                              </span>
                            )}

                            {!eligible && (
                              <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                                Not eligible
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-white/40">
                            {inv.email || "—"}
                            {inv.organization
                              ? ` · ${inv.organization}`
                              : ""}
                          </p>

                          {hasDd && inv.dd_access && (
                            <p className="mt-1 text-[10px] text-white/30">
                              Granted {formatDateTime(inv.dd_access.granted_at)}
                              {inv.dd_access.granted_by
                                ? ` by ${inv.dd_access.granted_by}`
                                : ""}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 gap-2">
                          {hasDd ? (
                            <button
                              onClick={() => {
                                setRevokeDialogInvestor(inv);
                                setRevokeReason("");
                                setRevokeError("");
                              }}
                              disabled={busy}
                              className="rounded-lg border border-red-300/25 bg-red-300/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-300 transition hover:bg-red-300/[0.12] disabled:opacity-40"
                            >
                              Revoke DD
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setGrantDialogInvestor(inv);
                                setGrantNotes("");
                                setGrantError("");
                              }}
                              disabled={busy || !eligible}
                              title={
                                !eligible
                                  ? "Investor must be VERIFIED and APPROVED"
                                  : undefined
                              }
                              className="rounded-lg border border-violet-300/25 bg-violet-300/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-violet-200 transition hover:bg-violet-300/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Grant DD
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}

        {/* REQUESTS TAB */}
        {tab === "REQUESTS" && (
          <div className="space-y-8">
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
              <div className="border-b border-white/10 px-6 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Pending requests ({pendingRequests.length})
                </p>
              </div>

              {loading ? (
                <div className="space-y-2 p-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-2xl bg-white/[0.025]"
                    />
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm text-white/50">
                    No pending access requests.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.06]">
                  {pendingRequests.map((req) => {
                    const busy = busyRequestId === req.id;

                    return (
                      <li key={req.id} className="px-6 py-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-white/85">
                                {req.investor
                                  ? investorDisplayName(req.investor)
                                  : "Investor"}
                              </span>
                              <span className="rounded-full border border-violet-300/25 bg-violet-300/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-violet-200">
                                {req.scope.replace(/_/g, " ")}
                              </span>
                            </div>

                            <p className="mt-1 text-[10px] text-white/35">
                              Requested{" "}
                              {formatDateTime(req.created_at)}
                            </p>

                            {req.reason && (
                              <p className="mt-3 max-w-2xl whitespace-pre-line text-xs leading-5 text-white/55">
                                {req.reason}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() =>
                                openDecision(req, "APPROVED")
                              }
                              disabled={busy}
                              className="rounded-lg border border-emerald-300/25 bg-emerald-300/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-300/[0.12] disabled:opacity-40"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                openDecision(req, "DECLINED")
                              }
                              disabled={busy}
                              className="rounded-lg border border-red-300/25 bg-red-300/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-300 transition hover:bg-red-300/[0.12] disabled:opacity-40"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {decidedRequests.length > 0 && (
              <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
                <div className="border-b border-white/10 px-6 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                    Decision history ({decidedRequests.length})
                  </p>
                </div>

                <ul className="divide-y divide-white/[0.06]">
                  {decidedRequests.map((req) => (
                    <li
                      key={req.id}
                      className="flex flex-wrap items-center gap-4 px-6 py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white/80">
                            {req.investor
                              ? investorDisplayName(req.investor)
                              : "Investor"}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/50">
                            {req.scope.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                              req.status === "APPROVED"
                                ? "border-emerald-300/25 bg-emerald-300/[0.06] text-emerald-300"
                                : "border-red-300/25 bg-red-300/[0.06] text-red-300"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-white/35">
                          Decided {formatDateTime(req.decided_at)}
                          {req.decided_by ? ` by ${req.decided_by}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* GRANT DIALOG */}
        {grantDialogInvestor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
            <button
              aria-label="Close"
              className="absolute inset-0 cursor-default"
              onClick={() => {
                if (!busyInvestorId) {
                  setGrantDialogInvestor(null);
                  setGrantError("");
                }
              }}
            />
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0c111d] shadow-2xl">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300/70">
                  Grant Due Diligence access
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {investorDisplayName(grantDialogInvestor)}
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  This grants the investor access to documents marked
                  DD_APPROVED. The action is audit-logged.
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Notes (optional)
                  </span>
                  <textarea
                    value={grantNotes}
                    onChange={(e) => {
                      setGrantNotes(e.target.value);
                      setGrantError("");
                    }}
                    rows={3}
                    placeholder="Context for the grant, e.g. reason for DD access."
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-300/40"
                  />
                </label>

                {grantError && (
                  <div className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200">
                    {grantError}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-5">
                <button
                  onClick={() => {
                    setGrantDialogInvestor(null);
                    setGrantError("");
                  }}
                  disabled={Boolean(busyInvestorId)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void submitGrant()}
                  disabled={Boolean(busyInvestorId)}
                  className="rounded-xl bg-violet-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-violet-200 disabled:opacity-40"
                >
                  {busyInvestorId ? "Granting…" : "Grant access"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REVOKE DIALOG */}
        {revokeDialogInvestor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
            <button
              aria-label="Close"
              className="absolute inset-0 cursor-default"
              onClick={() => {
                if (!busyInvestorId) {
                  setRevokeDialogInvestor(null);
                  setRevokeError("");
                }
              }}
            />
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0c111d] shadow-2xl">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-300/80">
                  Revoke Due Diligence access
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {investorDisplayName(revokeDialogInvestor)}
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  The investor will lose access to DD_APPROVED documents.
                  This action is audit-logged.
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Reason (optional)
                  </span>
                  <textarea
                    value={revokeReason}
                    onChange={(e) => {
                      setRevokeReason(e.target.value);
                      setRevokeError("");
                    }}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-red-300/40"
                  />
                </label>

                {revokeError && (
                  <div className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200">
                    {revokeError}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-5">
                <button
                  onClick={() => {
                    setRevokeDialogInvestor(null);
                    setRevokeError("");
                  }}
                  disabled={Boolean(busyInvestorId)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void submitRevoke()}
                  disabled={Boolean(busyInvestorId)}
                  className="rounded-xl bg-red-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-red-300 disabled:opacity-40"
                >
                  {busyInvestorId ? "Revoking…" : "Revoke access"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DECISION DIALOG */}
        {decisionDialogRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
            <button
              aria-label="Close"
              className="absolute inset-0 cursor-default"
              onClick={() => {
                if (!busyRequestId) {
                  setDecisionDialogRequest(null);
                  setDecisionError("");
                }
              }}
            />
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0c111d] shadow-2xl">
              <div className="border-b border-white/10 px-6 py-5">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    decisionType === "APPROVED"
                      ? "text-emerald-300/80"
                      : "text-red-300/80"
                  }`}
                >
                  {decisionType === "APPROVED"
                    ? "Approve access request"
                    : "Decline access request"}
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {decisionDialogRequest.investor
                    ? investorDisplayName(
                        decisionDialogRequest.investor
                      )
                    : "Investor"}
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  {decisionType === "APPROVED"
                    ? "Approving a Due Diligence request will also grant DD access."
                    : "Declining will close the request without granting access."}
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Notes (optional)
                  </span>
                  <textarea
                    value={decisionNotes}
                    onChange={(e) => {
                      setDecisionNotes(e.target.value);
                      setDecisionError("");
                    }}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  />
                </label>

                {decisionError && (
                  <div className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200">
                    {decisionError}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-5">
                <button
                  onClick={() => {
                    setDecisionDialogRequest(null);
                    setDecisionError("");
                  }}
                  disabled={Boolean(busyRequestId)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void submitDecision()}
                  disabled={Boolean(busyRequestId)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-black transition disabled:opacity-40 ${
                    decisionType === "APPROVED"
                      ? "bg-emerald-300 hover:bg-emerald-200"
                      : "bg-red-400 hover:bg-red-300"
                  }`}
                >
                  {busyRequestId
                    ? "Saving…"
                    : decisionType === "APPROVED"
                      ? "Approve"
                      : "Decline"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}