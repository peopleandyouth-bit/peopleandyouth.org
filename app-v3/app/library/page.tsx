'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function DigitalLibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    setLoading(true);
    const { data } = await supabase.from('digital_library_items').select('*').order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setItems(data);
    } else {
      // Default Seed Items
      setItems([
        {
          id: '1',
          title: 'Right to Information Act, 2005 (Statutory Text & Annotations)',
          item_type: 'Act',
          author_publisher: 'Parliament of India / PY Legal Press',
          publication_year: 2005,
          file_url: 'https://rti.gov.in',
          summary: 'An Act to provide for setting out the practical regime of right to information for citizens to secure access to information under the control of public authorities.',
        },
        {
          id: '2',
          title: 'CAG Audit Guidelines on Educational Infrastructure & Grant Allocations',
          item_type: 'Gazette',
          author_publisher: 'Comptroller & Auditor General of India',
          publication_year: 2024,
          file_url: '#',
          summary: 'Official audit standards for assessing public expenditure, statutory compliance, and operational efficiency in institutional projects.',
        }
      ]);
    }
    setLoading(false);
  };

  const types = ['All', 'Act', 'Gazette', 'Research Report', 'Book', 'Case Study', 'Presentation'];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = selectedType === 'All' || item.item_type === selectedType;
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author_publisher?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [items, selectedType, searchQuery]);

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            CENTRAL KNOWLEDGE & REPOSITORY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Digital Library & Acts Archive</h1>
          <p className="text-gray-400 text-[11px] mt-1">
            Searchable institutional repository of statutory Acts, official Gazettes, policy reports, and academic texts.
          </p>
        </div>
        <Link href="/policy" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
          ⚖️ Policy Repository
        </Link>
      </header>

      {/* SEARCH & FILTERS */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Acts, Gazettes, Books, or Keywords..."
          className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none flex-1 max-w-md"
        />

        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] ${
                selectedType === t ? 'bg-amber-400 text-black border-amber-400 font-bold' : 'bg-white/5 text-gray-400 border-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* LIBRARY GRID */}
      <section className="max-w-7xl mx-auto space-y-4">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Decrypting Library Index...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl text-gray-500">
            No library items match your search filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 font-bold uppercase">
                      {item.item_type}
                    </span>
                    <span className="text-gray-500 font-mono">{item.publication_year}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-snug">{item.title}</h2>
                  <p className="text-gray-300 text-[11px] leading-relaxed">{item.summary}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>Source: {item.author_publisher}</span>
                  {item.file_url ? (
                    <a href={item.file_url} target="_blank" rel="noreferrer" className="text-amber-400 font-bold hover:underline">
                      📖 Read Document →
                    </a>
                  ) : (
                    <span className="italic">Text Archived</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}