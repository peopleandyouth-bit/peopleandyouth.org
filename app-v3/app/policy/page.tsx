'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function PublicPolicyArchivePage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('policy_documents')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load policy archive:', err);
    } finally {
      setLoading(false);
    }
  };

  const docTypes = [
    'All',
    'RTI Filing',
    'CAG Critique',
    'PIL Draft',
    'Policy Audit',
    'Research Paper',
  ];

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesType = selectedType === 'All' || doc.document_type === selectedType;
      const matchesSearch =
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author_name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [documents, selectedType, searchQuery]);

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      {/* HEADER SECTION */}
      <header className="max-w-6xl mx-auto border-b border-white/10 pb-8 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
              PUBLIC CIVIC MECHANISMS & ARCHIVE
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Legal & Policy Repository</h1>
            <p className="text-gray-400 text-[11px] mt-1">
              Public access to RTI record queries, institutional audit reviews, legal petitions, and policy briefs.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dissent-dias"
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all text-gray-300"
            >
              📜 Editorial Essays
            </Link>
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all text-gray-300"
            >
              🔐 Admin Console
            </Link>
          </div>
        </div>

        {/* SEARCH & CLASSIFICATION CONTROLS */}
        <div className="pt-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search legal briefs, RTI subjects, author..."
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {docTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg border transition-all text-[11px] ${
                  selectedType === type
                    ? 'bg-amber-400 text-black border-amber-400 font-bold'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* DOCUMENT GRID */}
      <section className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Decrypting Public Legal Records...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl p-8 space-y-3">
            <div className="text-2xl">⚖️</div>
            <p className="text-gray-400 text-sm">No policy or legal documents match your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
              }}
              className="px-4 py-2 rounded-lg bg-white/10 text-amber-400 font-bold hover:bg-white/20 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-400/50 hover:bg-white/[0.07] transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 font-bold uppercase tracking-wider">
                      {doc.document_type}
                    </span>
                    <span className="text-gray-500 font-mono">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white leading-snug">
                    {doc.title}
                  </h2>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    {doc.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>Lead: <strong className="text-gray-300">{doc.author_name}</strong></span>
                  {doc.file_url ? (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-extrabold hover:bg-amber-300 transition-all"
                    >
                      📄 Download PDF Record →
                    </a>
                  ) : (
                    <span className="italic text-gray-600">No PDF Attached</span>
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