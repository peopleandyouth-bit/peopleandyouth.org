'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';
import { UserRole } from '@/lib/types/os';
import { getRoleBadgeColor } from '@/lib/rbac';

export default function UniversalDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'research' | 'ai'>('overview');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentUser = {
    fullName: "Swaraj Shandilya",
    username: "swarajshandilya",
    passportId: "PY-2026-612030",
    roles: ['district_coordinator', 'researcher', 'editor'] as UserRole[],
    district: "Delhi",
    country: "India",
    impactScore: 840,
    volunteerHours: 124,
    publishedPapers: 3,
  };

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      });
      const data = await res.json();
      setAiResponse(data.answer || 'No institutional citation found.');
    } catch (err) {
      setAiResponse('Unable to connect to Institutional Knowledge RAG Engine.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 flex flex-col justify-between">
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-black">
              PY
            </div>
            <div>
              <span className="font-extrabold text-lg text-white block leading-none">P&amp;Y OS</span>
              <span className="text-[10px] uppercase text-cyan-400 font-mono tracking-widest">Institutional HQ</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <GoogleTranslate />
            <Link
              href={`/profile/${currentUser.username}`}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs hover:bg-cyan-500/30 transition-all flex items-center gap-2"
            >
              <span>👤</span>
              <span>{currentUser.passportId}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="h-12 w-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-lg">
                SS
              </div>
              <div>
                <p className="font-bold text-sm text-white">{currentUser.fullName}</p>
                <p className="text-[11px] text-gray-400 font-mono">@{currentUser.username}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Assigned Roles</span>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.roles.map((r) => (
                  <span key={r} className={`px-2 py-0.5 rounded-md text-[10px] font-mono border uppercase ${getRoleBadgeColor(r)}`}>
                    {r.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <nav className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                activeTab === 'overview' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>📊 Universal Overview</span>
              <span>→</span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                activeTab === 'tasks' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>⚙️ Department Tasks</span>
              <span>→</span>
            </button>
            <button
              onClick={() => setActiveTab('research')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                activeTab === 'research' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>🔬 Research &amp; Journals</span>
              <span>→</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                activeTab === 'ai' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>🤖 Ask P&amp;Y AI Engine</span>
              <span>→</span>
            </button>
          </nav>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-950 via-[#0a122c] to-cyan-950 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">CIVIC IMPACT SCORE LEDGER</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-400/30">
                    Tier 1 Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-center">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">Overall Impact</span>
                    <span className="text-3xl font-extrabold text-cyan-400 mt-1 block">{currentUser.impactScore}</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">Volunteer Hours</span>
                    <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{currentUser.volunteerHours} hrs</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">Research Papers</span>
                    <span className="text-3xl font-extrabold text-amber-400 mt-1 block">{currentUser.publishedPapers}</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">District Jurisdiction</span>
                    <span className="text-lg font-extrabold text-white mt-2 block">{currentUser.district}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/departments/research"
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-cyan-400/50 transition-all space-y-2 block"
                >
                  <span className="text-2xl">🔬</span>
                  <h3 className="font-bold text-white text-sm">Research Workspace</h3>
                  <p className="text-xs text-gray-400">Access peer reviews and Knowledge Caves.</p>
                </Link>

                <Link
                  href="/departments/editorial"
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-cyan-400/50 transition-all space-y-2 block"
                >
                  <span className="text-2xl">✍️</span>
                  <h3 className="font-bold text-white text-sm">Editorial &amp; Dissent Dias</h3>
                  <p className="text-xs text-gray-400">Review pending journal submissions.</p>
                </Link>

                <Link
                  href="/departments/campaigns"
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-cyan-400/50 transition-all space-y-2 block"
                >
                  <span className="text-2xl">🏛</span>
                  <h3 className="font-bold text-white text-sm">District Campaigns</h3>
                  <p className="text-xs text-gray-400">Direct municipal audit drives.</p>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-white/5 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">INSTITUTIONAL RAG ENGINE</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">Ask People &amp; Youth AI</h2>
              </div>

              <form onSubmit={handleAiAsk} className="space-y-4">
                <textarea
                  rows={3}
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask about RTI guidelines, constitutional precedents, or Renaissance journal standards..."
                  className="w-full bg-[#070b19] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs"
                >
                  {isAiLoading ? 'Searching Knowledge Graph...' : 'Execute Inquiry →'}
                </button>
              </form>

              {aiResponse && (
                <div className="p-5 rounded-2xl bg-[#0b1228] border border-cyan-400/30 text-xs text-gray-200 leading-relaxed font-mono space-y-2">
                  <p className="text-cyan-400 font-bold">📜 Institutional AI Synthesis:</p>
                  <p>{aiResponse}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </main>
  );
}
