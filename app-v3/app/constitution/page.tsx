'use client';

import React from 'react';
import Link from 'next/link';

export default function ConstitutionAndFoundingCharterPage() {
  const schedules = [
    { num: 'Schedule I', title: 'Organizational Structure', desc: 'Full Institutional Organogram & Governance Hierarchy' },
    { num: 'Schedule II', title: 'Departmental Mandates', desc: 'Operational Rules for 20 Institutional Divisions' },
    { num: 'Schedule III', title: 'Editorial Charter', desc: 'Ethics, Peer-Review & Dissent Rules' },
    { num: 'Schedule IV', title: 'Research Standards Manual', desc: 'Empirical Methods & Data Integrity Protocols' },
    { num: 'Schedule V', title: 'Career & Leadership Code', desc: 'Hiring Standards & 6-Stage Gateway Architecture' },
    { num: 'Schedule VI', title: 'Election & Appointment Rules', desc: 'Governance Elections & Statutory Nominations' },
    { num: 'Schedule VII', title: 'Awards & Honours', desc: 'Civic Medals & Fellow Recognition Framework' },
    { num: 'Schedule VIII', title: 'Brand Identity Manual', desc: 'Official Seal, Typography & Palette Codes' },
    { num: 'Schedule IX', title: 'Digital Identity Framework', desc: 'Civic Passport (₹499) Regulations' },
    { num: 'Schedule X', title: 'Institution OS Framework', desc: 'Architecture & Database Infrastructure Standards' },
    { num: 'Schedule XI', title: 'Knowledge Architecture', desc: '18 Knowledge Realms & Knowledge Caves Index' },
    { num: 'Schedule XII', title: 'AI Governance Framework', desc: 'AI Ethics & Algorithmic Disclosure Standards' },
    { num: 'Schedule XIII', title: 'Campus Master Plan', desc: 'Infrastructure, Halls & Digital Command Center' },
    { num: 'Schedule XIV', title: 'Global Chapter Regulations', desc: 'Chapter Charters & International Legal Mandates' },
    { num: 'Schedule XV', title: 'Financial & Audit Code', desc: 'Accounting, Grants & Reserve Fund Rules' },
  ];

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      {/* TOP UTILITY HEADER */}
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2.5 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
          ← Return to Digital Headquarters
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 font-bold">PEOPLE & YOUTH</span>
          <span>&middot;</span>
          <span className="text-amber-300">FOUNDING CHARTER & CONSTITUTION</span>
        </div>
      </div>

      {/* MASTHEAD */}
      <header className="border-b border-white/10 px-6 py-12 max-w-5xl mx-auto space-y-4 text-center">
        <span className="px-3.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-[10px] uppercase rounded-full tracking-[0.2em]">
          SOVEREIGN INSTITUTIONAL CHARTER
        </span>
        <h1 className="text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight text-white">
          The Constitution of People & Youth
        </h1>
        <p className="text-amber-300 text-sm italic font-serif max-w-2xl mx-auto">
          "Where Ideas Become Institutions."
        </p>
        <p className="text-gray-400 text-xs font-serif max-w-3xl mx-auto leading-relaxed pt-2">
          A Constitutional Charter for an Independent Global Institution Dedicated to Knowledge, Leadership, Research, Civic Engagement, and Institution Building.
        </p>
      </header>

      {/* DOCUMENT BODY */}
      <div className="max-w-5xl mx-auto p-6 sm:p-12 space-y-16">
        
        {/* SECTION: ABOUT PEOPLE & YOUTH OVERVIEW */}
        <section className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest block">INSTITUTIONAL OVERVIEW</span>
            <h2 className="text-2xl font-extrabold text-white font-serif mt-1">About People & Youth</h2>
          </div>

          <div className="space-y-4 font-serif text-sm text-gray-300 leading-relaxed">
            <p>
              <strong className="text-white">People & Youth</strong> is an independent, sovereign, global institution established to bridge academic rigor, statutory policy analysis, data engineering, and youth-led governance. Founded on the principle that civilizations advance through reasoned inquiry, dialectical discourse, and structured action (<em>Praxis</em>), the platform operates as a 100-year digital headquarters and physical ecosystem designed to cultivate institution builders.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-2">
              <div className="p-4 bg-[#070b19] border border-white/10 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">01. Research & Knowledge</span>
                <p className="text-gray-400 text-[11px]">18 Knowledge Realms, Knowledge Caves, empirical policy labs, statutory CAG audit reviews, and PIL frameworks.</p>
              </div>

              <div className="p-4 bg-[#070b19] border border-white/10 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">02. Press & Publications</span>
                <p className="text-gray-400 text-[11px]">People & Youth Publications umbrella governing Dissent Dias and the 17-journal Renaissance Series.</p>
              </div>

              <div className="p-4 bg-[#070b19] border border-white/10 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">03. Global Opportunity Gateway</span>
                <p className="text-gray-400 text-[11px]">Unified 6-stage recruitment architecture across 13 divisions, campus chapters, and fellowships.</p>
              </div>

              <div className="p-4 bg-[#070b19] border border-white/10 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">04. Technology Infrastructure</span>
                <p className="text-gray-400 text-[11px]">Driven by Institution OS, AI knowledge graphs, and the Civic Passport digital identity framework.</p>
              </div>
            </div>
          </div>
        </section>

        {/* VOLUME I: FOUNDATIONAL PRINCIPLES */}
        <section className="space-y-8">
          <div className="border-b border-white/10 pb-3">
            <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">VOLUME I</span>
            <h2 className="text-3xl font-black text-white font-serif uppercase">Foundational Principles</h2>
          </div>

          <div className="space-y-6 font-serif leading-relaxed text-gray-300">
            {/* CHAPTER 1 */}
            <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-3">
              <span className="text-amber-400 font-mono text-[10px] uppercase font-bold">Chapter 1 &middot; The Preamble</span>
              <p className="text-sm italic border-l-2 border-l-amber-400 pl-4 py-1 text-gray-200">
                "WE, THE MEMBERS AND BUILDERS OF PEOPLE & YOUTH, dedicated to the pursuit of truth, uncompromised intellectual inquiry, constitutional morality, and the empowerment of youth towards responsible civic action (Praxis); Reaffirming that ideas must not remain abstract soliloquies but evolve into enduring, ethical, and self-sustaining public institutions; Pledging to maintain total independence from ideological dogma, commercial bias, and transient political expediency; Establishing a 100-year institutional framework grounded in academic freedom, evidence-based research, and global collaboration; DO HEREBY ENACT, ADOPT, AND GIVE TO OURSELVES THIS FOUNDING CONSTITUTIONAL CHARTER OF PEOPLE & YOUTH."
              </p>
            </div>

            {/* CHAPTER 2 */}
            <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-3">
              <span className="text-amber-400 font-mono text-[10px] uppercase font-bold">Chapter 2 &middot; Name, Identity & Legal Character</span>
              <ul className="space-y-2 text-xs font-mono text-gray-300">
                <li><strong className="text-white">Institutional Name:</strong> People & Youth (P&Y / People & Youth Global)</li>
                <li><strong className="text-white">Legal Identity:</strong> Autonomous, sovereign, non-partisan international civic knowledge and research institution.</li>
                <li><strong className="text-white">Institutional Independence:</strong> Perpetually independent of any single government, political party, or corporate conglomerate.</li>
                <li><strong className="text-white">Jurisdiction & Digital HQ:</strong> Physical headquarters in New Delhi, India; Digital HQ at www.peopleandyouth.org.</li>
              </ul>
            </div>

            {/* CHAPTER 3 & 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
                <span className="text-amber-400 text-[10px] font-bold uppercase">Chapter 3 &middot; Vision</span>
                <p className="text-gray-300 text-[11px]"><strong className="text-white">Vision 2050:</strong> Pan-global network of university chapters and policy observatories empowering 100,000 youth leaders.</p>
                <p className="text-gray-300 text-[11px]"><strong className="text-white">Vision 2100 / Century Vision:</strong> A self-governing century-long institutional ecosystem anchoring global public policy.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
                <span className="text-amber-400 text-[10px] font-bold uppercase">Chapter 4 &middot; Mission</span>
                <p className="text-gray-300 text-[11px]"><strong className="text-white">Institution Building:</strong> Capacity engines via Institution Lab.</p>
                <p className="text-gray-300 text-[11px]"><strong className="text-white">Knowledge & Leadership:</strong> CAG audit critiques, peer-reviewed journals, and youth leadership development.</p>
              </div>
            </div>

            {/* CHAPTER 5 & 6 */}
            <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-4">
              <span className="text-amber-400 font-mono text-[10px] uppercase font-bold">Chapters 5 & 6 &middot; Motto, Emblem & Foundational Philosophy</span>
              <p className="text-xs font-mono text-gray-300">
                <strong className="text-white">Official Motto:</strong> "Build Institutions. Shape Society. Lead the Future." &middot; "Question | Reflect | Act"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-amber-300">
                <div className="p-2 bg-[#070b19] rounded-lg border border-white/10">1. Vasudhaiva Kutumbakam</div>
                <div className="p-2 bg-[#070b19] rounded-lg border border-white/10">2. Constitutional Morality</div>
                <div className="p-2 bg-[#070b19] rounded-lg border border-white/10">3. Human Dignity</div>
                <div className="p-2 bg-[#070b19] rounded-lg border border-white/10">4. Evidence Inquiry</div>
                <div className="p-2 bg-[#070b19] rounded-lg border border-white/10">5. Intellectual Integrity</div>
                <div className="p-2 bg-[#070b19] rounded-lg border border-white/10">6. Academic Freedom</div>
                <div className="p-2 bg-[#070b19] rounded-lg border border-white/10">7. Editorial Independence</div>
                <div className="p-2 bg-[#070b19] rounded-lg border border-white/10">8. Neutrality</div>
                <div className="p-2 bg-[#070b19] rounded-lg border border-white/10">9. Public Service</div>
                <div className="p-2 bg-[#070b19] rounded-lg border border-white/10">10. Praxis Leadership</div>
              </div>
            </div>
          </div>
        </section>

        {/* VOLUME II: THE INSTITUTIONAL ECOSYSTEM */}
        <section className="space-y-8">
          <div className="border-b border-white/10 pb-3">
            <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">VOLUME II</span>
            <h2 className="text-3xl font-black text-white font-serif uppercase">The Institutional Ecosystem</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
              <span className="text-amber-400 text-[10px] font-bold uppercase">Chapter 7 &middot; Ecosystem Organs</span>
              <ul className="space-y-1 text-gray-300 text-[11px] list-disc list-inside">
                <li>People & Youth Central Body</li>
                <li>Foundation & Advisory</li>
                <li>Academy & Research Institute</li>
                <li>Institution Lab & Leadership Network</li>
                <li>Innovation Hub & Digital Platform</li>
                <li>Civic Passport & Grand Library</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
              <span className="text-amber-400 text-[10px] font-bold uppercase">Chapter 8 &middot; Publications Press</span>
              <p className="text-gray-300 text-[11px]"><strong className="text-white">Dissent Dias:</strong> Public affairs, essays & commentary.</p>
              <p className="text-gray-300 text-[11px]"><strong className="text-white">Renaissance Series:</strong> 17 academic journals led by flagship <em>Policy Renaissance</em>.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-2">
              <span className="text-amber-400 text-[10px] font-bold uppercase">Chapter 9 &middot; Knowledge Taxonomy</span>
              <p className="text-gray-300 text-[11px]"><strong className="text-white">18 Knowledge Realms:</strong> Macro domain classification.</p>
              <p className="text-gray-300 text-[11px]"><strong className="text-white">Knowledge Caves:</strong> Curated reference collections.</p>
            </div>
          </div>
        </section>

        {/* VOLUME III TO XI SUMMARY GRID */}
        <section className="space-y-8">
          <div className="border-b border-white/10 pb-3">
            <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">VOLUMES III – XI</span>
            <h2 className="text-3xl font-black text-white font-serif uppercase">Governance, Membership & Operations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
              <span className="text-amber-400 font-bold text-[10px] uppercase">Volume III &middot; Governance</span>
              <p className="text-gray-300 text-[11px]">Board of Trustees, Executive Council, Academic/Editorial Councils, Ethics Commission, Ombudsperson, 20 Departments.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
              <span className="text-amber-400 font-bold text-[10px] uppercase">Volume IV &middot; Membership</span>
              <p className="text-gray-300 text-[11px]">Categories, Rights (Freedom of Thought, Editorial Participation), Duties (Zero Plagiarism, Asset Protection).</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
              <span className="text-amber-400 font-bold text-[10px] uppercase">Volume V &middot; Knowledge Codes</span>
              <p className="text-gray-300 text-[11px]">Editorial Independence, Research Ethics, Mandatory AI Disclosure, Peer Review & Open Science.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
              <span className="text-amber-400 font-bold text-[10px] uppercase">Volume VI &middot; Careers & Gateway</span>
              <p className="text-gray-300 text-[11px]">Universal 6-Stage Recruitment Framework, Candidate Dashboard, Leadership Network, Academy Schools.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
              <span className="text-amber-400 font-bold text-[10px] uppercase">Volume VII & VIII &middot; Finance & Tech</span>
              <p className="text-gray-300 text-[11px]">Quarterly Public Audit Disclosures, Institution OS, Row-Level Security, Asset Non-Liquidation Safeguards.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
              <span className="text-amber-400 font-bold text-[10px] uppercase">Volume IX – XI &middot; Continuity</span>
              <p className="text-gray-300 text-[11px]">Global Chapters, Amendment Procedures, Century Vision Planning, and Asset Transfer Dissolution Clause.</p>
            </div>
          </div>
        </section>

        {/* STATUTORY SCHEDULES */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-3">
            <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">ENACTMENT ANNEXURES</span>
            <h2 className="text-3xl font-black text-white font-serif uppercase">Statutory Schedules (I – XV)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
            {schedules.map((s) => (
              <div key={s.num} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1 hover:border-amber-400/50 transition-colors">
                <span className="text-amber-400 font-bold text-[10px] uppercase">{s.num}</span>
                <h3 className="text-white font-bold text-xs">{s.title}</h3>
                <p className="text-gray-400 text-[11px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MANDATORY NOTICE AT END */}
        <div className="pt-12 text-center border-t border-white/10">
          <span className="px-4 py-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold font-mono text-xs uppercase tracking-widest rounded-full">
            work in progress
          </span>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#040711] py-8 px-6 text-center text-gray-500 text-[10px] font-mono">
        &copy; 2026 People & Youth &middot; Sovereign Founding Charter &middot; www.peopleandyouth.org
      </footer>
    </main>
  );
}