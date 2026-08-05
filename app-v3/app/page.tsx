'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function UnifiedSovereignHomepage() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('public_publications_feed')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPublications(data);
    } else {
      // Fallback query across individual tables
      const { data: cimsData } = await supabase.from('institution_content').select('*');
      const { data: essayData } = await supabase.from('watermarked_essays').select('*');
      
      const combined = [
        ...(cimsData || []).map((i) => ({ ...i, category: i.domain || 'EDITORIAL' })),
        ...(essayData || []).map((e) => ({ ...e, category: e.category || 'ESSAY' }))
      ];
      setPublications(combined);
    }
    setLoading(false);
  };

  // Filtered publications for live header search
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

  // AI Assistant Query Handler
  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiThinking(true);
    setAiResponse(null);

    // Simulate Sovereign AI synthesis across database
    setTimeout(() => {
      setAiResponse(
        `Synthesizing platform records for "${aiPrompt}":\n\nBased on Sovereign Knowledge Archives and "Dialectics of Consciousness", civilization advances not through ideological binaries, but through the courage to question assumptions and reconcile contradictions into Praxis.`
      );
      setAiThinking(false);
    }, 1200);
  };

  const heroArticle = publications[0] || null;
  const trendingArticles = publications.slice(1, 4);
  const dissentDiasEssays = publications.filter((p) => p.category?.toLowerCase().includes('essay') || p.category?.toLowerCase().includes('editorial')).slice(0, 4);
  const policyPapers = publications.filter((p) => p.category?.toLowerCase().includes('policy') || p.category?.toLowerCase().includes('audit') || p.category?.toLowerCase().includes('cag')).slice(0, 4);

  // PROJECT HIMALAYA TAXONOMY DATA
  const mountainRanges = [
    { id: 'R1', name: 'Range I: Dialectics & Consciousness', desc: 'Philosophical soliloquies, mind theory, and ideological synthesis.', caves: 'Caves 1 - 4', link: '/caves' },
    { id: 'R2', name: 'Range II: Civic Mechanisms & Statutory Law', desc: 'CAG audit reviews, RTI record disclosures, and PIL petitions.', caves: 'Caves 5 - 8', link: '/policy-lab' },
    { id: 'R3', name: 'Range III: Macro-Strategy & Geopolitics', desc: 'Global trade, economic analytics, and international affairs.', caves: 'Caves 9 - 13', link: '/observatory' },
    { id: 'R4', name: 'Range IV: Praxis & Youth Leadership', desc: 'Civic action, institutional governance, and youth leadership.', caves: 'Caves 14 - 17', link: '/academy' }
  ];

  const knowledgeCaves = [
    'Cave 01: Dialectics', 'Cave 02: Consciousness', 'Cave 03: Epistemology', 'Cave 04: Moral Philosophy',
    'Cave 05: Statutory Law', 'Cave 06: CAG Audits', 'Cave 07: RTI Repository', 'Cave 08: Constitutional PILs',
    'Cave 09: Trade & Strategy', 'Cave 10: Data Engineering', 'Cave 11: Global Economy', 'Cave 12: Public Policy',
    'Cave 13: Diplomatic History', 'Cave 14: Youth Praxis', 'Cave 15: Institutional Ethics', 'Cave 16: Leadership', 'Cave 17: Civic Action'
  ];

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* 1. TOP UTILITY & SOCIAL CONNECT BAR */}
        <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex flex-wrap justify-between items-center gap-2 text-[10px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold tracking-wider">PEOPLEANDYOUTH.ORG</span>
            <span>•</span>
            <span className="hidden sm:inline">SOVEREIGN CIVIC KNOWLEDGE PLATFORM</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 border-r border-white/10 pr-4">
              <a href="https://instagram.com/peopleandyouth" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">📷 Instagram</a>
              <a href="https://youtube.com/@peopleandyouth" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">▶️ YouTube</a>
              <a href="https://linkedin.com/in/swarajshandilya" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">💼 LinkedIn</a>
              <a href="mailto:contact@peopleandyouth.org" className="hover:text-amber-400 transition-colors">✉️ Email</a>
            </div>

            <Link href="/passport" className="text-amber-300 font-bold hover:underline">🪪 Civic Passport</Link>
            <Link href="/admin/login" className="hover:text-amber-400 transition-colors">🔐 Admin Console</Link>
          </div>
        </div>

        {/* 2. MAIN HEADER & LIVE SEARCH BAR */}
        <header className="border-b border-white/10 px-6 py-6 max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <Link href="/">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase hover:text-amber-400 transition-colors">
                  People & Youth <span className="text-amber-400">.</span>
                </h1>
              </Link>
              <p className="text-gray-400 text-[10px] tracking-widest uppercase mt-1">
                At the Heart of Change &middot; Question | Reflect | Act &middot; Leading Youth Towards Praxis
              </p>
            </div>

            {/* LIVE SEARCH & AI BUTTON */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search publications, authors, categories..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none text-[11px]"
                />

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a1024] border border-amber-400/40 rounded-xl p-3 z-50 space-y-2 shadow-2xl max-h-64 overflow-y-auto">
                    <div className="text-[9px] font-bold text-amber-400 uppercase">Search Results ({searchResults.length})</div>
                    {searchResults.map((res) => (
                      <Link
                        key={res.id}
                        href={`/articles/${res.slug}`}
                        className="block p-2 rounded hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                      >
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

          {/* FULL NAVIGATION MENU */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold uppercase border-t border-white/10 pt-3 text-gray-300">
            <Link href="/" className="text-amber-400 hover:underline">Home</Link>
            <Link href="/dissent-dias" className="hover:text-amber-400 transition-colors">Dissent Dias</Link>
            <Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link>
            <Link href="/policy-lab" className="hover:text-amber-400 transition-colors">Policy Lab</Link>
            <Link href="/caves" className="hover:text-amber-400 transition-colors text-amber-300">17 Caves</Link>
            <Link href="/mountains" className="hover:text-amber-400 transition-colors text-amber-300">4 Mountain Ranges</Link>
            <Link href="/journals" className="hover:text-amber-400 transition-colors">Renaissance Journals</Link>
            <Link href="/library" className="hover:text-amber-400 transition-colors">Digital Library</Link>
            <Link href="/observatory" className="hover:text-amber-400 transition-colors">Observatory</Link>
            <Link href="/passport" className="hover:text-amber-400 transition-colors">Civic Passport</Link>
          </nav>
        </header>

        {/* 3. SOVEREIGN AI ASSISTANT MODAL */}
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

        {/* 4. HERO SECTION */}
        {heroArticle && (
          <section className="max-w-7xl mx-auto p-6 border-b border-white/10">
            <div className="bg-gradient-to-r from-[#0a1024] via-[#0f1733] to-[#141f45] border border-amber-400/30 p-8 sm:p-12 rounded-3xl space-y-4 relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-black font-extrabold uppercase text-[9px] tracking-widest">
                  FEATURED PUBLICATION
                </span>
                <span className="text-gray-400 font-mono text-[10px]">
                  {new Date(heroArticle.created_at).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white leading-tight">
                {heroArticle.title}
              </h2>

              {heroArticle.subtitle && (
                <p className="text-base font-serif italic text-gray-300 max-w-3xl leading-relaxed">
                  {heroArticle.subtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] text-gray-400 pt-4 border-t border-white/10 font-mono">
                <div className="flex items-center gap-3">
                  <span>By <strong className="text-white">{heroArticle.author_name}</strong></span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold uppercase">{heroArticle.category}</span>
                </div>

                <Link
                  href={`/articles/${heroArticle.slug}`}
                  className="px-6 py-2.5 bg-amber-400 text-black font-extrabold rounded-xl uppercase hover:bg-amber-300 transition-all text-xs"
                >
                  Read Full Paper →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 5. PROJECT HIMALAYA: 4 MOUNTAIN RANGES */}
        <section className="max-w-7xl mx-auto p-6 space-y-4 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest block">PROJECT HIMALAYA</span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">🏔️ The 4 Sovereign Mountain Ranges</h3>
            </div>
            <Link href="/mountains" className="text-amber-400 hover:underline font-bold text-[10px]">Explore All Ranges →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mountainRanges.map((range) => (
              <Link key={range.id} href={range.link} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-amber-400/60 transition-all space-y-3 block group">
                <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 font-bold text-[9px] uppercase border border-amber-400/20">
                  {range.caves}
                </span>
                <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">{range.name}</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">{range.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. PROJECT HIMALAYA: 17 KNOWLEDGE CAVES */}
        <section className="max-w-7xl mx-auto p-6 space-y-4 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest block">TAXONOMY ARCHIVE</span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">🏛️ The 17 Knowledge Caves</h3>
            </div>
            <Link href="/caves" className="text-amber-400 hover:underline font-bold text-[10px]">View Cave Directory →</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {knowledgeCaves.map((cave, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl text-center hover:border-amber-400/40 transition-colors">
                <span className="text-gray-300 font-bold text-[10px] block truncate">{cave}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 7. TRENDING RESEARCH & EDITORIALS */}
        {trendingArticles.length > 0 && (
          <section className="max-w-7xl mx-auto p-6 space-y-4 border-b border-white/10">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <span>🔥</span> Trending Publications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingArticles.map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/10 hover:border-amber-400/50 p-6 rounded-2xl space-y-3 flex flex-col justify-between transition-all group">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {item.category}
                    </span>
                    <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 text-[11px] line-clamp-2 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  <Link href={`/articles/${item.slug}`} className="text-amber-400 font-bold text-[10px] hover:underline pt-2 block">
                    Read Publication →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. CIVIC PASSPORT PROMOTION */}
        <section className="max-w-7xl mx-auto p-6">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black p-8 sm:p-12 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-black text-white font-extrabold uppercase text-[9px] rounded-md tracking-widest">
                CIVIC PASSPORT MEMBERSHIP (₹499)
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold">Unlock Premium Research & Policy Repositories</h3>
              <p className="text-xs font-medium max-w-xl leading-relaxed">
                Gain access to member-only discussions, early research drafts, statutory audit analysis, and official certificates.
              </p>
            </div>

            <Link href="/passport" className="px-6 py-3.5 bg-black text-white font-extrabold rounded-2xl uppercase text-xs hover:bg-gray-900 transition-all shrink-0 shadow-xl">
              Join Civic Passport →
            </Link>
          </div>
        </section>
      </div>

      {/* 9. RICH FOOTER */}
      <footer className="border-t border-white/10 bg-[#040711] mt-12 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-3">
            <h4 className="text-lg font-extrabold text-white uppercase">People & Youth <span className="text-amber-400">.</span></h4>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              At the Heart of Change. Building a culture of reasoned dialogue, intellectual curiosity, and responsible civic action.
            </p>
            <div className="text-amber-400 font-bold text-[10px] tracking-widest uppercase pt-2">
              QUESTION. REFLECT. ACT.
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Platform Directory</h5>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li><Link href="/dissent-dias" className="hover:text-white transition-colors">Dissent Dias Reader</Link></li>
              <li><Link href="/caves" className="hover:text-white transition-colors">17 Knowledge Caves</Link></li>
              <li><Link href="/mountains" className="hover:text-white transition-colors">4 Mountain Ranges</Link></li>
              <li><Link href="/policy-lab" className="hover:text-white transition-colors">Public Policy Lab</Link></li>
              <li><Link href="/journals" className="hover:text-white transition-colors">Renaissance Journals</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Governance</h5>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us & Vision</Link></li>
              <li><Link href="/passport" className="hover:text-white transition-colors">Digital Passport ID</Link></li>
              <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Console</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Connect Channels</h5>
            <div className="space-y-2 text-gray-300 text-[11px]">
              <p>📷 Instagram: <a href="https://instagram.com/peopleandyouth" target="_blank" rel="noreferrer" className="text-amber-300 font-bold hover:underline">@peopleandyouth</a></p>
              <p>▶️ YouTube: <a href="https://youtube.com/@peopleandyouth" target="_blank" rel="noreferrer" className="text-amber-300 font-bold hover:underline">@peopleandyouth</a></p>
              <p>💼 LinkedIn: <a href="https://linkedin.com/in/swarajshandilya" target="_blank" rel="noreferrer" className="text-amber-300 font-bold hover:underline">Swaraj Shandilya</a></p>
              <p>✉️ Email: <a href="mailto:contact@peopleandyouth.org" className="text-amber-300 font-bold hover:underline">contact@peopleandyouth.org</a></p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-wrap justify-between items-center text-[10px] text-gray-500 font-mono gap-4">
          <span>&copy; 2026 People & Youth &middot; www.peopleandyouth.org &middot; All Rights Reserved.</span>
          <span>Sovereign Knowledge Infrastructure &middot; Leading Youth Towards Praxis</span>
        </div>
      </footer>
    </main>
  );
}