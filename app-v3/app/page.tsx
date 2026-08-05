import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 60; // Incremental Static Regeneration (ISR)

export default async function DynamicNewsroomHomepage() {
  // Query Unified Feed for Dynamic Homepage Sections
  const { data: publications } = await supabase
    .from('public_publications_feed')
    .select('*')
    .order('created_at', { ascending: false });

  const feed = publications || [];
  const heroArticle = feed[0] || null;
  const trendingArticles = feed.slice(1, 4);
  const editorials = feed.filter((p) => p.category?.toLowerCase().includes('editorial') || p.category?.toLowerCase().includes('essay')).slice(0, 4);
  const policyPapers = feed.filter((p) => p.category?.toLowerCase().includes('policy') || p.category?.toLowerCase().includes('audit')).slice(0, 4);
  const philosophyPapers = feed.filter((p) => p.category?.toLowerCase().includes('philosophy') || p.category?.toLowerCase().includes('consciousness')).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      {/* TOP INSTITUTION BAR */}
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex justify-between items-center text-[10px] text-gray-400">
        <div className="flex gap-4">
          <span className="text-amber-400 font-bold">PEOPLEANDYOUTH.ORG</span>
          <span>•</span>
          <span>SOVEREIGN CIVIC KNOWLEDGE PLATFORM</span>
        </div>
        <div className="flex gap-4">
          <Link href="/passport" className="hover:text-amber-400 transition-colors">🪪 Civic Passport</Link>
          <Link href="/admin/login" className="hover:text-amber-400 transition-colors">🔐 Admin Access</Link>
        </div>
      </div>

      {/* MAIN NAVIGATION */}
      <header className="border-b border-white/10 px-6 py-6 max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            People & Youth <span className="text-amber-400">.</span>
          </h1>
          <p className="text-gray-400 text-[10px] tracking-widest uppercase mt-0.5">
            Question | Reflect | Act — Leading Youth Towards Praxis
          </p>
        </div>

        <nav className="flex flex-wrap gap-4 text-[11px] font-bold uppercase">
          <Link href="/dissent-dias" className="text-amber-400 hover:underline">Dissent Dias</Link>
          <Link href="/journals" className="text-gray-300 hover:text-white">Journals</Link>
          <Link href="/policy-lab" className="text-gray-300 hover:text-white">Policy Lab</Link>
          <Link href="/academy" className="text-gray-300 hover:text-white">Academy</Link>
          <Link href="/library" className="text-gray-300 hover:text-white">Library</Link>
          <Link href="/observatory" className="text-gray-300 hover:text-white">Observatory</Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      {heroArticle && (
        <section className="max-w-7xl mx-auto p-6 border-b border-white/10">
          <div className="bg-gradient-to-r from-[#0a1024] to-[#111936] border border-amber-400/30 p-8 sm:p-12 rounded-3xl space-y-4 relative overflow-hidden">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-black font-extrabold uppercase text-[9px] tracking-widest">
              FEATURED PUBLICATION
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white leading-tight">
              {heroArticle.title}
            </h2>
            {heroArticle.subtitle && (
              <p className="text-base font-serif italic text-gray-300 max-w-3xl">
                {heroArticle.subtitle}
              </p>
            )}
            <div className="flex items-center gap-4 text-[10px] text-gray-400 pt-2 font-mono">
              <span>By <strong className="text-white">{heroArticle.author_name}</strong></span>
              <span>•</span>
              <span className="text-amber-400 font-bold uppercase">{heroArticle.category}</span>
              <span>•</span>
              <Link
                href={`/articles/${heroArticle.slug}`}
                className="px-5 py-2 bg-amber-400 text-black font-extrabold rounded-xl uppercase hover:bg-amber-300 transition-all inline-block ml-auto"
              >
                Read Full Paper →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TRENDING ARTICLES GRID */}
      {trendingArticles.length > 0 && (
        <section className="max-w-7xl mx-auto p-6 space-y-4 border-b border-white/10">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            🔥 Trending Research & Editorials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingArticles.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-amber-400 uppercase">{item.category}</span>
                  <h4 className="text-base font-bold text-white leading-snug">{item.title}</h4>
                  <p className="text-gray-400 text-[11px] line-clamp-2">{item.subtitle}</p>
                </div>
                <Link href={`/articles/${item.slug}`} className="text-amber-400 font-bold text-[10px] hover:underline pt-2 block">
                  Read Record →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* POLICY & PHILOSOPHY SECTIONS */}
      <section className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-white/10">
        {/* POLICY LAB */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">
            ⚖️ Statutory Policy & CAG Audits
          </h3>
          <div className="space-y-3">
            {policyPapers.map((p) => (
              <Link key={p.id} href={`/articles/${p.slug}`} className="block p-4 bg-white/5 border border-white/10 rounded-xl hover:border-amber-400 transition-all">
                <span className="text-[9px] text-amber-400 font-bold uppercase block mb-1">{p.category}</span>
                <h4 className="text-sm font-bold text-white">{p.title}</h4>
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
                <h4 className="text-sm font-bold text-white">{ph.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CIVIC PASSPORT PROMOTION */}
      <section className="max-w-7xl mx-auto p-6">
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black p-8 sm:p-12 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6 shadow-2xl">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-black text-white font-extrabold uppercase text-[9px] rounded-md">
              CIVIC PASSPORT MEMBERSHIP (₹499)
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">Unlock Premium Research & Policy Repositories</h3>
            <p className="text-xs font-medium max-w-xl">
              Gain access to member-only discussions, early research drafts, statutory audit analysis, and official certificates.
            </p>
          </div>
          <Link href="/passport" className="px-6 py-3 bg-black text-white font-extrabold rounded-2xl uppercase text-xs hover:bg-gray-900 transition-all shrink-0">
            Join Civic Passport →
          </Link>
        </div>
      </section>
    </main>
  );
}