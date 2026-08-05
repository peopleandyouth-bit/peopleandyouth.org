import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 60; // Incremental Static Regeneration

export default async function IntegratedMasterHomepage() {
  // Query Unified Publication Feed
  const { data: publications } = await supabase
    .from('public_publications_feed')
    .select('*')
    .order('created_at', { ascending: false });

  const feed = publications || [];
  const heroArticle = feed[0] || null;
  const trendingArticles = feed.slice(1, 4);
  const dissentDiasEssays = feed.filter((p) => p.category?.toLowerCase().includes('essay') || p.category?.toLowerCase().includes('editorial')).slice(0, 4);
  const policyPapers = feed.filter((p) => p.category?.toLowerCase().includes('policy') || p.category?.toLowerCase().includes('audit') || p.category?.toLowerCase().includes('cag')).slice(0, 4);
  const philosophyPapers = feed.filter((p) => p.category?.toLowerCase().includes('philosophy') || p.category?.toLowerCase().includes('consciousness')).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* 1. TOP UTILITY BAR: SOCIAL MEDIA & ACCESS LINKS */}
        <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex flex-wrap justify-between items-center gap-2 text-[10px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold tracking-wider">PEOPLEANDYOUTH.ORG</span>
            <span>•</span>
            <span className="hidden sm:inline">SOVEREIGN CIVIC KNOWLEDGE PLATFORM</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* SOCIAL MEDIA CONNECT CHANNELS */}
            <div className="flex items-center gap-3 border-r border-white/10 pr-4">
              <a href="https://instagram.com/peopleandyouth" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
                📷 Instagram
              </a>
              <a href="https://youtube.com/@peopleandyouth" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
                ▶️ YouTube
              </a>
              <a href="https://linkedin.com/in/swarajshandilya" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
                💼 LinkedIn
              </a>
              <a href="mailto:peopleandyouth@gmail.com" className="hover:text-amber-400 transition-colors">
                ✉️ Email
              </a>
            </div>

            <Link href="/passport" className="text-amber-300 font-bold hover:underline">
              🪪 Civic Passport
            </Link>
            <Link href="/admin/login" className="hover:text-amber-400 transition-colors">
              🔐 Admin Console
            </Link>
          </div>
        </div>

        {/* 2. MASTER BRAND HEADER & NAVIGATION MENU */}
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

            <div className="flex items-center gap-3">
              <Link
                href="/dissent-dias"
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold rounded-xl uppercase hover:from-amber-300 transition-all shadow-lg text-[11px]"
              >
                📜 Dissent Dias Reader
              </Link>
            </div>
          </div>

          {/* COMPLETE HEADER NAVIGATION LINKS */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold uppercase border-t border-white/10 pt-3 text-gray-300">
            <Link href="/" className="text-amber-400 hover:underline">Home</Link>
            <Link href="/dissent-dias" className="hover:text-amber-400 transition-colors">Dissent Dias</Link>
            <Link href="/policy" className="hover:text-amber-400 transition-colors">About Us</Link>
            <Link href="/policy-lab" className="hover:text-amber-400 transition-colors">Policy Lab</Link>
            <Link href="/journals" className="hover:text-amber-400 transition-colors">Renaissance Journals</Link>
            <Link href="/academy" className="hover:text-amber-400 transition-colors">Academy</Link>
            <Link href="/library" className="hover:text-amber-400 transition-colors">Digital Library</Link>
            <Link href="/observatory" className="hover:text-amber-400 transition-colors">Observatory</Link>
            <Link href="/global-map" className="hover:text-amber-400 transition-colors">Global Chapters</Link>
            <Link href="/passport" className="hover:text-amber-400 transition-colors">Civic Passport</Link>
          </nav>
        </header>

        {/* 3. HERO SECTION (LATEST FEATURED PUBLICATION) */}
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

        {/* 4. TRENDING RESEARCH & EDITORIALS */}
        {trendingArticles.length > 0 && (
          <section className="max-w-7xl mx-auto p-6 space-y-4 border-b border-white/10">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <span>🔥</span> Trending Research & Publications
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

        {/* 5. DISSENT DIAS ESSAYS & POLICY SECTIONS */}
        <section className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-white/10">
          {/* DISSENT DIAS ESSAYS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">
              📜 Dissent Dias Essays
            </h3>
            <div className="space-y-3">
              {dissentDiasEssays.map((e) => (
                <Link key={e.id} href={`/articles/${e.slug}`} className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:border-amber-400 transition-all">
                  <span className="text-[9px] text-amber-400 font-bold uppercase block mb-1">{e.category}</span>
                  <h4 className="text-sm font-bold text-white leading-snug">{e.title}</h4>
                </Link>
              ))}
            </div>
          </div>

          {/* POLICY LAB & AUDITS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">
              ⚖️ Policy Lab & Statutory Audits
            </h3>
            <div className="space-y-3">
              {policyPapers.map((p) => (
                <Link key={p.id} href={`/articles/${p.slug}`} className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:border-amber-400 transition-all">
                  <span className="text-[9px] text-amber-400 font-bold uppercase block mb-1">{p.category}</span>
                  <h4 className="text-sm font-bold text-white leading-snug">{p.title}</h4>
                </Link>
              ))}
            </div>
          </div>

          {/* PHILOSOPHY & CONSCIOUSNESS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">
              🧠 Philosophy & Consciousness
            </h3>
            <div className="space-y-3">
              {philosophyPapers.map((ph) => (
                <Link key={ph.id} href={`/articles/${ph.slug}`} className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:border-amber-400 transition-all">
                  <span className="text-[9px] text-amber-400 font-bold uppercase block mb-1">{ph.category}</span>
                  <h4 className="text-sm font-bold text-white leading-snug">{ph.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CIVIC PASSPORT MEMBERSHIP PROMOTION */}
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

      {/* 7. RICH INSTITUTIONAL FOOTER */}
      <footer className="border-t border-white/10 bg-[#040711] mt-12 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* COL 1: MISSION */}
          <div className="space-y-3">
            <h4 className="text-lg font-extrabold text-white uppercase">People & Youth <span className="text-amber-400">.</span></h4>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              At the Heart of Change. Building a culture of reasoned dialogue, intellectual curiosity, and responsible civic action.
            </p>
            <div className="text-amber-400 font-bold text-[10px] tracking-widest uppercase pt-2">
              QUESTION. REFLECT. ACT.
            </div>
          </div>

          {/* COL 2: PLATFORM DIRECTORY */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Platform Directory</h5>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li><Link href="/dissent-dias" className="hover:text-white transition-colors">Dissent Dias Reader</Link></li>
              <li><Link href="/journals" className="hover:text-white transition-colors">Renaissance Journals</Link></li>
              <li><Link href="/policy-lab" className="hover:text-white transition-colors">Public Policy Lab</Link></li>
              <li><Link href="/academy" className="hover:text-white transition-colors">Institution Academy</Link></li>
              <li><Link href="/library" className="hover:text-white transition-colors">Digital Acts Library</Link></li>
              <li><Link href="/observatory" className="hover:text-white transition-colors">Live Policy Observatory</Link></li>
            </ul>
          </div>

          {/* COL 3: GOVERNANCE & LEGAL */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Governance</h5>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li><Link href="/policy" className="hover:text-white transition-colors">About Us & Vision</Link></li>
              <li><Link href="/passport" className="hover:text-white transition-colors">Digital Passport ID</Link></li>
              <li><Link href="/global-map" className="hover:text-white transition-colors">Global Chapters</Link></li>
              <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Console</Link></li>
            </ul>
          </div>

          {/* COL 4: CONNECT & SOCIAL MEDIA */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Connect Channels</h5>
            <div className="space-y-2 text-gray-300 text-[11px]">
              <p>📷 Instagram: <a href="https://instagram.com/peopleandyouth" target="_blank" rel="noreferrer" className="text-amber-300 font-bold hover:underline">@peopleandyouth</a></p>
              <p>▶️ YouTube: <a href="https://youtube.com/@peopleandyouth" target="_blank" rel="noreferrer" className="text-amber-300 font-bold hover:underline">@peopleandyouth</a></p>
              <p>💼 LinkedIn: <a href="https://linkedin.com/in/swarajshandilya" target="_blank" rel="noreferrer" className="text-amber-300 font-bold hover:underline">Swaraj Shandilya</a></p>
              <p>✉️ Email: <a href="mailto:peopleandyouth@gmail.com" className="text-amber-300 font-bold hover:underline">peopleandyouth@gmail.com</a></p>
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