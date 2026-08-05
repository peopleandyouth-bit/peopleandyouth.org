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
    const { data } = await supabase.from('watermarked_essays').select('*').order('created_at', { ascending: false });
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
        Loading Sovereign Print Engine...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6">
      <div className="no-print max-w-5xl mx-auto mb-8 space-y-4 border-b border-white/10 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px]">ADMINISTRATION</span>
            <h1 className="text-2xl font-extrabold text-white">Unblocked Print Studio</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/dashboard" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"> HQ Dashboard</Link>
            <button onClick={triggerPrint} className="px-5 py-2 rounded-lg bg-amber-400 text-black font-extrabold hover:bg-amber-300">
              🖨️ Print / Save Clean PDF
            </button>
          </div>
        </div>

        {/* SELECTOR */}
        <div className="flex items-center gap-3">
          <label className="text-gray-400 uppercase">Select Document:</label>
          <select 
            value={selectedEssay?.id || ''} 
            onChange={(e) => setSelectedEssay(essays.find(item => item.id === e.target.value))}
            className="bg-[#070b19] border border-white/20 rounded-lg p-2 text-white font-mono focus:outline-none"
          >
            {essays.map(item => (
              <option key={item.id} value={item.id}>{item.title} ({item.slug})</option>
            ))}
          </select>
        </div>
      </div>

      {/* PRINT CANVAS */}
      {selectedEssay && (
        <div className="print-area max-w-3xl mx-auto bg-white text-black p-12 rounded-xl shadow-2xl font-serif">
          <div className="border-b-2 border-black pb-4 mb-6 font-sans">
            <div className="text-xs uppercase font-bold text-gray-500">{selectedEssay.category}</div>
            <h1 className="text-3xl font-bold mt-1">{selectedEssay.title}</h1>
            {selectedEssay.subtitle && <p className="italic text-sm text-gray-600 mt-1">{selectedEssay.subtitle}</p>}
            <div className="text-xs text-gray-500 mt-3 font-mono">
              Author: {selectedEssay.author_name} | Published: {new Date(selectedEssay.created_at).toLocaleDateString()}
            </div>
          </div>

          <div 
            className="prose max-w-none text-black leading-relaxed font-serif"
            dangerouslySetInnerHTML={{ __html: selectedEssay.raw_html }}
          />

          <div className="mt-12 pt-4 border-t border-gray-300 font-mono text-[9px] text-gray-400 flex justify-between">
            <span>OFFICIAL PRINT RECORD • PEOPLE AND YOUTH</span>
            <span>UUID: {selectedEssay.id}</span>
          </div>
        </div>
      )}
    </main>
  );
}
