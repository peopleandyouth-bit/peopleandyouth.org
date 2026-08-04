'use client';

import React from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';

export default function RenaissanceJournalPage({ params }: { params: { journalSlug: string } }) {
  const journalSlug = params.journalSlug || 'policy-renaissance';

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 flex flex-col justify-between">
      
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg text-white">People &amp; Youth</Link>
          <GoogleTranslate />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 w-full flex-1 space-y-12">
        
        <div className="bg-gradient-to-br from-blue-950 via-[#0a122c] to-cyan-950 border-2 border-cyan-500/40 rounded-3xl p-8 sm:p-12 space-y-6">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 font-mono text-xs border border-cyan-400/30 rounded-full font-bold uppercase">
            RENAISSANCE PUBLICATIONS JOURNAL
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white capitalize">
            {journalSlug.replace('-', ' ')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
            Independent, peer-reviewed international digital journal dedicated to interdisciplinary empirical research, public administration, and constitutional morality.
          </p>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
            <Link
              href="/submit-paper"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs"
            >
              Submit Manuscript for Peer Review →
            </Link>
            <button className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs font-mono border border-white/10">
              Editorial Board &amp; Guidelines
            </button>
          </div>
        </div>

      </div>

    </main>
  );
}
