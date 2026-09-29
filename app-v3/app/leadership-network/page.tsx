'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LeadershipNetworkPage() {
  const [activeLevel, setActiveLevel] = useState<'all' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'campus'>('all');

  const level1Offices = [
    {
      office: "Founder's Office",
      slug: "founder",
      role: "Guardian of institutional vision, custodian of the Constitution, strategic direction & institutional diplomacy.",
      facilities: ["Founder's Chamber", "Strategic War Room", "Founder Archives", "Private Meeting Lounge", "Executive Secretariat"],
      holder: "Swaraj Shandilya",
      status: "Assigned"
    },
    {
      office: "Office of the Chairperson",
      slug: "chairperson",
      role: "Presides over the Board of Trustees and ensures constitutional governance across all organs.",
      facilities: ["Chairperson's Chamber", "Board Meeting Room"],
      holder: "Vacant (Awaiting Appointment)",
      status: "Open for Recruitment"
    },
    {
      office: "Office of the Chief Executive Officer",
      slug: "chief-executive-officer",
      role: "Responsible for day-to-day administration, executive operations, and strategic execution.",
      facilities: ["CEO Office", "Executive Operations Centre"],
      holder: "Vacant (Awaiting Appointment)",
      status: "Open for Recruitment"
    }
  ];

  const level2Offices = [
    { office: "Office of Strategy", slug: "chief-strategy-officer", head: "Chief Strategy Officer", facilities: ["Strategy Room", "Future Planning Lab"] },
    { office: "Office of Finance", slug: "chief-financial-officer", head: "Chief Financial Officer", facilities: ["Finance Office", "Treasury Room", "Audit Vault"] },
    { office: "Office of Research", slug: "chief-research-officer", head: "Chief Research Officer", facilities: ["Research Headquarters", "Research Review Room", "Research Repository"] },
    { office: "Office of Publications", slug: "chief-editorial-officer", head: "Chief Editorial Officer", facilities: ["Editorial Chamber", "Editorial Conference Room", "Publication Studio"] },
    { office: "Office of Technology", slug: "chief-technology-officer", head: "Chief Technology Officer", facilities: ["Technology Command Centre", "AI Lab", "Cyber Security Centre"] },
    { office: "Office of Growth", slug: "chief-growth-officer", head: "Chief Growth Officer", facilities: ["Business Development Room", "Partnership Room", "Corporate Relations Centre"] },
    { office: "Office of Communications", slug: "chief-communications-officer", head: "Chief Communications Officer", facilities: ["Media Studio", "Public Relations Room", "Digital Media Lab"] },
    { office: "Office of Human Capital", slug: "chief-human-resources-officer", head: "Chief Human Resources Officer", facilities: ["Recruitment Centre", "Learning Centre", "Employee Relations Office"] },
    { office: "Office of Legal Affairs", slug: "chief-legal-officer", head: "Chief Legal & Governance Officer", facilities: ["Legal Chamber", "Compliance Centre", "Ethics Review Room"] }
  ];

  const level3Chambers = [
    { name: "Executive Council Chamber (Weekly Executive Meetings)", slug: "executive-council-chamber" },
    { name: "Academic Council Chamber (Research Approvals)", slug: "academic-council-chamber" },
    { name: "Editorial Council Chamber (Publication Decisions)", slug: "editorial-council-chamber" },
    { name: "Research Council Chamber (Research Standards)", slug: "research-council-chamber" },
    { name: "Ethics Commission Chamber (Ethics Hearings)", slug: "ethics-commission-chamber" },
    { name: "Audit Commission Chamber (Financial Reviews)", slug: "audit-commission-chamber" },
    { name: "Ombudsperson Chamber (Member Grievances)", slug: "ombudsperson-chamber" }
  ];

  const level4Offices = [
    { name: "Global Director's Office (Coordinates Continents)", slug: "global-director" },
    { name: "Regional Director's Office (Coordinates Multiple Countries)", slug: null },
    { name: "Country Director's Office (Coordinates National Operations)", slug: null },
    { name: "State Director's Office (Coordinates State Chapters)", slug: null },
    { name: "District Coordinator's Office (Coordinates District Chapters)", slug: null },
    { name: "Campus Chapter Office (Coordinates University Chapters)", slug: null }
  ];

  const level5Divisions = [
    { name: "Research Institute", rooms: ["Research Hall", "Data Analytics Lab", "Policy Lab", "Innovation Lab", "Case Study Centre", "Survey Operations Room"] },
    { name: "Publications Division (Dissent Dias)", rooms: ["Editor-in-Chief Office", "Opinion Desk", "Fact Check Desk", "Podcast Studio", "Video Studio", "Editorial Library"] },
    { name: "Renaissance Editorial Centre", rooms: ["Journal Management Room", "Peer Review Office", "Citation Desk", "Production Studio", "Digital Publishing Room"] },
    { name: "Knowledge Library (Grand Library)", rooms: ["Reading Hall", "Digital Archive", "Knowledge Realms", "Knowledge Caves", "AI Knowledge Terminal", "Rare Collections Room"] },
    { name: "Institution Lab", rooms: ["Constitution Design Studio", "Governance Design Lab", "Institution OS Lab", "Policy Design Studio", "Organizational Development Room"] },
    { name: "Academy (Leadership, Policy & AI Schools)", rooms: ["Leadership Hall", "Simulation Room", "Policy Studio", "Legislative Simulation Hall", "AI Lab", "Cloud Computing Centre"] },
    { name: "Advisory & Consulting Division", rooms: ["Market Entry Lab", "CSR Advisory Room", "Public Policy Consulting Room", "Rural Transformation Studio"] },
    { name: "Events & Convention Centre", rooms: ["Grand Auditorium", "Amphitheatre", "Conference Hall", "Press Briefing Room", "Exhibition Hall", "Networking Lounge"] },
    { name: "Foundation & Member Services", rooms: ["Scholarship Office", "Fellowship Office", "Grant Management Centre", "Community Development Office", "International Desk"] },
    { name: "Digital Headquarters NOC", rooms: ["Network Operations Centre", "Data Centre", "Analytics Command Centre", "Cyber Defence Room", "Platform Operations Room"] }
  ];

  const campusZones = [
    "Constitution House", "Founder's Office", "Executive Centre", "Board House",
    "Research Institute", "Dissent Dias House", "Renaissance Publications Centre", "Grand Library",
    "Institution Lab", "Academy", "Convention Centre", "Innovation Hub", "AI Centre",
    "Leadership Residence", "International Guest House", "Student & Fellow Residence",
    "Media Centre", "Rural Innovation Farm", "Meditation Garden", "Knowledge Square"
  ];

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <div className="border-b border-white/10 bg-[#070b19] px-6 py-2.5 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
          <Link href="/" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
            ← Return to Digital Headquarters
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 font-bold">PEOPLE &amp; YOUTH</span>
            <span>&middot;</span>
            <span className="text-amber-300">OFFICE-CENTRIC GOVERNANCE ARCHITECTURE</span>
          </div>
        </div>

        {/* MASTHEAD */}
        <header className="border-b border-white/10 px-6 py-12 max-w-6xl mx-auto space-y-4 text-center">
          <span className="px-3.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-[10px] uppercase rounded-full tracking-widest">
            INSTITUTIONAL LEADERSHIP NETWORK
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight text-white">
            Leadership is Stewardship
          </h1>
          <p className="text-amber-300 text-sm italic font-serif max-w-2xl mx-auto">
            &ldquo;Every office exists to strengthen the institution, not the individual.&rdquo;
          </p>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl max-w-3xl mx-auto text-gray-300 text-[11px] font-serif leading-relaxed text-left border-l-2 border-l-amber-400">
            <strong className="text-amber-400 font-mono uppercase text-[9px] block mb-1">GOVERNANCE PRINCIPLE</strong>
            We consciously avoid person-centric reliance. The governance structure is office-centric: individual leaders occupy constitutional chambers, but the institutional authority resides permanently within the Office.
          </div>
        </header>

        {/* FILTER CONTROLS */}
        <div className="max-w-6xl mx-auto px-6 pt-6 flex flex-wrap justify-center gap-2 border-b border-white/10 pb-6">
          <button onClick={() => setActiveLevel('all')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeLevel === 'all' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
            All Layers
          </button>
          <button onClick={() => setActiveLevel('level1')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeLevel === 'level1' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
            Level I — Constitutional Apex
          </button>
          <button onClick={() => setActiveLevel('level2')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeLevel === 'level2' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
            Level II — Executive Heads
          </button>
          <button onClick={() => setActiveLevel('level3')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeLevel === 'level3' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
            Level III — Councils
          </button>
          <button onClick={() => setActiveLevel('level4')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeLevel === 'level4' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
            Level IV — Global Network
          </button>
          <button onClick={() => setActiveLevel('level5')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeLevel === 'level5' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
            Level V — Research &amp; Knowledge
          </button>
          <button onClick={() => setActiveLevel('campus')} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeLevel === 'campus' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
            Campus Master Plan
          </button>
        </div>

        {/* MAIN DISPLAY */}
        <div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-12">

          {/* LEVEL I */}
          {(activeLevel === 'all' || activeLevel === 'level1') && (
            <section className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">LEVEL I</span>
                <h2 className="text-xl font-extrabold text-white">Constitutional Leadership (Apex Layer)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {level1Offices.map((off, i) => (
                  <Link
                    key={i}
                    href={`/office/${off.slug}`}
                    className="bg-white/5 border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.07] transition-all p-6 rounded-3xl space-y-4 flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                        <span className="text-amber-400">OFFICE 0{i + 1}</span>
                        <span className={off.status === 'Assigned' ? 'text-emerald-400' : 'text-amber-300'}>● {off.status}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">{off.office}</h3>
                      <p className="text-gray-300 text-[11px] leading-relaxed font-serif">{off.role}</p>

                      <div className="pt-2">
                        <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Dedicated Facilities:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {off.facilities.map((fac, idx) => (
                            <span key={idx} className="bg-[#070b19] border border-white/10 text-gray-300 text-[9px] px-2 py-0.5 rounded">
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400">Incumbent:</span>
                        <span className={off.holder.includes('Vacant') ? 'text-amber-300 italic font-bold' : 'text-white font-bold'}>{off.holder}</span>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors flex items-center justify-between">
                        <span>Enter Office</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* LEVEL II */}
          {(activeLevel === 'all' || activeLevel === 'level2') && (
            <section className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">LEVEL II</span>
                <h2 className="text-xl font-extrabold text-white">Executive Leadership Offices</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {level2Offices.map((off, i) => (
                  <Link
                    key={i}
                    href={`/office/${off.slug}`}
                    className="bg-white/5 border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.07] transition-all p-5 rounded-2xl space-y-3 group cursor-pointer block"
                  >
                    <div>
                      <span className="text-amber-400 font-bold text-[9px] uppercase">{off.head}</span>
                      <h3 className="text-sm font-bold text-white mt-0.5 group-hover:text-amber-300 transition-colors">{off.office}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {off.facilities.map((fac, idx) => (
                        <span key={idx} className="bg-[#070b19] text-gray-400 text-[8px] px-2 py-0.5 rounded border border-white/5">
                          {fac}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-white/5 text-[9px] font-bold uppercase tracking-wider text-amber-300 flex justify-between">
                      <span>Enter Office</span>
                      <span>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* LEVEL III */}
          {(activeLevel === 'all' || activeLevel === 'level3') && (
            <section className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">LEVEL III</span>
                <h2 className="text-xl font-extrabold text-white">Institutional Council Chambers</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {level3Chambers.map((ch, i) => (
                  <Link
                    key={i}
                    href={`/office/${ch.slug}`}
                    className="bg-white/5 border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.07] transition-all p-4 rounded-xl flex items-center gap-3 group cursor-pointer"
                  >
                    <span className="text-amber-400 font-bold text-sm">🏛️</span>
                    <span className="text-gray-300 font-bold text-[11px] group-hover:text-amber-200 transition-colors">{ch.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* LEVEL IV */}
          {(activeLevel === 'all' || activeLevel === 'level4') && (
            <section className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">LEVEL IV</span>
                <h2 className="text-xl font-extrabold text-white">Global Leadership Network Offices</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {level4Offices.map((off, i) => {
                  const content = (
                    <>
                      <span className="text-amber-400 font-bold text-sm">🌐</span>
                      <span className="text-gray-300 font-bold text-[11px] group-hover:text-amber-200 transition-colors">{off.name}</span>
                    </>
                  );

                  if (off.slug) {
                    return (
                      <Link
                        key={i}
                        href={`/office/${off.slug}`}
                        className="bg-white/5 border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.07] transition-all p-4 rounded-xl flex items-center gap-3 group cursor-pointer"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={i}
                      className="bg-white/5 border border-white/10 opacity-60 p-4 rounded-xl flex items-center gap-3"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* LEVEL V */}
          {(activeLevel === 'all' || activeLevel === 'level5') && (
            <section className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">LEVEL V</span>
                <h2 className="text-xl font-extrabold text-white">Research, Knowledge &amp; Operational Infrastructure</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {level5Divisions.map((div, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                    <h3 className="text-sm font-bold text-amber-300 uppercase">{div.name}</h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {div.rooms.map((rm, idx) => (
                        <span key={idx} className="bg-[#070b19] border border-white/10 text-gray-300 text-[9px] px-2 py-1 rounded">
                          {rm}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CAMPUS MASTER PLAN */}
          {(activeLevel === 'all' || activeLevel === 'campus') && (
            <section className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">LONG-TERM CAMPUS VISION</span>
                <h2 className="text-xl font-extrabold text-white">People &amp; Youth Leadership Campus (Bihar Master Plan)</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {campusZones.map((zone, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl text-center hover:border-amber-400/40 transition-colors">
                    <span className="text-amber-400 font-mono text-[8px] uppercase block">ZONE {i + 1}</span>
                    <span className="text-white font-bold text-[10px] block mt-0.5 truncate">{zone}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      <footer className="border-t border-white/10 bg-[#040711] py-8 px-6 text-center text-gray-500 text-[10px]">
        &copy; 2026 People &amp; Youth &middot; Leadership Network &amp; Office Governance &middot; www.peopleandyouth.org
      </footer>
    </main>
  );
}