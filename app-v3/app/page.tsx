'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function DigitalHeadquartersPage() {
  const [activeSection, setActiveSection] = useState<string>('Overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 100-YEAR INSTITUTIONAL TAXONOMY
  const headquartersStructure = [
    {
      id: 'about',
      title: 'About People & Youth',
      subtitle: 'Foundational Charter & Governance',
      items: [
        'Our Story', 'Our Philosophy', 'Vision 2050', 'Mission',
        'Institutional Model', 'Our Values', 'Founder', 'Global Leadership',
        'Governance', 'Institutional Timeline', 'Why People & Youth?',
        'Annual Reports', 'Join the Institution'
      ]
    },
    {
      id: 'constitution',
      title: 'Constitution of People & Youth',
      subtitle: 'Sovereign Organic Laws & Rights',
      items: [
        'Preamble', 'Founding Charter', 'Institutional Philosophy', 'Vision',
        'Mission', 'Governance', 'Rights of Members', 'Duties of Members',
        'Leadership Framework', 'Research Ethics', 'Editorial Charter',
        'Financial Transparency', 'Amendment Procedure', 'Institutional Continuity',
        'Constitutional Schedules'
      ]
    },
    {
      id: 'institution',
      title: 'The Institution',
      subtitle: 'Executive & Academic Councils',
      items: [
        'Governance', 'Board of Trustees', 'Executive Council', 'Academic Council',
        'Editorial Council', 'Research Council', 'Ethics Commission',
        'Ombudsperson', 'Audit Commission', 'Global Assembly'
      ]
    },
    {
      id: 'research-institute',
      title: 'People & Youth Research Institute',
      subtitle: 'Empirical Intelligence & Policy Labs',
      items: [
        'Research Divisions', 'Policy Labs', 'Working Papers', 'White Papers',
        'Annual Reports', 'Datasets', 'Impact Studies', 'District Intelligence',
        'Economic Observatory', 'Publications'
      ]
    },
    {
      id: 'publications',
      title: 'People & Youth Publications',
      subtitle: 'Parent Editorial Division',
      items: [
        'Dissent Dias (Public Affairs & Essays)',
        'Renaissance Series (Scholarly Journals)',
        'Knowledge Caves (Reference Archives)'
      ]
    },
    {
      id: 'dissent-dias',
      title: 'Dissent Dias',
      subtitle: 'Public Affairs, Commentary & Essays',
      items: [
        'Editorials', 'Essays', 'Opinion', 'Longform', 'Interviews',
        'Debates', 'Field Reports', 'Campus Voices', 'Letters',
        'Podcasts', 'Video Essays', 'Editorial Board'
      ]
    },
    {
      id: 'renaissance-series',
      title: 'Renaissance Series',
      subtitle: '17 Scholarly & Professional Journals',
      items: [
        'Policy Renaissance (Flagship)', 'Education Renaissance', 'Trade Renaissance',
        'Economic Renaissance', 'Technology Renaissance', 'Innovation Renaissance',
        'Climate Renaissance', 'Agriculture Renaissance', 'Health Renaissance',
        'Law Renaissance', 'Global Affairs Renaissance', 'Governance Renaissance',
        'Society Renaissance', 'Entrepreneurship Renaissance',
        'Artificial Intelligence Renaissance', 'Rural Renaissance',
        'Urban Renaissance', 'Editorial Office'
      ]
    },
    {
      id: 'caves',
      title: 'Knowledge Caves',
      subtitle: '19 Curated Reference Collections',
      items: [
        'Public Policy Cave', 'Economics Cave', 'Trade Cave', 'Technology Cave',
        'Artificial Intelligence Cave', 'Governance Cave', 'Education Cave',
        'Law Cave', 'Agriculture Cave', 'Climate Cave', 'Health Cave',
        'Rural Development Cave', 'Entrepreneurship Cave', 'Innovation Cave',
        'Finance Cave', 'International Relations Cave', 'History Cave',
        'Philosophy Cave', 'Digital Library'
      ]
    },
    {
      id: 'mountains',
      title: 'Knowledge Mountain Ranges',
      subtitle: '8 Sovereign Thematic Ranges',
      items: [
        'Himalaya Range', 'Aravalli Range', 'Vindhya Range', 'Satpura Range',
        'Nilgiri Range', 'Eastern Ghats Range', 'Western Ghats Range',
        'Global Summit Range'
      ]
    },
    {
      id: 'advisory',
      title: 'People & Youth Advisory',
      subtitle: 'Strategic & Public Sector Consulting',
      items: [
        'Institution Development', 'Strategy Consulting', 'Public Policy Consulting',
        'Market Entry', 'CSR Advisory', 'District Intelligence', 'Economic Research',
        'Digital Transformation', 'Rural Consulting', 'Leadership Development',
        'Innovation Advisory'
      ]
    },
    {
      id: 'academy',
      title: 'People & Youth Academy',
      subtitle: 'Executive Leadership & Schools',
      items: [
        'Leadership School', 'Policy School', 'Research School', 'Entrepreneurship School',
        'AI School', 'Governance School', 'Executive Education', 'Certification',
        'Workshops', 'Learning Portal'
      ]
    },
    {
      id: 'observatories',
      title: 'Observatories',
      subtitle: '10 Real-Time Empirical Monitors',
      items: [
        'Youth Observatory', 'Economy Observatory', 'Education Observatory',
        'Trade Observatory', 'Agriculture Observatory', 'Labour Observatory',
        'Climate Observatory', 'Innovation Observatory', 'Governance Observatory',
        'District Development Observatory'
      ]
    },
    {
      id: 'leadership-network',
      title: 'Leadership Network',
      subtitle: 'Pan-India & Global Chapters',
      items: [
        'Global Chapters', 'Country Chapters', 'State Chapters', 'District Chapters',
        'Campus Chapters', 'Community Chapters', 'Youth Ambassadors', 'Fellows', 'Volunteers'
      ]
    },
    {
      id: 'careers',
      title: 'Global Careers & Leadership Portal',
      subtitle: '13 Divisions & Candidate Portal',
      items: [
        'Executive Leadership', 'Research', 'Editorial', 'Technology', 'Consulting',
        'Marketing', 'Sales', 'Finance', 'Human Resources', 'Operations',
        'Communications', 'Internships', 'Fellowships', 'District Coordinators',
        'Country Directors', 'Candidate Portal'
      ]
    },
    {
      id: 'events',
      title: 'Events',
      subtitle: 'Summits, Colloquia & Dialogues',
      items: [
        'Annual Summit', 'Leadership Forum', 'Conferences', 'Webinars',
        'Dialogues', 'Policy Roundtables', 'Research Colloquia', 'Workshops', 'Calendar'
      ]
    },
    {
      id: 'institution-lab',
      title: 'Institution Lab',
      subtitle: 'Governance Design & AI Systems',
      items: [
        'Build an Institution', 'Governance Design', 'Constitution Builder',
        'Policy Builder', 'Strategy Builder', 'Digital Transformation',
        'Market Entry', 'Capacity Building', 'AI for Institutions',
        'Institutional Intelligence'
      ]
    },
    {
      id: 'campus',
      title: 'The Campus',
      subtitle: 'Leadership & Innovation Campus',
      items: [
        'Knowledge Square', 'Constitution Hall', 'Founder Gallery', 'Central Library',
        'Leadership Centre', 'Research Centre', 'Innovation Hub', 'Policy Hall',
        'Media Studio', 'Digital Command Centre', 'Conference Centre',
        'Amphitheatre', 'Demonstration Farms', 'Meditation Garden', 'Guest House'
      ]
    },
    {
      id: 'foundation',
      title: 'People & Youth Foundation',
      subtitle: 'Grants, Scholarships & Social Impact',
      items: [
        'Scholarships', 'Fellowships', 'Grants', 'Community Development',
        'Rural Transformation', 'Education', 'Health', 'Disaster Response', 'Annual Giving'
      ]
    },
    {
      id: 'platform',
      title: 'Digital Platform',
      subtitle: 'Institution OS & AI Graph',
      items: [
        'Institution OS', 'Knowledge Graph', 'AI Assistant', 'Analytics',
        'API', 'Member Dashboard', 'Founder Dashboard', 'Media Library', 'CRM', 'ERP'
      ]
    }
  ];

  // Live Filter for Search
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
      {/* 1. TOP UTILITY BAR */}
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2.5 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-bold tracking-widest">PEOPLEANDYOUTH.ORG</span>
          <span>•</span>
          <span className="hidden sm:inline">DIGITAL HEADQUARTERS OF A GLOBAL INSTITUTION</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/constitution" className="text-amber-300 font-bold hover:underline">📜 Constitution</Link>
          <Link href="/careers" className="text-amber-300 font-bold hover:underline">💼 Global Careers</Link>
          <Link href="/admin/login" className="hover:text-amber-400">🔐 Institution OS</Link>
        </div>
      </div>

      {/* 2. INSTITUTIONAL MASTHEAD */}
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
            placeholder="🔍 Search across 19 Divisions, 17 Journals, 8 Ranges, and 19 Caves..."
            className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none text-xs"
          />
        </div>
      </header>

      {/* 3. PRIMARY DIVISION NAVIGATION BAR */}
      <nav className="border-b border-white/10 bg-[#070b19] px-6 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap">
          <button
            onClick={() => setActiveSection('Overview')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeSection === 'Overview' ? 'bg-amber-400 text-black border-amber-400' : 'bg-white/5 border-white/10 hover:text-white'
            }`}
          >
            🏛️ All Divisions
          </button>

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

      {/* 4. INSTITUTIONAL DIVISIONS GRID */}
      <div className="max-w-7xl mx-auto p-6 sm:p-12 space-y-12">
        {filteredSections.map((section: any) => (
          <section key={section.id} id={section.id} className="space-y-4">
            <div className="flex justify-between items-end border-b border-white/10 pb-3">
              <div>
                <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">{section.subtitle}</span>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">{section.title}</h2>
              </div>
              <Link
                href={`/${section.id}`}
                className="text-amber-400 font-bold text-[10px] uppercase hover:underline"
              >
                Access Division Portal →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {section.items.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 hover:border-amber-400/50 p-3.5 rounded-xl transition-all space-y-1"
                >
                  <span className="text-amber-400/60 font-mono text-[8px] uppercase block">ENT-{idx + 1}</span>
                  <span className="text-white font-bold text-[11px] block leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* 5. INSTITUTIONAL FOOTER */}
      <footer className="border-t border-white/10 bg-[#040711] py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-8 mb-12 text-[11px]">
          <div className="col-span-2 space-y-3">
            <h3 className="text-lg font-extrabold text-white uppercase">People & Youth <span className="text-amber-400">.</span></h3>
            <p className="text-gray-400 leading-relaxed font-serif">
              Digital Headquarters of a Sovereign Global Institution. Question | Reflect | Act — Leading Youth Towards Praxis.
            </p>
            <p className="text-amber-400 font-bold text-[10px] tracking-widest uppercase pt-2">
              WHERE IDEAS BECOME INSTITUTIONS.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase">Research & Press</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><Link href="/research-institute" className="hover:text-white">Research Institute</Link></li>
              <li><Link href="/dissent-dias" className="hover:text-white">Dissent Dias</Link></li>
              <li><Link href="/renaissance-series" className="hover:text-white">Renaissance Series</Link></li>
              <li><Link href="/caves" className="hover:text-white">Knowledge Caves</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase">Leadership</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><Link href="/academy" className="hover:text-white">People & Youth Academy</Link></li>
              <li><Link href="/advisory" className="hover:text-white">Advisory Division</Link></li>
              <li><Link href="/leadership-network" className="hover:text-white">Leadership Network</Link></li>
              <li><Link href="/campus" className="hover:text-white">The Campus</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase">Governance</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><Link href="/constitution" className="hover:text-white">Constitution Charter</Link></li>
              <li><Link href="/institution" className="hover:text-white">The Institution</Link></li>
              <li><Link href="/foundation" className="hover:text-white">Foundation</Link></li>
              <li><Link href="/platform" className="hover:text-white">Digital Platform</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase">Careers & Contact</h4>
            <ul className="space-y-1.5 text-gray-400">
              <li><Link href="/careers" className="hover:text-white">Global Careers</Link></li>
              <li><Link href="/events" className="hover:text-white">Annual Summit</Link></li>
              <li><a href="mailto:contact@peopleandyouth.org" className="text-amber-300 font-bold">contact@peopleandyouth.org</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-wrap justify-between items-center text-[10px] text-gray-500 font-mono gap-4">
          <span>&copy; 2026 People & Youth &middot; www.peopleandyouth.org &middot; All Rights Reserved.</span>
          <span>Sovereign Knowledge Infrastructure &middot; Building 100-Year Institutions</span>
        </div>
      </footer>
    </main>
  );
}