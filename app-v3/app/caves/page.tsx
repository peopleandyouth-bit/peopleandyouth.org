import React from 'react';
import Link from 'next/link';

export default function CavesDirectoryPage() {
  const cavesList = [
    { title: 'Cave 01: Dialectics', desc: 'Movement of thesis, antithesis, and synthesis in human thought.' },
    { title: 'Cave 02: Consciousness', desc: 'Reconciliation of contradictions within the human mind.' },
    { title: 'Cave 03: Epistemology', desc: 'Inquiry into knowledge acquisition and borrowed certainty.' },
    { title: 'Cave 04: Moral Philosophy', desc: 'Ethics, solitude, and the discovery of inward soliloquy.' },
    { title: 'Cave 05: Statutory Law', desc: 'Constitutional mandates and administrative law frameworks.' },
    { title: 'Cave 06: CAG Audits', desc: 'Empirical examination of government audit reports.' },
    { title: 'Cave 07: RTI Repository', desc: 'Public interest information queries and transparency records.' },
    { title: 'Cave 08: Constitutional PILs', desc: 'Public Interest Litigation draft petitions for institutional reforms.' },
    { title: 'Cave 09: Trade & Strategy', desc: 'Macroeconomic policy, international trade, and commercial analytics.' },
    { title: 'Cave 10: Data Engineering', desc: 'Sovereign data architectures and analytics infrastructure.' },
    { title: 'Cave 11: Global Economy', desc: 'Geopolitical economies, monetary policy, and resource allocation.' },
    { title: 'Cave 12: Public Policy', desc: 'Policy formulation, evaluation metrics, and institutional impact.' },
    { title: 'Cave 13: Diplomatic History', desc: 'International relations and diplomatic strategy.' },
    { title: 'Cave 14: Youth Praxis', desc: 'Transforming understanding into responsible civic action.' },
    { title: 'Cave 15: Institutional Ethics', desc: 'Governance accountability and leadership principles.' },
    { title: 'Cave 16: Leadership', desc: 'Strategic management and social impact leadership.' },
    { title: 'Cave 17: Civic Action', desc: 'Mobilizing youth toward reasoned public dialogue.' }
  ];

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex justify-between items-center">
        <div>
          <span className="text-amber-400 font-bold uppercase text-[10px] tracking-widest block">TAXONOMY ARCHIVE</span>
          <h1 className="text-4xl font-extrabold text-white mt-1">Caves</h1>
        </div>
        <Link href="/" className="text-amber-400 font-bold hover:underline">← Main Newsroom</Link>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {cavesList.map((cave, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 hover:border-amber-400/50 transition-all">
            <span className="text-amber-400 font-bold text-[9px] uppercase">KNOWLEDGE CAVE</span>
            <h2 className="text-base font-bold text-white">{cave.title}</h2>
            <p className="text-gray-400 text-[11px] leading-relaxed">{cave.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}