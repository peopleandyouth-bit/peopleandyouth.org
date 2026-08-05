'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function DissentDiasPage() {
  const [essays, setEssays] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchEssays();
  }, []);

  const fetchEssays = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watermarked_essays')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setEssays(data);
      }
    } catch (err) {
      console.error('Failed to load editorial feed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derive unique categories dynamically
  const categories = useMemo(() => {
    const cats = Array.from(new Set(essays.map((item) => item.category).filter(Boolean)));
    return ['All', ...cats];
  }, [essays]);

  // Filtered essays computed in real-time
  const filteredEssays = useMemo(() => {
    return essays.filter((essay) => {
      const matchesSearch =
        essay.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        essay.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        essay.author_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || essay.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [essays, searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      {/* HEADER SECTION */}
      <header className="max-w-6xl mx-auto border-b border-white/10 pb-8 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
              PUBLIC EDITORIAL PORTAL
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Dissent Dias</h1>
            <p className="text-gray-400 text-[11px] mt-1">
              Sovereign knowledge repository, legal critiques, and public policy essays.
            </p>
          </div>
          <Link
            href="/admin/login"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all text-gray-300"
          >
            ðŸ” Admin Console
          </Link>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="pt-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subtitle, or author..."
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                âœ•
              </button>
            )}
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg border transition-all text-[11px] ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black border-amber-400 font-bold'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ESSAY GRID FEED */}
      <section className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading Sovereign Records...</span>
          </div>
        ) : filteredEssays.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl p-8 space-y-3">
            <div className="text-2xl">ðŸ”</div>
            <p className="text-gray-400 text-sm">No essays match your current filter or search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-lg bg-white/10 text-amber-400 font-bold hover:bg-white/20 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEssays.map((essay) => (
              <Link
                key={essay.id}
                href={`/essay/${essay.slug}`}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-400/50 hover:bg-white/[0.07] transition-all space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    <span>{essay.category}</span>
                    <span className="text-gray-500 font-mono">{essay.read_time}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                    {essay.title}
                  </h2>
                  {essay.subtitle && (
                    <p className="text-gray-400 text-[11px] line-clamp-2 leading-relaxed">
                      {essay.subtitle}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>By {essay.author_name}</span>
                  <span>{new Date(essay.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}