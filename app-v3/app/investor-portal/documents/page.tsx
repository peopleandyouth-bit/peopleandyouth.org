"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type InvestorFacingDocument = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_type: string | null;
  file_size_bytes: number | null;
  access_level: "PUBLIC" | "APPROVED";
  updated_at: string | null;
};

function formatBytes(bytes: number | null | undefined) {
  const amount = Number(bytes ?? 0);
  if (amount < 1024) return `${amount} B`;
  if (amount < 1024 * 1024) return `${(amount / 1024).toFixed(0)} KB`;
  return `${(amount / 1024 / 1024).toFixed(1)} MB`;
}

const CATEGORY_ORDER = [
  "Executive Summary",
  "Pitch Deck",
  "Financial Model",
  "Legal",
  "Market Research",
  "Investor Material",
  "Institutional",
];

function categoryRank(category: string) {
  const idx = CATEGORY_ORDER.indexOf(category);
  return idx === -1 ? CATEGORY_ORDER.length : idx;
}

export default function InvestorPortalDocumentsPage() {
  const [documents, setDocuments] = useState<InvestorFacingDocument[]>([]);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [docsResponse, meResponse] = await Promise.all([
        fetch("/api/investor-portal/documents", { cache: "no-store" }),
        fetch("/api/investor-portal/me", { cache: "no-store" }),
      ]);

      const docsData = await docsResponse.json();

      if (!docsResponse.ok || !docsData.success) {
        throw new Error("Unable to load documents.");
      }

      setDocuments(docsData.documents ?? []);

      // Fetch acknowledgements through a lightweight client check.
      // The endpoint returns them via the investor portal read path.
      if (meResponse.ok) {
        const meData = await meResponse.json();
        void meData; // reserved for future ack-status embedding
      }

      // Read existing acknowledgements (best-effort; ignore errors).
      const ackResponse = await fetch(
        "/api/investor-portal/documents/acknowledgements",
        { cache: "no-store" }
      ).catch(() => null);

      if (ackResponse && ackResponse.ok) {
        const ackData = await ackResponse.json();
        const ids: string[] = (ackData.document_ids ?? []) as string[];
        setAcknowledged(new Set(ids));
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load documents."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const grouped = useMemo(() => {
    const map = new Map<string, InvestorFacingDocument[]>();
    for (const doc of documents) {
      const category = doc.category || "Institutional";
      const list = map.get(category) ?? [];
      list.push(doc);
      map.set(category, list);
    }
    return map;
  }, [documents]);

  const orderedCategories = useMemo(
    () =>
      Array.from(grouped.keys()).sort(
        (a, b) => categoryRank(a) - categoryRank(b)
      ),
    [grouped]
  );

  async function acknowledge(documentId: string) {
    setAcknowledgingId(documentId);

    try {
      const response = await fetch(
        "/api/investor-portal/acknowledge",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document_id: documentId }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to record acknowledgement.");
      }

      setAcknowledged((current) => {
        const next = new Set(current);
        next.add(documentId);
        return next;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAcknowledgingId(null);
    }
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Documents
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          Your private People &amp; Youth documents.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          Materials made available to you as part of your relationship with
          the institution. Access is audited and time-limited.
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-[#f5f0e6]/[0.03]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-6 py-4 text-sm text-red-200">
          {error}
        </div>
      ) : documents.length === 0 ? (
        <div className="border-t border-[#f5f0e6]/8 pt-10 text-center">
          <p className="text-sm text-[#f5f0e6]/50">
            No documents have been made available yet.
          </p>
          <p className="mt-2 text-xs text-[#f5f0e6]/35">
            Investor Relations will notify you when new materials are
            published.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {orderedCategories.map((category) => {
            const items = grouped.get(category) ?? [];

            return (
              <section key={category}>
                <div className="flex items-baseline justify-between border-b border-[#f5f0e6]/8 pb-3">
                  <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-[#c8a56b]/80">
                    {category}
                  </h2>
                  <span className="text-[10px] tracking-[0.2em] text-[#f5f0e6]/35">
                    {items.length} document
                    {items.length === 1 ? "" : "s"}
                  </span>
                </div>

                <ul className="divide-y divide-[#f5f0e6]/6">
                  {items.map((doc) => {
                    const isAcknowledged = acknowledged.has(doc.id);
                    const isAcknowledging = acknowledgingId === doc.id;

                    return (
                      <li
                        key={doc.id}
                        className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-medium text-[#f5f0e6]">
                            {doc.title}
                          </p>

                          {doc.description && (
                            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#f5f0e6]/45">
                              {doc.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-[#f5f0e6]/30">
                            {doc.file_type && (
                              <span>{doc.file_type}</span>
                            )}
                            {doc.file_size_bytes && (
                              <span>
                                {formatBytes(doc.file_size_bytes)}
                              </span>
                            )}
                            {doc.updated_at && (
                              <span>
                                Updated{" "}
                                {new Date(
                                  doc.updated_at
                                ).toLocaleDateString("en-IN", {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                            {doc.access_level === "PUBLIC" && (
                              <span className="text-[#c8a56b]/60">
                                Public
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-3">
                          <a
                            href={`/api/investors/document?id=${encodeURIComponent(
                              doc.id
                            )}`}
                            className="inline-block rounded-lg border border-[#c8a56b]/40 px-4 py-2 text-xs tracking-wider text-[#c8a56b] transition hover:bg-[#c8a56b]/10"
                          >
                            View document →
                          </a>

                          {isAcknowledged ? (
                            <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-emerald-300/90">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                              Acknowledged
                            </span>
                          ) : (
                            <button
                              onClick={() => void acknowledge(doc.id)}
                              disabled={isAcknowledging}
                              className="inline-block rounded-lg border border-[#f5f0e6]/15 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-[#f5f0e6]/55 transition hover:border-[#f5f0e6]/40 hover:text-[#f5f0e6] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isAcknowledging
                                ? "Recording…"
                                : "Acknowledge"}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <div className="border-t border-[#f5f0e6]/8 pt-6 text-xs leading-6 text-[#f5f0e6]/35">
        Documents are served through time-limited signed URLs. Access
        requests are audited. Acknowledging a document records that you
        have reviewed it. If you need a document you cannot see, please
        contact Investor Relations.
      </div>
    </div>
  );
}