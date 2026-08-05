'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function DissentDiasPortalPage() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);

    // Fetch from Unified Feed
    const { data, error } = await supabase
      .from('public_publications_feed')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPublications(data);
    } else {
      // Fallback query across individual tables
      const { data: cimsData } = await supabase
        .from('institution_content')
        .select('*')
        .eq('status', 'published');

      const { data: essayData } = await supabase
        .from('watermarked_essays')
        .select('*')
        .eq('status', 'published');

      const combined = [
        ...(cimsData || []).map((i) => ({ ...i, category: i.domain || 'EDITORIAL' })),
        ...(essayData || []).map((e) => ({ ...e, category: e.category || 'ESSAY' }))
      ];

      setPublications(combined);
    }
    setLoading(false);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    publications.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [publications]);

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      const matchesCategory = selectedCategory === 'All' || pub.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        pub.title?.toLowerCase().includes(q) ||
        pub.subtitle?.toLowerCase().includes(q) ||
        pub.author_name?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [publications, selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            PUBLIC EDITORIAL PORTAL
          </span>
          <h1 className="text-4xl font-extrabold text-white mt-1">Dissent Dias</h1>
          <p className="text-gray-400 text-[11px] mt-1">
            Sovereign knowledge repository, legal critiques, and public policy essays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/cims"
            className="px-4 py-2.5 rounded-xl bg-amber-400 text-black font-extrabold hover:bg-amber-300 transition-all shadow-lg"
          >
            ⚙️ Admin Console
          </Link>
        </div>
      </header>

      {/* SEARCH & CATEGORY FILTERS */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, subtitle, or author..."
            className="w-full sm:w-96 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
          />

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black border-amber-400'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PUBLICATION FEED */}
      <section className="max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Decrypting Editorial Index...</span>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl text-gray-400 space-y-3">
            <div className="text-2xl">📜</div>
            <p className="text-sm font-bold">No publications match your filter or search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((pub) => (
              <article
                key={pub.id}
                className="bg-white/5 border border-white/10 hover:border-amber-400/60 p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                    <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                      {pub.category}
                    </span>
                    <span className="text-gray-500 font-mono">
                      {new Date(pub.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {pub.title}
                  </h2>

                  {pub.subtitle && (
                    <p className="text-gray-400 text-[11px] line-clamp-2 leading-relaxed font-serif italic">
                      {pub.subtitle}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-400">
                  <span>By <strong className="text-white">{pub.author_name}</strong></span>
                  <Link
                    href={`/articles/${pub.slug}`}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Read Article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}