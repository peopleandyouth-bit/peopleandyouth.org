import React from 'react';
import Link from 'next/link';

export default function ConstitutionAndAdvisoryPage() {
  const advisoryBoard = [
    { name: "Legal & Constitutional Oversight Council", role: "Judicial Review, Statutory Policy & PIL Frameworks" },
    { name: "Academic & Philosophical Advisory", role: "Epistemology, Ethics & Dialectical Research Oversight" },
    { name: "Economic & Macro-Strategy Board", role: "CAG Audit Critiques, Fiscal Governance & Data Engineering" },
    { name: "Civic Youth & Institutional Governance", role: "Youth Leadership, Chapter Expansion & Praxis Integration" }
  ];

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline">← Main Newsroom</Link>
        <span>PEOPLEANDYOUTH.ORG &middot; CONSTITUTIONAL CHARTER & ADVISORY BOARD</span>
      </div>

      <header className="border-b border-white/10 px-6 py-10 max-w-5xl mx-auto space-y-3 text-center">
        <span className="text-amber-400 font-bold uppercase tracking-[0.2em] text-[10px]">GOVERNANCE & INSTITUTIONAL LAWS</span>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase font-serif tracking-tight">Constitution Charter</h1>
        <p className="text-gray-400 text-sm italic font-serif max-w-2xl mx-auto">
          The Sovereign Framework Governing Intellectual Integrity, Dissent, and Youth Praxis
        </p>
      </header>

      <div className="max-w-4xl mx-auto p-6 sm:p-12 space-y-12">
        <section className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-amber-400 font-mono uppercase tracking-wider border-b border-white/10 pb-2">Institutional Preamble</h2>
          <p className="text-gray-300 text-xs leading-relaxed font-serif">
            People & Youth is bound by the mandate to cultivate reasoned dialogue, uncompromised inquiry, and structured civic action. This Constitution Charter establishes the inviolable independence of our research, the protection of editorial dissent, and the systematic structure of our Mountains and Caves.
          </p>
        </section>

        <section className="space-y-6">
          <div className="border-b border-white/10 pb-2">
            <span className="text-amber-400 font-bold text-[10px] uppercase tracking-widest">OVERSIGHT</span>
            <h2 className="text-2xl font-extrabold text-white">The Advisory Board</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advisoryBoard.map((item, idx) => (
              <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2 hover:border-amber-400/50 transition-colors">
                <span className="text-amber-400 font-bold text-[10px]">COUNCIL {idx + 1}</span>
                <h3 className="text-base font-bold text-white">{item.name}</h3>
                <p className="text-gray-400 text-[11px] leading-relaxed">{item.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}