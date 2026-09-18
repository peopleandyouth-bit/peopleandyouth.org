"use client";

import { useCallback, useEffect, useState } from "react";

type AccessRequest = {
  id: string;
  scope: string;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "DECLINED";
  decided_at: string | null;
  created_at: string;
};

type AccessState = {
  has_dd_access: boolean;
  verified: boolean;
  approved: boolean;
};

const SCOPE_LABELS: Record<string, string> = {
  DUE_DILIGENCE: "Due Diligence",
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function InvestorPortalAccessPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [accessState, setAccessState] = useState<AccessState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitNotice, setSubmitNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [docsResponse, requestsResponse] = await Promise.all([
        fetch("/api/investor-portal/documents", { cache: "no-store" }),
        fetch("/api/investor-portal/access-requests", {
          cache: "no-store",
        }),
      ]);

      const docsData = await docsResponse.json();
      const requestsData = await requestsResponse.json();

      if (docsResponse.ok && docsData.success) {
        setAccessState(docsData.access ?? null);
      }

      if (requestsResponse.ok && requestsData.success) {
        setRequests(requestsData.requests ?? []);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load access information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const pendingDdRequest = requests.find(
    (r) => r.scope === "DUE_DILIGENCE" && r.status === "PENDING"
  );

  async function submitRequest() {
    setSubmitting(true);
    setSubmitError("");
    setSubmitNotice("");

    try {
      const response = await fetch(
        "/api/investor-portal/access-requests",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scope: "DUE_DILIGENCE",
            reason: requestReason.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ?? "Unable to submit the request."
        );
      }

      if (data.duplicate) {
        setSubmitNotice(
          "A request for Due Diligence access is already pending review."
        );
      } else {
        setSubmitNotice(
          "Your request has been submitted. Investor Relations will respond."
        );
      }

      setShowRequestForm(false);
      setRequestReason("");
      await loadData();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Unable to submit the request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Access
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          Your access to People &amp; Youth materials.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          Your portal access grants you visibility into institutional and
          investor materials. Additional access tiers — such as Due
          Diligence — are granted by Investor Relations on request.
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-[#f5f0e6]/[0.03]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-6 py-4 text-sm text-red-200">
          {error}
        </div>
      ) : (
        <>
          {/* Current access */}
          <section className="border-t border-[#f5f0e6]/8 pt-8">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
              Current access
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <AccessCard
                label="Verification"
                value={accessState?.verified ? "Verified" : "Pending"}
                active={Boolean(accessState?.verified)}
              />
              <AccessCard
                label="Portal approval"
                value={accessState?.approved ? "Approved" : "Pending"}
                active={Boolean(accessState?.approved)}
              />
              <AccessCard
                label="Due Diligence"
                value={
                  accessState?.has_dd_access
                    ? "Granted"
                    : pendingDdRequest
                      ? "Requested"
                      : "Not granted"
                }
                active={Boolean(accessState?.has_dd_access)}
              />
            </div>
          </section>

          {/* Request DD access */}
          {!accessState?.has_dd_access && (
            <section className="border-t border-[#f5f0e6]/8 pt-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
                Due Diligence access
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#f5f0e6]/55">
                Due Diligence access is granted by Investor Relations on
                a per-investor basis. If you are considering a
                commitment and would like to review the institutional,
                operational and financial materials, you may request
                access here.
              </p>

              {submitNotice && (
                <div className="mt-6 rounded-lg border border-[#c8a56b]/30 bg-[#c8a56b]/[0.06] px-4 py-3 text-xs leading-5 text-[#f5f0e6]/75">
                  {submitNotice}
                </div>
              )}

              {pendingDdRequest ? (
                <div className="mt-6 rounded-2xl border border-[#f5f0e6]/10 bg-[#f5f0e6]/[0.02] px-5 py-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#c8a56b]/70">
                    Request pending
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f5f0e6]/65">
                    Your request for Due Diligence access was submitted
                    on {formatDateTime(pendingDdRequest.created_at)}.
                    Investor Relations will respond shortly.
                  </p>
                </div>
              ) : showRequestForm ? (
                <div className="mt-6 rounded-2xl border border-[#f5f0e6]/10 bg-[#f5f0e6]/[0.02] px-5 py-5">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[#f5f0e6]/45">
                      Reason (optional)
                    </span>
                    <textarea
                      value={requestReason}
                      onChange={(e) => {
                        setRequestReason(e.target.value);
                        setSubmitError("");
                      }}
                      rows={4}
                      placeholder="Provide context for your request, if you wish."
                      className="mt-2 w-full resize-none rounded-lg border border-[#f5f0e6]/10 bg-[#0e1628] px-4 py-3 text-sm leading-6 text-[#f5f0e6] outline-none transition placeholder:text-[#f5f0e6]/20 focus:border-[#c8a56b]/60"
                    />
                  </label>

                  {submitError && (
                    <div className="mt-3 rounded-lg border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200">
                      {submitError}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => void submitRequest()}
                      disabled={submitting}
                      className="rounded-lg bg-[#c8a56b] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[#0a1020] transition hover:bg-[#d8b57b] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Submitting…" : "Submit request"}
                    </button>
                    <button
                      onClick={() => {
                        setShowRequestForm(false);
                        setRequestReason("");
                        setSubmitError("");
                      }}
                      disabled={submitting}
                      className="rounded-lg border border-[#f5f0e6]/10 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-[#f5f0e6]/55 transition hover:border-[#f5f0e6]/25 hover:text-[#f5f0e6] disabled:opacity-40"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="rounded-lg border border-[#c8a56b]/40 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-[#c8a56b] transition hover:bg-[#c8a56b]/10"
                  >
                    Request Due Diligence access
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Request history */}
          {requests.length > 0 && (
            <section className="border-t border-[#f5f0e6]/8 pt-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
                Request history
              </p>

              <ul className="mt-6 divide-y divide-[#f5f0e6]/6">
                {requests.map((req) => (
                  <li
                    key={req.id}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#f5f0e6]">
                        {SCOPE_LABELS[req.scope] ?? req.scope}
                      </p>
                      {req.reason && (
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-[#f5f0e6]/45">
                          {req.reason}
                        </p>
                      )}
                      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#f5f0e6]/35">
                        Submitted {formatDateTime(req.created_at)}
                      </p>
                    </div>

                    <span
                      className={`self-start rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                        req.status === "APPROVED"
                          ? "border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-300"
                          : req.status === "DECLINED"
                            ? "border-red-400/25 bg-red-400/[0.06] text-red-300"
                            : "border-[#c8a56b]/30 bg-[#c8a56b]/[0.06] text-[#c8a56b]"
                      }`}
                    >
                      {req.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function AccessCard({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="border-t border-[#f5f0e6]/8 pt-5">
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5f0e6]/40">
        {label}
      </p>
      <p
        className={`mt-2 text-lg font-light ${
          active ? "text-[#c8a56b]" : "text-[#f5f0e6]/55"
        }`}
      >
        {value}
      </p>
    </div>
  );
}