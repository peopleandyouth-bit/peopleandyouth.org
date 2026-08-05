'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function PolicyRepositoryPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicyDocs();
  }, []);

  const fetchPolicyDocs = async () => {
    setLoading(true);
    const { data } = await supabase.from('public_publications_feed').select('*').order('created_at', { ascending: false });
    if (data) setDocs(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex justify-between items-center">
        <div>
          <span className="text-amber-400 font-bold uppercase text-[10px] tracking-widest block">CIVIC MECHANISMS</span>
          <h1 className="text-4xl font-extrabold text-white mt-1">Policy Lab</h1>
        </div>
        <Link href="/" className="text-amber-400 font-bold hover:underline">← Main Newsroom</Link>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? <div className="text-gray-500">Loading Policy Repository...</div> : docs.map((doc) => (
          <div key={doc.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
            <span className="text-[9px] font-bold text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded">{doc.category}</span>
            <h3 className="text-base font-bold text-white">{doc.title}</h3>
            <p className="text-gray-400 text-[11px] line-clamp-2">{doc.subtitle}</p>
            <Link href={`/articles/${doc.slug}`} className="text-amber-400 font-bold text-[10px] hover:underline block pt-2">Access Document →</Link>
          </div>
        ))}
      </div>
    </main>
  );
}