"use client";

import { useState } from "react";

export default function DissentDias() {
  const [proVotes, setProVotes] = useState(342);
  const [conVotes, setConVotes] = useState(189);
  const [voted, setVoted] = useState<"pro" | "con" | null>(null);

  const total = proVotes + conVotes;
  const proPercent = Math.round((proVotes / total) * 100);
  const conPercent = Math.round((conVotes / total) * 100);

  const handleVote = (type: "pro" | "con") => {
    if (voted) return;
    if (type === "pro") setProVotes(proVotes + 1);
    if (type === "con") setConVotes(conVotes + 1);
    setVoted(type);
  };

  return (
    <section id="dissent-dias" className="py-24 relative z-10 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Explanation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 text-xs font-mono">
              <span>CIVIL DISCOURSE PROTOCOL</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Dissent Dias
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Social media algorithms prioritize outrage. <strong className="text-white">Dissent Dias</strong> prioritizes evidence. Every motion requires verified data sources, policy references, and respectful counter-arguments.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-sm text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Zero ad-hominem attacks or unverified claims</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Public policy paper output from top debates</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Encrypted member voting via Dissent Card ID</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Debate Widget */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-cyan-400 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                  MOTION #042 — LIVE DEBATE
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Voting Open</span>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-snug">
                "Centralized higher education approvals should be replaced by public CAG audits and performance transparency."
              </h3>

              {/* Progress Gauge */}
              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span className="text-cyan-400 font-bold">AFFIRMATIVE ({proPercent}%)</span>
                  <span className="text-indigo-400 font-bold">NEGATIVE ({conPercent}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-white/5">
                  <div
                    style={{ width: `${proPercent}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-l-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${conPercent}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-r-full transition-all duration-500"
                  />
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  Total Votes Recorded: {total}
                </div>
              </div>

              {/* Voting Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleVote("pro")}
                  disabled={voted !== null}
                  className={`py-3.5 px-4 rounded-xl font-semibold text-sm transition-all border ${
                    voted === "pro"
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                      : "bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-200"
                  }`}
                >
                  {voted === "pro" ? "✓ Supported Motion" : "Support Affirmative"}
                </button>
                <button
                  onClick={() => handleVote("con")}
                  disabled={voted !== null}
                  className={`py-3.5 px-4 rounded-xl font-semibold text-sm transition-all border ${
                    voted === "con"
                      ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                      : "bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-200"
                  }`}
                >
                  {voted === "con" ? "✓ Opposed Motion" : "Support Negative"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}