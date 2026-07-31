"use client";

import { useState } from "react";
import Link from "next/link";

const JOURNALS = [
  "Public Policy & CAG Audits",
  "International Business & Trade",
  "AI & Digital Governance",
  "Rural India Development Lab",
  "Development Economics",
  "Youth Psychology & Leadership",
  "Civic Entrepreneurship",
];

export default function SubmitPaperPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [journal, setJournal] = useState(JOURNALS[0]);
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/articles/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category: journal,
          author_name: fullName,
          author_email: email,
          abstract,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      setStatusMessage({
        type: "success",
        text: "Your research paper has been submitted to the editorial board! It is now pending review on the Admin Dashboard.",
      });

      // Clear form
      setTitle("");
      setAbstract("");
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "An error occurred while submitting your paper.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xs font-mono text-cyan-400 hover:underline">
            &larr; Return to Main Platform
          </Link>
          <span className="text-xs font-mono text-slate-400">
            THINK TANK PUBLISHING PORTAL
          </span>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 shadow-2xl relative">
          <div className="mb-8">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">
              7 SOVEREIGN JOURNALS
            </span>
            <h1 className="text-3xl font-extrabold text-white">
              Submit Research Policy Paper
            </h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Publish evidence-based research, audit analysis, or grassroots strategy. Approved papers will be featured across the People & Youth Think Tank repository.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`mb-6 p-4 rounded-xl border text-xs font-medium leading-relaxed ${
                statusMessage.type === "success"
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                  : "bg-red-950/60 border-red-800 text-red-300"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  AUTHOR FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Swaraj Shandilya"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  AUTHOR EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="swaraj@peopleandyouth.org"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                TARGET SOVEREIGN JOURNAL *
              </label>
              <select
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              >
                {JOURNALS.map((j) => (
                  <option key={j} value={j} className="bg-slate-900 text-white">
                    {j}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                PAPER TITLE *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Evaluation of Skill Development Outlays under CAG Audit Frameworks"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                RESEARCH ABSTRACT & METHODOLOGY *
              </label>
              <textarea
                required
                rows={6}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Provide a detailed summary of your thesis, findings, data sources (e.g., RTI data, public audit reports), and policy recommendations..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Submitting Paper to Editorial Board...</span>
              ) : (
                <span>Submit Paper for Peer Review</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}