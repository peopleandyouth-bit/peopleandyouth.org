"use client";

import { useCallback, useEffect, useState } from "react";

type UploadSummary = {
  id: string;
  file_name: string;
  file_size_bytes: number | null;
  file_type: string | null;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
  uploaded_at: string;
};

type UploadRequest = {
  id: string;
  title: string;
  description: string | null;
  status: "OPEN" | "SUBMITTED" | "COMPLETED" | "CANCELLED";
  due_at: string | null;
  created_at: string;
  uploads: UploadSummary[];
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatBytes(bytes: number | null | undefined) {
  const amount = Number(bytes ?? 0);
  if (amount < 1024) return `${amount} B`;
  if (amount < 1024 * 1024) return `${(amount / 1024).toFixed(0)} KB`;
  return `${(amount / 1024 / 1024).toFixed(1)} MB`;
}

export default function InvestorPortalUploadsPage() {
  const [requests, setRequests] = useState<UploadRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(
    null
  );
  const [uploadError, setUploadError] = useState("");
  const [uploadNotice, setUploadNotice] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/investor-portal/upload-requests",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load upload requests.");
      }

      setRequests(data.requests ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load upload requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function submitFile(requestId: string, file: File) {
    setUploadingRequestId(requestId);
    setUploadError("");
    setUploadNotice("");

    try {
      const formData = new FormData();
      formData.append("request_id", requestId);
      formData.append("file", file);

      const response = await fetch(
        "/api/investor-portal/upload-submit",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ?? "Unable to submit the file."
        );
      }

      setUploadNotice(
        "Your file was submitted successfully. Investor Relations has been notified."
      );

      await loadRequests();
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "Unable to submit the file."
      );
    } finally {
      setUploadingRequestId(null);
    }
  }

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Uploads
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          Materials requested from you.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          From time to time, Investor Relations may request specific
          documents — for example, corporate registration details or
          regulatory filings. Materials you submit are visible only to
          Investor Relations.
        </p>
      </header>

      {uploadNotice && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4 text-sm text-emerald-200">
          {uploadNotice}
        </div>
      )}

      {uploadError && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-200">
          {uploadError}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-[#f5f0e6]/[0.03]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-6 py-4 text-sm text-red-200">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#f5f0e6]/10 px-6 py-16 text-center">
          <p className="text-sm text-[#f5f0e6]/50">
            Nothing has been requested from you.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#f5f0e6]/35">
            When Investor Relations needs a specific document or
            certificate, it will appear here with upload instructions.
          </p>
        </div>
      ) : (
        <ul className="space-y-8">
          {requests.map((request) => (
            <li
              key={request.id}
              className="border-t border-[#f5f0e6]/8 pt-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-light text-[#f5f0e6]">
                    {request.title}
                  </p>
                  {request.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
                      {request.description}
                    </p>
                  )}
                  <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#f5f0e6]/35">
                    Requested {formatDateTime(request.created_at)}
                    {request.due_at &&
                      ` · Due ${formatDateTime(request.due_at)}`}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                    request.status === "SUBMITTED"
                      ? "border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-300"
                      : "border-[#c8a56b]/30 bg-[#c8a56b]/[0.06] text-[#c8a56b]"
                  }`}
                >
                  {request.status}
                </span>
              </div>

              {request.uploads.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {request.uploads.map((upload) => (
                    <li
                      key={upload.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#f5f0e6]/6 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[#f5f0e6]/85">
                          {upload.file_name}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#f5f0e6]/35">
                          {formatBytes(upload.file_size_bytes)} ·
                          Uploaded {formatDateTime(upload.uploaded_at)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.16em] ${
                          upload.status === "APPROVED"
                            ? "border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-300"
                            : upload.status === "REJECTED"
                              ? "border-red-400/25 bg-red-400/[0.06] text-red-300"
                              : "border-[#f5f0e6]/10 text-[#f5f0e6]/50"
                        }`}
                      >
                        {upload.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {request.status === "OPEN" && (
                <div className="mt-5">
                  <label className="inline-block cursor-pointer rounded-lg border border-[#c8a56b]/40 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-[#c8a56b] transition hover:bg-[#c8a56b]/10">
                    {uploadingRequestId === request.id
                      ? "Uploading…"
                      : "Choose file to upload"}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      className="hidden"
                      disabled={uploadingRequestId === request.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void submitFile(request.id, file);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>

                  <p className="mt-3 text-[10px] leading-5 text-[#f5f0e6]/30">
                    Accepted: PDF, DOCX, XLSX, PNG, JPG. Maximum 20 MB.
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}