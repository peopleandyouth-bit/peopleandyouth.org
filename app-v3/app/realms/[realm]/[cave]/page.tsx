'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CaveDetailPage() {
  const params = useParams();
  const rawRealm = (params?.realm as string) || 'policy';
  const rawCave = (params?.cave as string) || 'public-administration';

  // Format display titles from slugs while preserving exact nomenclature
  const formatTitle = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const realmTitle = formatTitle(rawRealm) + ' Realm';
  const caveTitle = formatTitle(rawCave) + ' Cave';

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCaveArticles() {
      setLoading(true);
      // Fetch published articles matching this cave or realm category
      const { data, error } = await supabase
        .from('articles')
        .select('*, authors(name, designation), publications(name)')
        .eq('status', 'PUBLISHED')
        .or(`category.ilike.%${formatTitle(rawCave)}%,category.ilike.%${formatTitle(rawRealm)}%,publication_type.eq.KNOWLEDGE_CAVE`)
        .order('published_at', { ascending: false });

      if (data) setArticles(data);
      setLoading(false);
    }

    fetchCaveArticles();
  }, [rawRealm, rawCave]);

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans p-6 sm:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* BREADCRUMB / TOP NAVIGATION */}
        <div className="flex justify-between items-center text-xs border-b border-gray-800 pb-4">
          <Link href="/realms" className="text-amber-400 hover:underline font-mono uppercase tracking-wider">
            ← Return to Knowledge Realms Architecture
          </Link>

          <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest hidden sm:inline">
            PEOPLEANDYOUTH.ORG • KNOWLEDGE CAVES ARCHIVE
          </span>
        </div>

        {/* CAVE HEADER BANNER */}
        <div className="bg-[#070b19] border border-amber-500/30 rounded-2xl p-8 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded">
              {realmTitle}
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-[10px] font-mono text-gray-400 uppercase">
              SPECIALIZED KNOWLEDGE CAVE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wide">
            {caveTitle}
          </h1>

          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Curated intellectual repository housing policy formulations, statutory analyses, empirical research dispatches, and institutional literature.
          </p>
        </div>

        {/* ARTICLES EXPLORER GRID */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
              PUBLISHED DISPATCHES & RESEARCH PAPERS ({articles.length})
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 font-mono">
              Fetching knowledge archive...
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-[#070b19] border border-gray-800/80 rounded-2xl p-12 text-center space-y-3">
              <span className="text-2xl">📚</span>
              <h3 className="text-sm font-bold text-gray-300 uppercase">
                Cave Literature Initializing
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                No published dispatches have been tagged under <strong>{caveTitle}</strong> yet. Papers submitted via the Command Centre under this cave will render here live.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((art) => (
                <article key={art.id} className="bg-[#070b19] border border-gray-800/80 hover:border-amber-500/40 rounded-xl p-6 transition space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest block">
                      {art.category || 'Public Policy'}
                    </span>
                    <h2 className="text-lg font-bold text-white hover:text-amber-400 transition">
                      {art.title}
                    </h2>
                    {art.subtitle && (
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {art.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-800/80 pt-3 flex justify-between items-center text-[11px] text-gray-500 font-mono">
                    <span>By {art.authors?.name || 'People & Youth Research Board'}</span>
                    <span className="text-amber-400">{art.reading_time || 5} min read</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}