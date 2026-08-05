import React from 'react';
import Link from 'next/link';

export default function MountainsDirectoryPage() {
  const mountainRanges = [
    { name: 'Range I: Dialectics, Consciousness & Mind', desc: 'Philosophical soliloquies, mind theory, epistemological inquiry, and ideological synthesis.', link: '/caves' },
    { name: 'Range II: Civic Mechanisms, Statutory Law & Audit', desc: 'CAG audit reviews, Right to Information (RTI) disclosures, and Public Interest Litigation (PIL) frameworks.', link: '/policy-lab' },
    { name: 'Range III: Macro-Strategy, Analytics & Geopolitics', desc: 'Global trade dynamics, international affairs, economic modeling, and data engineering.', link: '/observatory' },
    { name: 'Range IV: Praxis, Leadership & Youth Action', desc: 'Institutional governance, youth leadership development, civic action, and grassroots policy.', link: '/academy' }
  ];

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex justify-between items-center">
        <div>
          <span className="text-amber-400 font-bold uppercase text-[10px] tracking-widest block">PROJECT HIMALAYA</span>
          <h1 className="text-4xl font-extrabold text-white mt-1">Mountains</h1>
        </div>
        <Link href="/" className="text-amber-400 font-bold hover:underline">← Main Newsroom</Link>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {mountainRanges.map((m, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-3 hover:border-amber-400/50 transition-all">
            <span className="text-amber-400 font-bold uppercase text-[9px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">MOUNTAIN RANGE {i + 1}</span>
            <h2 className="text-xl font-bold text-white">{m.name}</h2>
            <p className="text-gray-400 text-xs leading-relaxed">{m.desc}</p>
            <Link href={m.link} className="text-amber-300 font-bold text-[10px] hover:underline block pt-2">Explore Range Contents →</Link>
          </div>
        ))}
      </div>
    </main>
  );
}