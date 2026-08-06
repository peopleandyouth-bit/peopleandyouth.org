'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DynamicActivityPortalPage() {
  const [filter, setFilter] = useState('All');

  const liveTickers = [
    "🔥 RELEASE: CAG Audit Critique on Statutory Compliance Disclosures Released",
    "📜 DISSENT DIAS: New Philosophical Essay 'Dialectics of Consciousness' Published",
    "🏛️ CAMPUS SUMMIT: Annual Leadership Roundtable Scheduled at Headquarters",
    "📊 RESEARCH LAB: Working Paper #42 on Macro-Strategy & Trade Analytics Staged",
    "💼 RECRUITMENT: Universal Opportunity Gateway Processing Applications for 13 Divisions"
  ];

  const activities = [
    { type: 'Editorial', title: 'Dialectics of Consciousness: A Soliloquy', date: 'August 2026', status: 'DISPATCH', desc: 'Philosophical inquiry into thesis, antithesis, and human mind synthesis.' },
    { type: 'Conference', title: 'Annual Civic Governance & Public Policy Summit', date: 'Upcoming', status: 'LIVE REGISTRATION', desc: 'National dialogue featuring researchers, legal scholars, and youth chapter leads.' },
    { type: 'Policy Roundtable', title: 'Statutory CAG Audit & Fiscal Accountability Review', date: 'Recent', status: 'COMPLETED', desc: 'Empirical review of public sector audit disclosures and state budget mechanics.' },
    { type: 'Research Colloquium', title: 'AI Ethics & Sovereign Stack Architecture', date: 'Upcoming', status: 'UPCOMING', desc: 'Technical colloquium on PostgreSQL data engineering, AI knowledge graphs, and privacy.' }
  ];

  const filteredActivities = filter === 'All' ? activities : activities.filter((a) => a.type === filter);

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <div className="border-b border-white/10 bg-[#070b19] px-6 py-2.5 flex justify-between items-center text-[10px] text-gray-400">
          <Link href="/" className="text-amber-400 font-bold hover:underline">← Main Digital Headquarters</Link>
          <span>PEOPLEANDYOUTH.ORG &middot; DYNAMIC ACTIVITY PORTAL</span>
        </div>

        {/* MOVING TICKER MARQUEE SCENARIO */}
        <div className="bg-amber-400 text-black font-extrabold text-[10px] uppercase py-2 px-4 overflow-hidden whitespace-nowrap border-b border-amber-500 shadow-lg">
          <div className="inline-block animate-marquee space-x-8">
            {liveTickers.map((t, idx) => (
              <span key={idx} className="inline-inline-block px-4">
                {t} &middot;
              </span>
            ))}
          </div>
        </div>

        {/* MASTHEAD */}
        <header className="border-b border-white/10 px-6 py-12 max-w-6xl mx-auto space-y-4 text-center">
          <span className="px-3.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-[10px] uppercase rounded-full tracking-widest">
            REAL-TIME DISPATCHES & EVENTS
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight text-white">
            Institutional Activity
          </h1>
          <p className="text-gray-300 text-sm italic font-serif max-w-xl mx-auto">
            Live updates, upcoming summits, editorial releases, policy roundtables, and regional chapter activities.
          </p>
        </header>

        {/* FILTER BAR */}
        <div className="max-w-6xl mx-auto px-6 pt-6 flex justify-center gap-2 flex-wrap">
          {['All', 'Editorial', 'Conference', 'Policy Roundtable', 'Research Colloquium'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                filter === f ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ACTIVITIES GRID */}
        <div className="max-w-6xl mx-auto p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredActivities.map((act, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-3 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                  <span className="px-2.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">{act.type}</span>
                  <span className="text-emerald-400 font-mono">● {act.status}</span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">{act.title}</h3>
                <p className="text-gray-300 text-[11px] leading-relaxed font-serif">{act.desc}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-400">
                <span>Date: {act.date}</span>
                <Link href="/careers" className="text-amber-400 font-bold hover:underline">Engage Activity →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-white/10 bg-[#040711] py-8 px-6 text-center text-gray-500 text-[10px]">
        &copy; 2026 People & Youth &middot; Activity Portal &middot; www.peopleandyouth.org
      </footer>
    </main>
  );
}