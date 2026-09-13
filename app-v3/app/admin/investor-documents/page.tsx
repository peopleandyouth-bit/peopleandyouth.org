"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type DocumentRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_path: string;
  file_type: string | null;
  file_size_bytes: number | null;
  access_level: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type Investor = {
  id: string;
  full_name: string | null;
  email: string | null;
  organization: string | null;
  investor_type: string | null;
};

type Activity = {
  id: string;
  investor_id: string;
  activity_type: string;
  subject: string | null;
  details: string | null;
  occurred_at: string;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
};

type DocumentAccess = {
  id: string;
  investorId: string;
  investorName: string;
  documentName: string;
  action: string;
  occurredAt: string;
  subject: string | null;
};

type VersionGroup = {
  title: string;
  versions: DocumentRow[];
};

const DEFAULT_CATEGORIES = [
  "Executive Summary",
  "Financial Model",
  "Legal",
  "Market Research",
  "Pitch Deck",
  "Investor Material",
  "Other",
];

const ACCESS_LEVELS = ["PUBLIC", "APPROVED"] as const;

function formatBytes(bytes: number | null | undefined) {
  const amount = Number(bytes ?? 0);

  if (amount < 1024) return `${amount} B`;
  if (amount < 1024 * 1024)
    return `${(amount / 1024).toFixed(1)} KB`;
  if (amount < 1024 * 1024 * 1024)
    return `${(amount / 1024 / 1024).toFixed(1)} MB`;

  return `${(amount / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function fileExtension(value: string | null | undefined) {
  if (!value) return "—";
  const trimmed = value.trim();
  if (!trimmed) return "—";
  const withoutParams = trimmed.split(";")[0];
  const parts = withoutParams.split("/");
  return parts.length > 1
    ? parts[parts.length - 1].toUpperCase()
    : withoutParams.toUpperCase();
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

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase().trim();
}

/*
 * Extract document interactions from activity records.
 *
 * The CRM composer (5B.10) writes document actions as NOTE activities
 * whose details begin with "[DOCUMENT]\nAction: X\nDocument: Y".
 */
function parseDocumentActivities(
  activities: Activity[],
  investorsById: Map<string, Investor>
): DocumentAccess[] {
  const parsed: DocumentAccess[] = [];

  for (const activity of activities) {
    if (activity.activity_type !== "NOTE") continue;
    if (!activity.details) continue;

    const details = activity.details;

    if (!details.includes("[DOCUMENT]")) continue;

    const actionMatch = details.match(/Action:\s*([A-Z_]+)/);
    const documentMatch = details.match(/Document:\s*(.+)/);

    const action = actionMatch?.[1] ?? "VIEWED";
    const documentName =
      documentMatch?.[1]?.split("\n")[0]?.trim() ?? "";

    const investor = investorsById.get(activity.investor_id);

    parsed.push({
      id: activity.id,
      investorId: activity.investor_id,
      investorName:
        investor?.full_name ||
        investor?.organization ||
        investor?.email ||
        "Unknown investor",
      documentName: documentName || activity.subject || "Document",
      action,
      occurredAt: activity.occurred_at,
      subject: activity.subject,
    });
  }

  return parsed.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() -
      new Date(a.occurredAt).getTime()
  );
}

type Tab = "catalog" | "access" | "versions" | "analytics";

export default function InvestorDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("catalog");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [accessFilter, setAccessFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [search, setSearch] = useState("");

  const [busyId, setBusyId] = useState<string | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState(
    DEFAULT_CATEGORIES[0]
  );
  const [uploadAccess, setUploadAccess] = useState<
    (typeof ACCESS_LEVELS)[number]
  >("APPROVED");
  const [uploadOrder, setUploadOrder] = useState("10");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [docsResponse, activitiesResponse, crmResponse] =
        await Promise.all([
          fetch("/api/admin/investor-documents", {
            cache: "no-store",
          }),
          fetch("/api/admin/investor-crm/activities", {
            cache: "no-store",
          }),
          fetch("/api/admin/investor-crm", { cache: "no-store" }),
        ]);

      if (!docsResponse.ok) {
        throw new Error("Unable to load documents.");
      }

      const docsData = await docsResponse.json();
      setDocuments(docsData.documents ?? []);

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.activities ?? []);
      }

      if (crmResponse.ok) {
        const crmData = await crmResponse.json();

        const list: Investor[] = (crmData.investors ?? []).map(
          (inv: {
            id: string;
            full_name?: string | null;
            email?: string | null;
            organization?: string | null;
            investor_type?: string | null;
          }) => ({
            id: inv.id,
            full_name: inv.full_name ?? null,
            email: inv.email ?? null,
            organization: inv.organization ?? null,
            investor_type: inv.investor_type ?? null,
          })
        );

        setInvestors(list);
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
    void loadAll();
  }, [loadAll]);

  const investorsById = useMemo(() => {
    const map = new Map<string, Investor>();
    investors.forEach((inv) => map.set(inv.id, inv));
    return map;
  }, [investors]);

  const accessEvents: DocumentAccess[] = useMemo(
    () => parseDocumentActivities(activities, investorsById),
    [activities, investorsById]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();

    documents.forEach((doc) => {
      if (doc.category) set.add(doc.category);
    });

    DEFAULT_CATEGORIES.forEach((category) => set.add(category));

    return Array.from(set).sort();
  }, [documents]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((doc) => {
      const key = doc.category || "Uncategorised";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [documents]);

  const metrics = useMemo(() => {
    const total = documents.length;
    const active = documents.filter((d) => d.is_active !== false).length;
    const totalBytes = documents.reduce(
      (sum, d) => sum + Number(d.file_size_bytes ?? 0),
      0
    );
    const categoriesCount = Object.keys(categoryCounts).length;

    return { total, active, totalBytes, categoriesCount };
  }, [documents, categoryCounts]);

  /*
   * 7B.3 — Investor-specific documents.
   *
   * Match document title / description against investor name or
   * organisation. This is a heuristic — the schema does not carry
   * an explicit investor link.
   */
  function findLinkedInvestor(doc: DocumentRow): Investor | null {
    const haystack = normalize(`${doc.title} ${doc.description ?? ""}`);

    if (!haystack) return null;

    for (const investor of investors) {
      const candidates = [
        investor.full_name,
        investor.organization,
      ]
        .filter(Boolean)
        .map((v) => normalize(v as string));

      for (const candidate of candidates) {
        if (candidate.length < 3) continue;
        if (haystack.includes(candidate)) return investor;
      }
    }

    return null;
  }

  const filteredDocuments = useMemo(() => {
    let list = documents;

    if (categoryFilter !== "ALL") {
      list = list.filter(
        (doc) => (doc.category || "Uncategorised") === categoryFilter
      );
    }

    if (accessFilter !== "ALL") {
      list = list.filter((doc) => doc.access_level === accessFilter);
    }

    if (statusFilter !== "ALL") {
      list = list.filter((doc) =>
        statusFilter === "ACTIVE"
          ? doc.is_active !== false
          : doc.is_active === false
      );
    }

    if (search.trim()) {
      const needle = normalize(search);
      list = list.filter((doc) =>
        [
          doc.title,
          doc.description,
          doc.category,
        ]
          .filter(Boolean)
          .some((v) => normalize(v as string).includes(needle))
      );
    }

    return [...list].sort((a, b) => {
      const orderA = Number(a.display_order ?? 999);
      const orderB = Number(b.display_order ?? 999);
      if (orderA !== orderB) return orderA - orderB;

      const timeA = new Date(a.created_at ?? 0).getTime();
      const timeB = new Date(b.created_at ?? 0).getTime();
      return timeB - timeA;
    });
  }, [documents, categoryFilter, accessFilter, statusFilter, search]);

  /*
   * 7B.5 — Versioning.
   *
   * Group documents by normalised title. Multiple rows with the same
   * title are treated as versions of the same document.
   */
  const versionGroups: VersionGroup[] = useMemo(() => {
    const map = new Map<string, DocumentRow[]>();

    documents.forEach((doc) => {
      const key = doc.title.trim().toLowerCase();
      const list = map.get(key) ?? [];
      list.push(doc);
      map.set(key, list);
    });

    const groups: VersionGroup[] = [];

    map.forEach((versions, titleKey) => {
      if (versions.length < 2) return;

      groups.push({
        title: versions[0].title || titleKey,
        versions: [...versions].sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        ),
      });
    });

    return groups.sort(
      (a, b) => b.versions.length - a.versions.length
    );
  }, [documents]);

  /*
   * 7B.7 — Analytics.
   */
  const analytics = useMemo(() => {
    const totalBytes = documents.reduce(
      (sum, d) => sum + Number(d.file_size_bytes ?? 0),
      0
    );

    const avgBytes =
      documents.length > 0
        ? Math.round(totalBytes / documents.length)
        : 0;

    const active = documents.filter((d) => d.is_active !== false).length;
    const inactive = documents.length - active;

    const recentWindow = 30 * 86400000;
    const recent = documents.filter(
      (d) =>
        d.created_at &&
        Date.now() - new Date(d.created_at).getTime() <= recentWindow
    ).length;

    const byCategory = Object.entries(categoryCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    const byAccess: Record<string, number> = {};

    documents.forEach((doc) => {
      const key = doc.access_level || "UNSPECIFIED";
      byAccess[key] = (byAccess[key] ?? 0) + 1;
    });

    const accessWindow = 90 * 86400000;
    const recentAccesses = accessEvents.filter(
      (e) =>
        Date.now() - new Date(e.occurredAt).getTime() <= accessWindow
    ).length;

    return {
      totalBytes,
      avgBytes,
      active,
      inactive,
      recent,
      byCategory,
      byAccess,
      recentAccesses,
    };
  }, [documents, categoryCounts, accessEvents]);

  async function toggleActive(doc: DocumentRow) {
    setBusyId(doc.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        "/api/admin/investor-documents",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: doc.id,
            is_active: !(doc.is_active !== false),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to update document."
        );
      }

      setNotice(
        `Document "${doc.title}" ${
          !(doc.is_active !== false) ? "activated" : "deactivated"
        }.`
      );

      await loadAll();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update document."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteDocument(doc: DocumentRow) {
    const confirmed = window.confirm(
      `Delete "${doc.title}"? This removes both the database record and the stored file.`
    );

    if (!confirmed) return;

    setBusyId(doc.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        "/api/admin/investor-documents",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: doc.id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to delete document."
        );
      }

      setNotice(`Document "${doc.title}" deleted.`);

      await loadAll();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete document."
      );
    } finally {
      setBusyId(null);
    }
  }

  function resetUploadForm() {
    setUploadTitle("");
    setUploadDescription("");
    setUploadCategory(DEFAULT_CATEGORIES[0]);
    setUploadAccess("APPROVED");
    setUploadOrder("10");
    setUploadFile(null);
    setUploadError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function submitUpload() {
    if (!uploadFile) {
      setUploadError("A document file is required.");
      return;
    }

    if (!uploadTitle.trim()) {
      setUploadError("Document title is required.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setError("");
    setNotice("");

    try {
      const form = new FormData();
      form.append("file", uploadFile);
      form.append("title", uploadTitle.trim());
      form.append("description", uploadDescription.trim());
      form.append("category", uploadCategory);
      form.append("access_level", uploadAccess);
      form.append("display_order", uploadOrder || "0");

      const response = await fetch(
        "/api/admin/investor-documents",
        {
          method: "POST",
          body: form,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to upload document."
        );
      }

      setNotice(`Document "${uploadTitle.trim()}" uploaded.`);
      resetUploadForm();
      setShowUpload(false);

      await loadAll();
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "Unable to upload document."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <div className="mx-auto max-w-[1700px] px-6 py-8 lg:px-10">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.9)]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-300">
                  Document Intelligence
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Investor Data Room
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                Institutional document catalog, category distribution,
                investor linkage, access history, versioning and
                activation control.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setShowUpload((v) => !v);
                  setUploadError("");
                }}
                className="rounded-xl border border-sky-300/20 bg-sky-300/[0.08] px-4 py-2.5 text-sm font-semibold text-sky-200 transition hover:bg-sky-300/[0.14]"
              >
                {showUpload ? "Cancel Upload" : "+ Upload Document"}
              </button>

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

        {/* METRICS */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="Total Documents"
            value={String(metrics.total)}
            detail="In the data room"
            tone="sky"
          />
          <MetricTile
            label="Active"
            value={String(metrics.active)}
            detail="Available to investors"
            tone="green"
          />
          <MetricTile
            label="Categories"
            value={String(metrics.categoriesCount)}
            detail="Distinct groupings"
            tone="violet"
          />
          <MetricTile
            label="Total Size"
            value={formatBytes(metrics.totalBytes)}
            detail="Combined storage"
            tone="amber"
          />
        </section>

        {/* UPLOAD PANEL */}
        {showUpload && (
          <section className="mb-6 rounded-3xl border border-sky-300/20 bg-sky-300/[0.035] p-6 shadow-2xl shadow-sky-500/5">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Upload Institutional Document
              </h2>
              <p className="mt-1 text-xs text-white/40">
                Maximum file size: 25 MB. Files are stored in the
                private investor-data-room bucket.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Title *
                </label>
                <input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. FY26 Executive Summary"
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-sky-300/40"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-sky-300/40"
                  disabled={uploading}
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-[#0c111d]"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Description
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) =>
                    setUploadDescription(e.target.value)
                  }
                  rows={2}
                  placeholder="Optional context for this document"
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-sky-300/40"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Access Level
                </label>
                <select
                  value={uploadAccess}
                  onChange={(e) =>
                    setUploadAccess(
                      e.target.value as (typeof ACCESS_LEVELS)[number]
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-sky-300/40"
                  disabled={uploading}
                >
                  {ACCESS_LEVELS.map((level) => (
                    <option
                      key={level}
                      value={level}
                      className="bg-[#0c111d]"
                    >
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Display Order
                </label>
                <input
                  type="number"
                  value={uploadOrder}
                  onChange={(e) => setUploadOrder(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-sky-300/40"
                  disabled={uploading}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  File *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) =>
                    setUploadFile(e.target.files?.[0] ?? null)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  disabled={uploading}
                />
                {uploadFile && (
                  <p className="mt-2 text-[10px] text-white/40">
                    {uploadFile.name} · {formatBytes(uploadFile.size)}
                  </p>
                )}
              </div>
            </div>

            {uploadError && (
              <div className="mt-4 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                {uploadError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  resetUploadForm();
                  setShowUpload(false);
                }}
                disabled={uploading}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/55 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={() => void submitUpload()}
                disabled={uploading}
                className="rounded-xl bg-sky-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </section>
        )}

        {/* TABS */}
        <section className="mb-6 flex flex-wrap gap-2">
          {(
            [
              { value: "catalog", label: "Catalog" },
              { value: "access", label: "Access History" },
              { value: "versions", label: "Versioning" },
              { value: "analytics", label: "Analytics" },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "border-sky-300/40 bg-sky-300/[0.08] text-sky-200"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </section>

        {/* CATALOG TAB */}
        {activeTab === "catalog" && (
          <>
            {/* FILTERS */}
            <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">
              <div className="grid gap-4 lg:grid-cols-4">
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Search
                  </label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Title, description or category"
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-sky-300/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Access Level
                  </label>
                  <select
                    value={accessFilter}
                    onChange={(e) => setAccessFilter(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-sky-300/40"
                  >
                    <option value="ALL" className="bg-[#0c111d]">
                      All access levels
                    </option>
                    {ACCESS_LEVELS.map((level) => (
                      <option
                        key={level}
                        value={level}
                        className="bg-[#0c111d]"
                      >
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as
                          | "ALL"
                          | "ACTIVE"
                          | "INACTIVE"
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-sky-300/40"
                  >
                    <option value="ALL" className="bg-[#0c111d]">
                      All documents
                    </option>
                    <option value="ACTIVE" className="bg-[#0c111d]">
                      Active only
                    </option>
                    <option value="INACTIVE" className="bg-[#0c111d]">
                      Inactive only
                    </option>
                  </select>
                </div>
              </div>

              {/* Category chips */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  Category:
                </span>

                <button
                  onClick={() => setCategoryFilter("ALL")}
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition ${
                    categoryFilter === "ALL"
                      ? "border-sky-300/40 bg-sky-300/[0.1] text-sky-200"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }`}
                >
                  All ({documents.length})
                </button>

                {categories.map((category) => {
                  const count = categoryCounts[category] ?? 0;

                  if (count === 0 && category !== "Uncategorised") {
                    return null;
                  }

                  return (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition ${
                        categoryFilter === category
                          ? "border-sky-300/40 bg-sky-300/[0.1] text-sky-200"
                          : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                      }`}
                    >
                      {category} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-white/25">
                Showing {filteredDocuments.length} of {documents.length}
              </div>
            </section>

            {/* DOCUMENTS GRID */}
            {loading ? (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-3xl bg-white/[0.025]"
                  />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl text-white/25">
                  ◇
                </div>
                <p className="mt-5 text-sm font-semibold text-white/70">
                  No documents match the current view
                </p>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/30">
                  Clear filters or upload the first document.
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-4 text-xs font-semibold text-sky-300 hover:text-sky-200"
                >
                  Upload document →
                </button>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {filteredDocuments.map((doc) => {
                  const linked = findLinkedInvestor(doc);
                  const isActive = doc.is_active !== false;
                  const sameTitleCount = documents.filter(
                    (d) =>
                      d.title.trim().toLowerCase() ===
                      doc.title.trim().toLowerCase()
                  ).length;

                  return (
                    <article
                      key={doc.id}
                      className={`flex flex-col rounded-3xl border bg-white/[0.035] p-5 shadow-xl transition ${
                        isActive
                          ? "border-white/10"
                          : "border-white/[0.06] opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-sky-300/15 bg-sky-300/[0.06] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-300">
                              {fileExtension(doc.file_type)}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/45">
                              {doc.category || "Uncategorised"}
                            </span>
                            {doc.access_level && (
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                                  doc.access_level === "PUBLIC"
                                    ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300"
                                    : "border-violet-300/15 bg-violet-300/[0.06] text-violet-300"
                                }`}
                              >
                                {doc.access_level}
                              </span>
                            )}
                            {sameTitleCount > 1 && (
                              <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                                v{sameTitleCount}
                              </span>
                            )}
                            {linked && (
                              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-300">
                                {linked.full_name ||
                                  linked.organization ||
                                  "Linked"}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 truncate text-base font-semibold text-white/90">
                            {doc.title}
                          </h3>

                          {doc.description && (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">
                              {doc.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              isActive
                                ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300"
                                : "border-red-300/20 bg-red-300/[0.08] text-red-300"
                            }`}
                          >
                            <span
                              className={`h-1 w-1 rounded-full ${
                                isActive
                                  ? "bg-emerald-300"
                                  : "bg-red-300"
                              }`}
                            />
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                          <div className="text-white/30">Size</div>
                          <div className="mt-0.5 font-medium text-white/65">
                            {formatBytes(doc.file_size_bytes)}
                          </div>
                        </div>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                          <div className="text-white/30">Order</div>
                          <div className="mt-0.5 font-medium text-white/65">
                            {doc.display_order ?? 0}
                          </div>
                        </div>
                        <div className="col-span-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                          <div className="text-white/30">Uploaded</div>
                          <div className="mt-0.5 font-medium text-white/65">
                            {formatDate(doc.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
                        <button
                          onClick={() => void toggleActive(doc)}
                          disabled={busyId === doc.id}
                          className={`rounded-lg border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition disabled:opacity-40 ${
                            isActive
                              ? "border-red-300/20 bg-red-300/[0.05] text-red-300 hover:bg-red-300/[0.1]"
                              : "border-emerald-300/20 bg-emerald-300/[0.05] text-emerald-300 hover:bg-emerald-300/[0.1]"
                          }`}
                        >
                          {busyId === doc.id
                            ? "…"
                            : isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>

                        <button
                          onClick={() => void deleteDocument(doc)}
                          disabled={busyId === doc.id}
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/45 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
                        >
                          Delete
                        </button>

                        <span className="ml-auto text-[10px] text-white/25">
                          {doc.id.slice(0, 8)}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ACCESS HISTORY TAB */}
        {activeTab === "access" && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    Document Access History
                  </h2>
                  <p className="mt-1 text-xs text-white/40">
                    7B.4 — Document interactions recorded via the CRM
                    composer [DOCUMENT] actions.
                  </p>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/50">
                  {accessEvents.length} event
                  {accessEvents.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {accessEvents.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl text-white/25">
                  ◇
                </div>
                <p className="mt-5 text-sm font-semibold text-white/70">
                  No document interactions recorded
                </p>
                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/30">
                  Record a document action from the CRM composer
                  (Activity Composer → Document tab) to populate this
                  view.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {accessEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-white/[0.02]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-300/15 bg-sky-300/[0.06] text-xs font-semibold text-sky-200">
                      {initials(event.investorName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white/85">
                          {event.investorName}
                        </span>
                        <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                          {event.action}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-white/55">
                        {event.documentName}
                      </div>
                    </div>

                    <div className="shrink-0 text-right text-[11px] text-white/40">
                      {formatDateTime(event.occurredAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VERSIONING TAB */}
        {activeTab === "versions" && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="text-lg font-semibold">Document Versioning</h2>
              <p className="mt-1 text-xs text-white/40">
                7B.5 — Documents grouped by shared title. Multiple rows
                with the same title are treated as versions.
              </p>
            </div>

            {versionGroups.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl text-white/25">
                  ◇
                </div>
                <p className="mt-5 text-sm font-semibold text-white/70">
                  No versioned documents
                </p>
                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/30">
                  Upload a document with a title that matches an existing
                  document to create a new version.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {versionGroups.map((group) => (
                  <div key={group.title} className="px-6 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-white/85">
                        {group.title}
                      </h3>
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                        {group.versions.length} versions
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {group.versions.map((version, index) => (
                        <div
                          key={version.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-white/55">
                              v{group.versions.length - index}
                            </span>

                            <span className="text-xs text-white/55">
                              {formatDateTime(version.created_at)}
                            </span>

                            <span className="text-[10px] text-white/35">
                              {formatBytes(version.file_size_bytes)}
                            </span>

                            <span
                              className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${
                                version.is_active !== false
                                  ? "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300"
                                  : "border-red-300/15 bg-red-300/[0.06] text-red-300"
                              }`}
                            >
                              {version.is_active !== false
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono text-white/25">
                            {version.id.slice(0, 8)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricTile
                label="Total Size"
                value={formatBytes(analytics.totalBytes)}
                detail="Combined storage"
                tone="sky"
              />
              <MetricTile
                label="Average Size"
                value={formatBytes(analytics.avgBytes)}
                detail="Per document"
                tone="violet"
              />
              <MetricTile
                label="Active Ratio"
                value={
                  metrics.total > 0
                    ? `${Math.round(
                        (analytics.active / metrics.total) * 100
                      )}%`
                    : "—"
                }
                detail={`${analytics.active} active · ${analytics.inactive} inactive`}
                tone="green"
              />
              <MetricTile
                label="Recent Uploads"
                value={String(analytics.recent)}
                detail="Last 30 days"
                tone="amber"
              />
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Category Distribution">
                {analytics.byCategory.length === 0 ? (
                  <p className="text-xs text-white/40">
                    No categories yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics.byCategory.map((item) => {
                      const pct =
                        metrics.total > 0
                          ? Math.round(
                              (item.count / metrics.total) * 100
                            )
                          : 0;

                      return (
                        <div key={item.label}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="text-white/55">
                              {item.label}
                            </span>
                            <span className="font-semibold text-white/75">
                              {item.count}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-sky-300/70"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>

              <Panel title="Access Level Distribution">
                {Object.keys(analytics.byAccess).length === 0 ? (
                  <p className="text-xs text-white/40">
                    No documents.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(analytics.byAccess).map(
                      ([label, count]) => {
                        const pct =
                          metrics.total > 0
                            ? Math.round(
                                (count / metrics.total) * 100
                              )
                            : 0;

                        return (
                          <div key={label}>
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="text-white/55">
                                {label}
                              </span>
                              <span className="font-semibold text-white/75">
                                {count}
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className={`h-full rounded-full ${
                                  label === "PUBLIC"
                                    ? "bg-emerald-300/70"
                                    : "bg-violet-300/70"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </Panel>
            </div>

            <Panel title="Access Cadence">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Total recorded
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-sky-300">
                    {accessEvents.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Last 90 days
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-emerald-300">
                    {analytics.recentAccesses}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    Documents accessed
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-violet-300">
                    {
                      new Set(
                        accessEvents.map((e) => e.documentName)
                      ).size
                    }
                  </div>
                </div>
              </div>
            </Panel>
          </div>
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
  tone: "sky" | "violet" | "green" | "amber" | "red";
}) {
  const tones = {
    sky: {
      text: "text-sky-300",
      dot: "bg-sky-300",
      glow: "shadow-sky-500/10",
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
    red: {
      text: "text-red-300",
      dot: "bg-red-300",
      glow: "shadow-red-500/10",
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

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}