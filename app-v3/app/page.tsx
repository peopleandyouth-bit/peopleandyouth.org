'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function CompleteMasterHeadquartersPage() {
  const [publications, setPublications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPassportFlipped, setIsPassportFlipped] = useState(false);
  const [activeActivityFilter, setActiveActivityFilter] = useState('All');

  // AI Modal States
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    const { data } = await supabase
      .from('public_publications_feed')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setPublications(data);
    } else {
      setPublications([
        {
          id: '1',
          title: 'Dialectics of Consciousness',
          subtitle: 'A Soliloquy on Ideas, Society, and the Human Mind',
          author_name: 'Swaraj Shandilya',
          category: 'PHILOSOPHY & PUBLIC POLICY',
          slug: 'dialectics-of-consciousness',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Institutional Statutory CAG Audit Review',
          subtitle: 'Empirical critique of Comptroller & Auditor General findings and public finance mechanics',
          author_name: 'Swaraj Shandilya',
          category: 'POLICY LAB',
          slug: 'statutory-audit-review',
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const featuredSlides = useMemo(() => publications.slice(0, 5), [publications]);

  // Auto-carousel timer
  useEffect(() => {
    if (featuredSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredSlides.length]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return publications.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.subtitle?.toLowerCase().includes(q) ||
        p.author_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [searchQuery, publications]);

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiThinking(true);
    setAiResponse(null);

    setTimeout(() => {
      setAiResponse(
        `Synthesizing platform records for "${aiPrompt}":\n\nBased on Sovereign Archives and "Dialectics of Consciousness", civilization advances not through unexamined certainty, but through the courage to question assumptions, reconcile contradictions, and execute reasoned public action (Praxis).`
      );
      setAiThinking(false);
    }, 1200);
  };

  const tickers = [
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

  const filteredActivities = activeActivityFilter === 'All' 
    ? activities 
    : activities.filter((a) => a.type === activeActivityFilter);

  const headquartersStructure = [
    { id: 'about', title: 'About People & Youth', subtitle: 'Foundational Charter & Governance', items: ['Our Story', 'Our Philosophy', 'Vision 2050', 'Mission', 'Institutional Model', 'Founder', 'Global Leadership', 'Governance'] },
    { id: 'constitution', title: 'Constitution of People & Youth', subtitle: 'Founding Charter & Statutory Laws', items: ['Preamble', 'Founding Charter', 'Institutional Philosophy', 'Vision & Mission', 'Rights of Members', 'Duties', 'Schedules I–XV'] },
    { id: 'leadership-network', title: 'Leadership Network', subtitle: 'Office-Centric Governance Architecture', items: ["Founder's Office", 'Office of Chairperson', 'Office of CEO', 'Executive Officers', 'Chambers', 'Campus Master Plan'] },
    { id: 'activity', title: 'Institutional Activity', subtitle: 'Dynamic Live Feed & Dispatches', items: ['Editorials', 'Conferences', 'Policy Roundtables', 'Research Colloquia', 'Summits', 'Regional Dispatches'] },
    { id: 'realms', title: 'Knowledge Realms', subtitle: '18 Sovereign Thematic Domains', items: ['Governance Realm', 'Policy Realm', 'Economic Realm', 'Trade Realm', 'Technology Realm', 'AI Realm', 'Law & Justice Realm'] },
    { id: 'caves', title: 'Knowledge Caves', subtitle: 'Curated Reference Collections', items: ['Public Policy Cave', 'Economics Cave', 'Trade Cave', 'Technology Cave', 'AI Cave', 'Law Cave', 'Digital Library'] },
    { id: 'careers', title: 'Global Careers & Leadership Portal', subtitle: '13 Divisions & Universal Application Gateway', items: ['Executive Leadership', 'Research', 'Editorial', 'Technology', 'Consulting', 'Marketing', 'Finance', 'Candidate Dashboard'] }
  ];

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* 1. TOP UTILITY HEADER */}
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

        {/* 2. DYNAMIC MOVING TICKER MARQUEE */}
        <div className="bg-amber-400 text-black font-extrabold text-[10px] uppercase py-2 px-4 overflow-hidden whitespace-nowrap border-b border-amber-500 shadow-lg">
          <div className="inline-block animate-marquee space-x-8">
            {tickers.map((t, idx) => (
              <span key={idx} className="inline-inline-block px-4">
                {t} &middot;
              </span>
            ))}
          </div>
        </div>

        {/* 3. MASTHEAD & LIVE SEARCH */}
        <header className="border-b border-white/10 px-6 py-10 max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <Link href="/">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-serif hover:text-amber-400 transition-colors">
                  People & Youth <span className="text-amber-400">.</span>
                </h1>
              </Link>
              <p className="text-gray-400 text-[10px] tracking-widest uppercase mt-1">
                At the Heart of Change &middot; Question | Reflect | Act &middot; Leading Youth Towards Praxis
              </p>
            </div>

            {/* LIVE SEARCH & ASK AI */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search publications, authors, categories..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none text-[11px]"
                />

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a1024] border border-amber-400/40 rounded-xl p-3 z-50 space-y-2 shadow-2xl max-h-64 overflow-y-auto">
                    {searchResults.map((res) => (
                      <Link key={res.id} href={`/articles/${res.slug}`} className="block p-2 rounded hover:bg-white/10 border-b border-white/5 last:border-0">
                        <div className="font-bold text-white text-[11px] truncate">{res.title}</div>
                        <div className="text-[9px] text-gray-400">{res.category} &middot; By {res.author_name}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsAiOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold uppercase hover:from-amber-300 transition-all text-[10px] shrink-0 shadow-lg"
              >
                🤖 Ask AI
              </button>
            </div>
          </div>

          {/* MASTER DIVISION NAVIGATION BAR */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase border-t border-white/10 pt-3 text-gray-300">
            <Link href="/" className="text-amber-400 hover:underline">Home</Link>
            <Link href="/dissent-dias" className="hover:text-amber-400">Dissent Dias</Link>
            <Link href="/about" className="hover:text-amber-400">About Us</Link>
            <Link href="/constitution" className="hover:text-amber-400 text-amber-300">Constitution Charter</Link>
            <Link href="/leadership-network" className="hover:text-amber-400 text-amber-300">Leadership Network</Link>
            <Link href="/policy-lab" className="hover:text-amber-400">Policy Lab</Link>
            <Link href="/realms" className="hover:text-amber-400 text-amber-300">Knowledge Realms</Link>
            <Link href="/caves" className="hover:text-amber-400 text-amber-300">Knowledge Caves</Link>
            <Link href="/activity" className="hover:text-amber-400 text-amber-300">Live Activity</Link>
            <Link href="/careers" className="hover:text-amber-400 text-amber-300">Global Careers</Link>
            <Link href="/passport" className="hover:text-amber-400">Civic Passport</Link>
          </nav>
        </header>

        {/* 4. SOVEREIGN AI MODAL */}
        {isAiOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a1024] border border-amber-400/40 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <h3 className="text-sm font-bold text-amber-400 uppercase">Sovereign AI Knowledge Assistant</h3>
                </div>
                <button onClick={() => setIsAiOpen(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAiQuery} className="space-y-3">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask anything about our research, policy briefs, or dialectics..."
                  className="w-full bg-[#070b19] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none text-xs"
                />
                <button
                  type="submit"
                  disabled={aiThinking}
                  className="w-full py-2.5 rounded-xl bg-amber-400 text-black font-extrabold uppercase hover:bg-amber-300 transition-all text-xs"
                >
                  {aiThinking ? 'Synthesizing Knowledge...' : 'Query Sovereign AI'}
                </button>
              </form>

              {aiResponse && (
                <div className="bg-[#030611] p-4 rounded-xl border border-white/10 text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-serif">
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. AMAZON / FLIPKART STYLE DYNAMIC CAROUSEL */}
        {featuredSlides.length > 0 && (
          <section className="max-w-7xl mx-auto p-6 border-b border-white/10">
            <div className="relative bg-gradient-to-r from-[#0a1024] via-[#0f1733] to-[#141f45] border border-amber-400/30 p-8 sm:p-12 rounded-3xl space-y-4 overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-black font-extrabold uppercase text-[9px] tracking-widest">
                  FEATURED PUBLICATION
                </span>

                <div className="flex items-center gap-1.5">
                  {featuredSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="min-h-[140px] flex flex-col justify-between space-y-3 pt-2">
                <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white leading-tight">
                  {featuredSlides[currentSlide]?.title}
                </h2>

                <p className="text-base font-serif italic text-gray-300 max-w-3xl leading-relaxed">
                  {featuredSlides[currentSlide]?.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] text-gray-400 pt-4 border-t border-white/10 font-mono">
                <div className="flex items-center gap-3">
                  <span>By <strong className="text-white">{featuredSlides[currentSlide]?.author_name}</strong></span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold uppercase">{featuredSlides[currentSlide]?.category}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredSlides.length)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold"
                  >
                    ›
                  </button>

                  <Link
                    href={`/articles/${featuredSlides[currentSlide]?.slug}`}
                    className="px-6 py-2.5 bg-amber-400 text-black font-extrabold rounded-xl uppercase hover:bg-amber-300 transition-all text-xs"
                  >
                    Read Full Paper →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 6. CIVIC PASSPORT 3D FLIPPING SPOTLIGHT SECTION */}
        <section className="max-w-7xl mx-auto p-6 border-b border-white/10">
          <div className="bg-gradient-to-r from-[#070b19] via-[#0b142d] to-[#040711] border border-amber-400/40 p-8 sm:p-12 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-2xl">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-amber-400 text-black font-extrabold uppercase text-[9px] rounded-md tracking-widest">
                DIGITAL IDENTITY & MEMBER PASS
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-serif">
                Sovereign Civic Passport
              </h3>
              <p className="text-gray-300 text-xs font-serif leading-relaxed">
                Gain access to member-only discussions, early research drafts, statutory audit analysis, and official certificates. Click the digital pass to flip and scan social media verification QR links.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/passport"
                  className="px-6 py-3 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs shadow-lg"
                >
                  Unlock Civic Passport ID (₹499) →
                </Link>
                <span className="text-[10px] text-gray-400">Click pass on the right to flip 🔄</span>
              </div>
            </div>

            {/* 3D FLIPPING CARD WIDGET */}
            <div className="flex justify-center">
              <div
                onClick={() => setIsPassportFlipped(!isPassportFlipped)}
                className="w-full max-w-sm h-64 cursor-pointer perspective-1000 group"
              >
                <div
                  className={`relative w-full h-full duration-700 ease-out transition-transform ${
                    isPassportFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isPassportFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* FRONT SIDE */}
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#0a1024] via-[#0f1733] to-[#1a2754] border-2 border-amber-400/60 rounded-3xl p-6 shadow-2xl flex flex-col justify-between"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-amber-400 font-bold text-[9px] uppercase tracking-widest block">PEOPLE & YOUTH</span>
                        <h4 className="text-base font-black text-white uppercase font-serif">Civic Passport</h4>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-400 text-black font-extrabold text-[9px] rounded uppercase">₹499 MEMBER</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400 uppercase block">Passport Holder</span>
                      <div className="text-sm font-bold text-white">Swaraj Shandilya</div>
                      <div className="text-[9px] text-amber-300 font-mono">ID: PY-PASSPORT-2026-8841</div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/10 pt-2 text-[9px] text-gray-400">
                      <span>ISSUED BY: INSTITUTION BOARD</span>
                      <span className="text-amber-400 font-bold uppercase">FLIP CARD 🔄</span>
                    </div>
                  </div>

                  {/* BACK SIDE (VERIFICATION & SOCIAL CHANNELS) */}
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#070b19] via-[#0b142d] to-[#040711] border-2 border-amber-400/60 rounded-3xl p-5 shadow-2xl flex flex-col justify-between"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-amber-400 font-bold text-[9px] uppercase">VERIFIED CONNECT CHANNELS</span>
                      <span className="text-[8px] text-gray-400">SCAN / CLICK</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                      <a href="https://instagram.com/peopleandyouth" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg border border-white/10 hover:border-amber-400 flex items-center gap-1.5">
                        <span>📷</span>
                        <div><span className="text-white font-bold block">Instagram</span><span className="text-gray-400 text-[7px]">@peopleandyouth</span></div>
                      </a>

                      <a href="https://youtube.com/@peopleandyouth" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg border border-white/10 hover:border-amber-400 flex items-center gap-1.5">
                        <span>▶️</span>
                        <div><span className="text-white font-bold block">YouTube</span><span className="text-gray-400 text-[7px]">@peopleandyouth</span></div>
                      </a>

                      <a href="https://linkedin.com/in/swarajshandilya" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg border border-white/10 hover:border-amber-400 flex items-center gap-1.5">
                        <span>💼</span>
                        <div><span className="text-white font-bold block">LinkedIn</span><span className="text-gray-400 text-[7px]">Swaraj Shandilya</span></div>
                      </a>

                      <a href="mailto:contact@peopleandyouth.org" className="p-2 bg-white/5 rounded-lg border border-white/10 hover:border-amber-400 flex items-center gap-1.5">
                        <span>✉️</span>
                        <div><span className="text-white font-bold block">Email</span><span className="text-gray-400 text-[7px]">contact@...</span></div>
                      </a>
                    </div>

                    <div className="text-center text-[8px] text-amber-400 font-bold uppercase">
                      Click to return to passport identity
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. DYNAMIC LIVE ACTIVITY & MOVING SCENARIO SECTION */}
        <section className="max-w-7xl mx-auto p-6 space-y-4 border-b border-white/10">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/10 pb-3">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest block">REAL-TIME DISPATCHES</span>
              <h3 className="text-2xl font-extrabold text-white mt-0.5">Live Activity & Developments</h3>
            </div>

            <div className="flex items-center gap-2">
              {['All', 'Editorial', 'Conference', 'Policy Roundtable', 'Research Colloquium'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveActivityFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                    activeActivityFilter === f ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredActivities.map((act, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 hover:border-amber-400/50 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                    <span className="px-2.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">{act.type}</span>
                    <span className="text-emerald-400 font-mono">● {act.status}</span>
                  </div>
                  <h4 className="text-base font-bold text-white font-serif">{act.title}</h4>
                  <p className="text-gray-300 text-[11px] leading-relaxed font-serif">{act.desc}</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-400">
                  <span>Date: {act.date}</span>
                  <Link href="/activity" className="text-amber-400 font-bold hover:underline">View Live Activity →</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. DIGITAL HEADQUARTERS DIVISIONS GRID */}
        <div className="max-w-7xl mx-auto p-6 sm:p-12 space-y-12">
          {headquartersStructure.map((section: any) => (
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
      </div>

      {/* 9. RICH FOOTER */}
      <footer className="border-t border-white/10 bg-[#040711] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center text-[10px] text-gray-500 font-mono gap-4">
          <span>&copy; 2026 People & Youth &middot; www.peopleandyouth.org &middot; All Rights Reserved.</span>
          <span>Where Ideas Become Institutions</span>
        </div>
      </footer>
    </main>
  );
}