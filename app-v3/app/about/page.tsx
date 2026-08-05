import React from 'react';
import Link from 'next/link';

export default function InstitutionalAboutPage() {
  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline">← Return to Main Newsroom</Link>
        <span>PEOPLEANDYOUTH.ORG &middot; INSTITUTIONAL CHARTER</span>
      </div>

      <header className="border-b border-white/10 px-6 py-10 max-w-5xl mx-auto space-y-3 text-center">
        <span className="text-amber-400 font-bold uppercase tracking-[0.2em] text-[10px]">SOVEREIGN CIVIC KNOWLEDGE PLATFORM</span>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase font-serif tracking-tight">About People & Youth</h1>
        <p className="text-gray-400 text-sm italic font-serif max-w-2xl mx-auto">
          At the Heart of Change &middot; Question | Reflect | Act &middot; Leading Youth Towards Praxis
        </p>
      </header>

      <div className="max-w-4xl mx-auto p-6 sm:p-12 space-y-12">
        <section className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
            <div className="w-12 h-12 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center text-base">SS</div>
            <div>
              <h2 className="text-lg font-bold text-white">Swaraj Shandilya</h2>
              <p className="text-amber-400 text-[10px]">Founder & Lead Architect &middot; peopleandyouth.org</p>
            </div>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed font-serif">
            Ex-Coordinator, The Public Policy Club, IIFT &middot; MBA(IB) IIFT (2025–27) &middot; Marketing, Strategy & Analytics &middot; Professional Data Engineer &middot; Social Impact Leadership &middot; Ex-HCL Technologies.
          </p>
        </section>

        <section className="space-y-4 font-serif text-sm text-gray-300 leading-relaxed">
          <h2 className="text-xl font-bold text-amber-400 font-mono uppercase tracking-wider border-b border-white/10 pb-2">Our Purpose & Vision</h2>
          <p>People & Youth is a sovereign civic knowledge platform established to bridge academic rigor, statutory policy analysis, and youth-led governance.</p>
          <p>We believe that civilizations do not advance through the triumph of unexamined certainty, but through the courage to question, reflect, and execute reasoned action (<em>Praxis</em>).</p>
        </section>
      </div>
    </main>
  );
}