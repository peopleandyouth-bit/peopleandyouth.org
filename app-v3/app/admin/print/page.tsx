'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const DEFAULT_ESSAYS = [
  {
    id: 'default-1',
    slug: 'dialectics-of-consciousness',
    title: 'Dialectics of Consciousness',
    subtitle: 'A Soliloquy on Ideas, Society, and the Human Mind',
    category: 'Essay • Philosophy & Human Consciousness',
    author_name: 'Swaraj Shandilya',
    raw_html: `
      <p>Our age is fascinated by binaries. We are encouraged to choose between Left and Right, Capitalism and Socialism, Tradition and Modernity, Desire and Suppression, as though human civilization advances only by choosing one extreme over another.</p>
      <p>Yet history tells a different story. Every significant transformation has emerged not from the victory of one absolute over another, but from the dialogue between opposing forces.</p>
      <blockquote style="background:#F4F6F9; border-left:4px solid #C59B27; padding:15px; font-style:italic; font-weight:bold; color:#0B192C;">
        "True capitalism and true socialism are not enemies. Their highest forms meet in synthesis."
      </blockquote>
      <p>The future rarely belongs to ideological purity. It belongs to intellectual evolution.</p>
    `
  }
];

export default function AdminPrintStudioPage() {
  const [essays, setEssays] = useState<any[]>(DEFAULT_ESSAYS);
  const [selectedEssay, setSelectedEssay] = useState<any>(DEFAULT_ESSAYS[0]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('py_admin_authorized', 'true');
    }
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await supabase.from('watermarked_essays').select('*');
      if (data && data.length > 0) {
        setEssays(data);
        setSelectedEssay(data[0]);
      }
    } catch (err) {
      console.error('Using default admin print ledger.');
    }
  };

  const triggerAdminPrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs flex">
      <aside className="w-72 bg-[#050814] border-r border-white/10 p-6 flex flex-col justify-between shrink-0 sticky top-0 h-screen print:hidden">
        <div className="space-y-6">
          <div className="border-b border-amber-500/30 pb-4">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">ADMINISTER PRINT RIGHTS</span>
            <h1 className="text-lg font-extrabold text-white mt-1">Print Studio</h1>
            <p className="text-[10px] text-gray-400">Exclusive Authority HQ</p>
          </div>
          <nav className="space-y-1">
            <Link href="/admin/print" className="block px-3.5 py-3 rounded-xl bg-amber-400 text-black font-extrabold">
              🖨️ Official Print Studio
            </Link>
            <Link href="/admin/essays" className="block px-3.5 py-3 rounded-xl text-gray-300 hover:bg-white/5">
              📜 Essay Publisher
            </Link>
            <Link href="/admin/dashboard" className="block px-3.5 py-3 rounded-xl text-gray-300 hover:bg-white/5">
              🖥️ Master Control HQ
            </Link>
          </nav>
        </div>
      </aside>

      <section className="flex-1 p-8 space-y-6 overflow-y-auto print:p-0 print:bg-white print:text-black">
        <div className="flex justify-between items-center border-b border-white/10 pb-4 print:hidden">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest">AUTHORIZED PRINTING CONSOLE</span>
            <h2 className="text-xl font-extrabold text-white uppercase mt-1">Select Document to Print</h2>
          </div>
          <button onClick={triggerAdminPrint} className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs shadow-xl transition-all">
            🖨️ Execute Official Admin Print / PDF Export
          </button>
        </div>

        <div className="bg-white/5 p-4 rounded-xl border border-white/10 font-mono print:hidden">
          <label className="block text-gray-300 uppercase mb-2">Select Document:</label>
          <select value={selectedEssay?.slug} onChange={(e) => setSelectedEssay(essays.find(item => item.slug === e.target.value))} className="w-full bg-[#070b19] border border-amber-400/40 rounded-lg p-3 text-amber-300 font-bold focus:outline-none">
            {essays.map((item) => (
              <option key={item.slug} value={item.slug}>{item.title} — {item.author_name} ({item.category})</option>
            ))}
          </select>
        </div>

        {selectedEssay && (
          <div className="bg-white text-[#222222] p-10 rounded-2xl shadow-2xl space-y-6 font-serif max-w-[210mm] mx-auto print:shadow-none print:max-w-none print:w-full print:p-0">
            <div className="text-center border-b pb-4">
              <div className="text-xs font-bold text-[#0B192C] uppercase font-sans tracking-widest">peopleandyouth.org • Official Printed Record</div>
              <h1 className="text-3xl font-bold mt-2 text-[#0B192C]">{selectedEssay.title}</h1>
              <p className="text-sm italic text-gray-600">{selectedEssay.subtitle}</p>
              <p className="text-xs font-sans text-amber-700 font-bold mt-2 uppercase">{selectedEssay.author_name} • {selectedEssay.category}</p>
            </div>
            <div className="prose max-w-none text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedEssay.raw_html }} />
            <div className="border-t pt-4 text-center text-xs font-sans text-gray-500">
              Printed under sole authorization of Platform Administration (peopleandyouth.org)
            </div>
          </div>
        )}
      </section>
    </main>
  );
}