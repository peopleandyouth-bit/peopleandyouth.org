"use client";

import { useEffect, useState } from "react";

type Document = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_type: string | null;
  file_size_bytes: number | null;
  access_level: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

const CATEGORIES = [
  "Company & Institutional Overview",
  "Investment Thesis",
  "Platform & Product",
  "Traction & Metrics",
  "Market & Opportunity",
  "Business Model",
  "Capital Raise",
  "Use of Funds",
  "Governance & Structure",
  "Financial Information",
  "Legal & Compliance",
  "Founder & Team",
  "Investor Material",
];

export default function InvestorDataRoomAdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [accessLevel, setAccessLevel] = useState("APPROVED");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [file, setFile] = useState<File | null>(null);

  async function loadDocuments() {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/investor-documents",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load documents.");
      }

      setDocuments(data.documents || []);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to load documents."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function uploadDocument(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!file) {
      alert("Select a document first.");
      return;
    }

    if (!title.trim()) {
      alert("Enter a document title.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("access_level", accessLevel);
      formData.append("display_order", displayOrder);

      const response = await fetch(
        "/api/admin/investor-documents",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to upload document."
        );
      }

      setTitle("");
      setDescription("");
      setCategory(CATEGORIES[0]);
      setAccessLevel("APPROVED");
      setDisplayOrder("0");
      setFile(null);

      const input = document.getElementById(
        "investor-document-file"
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      await loadDocuments();

      alert("Investor document uploaded successfully.");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to upload document."
      );
    } finally {
      setUploading(false);
    }
  }

  async function toggleDocument(document: Document) {
    try {
      const response = await fetch(
        "/api/admin/investor-documents",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: document.id,
            is_active: !document.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update document."
        );
      }

      await loadDocuments();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update document."
      );
    }
  }

  async function deleteDocument(document: Document) {
    const confirmed = window.confirm(
      `Delete "${document.title}" permanently?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "/api/admin/investor-documents",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: document.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to delete document."
        );
      }

      await loadDocuments();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete document."
      );
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="border-b border-neutral-800 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
            Investor Relations
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Data Room Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            Upload, organize and control the institutional materials
            available to approved investors.
          </p>
        </div>

        <section className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Add Material
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Upload investor document
            </h2>
          </div>

          <form
            onSubmit={uploadDocument}
            className="grid gap-5 lg:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Title
              </label>

              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="People & Youth Institutional Overview"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={3}
                placeholder="Brief description of this investor material."
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Access
              </label>

              <select
                value={accessLevel}
                onChange={(event) =>
                  setAccessLevel(event.target.value)
                }
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
              >
                <option value="APPROVED">
                  Approved Investors
                </option>

                <option value="PUBLIC">
                  Public
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Display Order
              </label>

              <input
                type="number"
                value={displayOrder}
                onChange={(event) =>
                  setDisplayOrder(event.target.value)
                }
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Document
              </label>

              <input
                id="investor-document-file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv"
                onChange={(event) =>
                  setFile(event.target.files?.[0] || null)
                }
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-300"
              />

              <p className="mt-2 text-xs text-neutral-500">
                Maximum size: 25 MB. Documents are stored in a
                private investor data-room bucket.
              </p>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={uploading}
                className="rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading
                  ? "Uploading..."
                  : "Upload to Data Room"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Published Materials
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Data Room
              </h2>
            </div>

            <span className="text-sm text-neutral-500">
              {documents.length} document
              {documents.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-neutral-800 p-8 text-sm text-neutral-500">
              Loading data room...
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-800 p-10 text-center">
              <h3 className="text-lg font-semibold">
                No investor materials yet.
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                Upload the first institutional document above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800 bg-neutral-900">
              {documents.map((document) => (
                <article
                  key={document.id}
                  className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-neutral-800 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        {document.category ||
                          "Investor Material"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          document.is_active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {document.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold">
                      {document.title}
                    </h3>

                    {document.description && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
                        {document.description}
                      </p>
                    )}

                    <p className="mt-3 text-xs text-neutral-600">
                      Access: {document.access_level}
                      {" · "}
                      Order: {document.display_order}
                      {document.file_size_bytes
                        ? ` · ${(
                            document.file_size_bytes /
                            1024 /
                            1024
                          ).toFixed(2)} MB`
                        : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() =>
                        toggleDocument(document)
                      }
                      className="rounded-full border border-neutral-700 px-4 py-2 text-xs font-semibold transition hover:border-amber-400 hover:text-amber-400"
                    >
                      {document.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      onClick={() =>
                        deleteDocument(document)
                      }
                      className="rounded-full border border-red-900 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}