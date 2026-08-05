'use client';

import React from 'react';
import Link from 'next/link';

export default function InstitutionOperatingSystemPage() {
  const modules = [
    { name: 'Universal Master CMS', path: '/admin/cms', icon: '✍️', desc: '13 Content Formats' },
    { name: 'Renaissance Journals', path: '/journals', icon: '📜', desc: '12 Domain Verticals' },
    { name: 'Institution ERP', path: '/admin/erp', icon: '💼', desc: 'Finance, HR, Payroll' },
    { name: 'Knowledge Graph', path: '/knowledge', icon: '🧠', desc: 'Knowledge Objects' },
    { name: 'District Governance', path: '/admin/governance', icon: '🏛️', desc: 'Regional Leadership' },
    { name: 'Careers & Fellowships', path: '/admin/careers', icon: '🎓', desc: 'Intake & Assessment' },
    { name: 'Partnerships & CRM', path: '/admin/crm', icon: '🤝', desc: 'Consulting & Contracts' },
    { name: 'Executive War Room', path: '/admin/war-room', icon: '⚡', desc: 'Single-Screen Command' }
  ];

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      <header className="max-w-7xl mx-auto border-b border-amber-400/40 pb-6 flex justify-between items-center">
        <div>
          <span className="px-3 py-1 bg-amber-400 text-black font-black uppercase text-[10px] rounded-md tracking-widest">
            PHASE 40 DESTINATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">The Institution Operating System (IOS)</h1>
        </div>
        <Link href="/admin/dashboard" className="px-4 py-2 bg-white/10 rounded-xl text-gray-200">
          ← Dashboard HQ
        </Link>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((m, idx) => (
          <Link key={idx} href={m.path} className="bg-[#070b19] border border-white/15 p-6 rounded-2xl space-y-3 hover:border-amber-400 transition-all block group">
            <div className="text-3xl">{m.icon}</div>
            <h2 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{m.name}</h2>
            <p className="text-gray-400 text-[10px]">{m.desc}</p>
            <span className="text-amber-400 font-bold text-[9px] uppercase block pt-2">Launch Engine →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}