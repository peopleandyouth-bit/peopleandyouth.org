"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type UploadSummary = {
  id: string;
  request_id: string | null;
  file_name: string;
  file_path: string;
  file_size_bytes: number | null;
  file_type: string | null;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  review_notes: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
};

type UploadRequestRow = {
  id: string;
  investor_id: string;
  title: string;
  description: string | null;
  status: "OPEN" | "SUBMITTED" | "COMPLETED" | "CANCELLED";
  due_at: string | null;
  created_at: string;
  completed_at: string | null;
  created_by: string | null;
  investor: {
    id: string;
    full_name: string | null;
    email: string | null;
    organization: string | null;
  } | null;
  uploads: UploadSummary[];
};

type InvestorOption = {
  id: string;
  full_name: string | null;
  email: string | null;
  organization: string | null;
  verification_status: string | null;
  access_level: string | null;
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

function formatBytes(bytes: number | null | undefined) {
  const amount = Number(bytes ?? 0);
  if (amount < 1024) return `${amount} B`;
  if (amount < 1024 * 1024) return `${(amount / 1024).toFixed(0)} KB`;
  return `${(amount / 1024 / 1024).toFixed(1)} MB`;
}

function investorDisplayName(row: {
  full_name: string | null;
  email: string | null;
  organization: string | null;
}) {
  return row.full_name || row.organization || row.email || "Investor";
}

type StatusFilter = "ALL" | "OPEN" | "SUBMITTED" | "COMPLETED" | "CANCELLED";

export default function AdminInvestorUploadsPage() {
  const [requests, setRequests] = useState<UploadRequestRow[]>([]);
  const [investors, setInvestors] = useState<InvestorOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");

  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
  const [busyUploadId, setBusyUploadId] = useState<string | null>(null);

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [createInvestorId, setCreateInvestorId] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createDueAt, setCreateDueAt] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Review dialog
  const [reviewUpload, setReviewUpload] = useState<UploadSummary | null>(null);
  const [reviewDecision, setReviewDecision] = useState<
    "APPROVED" | "REJECTED"
  >("APPROVED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewError, setReviewError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [uploadsRes, crmRes] = await Promise.all([
        fetch("/api/admin/investor-upload-requests", {
          cache: "no-store",
        }),
        fetch("/api/admin/investor-crm", { cache: "no-store" }),
      ]);

      const uploadsData = await uploadsRes.json();
      const crmData = await crmRes.json();

      if (!uploadsRes.ok || !uploadsData.success) {
        throw new Error(
          uploadsData?.error ?? "Unable to load upload requests."
        );
      }

      if (!crmRes.ok) {
        throw new Error("Unable to load investors.");
      }

      setRequests(uploadsData.requests ?? []);

      const investorList: InvestorOption[] = (
        crmData.investors ?? []
      ).map(
        (inv: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          organization?: string | null;
          verification_status?: string | null;
          access_level?: string | null;
        }) => ({
          id: inv.id,
          full_name: inv.full_name ?? null,
          email: inv.email ?? null,
          organization: inv.organization ?? null,
          verification_status: inv.verification_status ?? null,
          access_level: inv.access_level ?? null,
        })
      );

      setInvestors(investorList);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load upload data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const eligibleInvestors = useMemo(
    () =>
      investors.filter(
        (inv) =>
          inv.verification_status === "VERIFIED" &&
          inv.access_level === "APPROVED"
      ),
    [investors]
  );

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();

    return requests.filter((req) => {
      if (statusFilter !== "ALL" && req.status !== statusFilter) {
        return false;
      }

      if (!q) return true;

      const investorName = req.investor
        ? investorDisplayName(req.investor)
        : "";

      return [req.title, investorName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [requests, statusFilter, search]);

  const counts = useMemo(() => {
    return {
      ALL: requests.length,
      OPEN: requests.filter((r) => r.status === "OPEN").length,
      SUBMITTED: requests.filter((r) => r.status === "SUBMITTED").length,
      COMPLETED: requests.filter((r) => r.status === "COMPLETED").length,
      CANCELLED: requests.filter((r) => r.status === "CANCELLED").length,
    };
  }, [requests]);

  const pendingReviewCount = useMemo(
    () =>
      requests.reduce(
        (sum, req) =>
          sum +
          req.uploads.filter((u) => u.status === "SUBMITTED").length,
        0
      ),
    [requests]
  );

  function resetCreateForm() {
    setCreateInvestorId("");
    setCreateTitle("");
    setCreateDescription("");
    setCreateDueAt("");
    setCreateError("");
  }

  async function submitCreate() {
    setCreateError("");
    setNotice("");

    if (!createInvestorId) {
      setCreateError("Select an investor.");
      return;
    }
    if (!createTitle.trim()) {
      setCreateError("A title is required.");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(
        "/api/admin/investor-upload-requests",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investor_id: createInvestorId,
            title: createTitle.trim(),
            description: createDescription.trim() || undefined,
            due_at: createDueAt || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ?? "Unable to create upload request."
        );
      }

      setNotice("Upload request created.");
      setShowCreate(false);
      resetCreateForm();
      await loadAll();
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Unable to create upload request."
      );
    } finally {
      setCreating(false);
    }
  }

  async function transitionRequest(
    requestId: string,
    action: "CANCEL" | "COMPLETE"
  ) {
    setBusyRequestId(requestId);
    setNotice("");

    try {
      const response = await fetch(
        "/api/admin/investor-upload-requests",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: requestId,
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ?? "Unable to update upload request."
        );
      }

      setNotice(
        action === "CANCEL"
          ? "Upload request cancelled."
          : "Upload request marked complete."
      );
      await loadAll();
    } catch (err) {
      console.error(err);
      setNotice("");
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update upload request."
      );
    } finally {
      setBusyRequestId(null);
    }
  }

  function openReview(
    upload: UploadSummary,
    decision: "APPROVED" | "REJECTED"
  ) {
    setReviewUpload(upload);
    setReviewDecision(decision);
    setReviewNotes("");
    setReviewError("");
  }

  async function submitReview() {
    if (!reviewUpload) return;
    setBusyUploadId(reviewUpload.id);
    setReviewError("");
    setNotice("");

    try {
      const response = await fetch(
        "/api/admin/investor-uploads",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            upload_id: reviewUpload.id,
            decision: reviewDecision,
            notes: reviewNotes.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ?? "Unable to record review."
        );
      }

      setNotice(
        reviewDecision === "APPROVED"
          ? "Upload approved."
          : "Upload rejected."
      );
      setReviewUpload(null);
      await loadAll();
    } catch (err) {
      setReviewError(
        err instanceof Error
          ? err.message
          : "Unable to record review."
      );
    } finally {
      setBusyUploadId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                  Investor Uploads
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Materials Requested from Investors
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Request documents from investors, review submissions,
                and approve or reject with notes. All actions write an
                audit event.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setShowCreate(true);
                  resetCreateForm();
                }}
                disabled={loading || eligibleInvestors.length === 0}
                title={
                  eligibleInvestors.length === 0
                    ? "No eligible investors yet"
                    : undefined
                }
                className="rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                + New request
              </button>

              <button
                onClick={() => void loadAll()}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <a
                href="/admin/investor-access"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                DD Access
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
        <section className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Total requests
            </p>
            <p className="mt-3 text-3xl font-semibold text-white/80">
              {counts.ALL}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Awaiting submission
            </p>
            <p className="mt-3 text-3xl font-semibold text-cyan-300">
              {counts.OPEN}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Awaiting review
            </p>
            <p className="mt-3 text-3xl font-semibold text-amber-300">
              {pendingReviewCount}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Completed
            </p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {counts.COMPLETED}
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Search
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Title or investor"
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-300/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"
              >
                <option value="ALL" className="bg-[#0c111d]">
                  All ({counts.ALL})
                </option>
                <option value="OPEN" className="bg-[#0c111d]">
                  Open ({counts.OPEN})
                </option>
                <option value="SUBMITTED" className="bg-[#0c111d]">
                  Submitted ({counts.SUBMITTED})
                </option>
                <option value="COMPLETED" className="bg-[#0c111d]">
                  Completed ({counts.COMPLETED})
                </option>
                <option value="CANCELLED" className="bg-[#0c111d]">
                  Cancelled ({counts.CANCELLED})
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Requests list */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-3xl bg-white/[0.025]"
              />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 px-6 py-20 text-center">
            <p className="text-sm text-white/50">
              No upload requests match the current view.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((req) => {
              const busy = busyRequestId === req.id;

              return (
                <section
                  key={req.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]"
                >
                  {/* Request header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-white/90">
                          {req.title}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                            req.status === "OPEN"
                              ? "border-cyan-300/25 bg-cyan-300/[0.06] text-cyan-300"
                              : req.status === "SUBMITTED"
                                ? "border-amber-300/25 bg-amber-300/[0.06] text-amber-300"
                                : req.status === "COMPLETED"
                                  ? "border-emerald-300/25 bg-emerald-300/[0.06] text-emerald-300"
                                  : "border-white/10 bg-white/[0.03] text-white/45"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-white/40">
                        {req.investor
                          ? investorDisplayName(req.investor)
                          : "Unknown investor"}
                        {req.investor?.email
                          ? ` · ${req.investor.email}`
                          : ""}
                      </p>

                      {req.description && (
                        <p className="mt-2 max-w-2xl whitespace-pre-line text-xs leading-5 text-white/55">
                          {req.description}
                        </p>
                      )}

                      <p className="mt-2 text-[10px] text-white/30">
                        Created {formatDateTime(req.created_at)}
                        {req.created_by ? ` by ${req.created_by}` : ""}
                        {req.due_at
                          ? ` · Due ${formatDateTime(req.due_at)}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {req.status === "OPEN" && (
                        <button
                          onClick={() =>
                            void transitionRequest(req.id, "CANCEL")
                          }
                          disabled={busy}
                          className="rounded-lg border border-red-300/20 bg-red-300/[0.05] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-300 transition hover:bg-red-300/[0.1] disabled:opacity-40"
                        >
                          Cancel
                        </button>
                      )}
                      {(req.status === "SUBMITTED" ||
                        req.status === "OPEN") && (
                        <button
                          onClick={() =>
                            void transitionRequest(req.id, "COMPLETE")
                          }
                          disabled={busy}
                          className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.05] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-300/[0.1] disabled:opacity-40"
                        >
                          Mark complete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Uploads */}
                  <div className="px-6 py-5">
                    {req.uploads.length === 0 ? (
                      <p className="text-xs text-white/35">
                        No files submitted yet.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {req.uploads.map((upload) => {
                          const uploadBusy = busyUploadId === upload.id;

                          return (
                            <li
                              key={upload.id}
                              className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-white/85">
                                    {upload.file_name}
                                  </p>
                                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
                                    {formatBytes(upload.file_size_bytes)}
                                    {upload.file_type
                                      ? ` · ${upload.file_type}`
                                      : ""}
                                    {` · ${formatDateTime(
                                      upload.uploaded_at
                                    )}`}
                                  </p>
                                  {upload.review_notes && (
                                    <p className="mt-2 whitespace-pre-line text-xs leading-5 text-white/45">
                                      Review: {upload.review_notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  <span
                                    className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                                      upload.status === "APPROVED"
                                        ? "border-emerald-300/25 bg-emerald-300/[0.06] text-emerald-300"
                                        : upload.status === "REJECTED"
                                          ? "border-red-300/25 bg-red-300/[0.06] text-red-300"
                                          : "border-amber-300/25 bg-amber-300/[0.06] text-amber-300"
                                    }`}
                                  >
                                    {upload.status}
                                  </span>

                                  {upload.status === "SUBMITTED" && (
                                    <>
                                      <button
                                        onClick={() =>
                                          openReview(upload, "APPROVED")
                                        }
                                        disabled={uploadBusy}
                                        className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.05] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-300/[0.1] disabled:opacity-40"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() =>
                                          openReview(upload, "REJECTED")
                                        }
                                        disabled={uploadBusy}
                                        className="rounded-lg border border-red-300/20 bg-red-300/[0.05] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-300 transition hover:bg-red-300/[0.1] disabled:opacity-40"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* CREATE DIALOG */}
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
            <button
              aria-label="Close"
              className="absolute inset-0 cursor-default"
              onClick={() => {
                if (!creating) {
                  setShowCreate(false);
                  resetCreateForm();
                }
              }}
            />
            <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c111d] shadow-2xl">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/70">
                  New upload request
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  Request material from an investor
                </h2>
              </div>

              <div className="space-y-4 px-6 py-6">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Investor
                  </span>
                  <select
                    value={createInvestorId}
                    onChange={(e) => {
                      setCreateInvestorId(e.target.value);
                      setCreateError("");
                    }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"
                  >
                    <option value="" className="bg-[#0c111d]">
                      Select investor…
                    </option>
                    {eligibleInvestors.map((inv) => (
                      <option
                        key={inv.id}
                        value={inv.id}
                        className="bg-[#0c111d]"
                      >
                        {investorDisplayName(inv)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Title
                  </span>
                  <input
                    value={createTitle}
                    onChange={(e) => {
                      setCreateTitle(e.target.value);
                      setCreateError("");
                    }}
                    placeholder="e.g. Certificate of Incorporation"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-300/40"
                    maxLength={300}
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Description (optional)
                  </span>
                  <textarea
                    value={createDescription}
                    onChange={(e) => {
                      setCreateDescription(e.target.value);
                      setCreateError("");
                    }}
                    rows={3}
                    placeholder="Details or context for the request."
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-300/40"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Due date (optional)
                  </span>
                  <input
                    type="datetime-local"
                    value={createDueAt}
                    onChange={(e) => {
                      setCreateDueAt(e.target.value);
                      setCreateError("");
                    }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"
                  />
                </label>

                {createError && (
                  <div className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200">
                    {createError}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-5">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    resetCreateForm();
                  }}
                  disabled={creating}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void submitCreate()}
                  disabled={creating}
                  className="rounded-xl bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-200 disabled:opacity-40"
                >
                  {creating ? "Creating…" : "Create request"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REVIEW DIALOG */}
        {reviewUpload && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
            <button
              aria-label="Close"
              className="absolute inset-0 cursor-default"
              onClick={() => {
                if (!busyUploadId) {
                  setReviewUpload(null);
                  setReviewError("");
                }
              }}
            />
            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0c111d] shadow-2xl">
              <div className="border-b border-white/10 px-6 py-5">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    reviewDecision === "APPROVED"
                      ? "text-emerald-300/70"
                      : "text-red-300/80"
                  }`}
                >
                  {reviewDecision === "APPROVED"
                    ? "Approve upload"
                    : "Reject upload"}
                </p>
                <h2 className="mt-1 truncate text-lg font-semibold">
                  {reviewUpload.file_name}
                </h2>
              </div>

              <div className="space-y-4 px-6 py-6">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Notes (optional)
                  </span>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => {
                      setReviewNotes(e.target.value);
                      setReviewError("");
                    }}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  />
                </label>

                {reviewError && (
                  <div className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200">
                    {reviewError}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-5">
                <button
                  onClick={() => {
                    setReviewUpload(null);
                    setReviewError("");
                  }}
                  disabled={Boolean(busyUploadId)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void submitReview()}
                  disabled={Boolean(busyUploadId)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-black transition disabled:opacity-40 ${
                    reviewDecision === "APPROVED"
                      ? "bg-emerald-300 hover:bg-emerald-200"
                      : "bg-red-400 hover:bg-red-300"
                  }`}
                >
                  {busyUploadId
                    ? "Saving…"
                    : reviewDecision === "APPROVED"
                      ? "Approve"
                      : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}