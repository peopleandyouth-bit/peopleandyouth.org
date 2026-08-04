'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CimsAdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [articles, setArticles] = useState([
    { id: '1', title: 'Constitutional Precedents in Higher Education', type: 'Policy Brief', status: 'published', views: 1240 },
    { id: '2', title: 'Empirical Audit of PMKVY Skill Initiatives', type: 'Research Paper', status: 'in_review', views: 890 },
    { id: '3', title: 'Dissent & Morality in Digital Governance', type: 'Editorial', status: 'draft', views: 0 },
  ]);

  return (
    <main className="min-h-screen bg-[#070b19] text-white flex">
      
      {/* CIMS LEFT SIDEBAR */}
      <aside className="w-64 bg-[#050814] border-r border-white/10 p-5 flex flex-col justify-between shrink-0 font-mono text-xs">
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">INSTITUTIONAL CIMS</span>
            <h1 className="text-base font-extrabold text-white mt-1">Control Centre</h1>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: '📊 Dashboard', badge: null },
              { id: 'content', label: '📝 Content Manager', badge: '12' },
              { id: 'editorial', label: '✍️ Editorial & Dissent', badge: null },
              { id: 'research', label: '🔬 Research Repository', badge: null },
              { id: 'caves', label: '🏛️ Knowledge Caves', badge: '17' },
              { id: 'mountains', label: '🏔️ Mountain Ranges', badge: '4' },
              { id: 'journals', label: '📚 14 Renaissance Journals', badge: null },
              { id: 'media', label: '📁 Media Library', badge: null },
              { id: 'users', label: '👥 User & Role Manager', badge: null },
              { id: 'careers', label: '💼 Applications & Talent', badge: '5' },
              { id: 'analytics', label: '📈 Analytics & Metrics', badge: null },
              { id: 'ai', label: '🤖 Admin AI Assistant', badge: 'RAG' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                  activeTab === item.id ? 'bg-cyan-500 text-black font-bold' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] rounded bg-white/10 border border-white/10">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10">
          <Link href="/admin" className="text-gray-400 hover:text-cyan-400 block">← Back to Main Admin</Link>
          <Link href="/" className="text-gray-500 hover:text-white block mt-1">🌐 Public Platform</Link>
        </div>
      </aside>

      {/* CIMS MAIN CONTENT PANEL */}
      <section className="flex-1 p-8 space-y-8 overflow-y-auto">
        
        {/* TOP HEADER */}
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">CIMS ENGINE v2.0</span>
            <h2 className="text-2xl font-extrabold text-white uppercase mt-1">{activeTab} Workspace</h2>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20">
            + Create New Institutional Asset
          </button>
        </div>

        {/* METRICS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase block">Total Published Works</span>
                <span className="text-2xl font-extrabold text-cyan-400 mt-1 block">148</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase block">Active Knowledge Caves</span>
                <span className="text-2xl font-extrabold text-amber-400 mt-1 block">17</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase block">Renaissance Journals</span>
                <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">14</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase block">Active Researchers</span>
                <span className="text-2xl font-extrabold text-blue-400 mt-1 block">42</span>
              </div>
            </div>

            {/* RECENT CONTENT TABLE */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Recent Editorial &amp; Research Submissions</h3>
              
              <div className="space-y-3 font-mono text-xs">
                {articles.map((art) => (
                  <div key={art.id} className="bg-[#0b1228] p-4 rounded-xl border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{art.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{art.type} • {art.views} Views</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                      art.status === 'published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                      art.status === 'in_review' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                    }`}>
                      {art.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CIMS AI ASSISTANT PANEL */}
        {activeTab === 'ai' && (
          <div className="bg-white/5 border border-cyan-500/40 rounded-3xl p-8 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">ADMIN EDITORIAL ASSISTANT</span>
              <h3 className="text-xl font-bold text-white mt-1">Human-In-The-Loop AI Co-Pilot</h3>
              <p className="text-xs text-gray-300 mt-1">Draft summaries, suggest taxonomy, generate SEO metadata, and format citations. Human approval is mandatory before publication.</p>
            </div>

            <div className="space-y-4">
              <textarea
                rows={4}
                placeholder="Paste article draft or research abstract for AI summarization & SEO metadata generation..."
                className="w-full bg-[#070b19] border border-white/10 rounded-xl p-4 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs">
                Generate Abstract &amp; SEO Taxonomy →
              </button>
            </div>
          </div>
        )}

      </section>

    </main>
  );
}
