'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalMapPage() {
  const chapters = [
    { country: 'India', city: 'New Delhi', type: 'Global HQ & Policy Hub', status: 'Active' },
    { country: 'United Kingdom', city: 'London', type: 'Academic Exchange Chapter', status: 'Active' },
    { country: 'United States', city: 'Washington D.C.', type: 'Global Affairs & Tech Policy', status: 'Active' },
    { country: 'Singapore', city: 'Singapore', type: 'Trade & Innovation Hub', status: 'Active' }
  ];

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex justify-between items-center">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            SOVEREIGN CIVIC NETWORK
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Interactive Global Map</h1>
        </div>
        <Link href="/dissent-dias" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
          ← Editorial Portal
        </Link>
      </header>

      <div className="max-w-7xl mx-auto bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
        <h2 className="text-sm font-bold text-amber-400 uppercase">Institutional Chapters & Regional Footprint</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {chapters.map((c, idx) => (
            <div key={idx} className="bg-[#070b19] border border-white/15 p-6 rounded-2xl space-y-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase">
                {c.status}
              </span>
              <h3 className="text-lg font-bold text-white mt-2">{c.city}, {c.country}</h3>
              <p className="text-gray-400 text-[10px]">{c.type}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}