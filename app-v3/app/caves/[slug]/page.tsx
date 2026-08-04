'use client';

import React from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';

export default function KnowledgeCavePage({ params }: { params: { slug: string } }) {
  const caveSlug = params.slug || 'constitution-cave';

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 flex flex-col justify-between">
      
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg text-white">People &amp; Youth</Link>
          <GoogleTranslate />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12 w-full flex-1 space-y-12">
        
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold uppercase">
            MOUNTAIN RANGE: GOVERNANCE &amp; LAW
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white uppercase tracking-tight">
            🏛️ {caveSlug.replace('-', ' ')}
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            Structured knowledge repository indexing constitutional law briefs, judicial audit datasets, scholarly publications, and video lectures.
          </p>
        </div>

        {/* CAVE MODULES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
            <span className="text-2xl">📚</span>
            <h3 className="font-bold text-white text-base">Policy &amp; Legal Papers</h3>
            <p className="text-xs text-gray-400">18 peer-reviewed research papers and whitepapers indexed in this cave.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
            <span className="text-2xl">📊</span>
            <h3 className="font-bold text-white text-base">Empirical Datasets</h3>
            <p className="text-xs text-gray-400">Open-access CSV and JSON datasets on municipal performance and RTI responses.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
            <span className="text-2xl">🎓</span>
            <h3 className="font-bold text-white text-base">Learning Modules</h3>
            <p className="text-xs text-gray-400">P&amp;Y Academy structured courses built directly from this cave repository.</p>
          </div>
        </div>

      </div>

    </main>
  );
}
