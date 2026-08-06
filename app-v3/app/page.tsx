'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function DigitalHeadquartersPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const headquartersStructure = [
    {
      id: 'about',
      title: 'About People & Youth',
      subtitle: 'Foundational Charter & Governance',
      items: ['Our Story', 'Our Philosophy', 'Vision 2050', 'Mission', 'Institutional Model', 'Founder', 'Global Leadership', 'Governance']
    },
    {
      id: 'constitution',
      title: 'Constitution of People & Youth',
      subtitle: 'Founding Charter & Statutory Laws',
      items: ['Preamble', 'Founding Charter', 'Institutional Philosophy', 'Vision & Mission', 'Rights of Members', 'Duties', 'Schedules I–XV']
    },
    {
      id: 'leadership-network',
      title: 'Leadership Network',
      subtitle: 'Office-Centric Governance Architecture',
      items: ["Founder's Office", 'Office of Chairperson', 'Office of CEO', 'Executive Officers', 'Chambers', 'Campus Master Plan']
    },
    {
      id: 'activity',
      title: 'Institutional Activity',
      subtitle: 'Dynamic Live Feed & Dispatches',
      items: ['Editorials', 'Conferences', 'Policy Roundtables', 'Research Colloquia', 'Summits', 'Regional Dispatches']
    },
    {
      id: 'realms',
      title: 'Knowledge Realms',
      subtitle: '18 Sovereign Thematic Domains',
      items: ['Governance Realm', 'Policy Realm', 'Economic Realm', 'Trade Realm', 'Technology Realm', 'AI Realm', 'Law & Justice Realm']
    },
    {
      id: 'caves',
      title: 'Knowledge Caves',
      subtitle: 'Curated Reference Collections',
      items: ['Public Policy Cave', 'Economics Cave', 'Trade Cave', 'Technology Cave', 'AI Cave', 'Law Cave', 'Digital Library']
    },
    {
      id: 'careers',
      title: 'Global Careers & Leadership Portal',
      subtitle: '13 Divisions & Universal Application Gateway',
      items: ['Executive Leadership', 'Research', 'Editorial', 'Technology', 'Consulting', 'Marketing', 'Finance', 'Candidate Dashboard']
    }
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return headquartersStructure;
    const q = searchQuery.toLowerCase();
    return headquartersStructure.map((sec) => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchingItems = sec.items.filter((item) => item.toLowerCase().includes(q));
      if (matchTitle || matchingItems.length > 0) {
        return { ...sec, items: matchTitle ? sec.items : matchingItems };
      }
      return null;
    }).filter(Boolean);
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      {/* CLEAN TOP UTILITY BAR (GLITCH REMOVED) */}
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2.5 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-bold tracking-widest">PEOPLEANDYOUTH.ORG</span>
          <span>•</span>
          <span className="hidden sm:inline">DIGITAL HEADQUARTERS OF A GLOBAL INSTITUTION</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap font-bold">
          <Link href="/constitution" className="text-amber-300 hover:underline">Constitution Charter</Link>
          <Link href="/leadership-network" className="text-amber-300 hover:underline">Leadership Network</Link>
          <Link href="/activity" className="text-amber-300 hover:underline">Live Activity Feed</Link>
          <Link href="/careers" className="text-amber-300 hover:underline">Global Careers</Link>
          <Link href="/passport" className="text-gray-300 hover:text-white">Civic Passport</Link>
          <Link href="/admin/login" className="text-gray-300 hover:text-white">Institution OS</Link>
        </div>
      </div>

      {/* MASTHEAD */}
      <header className="border-b border-white/10 px-6 py-12 max-w-7xl mx-auto space-y-4 text-center">
        <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-[10px] uppercase rounded-full tracking-[0.2em]">
          PEOPLE & YOUTH &middot; DIGITAL HEADQUARTERS
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white uppercase font-serif tracking-tight pt-2">
          "Where Ideas Become Institutions."
        </h1>
        <p className="text-gray-300 text-sm italic font-serif max-w-3xl mx-auto leading-relaxed">
          A 100-Year Youth-Led Institution Bridging Academic Rigor, Statutory Policy Analysis, Sovereign Data Architectures, and Civic Action.
        </p>

        {/* SEARCH BAR */}
        <div className="max-w-xl mx-auto pt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across Divisions, Journals, Realms, and Caves..."
            className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none text-xs"
          />
        </div>
      </header>

      {/* PRIMARY NAVIGATION BAR */}
      <nav className="border-b border-white/10 bg-[#070b19] px-6 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap">
          {headquartersStructure.map((sec) => (
            <Link
              key={sec.id}
              href={`/${sec.id}`}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-amber-400/60 hover:text-amber-300 transition-all"
            >
              {sec.title}
            </Link>
          ))}
        </div>
      </nav>

      {/* DIVISIONS GRID */}
      <div className="max-w-7xl mx-auto p-6 sm:p-12 space-y-12">
        {filteredSections.map((section: any) => (
          <section key={section.id} id={section.id} className="space-y-4">
            <div className="flex justify-between items-end border-b border-white/10 pb-3">
              <div>
                <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">{section.subtitle}</span>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">{section.title}</h2>
              </div>
              <Link href={`/${section.id}`} className="text-amber-400 font-bold text-[10px] uppercase hover:underline">
                Access Division Portal →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {section.items.map((item: string, idx: number) => (
                <div key={idx} className="bg-white/5 border border-white/10 hover:border-amber-400/50 p-3.5 rounded-xl transition-all space-y-1">
                  <span className="text-amber-400/60 font-mono text-[8px] uppercase block">ENT-{idx + 1}</span>
                  <span className="text-white font-bold text-[11px] block leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#040711] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center text-[10px] text-gray-500 font-mono gap-4">
          <span>&copy; 2026 People & Youth &middot; www.peopleandyouth.org &middot; All Rights Reserved.</span>
          <span>Where Ideas Become Institutions</span>
        </div>
      </footer>
    </main>
  );
}