'use client';

import React from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';

export default function DissentDiasPage() {
  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 flex flex-col justify-between">
      
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg text-white">People &amp; Youth</Link>
          <GoogleTranslate />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12 w-full flex-1 space-y-12">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold uppercase">
            EDITORIAL &amp; PUBLIC DISCOURSE DIAS
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white">Dissent Dias</h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            A premium forum for long-form essays, reasoned critiques, youth perspectives, and public policy debates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <article className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:border-cyan-400/50 transition-all">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">EDITORIAL • 6 MIN READ</span>
            <h2 className="text-2xl font-bold text-white">Constitutional Morality in Digital Public Infrastructure</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Evaluating how algorithmic governance models impact individual rights and transparent public administration in rural districts.
            </p>
            <div className="flex justify-between items-center pt-4 border-t border-white/10 text-xs font-mono text-gray-400">
              <span>By Dr. Ananya Sharma</span>
              <span>August 2026</span>
            </div>
          </article>

          <article className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:border-cyan-400/50 transition-all">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">OPINION • 4 MIN READ</span>
            <h2 className="text-2xl font-bold text-white">The Imperative for Grassroots Municipal Performance Audits</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Why empirical RTI audits led by youth coordinators are vital to restoring faith in local Panchayati Raj institutions.
            </p>
            <div className="flex justify-between items-center pt-4 border-t border-white/10 text-xs font-mono text-gray-400">
              <span>By Swaraj Shandilya</span>
              <span>August 2026</span>
            </div>
          </article>
        </div>

      </div>

    </main>
  );
}
