'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { OpportunityApplySection } from '@/components/OpportunityApplyEngine';

export default function UniversalCareersPage() {
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const opportunitiesList = [
    { id: 'opp-1', title: 'Senior Policy Research Fellow', dept: 'Policy Lab', type: 'Fellowship', loc: 'New Delhi / Hybrid' },
    { id: 'opp-2', title: 'District Coordinator Lead', dept: 'District Network', type: 'District Leadership', loc: 'Pan-India' },
    { id: 'opp-3', title: 'Dissent Dias Opinion Columnist', dept: 'Editorial Board', type: 'Editorial', loc: 'Remote' },
    { id: 'opp-4', title: 'Full-Stack Next.js Architect', dept: 'Technology', type: 'Career', loc: 'Remote' },
    { id: 'opp-5', title: 'Campus President & Ambassador', dept: 'Campus Chapters', type: 'Campus Leadership', loc: 'University Campuses' },
    { id: 'opp-6', title: 'Strategy Consultant (Market Entry)', dept: 'Advisory', type: 'Consulting', loc: 'Hybrid' }
  ];

  const filteredOpps = useMemo(() => {
    return opportunitiesList.filter((o) => {
      const matchDept = selectedDept === 'All' || o.dept === selectedDept;
      const matchType = selectedType === 'All' || o.type === selectedType;
      return matchDept && matchType;
    });
  }, [selectedDept, selectedType]);

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline">← Main Platform</Link>
        <span>PEOPLEANDYOUTH.ORG &middot; GLOBAL OPPORTUNITY GATEWAY</span>
      </div>

      <div className="max-w-6xl mx-auto p-6 sm:p-12 space-y-8">
        <header className="text-center space-y-3">
          <span className="text-amber-400 font-bold uppercase text-[10px] tracking-widest block">UNIFIED RECRUITMENT ENGINE</span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase font-serif">Global Opportunity Gateway</h1>
          <p className="text-gray-400 text-xs italic font-serif max-w-xl mx-auto">
            One Gateway. Many Opportunities. Every Application Matters.
          </p>
        </header>

        {/* FILINGS & OPPORTUNITIES DROPDOWN FILTER MENU */}
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-amber-400 font-bold text-[10px] uppercase">Filter Filing Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#070b19] border border-white/20 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none text-xs"
            >
              <option value="All">All Departments</option>
              <option value="Policy Lab">Policy Lab</option>
              <option value="District Network">District Network</option>
              <option value="Editorial Board">Editorial Board</option>
              <option value="Technology">Technology</option>
              <option value="Campus Chapters">Campus Chapters</option>
              <option value="Advisory">Advisory</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-amber-400 font-bold text-[10px] uppercase">Filing Opportunity Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#070b19] border border-white/20 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none text-xs"
            >
              <option value="All">All Types</option>
              <option value="Fellowship">Fellowship</option>
              <option value="District Leadership">District Leadership</option>
              <option value="Editorial">Editorial</option>
              <option value="Career">Career</option>
              <option value="Campus Leadership">Campus Leadership</option>
              <option value="Consulting">Consulting</option>
            </select>
          </div>
        </div>

        {/* DYNAMIC OPPORTUNITIES LIST WITH EMBEDDED APPLY ENGINE */}
        <div className="space-y-6">
          {filteredOpps.map((opp) => (
            <OpportunityApplySection
              key={opp.id}
              opportunityId={opp.id}
              opportunityType={opp.type}
              department={opp.dept}
              title={opp.title}
              location={opp.loc}
            />
          ))}
        </div>
      </div>
    </main>
  );
}