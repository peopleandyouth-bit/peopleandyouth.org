"use client";

import { useState } from "react";
import Link from "next/link";

const SECTORS = [
  "AgriTech & Rural Supply Chain",
  "FinTech & Micro-Inclusion",
  "EdTech & Youth Skill Development",
  "FMCG & Grassroots Retail",
  "Healthcare & Medical Access",
  "Public Policy & Civic Infrastructure",
];

const BUDGET_RANGES = [
  "Under ₹2,50,000",
  "₹2,50,000 – ₹5,00,000",
  "₹5,00,000 – ₹15,00,000",
  "Custom Enterprise Strategy (₹15,00,000+)",
];

export default function RuralConsultingPage() {
  const [organization, setOrganization] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sector, setSector] = useState(SECTORS[0]);
  const [budget, setBudget] = useState(BUDGET_RANGES[0]);
  const [scope, setScope] = useState("");
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
      const res = await fetch("/api/consulting/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_name: organization,
          contact_person: contactPerson,
          email,
          phone,
          sector,
          project_scope: scope,
          budget_range: budget,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      setStatusMessage({
        type: "success",
        text: "Your consulting proposal has been transmitted to our Rural Strategy Advisory Board! A senior strategist will reach out within 48 hours.",
      });

      // Clear form scope
      setScope("");
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "An error occurred while submitting your proposal.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="text-xs font-mono text-cyan-400 hover:underline">
            &larr; Return to Main Platform
          </Link>
          <span className="text-xs font-mono text-slate-400">
            PEOPLE & YOUTH RURAL ADVISORY LAB
          </span>
        </div>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase block">
            Grassroots Market Entry & Advisory
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Bridge the Gap to Rural India
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            We provide corporations, startups, and policy institutions with actionable field strategy, consumer research, youth ambassador deployment, and local regulatory intelligence.
          </p>
        </div>

        {/* Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Grassroots Market Entry",
              desc: "Field-tested distribution strategies, village cluster onboarding, and localized product positioning.",
              tag: "Field Execution",
            },
            {
              title: "Youth Ambassador Networks",
              desc: "Mobilizing regional student leaders and campus networks to drive digital adoption and brand trust.",
              tag: "Network Scale",
            },
            {
              title: "Policy & CAG Audit Alignment",
              desc: "Navigating state schemes, local regulatory requirements, and public infrastructure compliance.",
              tag: "Compliance & Risk",
            },
          ].map((pillar, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-800">
                {pillar.tag}
              </span>
              <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* RFP / Proposal Form Container */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 max-w-4xl mx-auto shadow-2xl relative">
          <div className="mb-8">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">
              REQUEST FOR PROPOSAL (RFP)
            </span>
            <h2 className="text-2xl font-bold text-white">Book Rural Advisory Services</h2>
            <p className="text-xs text-slate-300 mt-1">
              Outline your organization's goals to receive a custom market entry blueprint and operational timeline.
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
                  ORGANIZATION / COMPANY NAME *
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Acme Corp / NGO Initiative"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  CONTACT PERSON FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Swaraj Shandilya"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  OFFICIAL EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  PHONE NUMBER *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  INDUSTRY SECTOR *
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                >
                  {SECTORS.map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  ESTIMATED PROJECT BUDGET RANGE
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                >
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b} className="bg-slate-900 text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                PROJECT SCOPE & TARGET REGIONS *
              </label>
              <textarea
                required
                rows={5}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="Describe your target audience, geographical focus (e.g., Tier 3/4 towns in Gujarat or UP), key metrics, and expected deliverables..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Transmitting Proposal...</span>
              ) : (
                <span>Submit RFP to Rural Strategy Board</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}