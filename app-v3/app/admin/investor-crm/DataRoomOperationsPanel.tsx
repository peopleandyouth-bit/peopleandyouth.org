"use client";

import { useEffect, useState } from "react";

type DdAccess = {
  id: string;
  granted_at: string;
  granted_by: string | null;
};

type AccessRequestSummary = {
  id: string;
  scope: string;
  status: string;
  created_at: string;
};

type UploadRequestSummary = {
  id: string;
  title: string;
  status: string;
  due_at: string | null;
  created_at: string;
};

type UploadSummary = {
  id: string;
  file_name: string;
  status: string;
  uploaded_at: string;
};

type SummaryResponse = {
  success: boolean;
  has_activity: boolean;
  dd_access: DdAccess | null;
  pending_access_requests: AccessRequestSummary[];
  open_upload_requests: UploadRequestSummary[];
  awaiting_review: UploadSummary[];
  counts: {
    pending_access_requests: number;
    open_upload_requests: number;
    awaiting_review: number;
  };
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

export function DataRoomOperationsPanel({
  investorId,
}: {
  investorId: string;
}) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/admin/investor-data-room-summary?investor_id=${encodeURIComponent(
            investorId
          )}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data?.error ?? "Unable to load data room summary."
          );
        }

        if (!cancelled) {
          setSummary(data as SummaryResponse);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load data room summary."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [investorId]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Data Room Operations
        </p>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            3.5
          </span>

          <a
            href="/admin/investor-access"
            className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 hover:text-violet-300"
          >
            Access
          </a>

          <a
            href="/admin/investor-uploads"
            className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 hover:text-emerald-300"
          >
            Uploads
          </a>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-lg bg-slate-900"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-3 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      ) : !summary ? null : !summary.has_activity ? (
        <p className="mt-3 text-xs text-slate-500">
          No data room activity recorded yet for this investor.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {/* DD access */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Due Diligence access
            </span>

            {summary.dd_access ? (
              <span className="rounded-full border border-violet-700/60 bg-violet-950/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                Granted
              </span>
            ) : (
              <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Not granted
              </span>
            )}
          </div>

          {summary.dd_access && (
            <p className="text-[11px] text-slate-600">
              Since {formatDateTime(summary.dd_access.granted_at)}
              {summary.dd_access.granted_by
                ? ` by ${summary.dd_access.granted_by}`
                : ""}
            </p>
          )}

          {/* Pending access requests */}
          {summary.counts.pending_access_requests > 0 && (
            <div className="rounded-lg border border-amber-900/60 bg-amber-950/30 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                {summary.counts.pending_access_requests} pending access request
                {summary.counts.pending_access_requests === 1 ? "" : "s"}
              </p>

              <ul className="mt-1 space-y-1">
                {summary.pending_access_requests
                  .slice(0, 3)
                  .map((req) => (
                    <li
                      key={req.id}
                      className="text-[11px] text-amber-200/80"
                    >
                      {req.scope.replace(/_/g, " ")} · requested{" "}
                      {formatDateTime(req.created_at)}
                    </li>
                  ))}
              </ul>

              <a
                href="/admin/investor-access"
                className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-amber-300 underline"
              >
                Review request
              </a>
            </div>
          )}

          {/* Open upload requests */}
          {summary.counts.open_upload_requests > 0 && (
            <div className="rounded-lg border border-cyan-900/60 bg-cyan-950/30 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                {summary.counts.open_upload_requests} open upload request
                {summary.counts.open_upload_requests === 1 ? "" : "s"}
              </p>

              <ul className="mt-1 space-y-1">
                {summary.open_upload_requests
                  .slice(0, 3)
                  .map((req) => (
                    <li
                      key={req.id}
                      className="text-[11px] text-cyan-200/80"
                    >
                      {req.title}
                      {req.due_at
                        ? ` · due ${formatDateTime(req.due_at)}`
                        : ""}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Awaiting review */}
          {summary.counts.awaiting_review > 0 && (
            <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/30 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                {summary.counts.awaiting_review} upload
                {summary.counts.awaiting_review === 1 ? "" : "s"}{" "}
                awaiting review
              </p>

              <ul className="mt-1 space-y-1">
                {summary.awaiting_review
                  .slice(0, 3)
                  .map((upload) => (
                    <li
                      key={upload.id}
                      className="truncate text-[11px] text-emerald-200/80"
                    >
                      {upload.file_name} ·{" "}
                      {formatDateTime(upload.uploaded_at)}
                    </li>
                  ))}
              </ul>

              <a
                href="/admin/investor-uploads"
                className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-300 underline"
              >
                Review uploads
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}