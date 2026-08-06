'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function KnowledgeRealmsPage() {
  const [selectedRealm, setSelectedRealm] = useState<string | null>('Policy Realm');

  const realmsData = [
    {
      name: 'Governance Realm',
      desc: 'Institutional design, executive administration, ombudsperson frameworks, and public integrity.',
      caves: ['Public Integrity Cave', 'Executive Administration Cave', 'Institutional Design Cave', 'Civil Services Cave', 'State Capability Cave']
    },
    {
      name: 'Policy Realm',
      desc: 'Public policy formulation, legislative analysis, statutory audits, and welfare mechanics.',
      caves: ['Public Administration Cave', 'Federalism Cave', 'Election Cave', 'Urban Governance Cave', 'Panchayati Raj Cave', 'Welfare Policy Cave', 'Constitutional Studies Cave', 'Policy Archive']
    },
    {
      name: 'Economic Realm',
      desc: 'Macroeconomics, fiscal governance, public finance, monetary policy, and development analytics.',
      caves: ['Fiscal Policy Cave', 'Public Finance Cave', 'Inflation & Monetary Cave', 'Economic History Cave', 'Development Economics Cave']
    },
    {
      name: 'Trade Realm',
      desc: 'Global commercial strategy, supply chain mechanics, tariff structures, and international trade law.',
      caves: ['Global Trade Cave', 'Supply Chain Cave', 'Tariff & Customs Cave', 'Export Strategy Cave', 'WTO & Bilateral Agreements Cave']
    },
    {
      name: 'Technology Realm',
      desc: 'Sovereign digital infrastructure, cloud architecture, cybersecurity, and open source systems.',
      caves: ['Sovereign Stack Cave', 'Cybersecurity Cave', 'Data Infrastructure Cave', 'Open Source Systems Cave', 'Digital Identity Cave']
    },
    {
      name: 'Artificial Intelligence Realm',
      desc: 'Machine intelligence models, AI ethics, neural architectures, and institutional AI deployment.',
      caves: ['AI Ethics & Governance Cave', 'Large Language Models Cave', 'Autonomous Systems Cave', 'Institutional Intelligence Cave', 'Algorithmic Safety Cave']
    },
    {
      name: 'Education Realm',
      desc: 'Pedagogical transformation, university governance, primary literacy, and learning technologies.',
      caves: ['Higher Education Cave', 'Primary Literacy Cave', 'Pedagogy & Learning Cave', 'EdTech Systems Cave', 'Academic Research Cave']
    },
    {
      name: 'Law & Justice Realm',
      desc: 'Constitutional law, statutory interpretation, judicial reform, PIL frameworks, and human rights.',
      caves: ['Constitutional Law Cave', 'Judicial Reform Cave', 'Public Interest Litigation Cave', 'Administrative Law Cave', 'Human Rights Cave']
    },
    {
      name: 'Leadership Realm',
      desc: 'Executive decision-making, strategic foresight, organizational culture, and youth leadership praxis.',
      caves: ['Youth Leadership Cave', 'Executive Strategy Cave', 'Organizational Culture Cave', 'Crisis Management Cave', 'Praxis Observatory Cave']
    },
    {
      name: 'Entrepreneurship Realm',
      desc: 'Venture creation, innovation ecosystems, capital allocation, and social enterprise models.',
      caves: ['Venture Building Cave', 'Social Enterprise Cave', 'Early-Stage Capital Cave', 'Incubation & Scaling Cave', 'Product Innovation Cave']
    },
    {
      name: 'Society & Culture Realm',
      desc: 'Sociological inquiry, cultural preservation, demographic shifts, and community development.',
      caves: ['Demographic Analytics Cave', 'Cultural Archives Cave', 'Community Action Cave', 'Urban Sociology Cave', 'Civic Discourse Cave']
    },
    {
      name: 'Health & Well-being Realm',
      desc: 'Public health systems, healthcare policy, epidemiology, mental health, and medical technology.',
      caves: ['Public Health Policy Cave', 'Epidemiology Cave', 'Healthcare Infrastructure Cave', 'Mental Health Systems Cave', 'Biomedical Innovation Cave']
    },
    {
      name: 'Agriculture & Rural Development Realm',
      desc: 'Agrarian economics, rural transformation, food security, supply chain logistics, and farming tech.',
      caves: ['Agrarian Policy Cave', 'Rural Transformation Cave', 'Food Security Cave', 'AgriTech Innovation Cave', 'Irrigation & Land Systems Cave']
    },
    {
      name: 'Environment & Climate Realm',
      desc: 'Ecological sustainability, energy transition, climate adaptation, and environmental law.',
      caves: ['Climate Adaptation Cave', 'Energy Transition Cave', 'Ecological Policy Cave', 'Carbon Markets Cave', 'Biodiversity Cave']
    },
    {
      name: 'Global Affairs Realm',
      desc: 'Geopolitics, foreign policy, diplomatic history, international security, and multilateral institutions.',
      caves: ['Diplomatic History Cave', 'Geopolitical Strategy Cave', 'International Security Cave', 'Multilateral Systems Cave', 'Foreign Policy Archive Cave']
    },
    {
      name: 'Media & Communication Realm',
      desc: 'Public discourse, journalism standards, digital broadcasting, media ethics, and narrative strategy.',
      caves: ['Investigative Journalism Cave', 'Public Relations Cave', 'Digital Broadcasting Cave', 'Media Ethics Cave', 'Narrative Strategy Cave']
    },
    {
      name: 'Innovation Realm',
      desc: 'Research & development, intellectual property, breakthrough technologies, and systems engineering.',
      caves: ['Systems Engineering Cave', 'IP & Patents Cave', 'R&D Governance Cave', 'Emerging Tech Cave', 'Design Thinking Cave']
    },
    {
      name: 'Philosophy & Ethics Realm',
      desc: 'Epistemology, moral philosophy, dialectical inquiry, political theory, and ethics of technology.',
      caves: ['Epistemology Cave', 'Dialectics & Mind Cave', 'Moral Philosophy Cave', 'Political Theory Cave', 'Ethics of Technology Cave']
    }
  ];

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* TOP UTILITY HEADER */}
        <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex justify-between items-center text-[10px] text-gray-400">
          <Link href="/" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
            ← Main Digital Headquarters
          </Link>
          <span>PEOPLEANDYOUTH.ORG &middot; KNOWLEDGE REALMS ARCHITECTURE</span>
        </div>

        {/* MASTHEAD */}
        <header className="border-b border-white/10 px-6 py-12 max-w-7xl mx-auto space-y-4 text-center">
          <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-[10px] uppercase rounded-full tracking-widest">
            TAXONOMY ARCHIVE &middot; 18 KNOWLEDGE REALMS
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight">
            Knowledge Realms
          </h1>
          <p className="text-gray-300 text-sm italic font-serif max-w-3xl mx-auto leading-relaxed">
            Organized thematic domains housing specialized Knowledge Caves across research, policy, strategy, governance, and philosophy.
          </p>
        </header>

        {/* REALMS & CAVES EXPLORER */}
        <div className="max-w-7xl mx-auto p-6 sm:p-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* REALMS SELECTOR LIST (LEFT COL) */}
            <div className="space-y-2 lg:col-span-1 border-r border-white/10 pr-0 lg:pr-6">
              <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
                Select Realm ({realmsData.length})
              </h2>
              <div className="space-y-1.5 max-h-[700px] overflow-y-auto pr-2">
                {realmsData.map((realm) => (
                  <button
                    key={realm.name}
                    onClick={() => setSelectedRealm(realm.name)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center ${
                      selectedRealm === realm.name
                        ? 'bg-amber-400 text-black border-amber-400 font-extrabold shadow-lg'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-amber-400/50 hover:text-white'
                    }`}
                  >
                    <span className="text-xs">{realm.name}</span>
                    <span className="text-[9px] font-mono opacity-80">{realm.caves.length} Caves →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* REALM DETAILS & NESTED CAVES (RIGHT COL) */}
            <div className="lg:col-span-2 space-y-6">
              {selectedRealm && (() => {
                const realm = realmsData.find((r) => r.name === selectedRealm);
                if (!realm) return null;
                return (
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
                    <div className="border-b border-white/10 pb-4 space-y-2">
                      <span className="text-amber-400 font-bold text-[9px] uppercase tracking-widest">ACTIVE REALM</span>
                      <h3 className="text-3xl font-extrabold text-white font-serif">{realm.name}</h3>
                      <p className="text-gray-300 text-xs italic font-serif leading-relaxed">{realm.desc}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Nested Knowledge Caves ({realm.caves.length})
                        </h4>
                        <Link href="/caves" className="text-amber-300 text-[10px] hover:underline font-bold">
                          View Full Cave Directory →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {realm.caves.map((caveName, idx) => (
                          <div
                            key={idx}
                            className="bg-[#070b19] border border-white/10 hover:border-amber-400/60 p-4 rounded-2xl space-y-1 transition-all"
                          >
                            <span className="text-amber-400/60 font-mono text-[8px] uppercase block">CAVE {idx + 1}</span>
                            <span className="text-white font-bold text-xs block">{caveName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#040711] py-8 px-6 text-center text-gray-500 text-[10px] font-mono">
        &copy; 2026 People & Youth &middot; Knowledge Realms Architecture &middot; www.peopleandyouth.org
      </footer>
    </main>
  );
}