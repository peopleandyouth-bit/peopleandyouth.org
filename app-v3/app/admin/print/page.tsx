'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPrintStudioPage() {
  const [essays, setEssays] = useState<any[]>([]);
  const [selectedEssay, setSelectedEssay] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEssays();
  }, []);

  const fetchEssays = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('watermarked_essays')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setEssays(data);
      setSelectedEssay(data[0]);
    }
    setLoading(false);
  };

  const triggerPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b19] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Initializing Sovereign Print Engine...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 print:bg-white print:text-black print:p-0">
      {/* GLOBAL PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-canvas {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* TOP CONTROL BAR (HIDDEN IN PRINT OUTPUT) */}
      <div className="no-print max-w-5xl mx-auto mb-8 space-y-4 border-b border-white/10 pb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
              ADMINISTRATION & ARCHIVAL
            </span>
            <h1 className="text-2xl font-extrabold text-white">Unblocked Print & PDF Export Studio</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-gray-200"
            >
              ← HQ Dashboard
            </Link>
            <button
              onClick={triggerPrint}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold hover:from-amber-300 transition-all shadow-xl"
            >
              🖨️ Print / Save Clean PDF
            </button>
          </div>
        </div>

        {/* DOCUMENT SELECTOR */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <label className="text-gray-400 uppercase text-[10px]">Select Document:</label>
          <select
            value={selectedEssay?.id || ''}
            onChange={(e) =>
              setSelectedEssay(essays.find((item) => item.id === e.target.value))
            }
            className="bg-[#070b19] border border-white/20 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-amber-400"
          >
            {essays.map((item) => (
              <option key={item.id} value={item.id}>
                {item.status === 'draft' ? '[DRAFT] ' : ''}{item.title} ({item.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PRINT CANVAS */}
      {selectedEssay ? (
        <div className="print-canvas max-w-3xl mx-auto bg-white text-black p-12 rounded-xl shadow-2xl font-serif">
          {/* HARDCOPY OFFICIAL HEADER */}
          <header className="border-b-2 border-black pb-4 mb-6 font-sans">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 mb-1">
              <span>{selectedEssay.category}</span>
              <span>PEOPLE & YOUTH OFFICIAL RECORD</span>
            </div>
            <h1 className="text-3xl font-extrabold text-black leading-tight mt-1">
              {selectedEssay.title}
            </h1>
            {selectedEssay.subtitle && (
              <p className="italic text-sm text-gray-700 mt-1">{selectedEssay.subtitle}</p>
            )}
            <div className="text-xs text-gray-600 mt-4 font-mono pt-2 border-t border-gray-300 flex justify-between">
              <span>Author: <strong>{selectedEssay.author_name}</strong></span>
              <span>Published: {new Date(selectedEssay.created_at).toLocaleDateString()}</span>
              <span>Reading Time: {selectedEssay.read_time}</span>
            </div>
          </header>

          {/* BODY CONTENT */}
          <div
            className="prose prose-neutral max-w-none text-black leading-relaxed font-serif text-sm"
            dangerouslySetInnerHTML={{ __html: selectedEssay.raw_html }}
          />

          {/* OFFICIAL ARCHIVAL FOOTER */}
          <footer className="mt-12 pt-4 border-t border-gray-400 font-mono text-[9px] text-gray-500 flex justify-between items-center">
            <span>PEOPLE & YOUTH • SOVEREIGN KNOWLEDGE INFRASTRUCTURE</span>
            <span>UUID: {selectedEssay.id}</span>
            <span>peopleandyouth.org</span>
          </footer>
        </div>
      ) : (
        <div className="no-print text-center py-20 text-gray-400">
          No essays available to print.
        </div>
      )}
    </main>
  );
}