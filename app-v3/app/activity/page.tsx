import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 0; // Fresh live data on every page load

export const metadata = {
  title: 'Activity Portal & Dispatches | People & Youth',
  description: 'Live institutional dispatches, policy reviews, research colloquia, and public publications from People & Youth.',
};

export default async function ActivityPage() {
  // Fetch live articles published via CIMS from Supabase
  const { data: dbArticles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  // Format DB items into activity dispatches
  const dynamicDispatches = (dbArticles || []).map((art) => ({
    title: art.title,
    subtitle: art.subtitle || art.abstract || art.excerpt || 'Official publication record.',
    category: art.category ? art.category.toUpperCase() : 'EDITORIAL',
    status: 'DISPATCH',
    date: new Date(art.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    slug: `/articles/${art.slug}`,
  }));

  // Fallback static upcoming institutional events
  const staticEvents = [
    {
      title: 'Annual Civic Governance & Public Policy Summit',
      subtitle: 'National dialogue featuring researchers, legal scholars, and youth chapter leads.',
      category: 'CONFERENCE',
      status: 'LIVE REGISTRATION',
      date: 'Upcoming',
      slug: '#',
    },
    {
      title: 'Statutory CAG Audit & Fiscal Accountability Review',
      subtitle: 'Empirical review of public sector audit disclosures and state budget mechanics.',
      category: 'POLICY ROUNDTABLE',
      status: 'COMPLETED',
      date: 'Recent',
      slug: '#',
    },
    {
      title: 'AI Ethics & Sovereign Stack Architecture',
      subtitle: 'Technical colloquium on PostgreSQL data engineering, AI knowledge graphs, and privacy.',
      category: 'RESEARCH COLLOQUIUM',
      status: 'UPCOMING',
      date: 'Upcoming',
      slug: '#',
    },
  ];

  const allActivities = [...dynamicDispatches, ...staticEvents];

  return (
    <main className="min-h-screen bg-[#030611] text-white font-sans selection:bg-amber-400 selection:text-black">
      {/* HEADER / NAVIGATION */}
      <header className="border-b border-white/10 bg-[#070b19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-amber-400 font-black tracking-widest text-xs uppercase hover:underline">
            ← PEOPLE & YOUTH HQ
          </Link>
          <div className="flex items-center gap-4 text-[11px] font-mono text-gray-400">
            <span className="text-amber-300 font-bold uppercase">ACTIVITY PORTAL</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* HERO HEADER */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <span className="text-amber-400 font-mono text-xs uppercase font-bold tracking-widest block">
            EVENTS, DISPATCHES & COLLOQUIA
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Institutional Activity & Dispatches
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl font-mono">
            Real-time portal for live research dispatches, statutory policy reviews, academic colloquia, and published institutional works.
          </p>
        </div>

        {/* ACTIVITY CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allActivities.map((act, idx) => (
            <div
              key={idx}
              className="bg-[#070b19]/60 border border-amber-500/20 hover:border-amber-400/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 hover:bg-[#0a1024] shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 font-bold uppercase">
                    {act.category}
                  </span>
                  <span className="text-emerald-400 font-bold tracking-wider">
                    ● {act.status}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white leading-snug tracking-tight">
                  {act.title}
                </h2>

                <p className="text-gray-300 text-sm font-serif leading-relaxed line-clamp-3">
                  {act.subtitle}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                <span className="text-gray-400">Date: {act.date}</span>
                {act.slug !== '#' ? (
                  <Link
                    href={act.slug}
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    Engage Activity &rarr;
                  </Link>
                ) : (
                  <span className="text-gray-500 font-bold">Engage Activity &rarr;</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-white/10 py-8 text-center text-xs font-mono text-gray-500">
        &copy; 2026 People & Youth &middot; Activity Portal &middot; www.peopleandyouth.org
      </footer>
    </main>
  );
}