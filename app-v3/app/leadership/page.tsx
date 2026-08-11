'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const INSTITUTIONAL_OFFICES = [
  { id: 'ALL', name: '🌐 All Institutional Offices' },
  { id: 'TECH', name: '💻 Office of Technology & AI Infrastructure', matchKey: 'technology' },
  { id: 'EXEC', name: '🏛️ Global Secretariat & Executive Offices', matchKey: 'secretariat' },
  { id: 'POLICY', name: '📜 Office of Public Policy, Legal & Strategy', matchKey: 'policy' },
  { id: 'EDITORIAL', name: '📚 Office of Publications & Editorial Board', matchKey: 'editorial' },
  { id: 'REGIONAL', name: '🌍 Office of Regional & Zonal Operations', matchKey: 'regional' }
];

export default function LeadershipNetworkPage() {
  const [selectedOffice, setSelectedOffice] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const ORG_LINKEDIN_URL = "https://www.linkedin.com/company/https-www.peopleandyouth.org-/";

  useEffect(() => {
    async function fetchLeadershipProfiles() {
      setLoading(true);
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('display_order', { ascending: true });

      if (data) setAuthors(data);
      setLoading(false);
    }

    fetchLeadershipProfiles();
  }, []);

  // Filter members based on selected Office
  const filteredMembers = authors.filter((a) => {
    if (selectedOffice === 'ALL') return true;
    const activeOffice = INSTITUTIONAL_OFFICES.find(o => o.id === selectedOffice);
    if (!activeOffice?.matchKey) return true;

    const officeText = (a.office || '').toLowerCase();
    const deptText = (a.department || '').toLowerCase();
    const desigText = (a.designation || '').toLowerCase();

    return officeText.includes(activeOffice.matchKey) || 
           deptText.includes(activeOffice.matchKey) || 
           desigText.includes(activeOffice.matchKey);
  });

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP BAR: LANGUAGE SWITCHER & OFFICIAL LINKEDIN */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-4">
          
          {/* LANGUAGE SWITCHER BAR */}
          <div className="flex items-center gap-2 bg-[#070b19] border border-amber-500/30 p-1.5 rounded-xl">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest px-2">
              🌐 LANGUAGE:
            </span>
            {['EN', 'HI', 'SA', 'BN', 'TA', 'TE'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                  selectedLanguage === lang ? 'bg-amber-500 text-black font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* OFFICIAL INSTITUTIONAL LINKEDIN BUTTON */}
          <a
            href={ORG_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-950/40 border border-blue-500/40 text-blue-400 hover:bg-blue-900/40 rounded-xl text-xs font-bold transition"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            Follow People & Youth on LinkedIn
          </a>
        </div>

        {/* HEADER BANNER */}
        <div className="bg-[#070b19] border border-amber-500/30 rounded-2xl p-6 sm:p-10 text-center space-y-3 shadow-2xl">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
            INSTITUTIONAL DIRECTORY • LEADERSHIP & FELLOWS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wider">
            Office Architecture & Fellows Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Explore active appointments, research fellows, legal scholars, and technology leads across the People & Youth ecosystem.
          </p>
        </div>

        {/* OFFICE FILTER NAVIGATION TABS */}
        <div className="flex border-b border-gray-800 overflow-x-auto gap-2 pb-2">
          {INSTITUTIONAL_OFFICES.map((office) => (
            <button
              key={office.id}
              onClick={() => setSelectedOffice(office.id)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition whitespace-nowrap border ${
                selectedOffice === office.id 
                  ? 'bg-amber-500 text-black border-amber-500 font-black' 
                  : 'bg-[#070b19] text-gray-400 border-gray-800 hover:border-amber-500/40 hover:text-white'
              }`}
            >
              {office.name}
            </button>
          ))}
        </div>

        {/* PROFILES GRID */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            Loading institutional registry...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* ACTIVE MEMBER CARDS */}
            {filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className="bg-[#070b19] border border-gray-800/80 hover:border-amber-500/50 rounded-2xl p-6 space-y-4 transition shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-white">{member.name}</h2>
                      <span className="text-xs font-semibold text-amber-400 block">{member.designation}</span>
                    </div>
                    {member.consent_status === 'ACCEPTED' ? (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-mono uppercase font-bold">
                        ✅ CONSENTED
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded font-mono uppercase font-bold">
                        ⏳ ACTIVE
                      </span>
                    )}
                  </div>

                  {member.office && (
                    <span className="text-[10px] text-gray-400 font-mono block bg-[#030611] p-2 rounded-lg border border-gray-800">
                      🏛️ {member.office}
                    </span>
                  )}

                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {member.bio || 'Member of the People & Youth institutional network.'}
                  </p>

                  {member.expertise && member.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {member.expertise.map((exp: string, idx: number) => (
                        <span key={idx} className="text-[9px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-800 pt-3 flex justify-between items-center text-xs">
                  <a
                    href={member.linkedin_url || ORG_LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline text-[11px] font-bold flex items-center gap-1"
                  >
                    LinkedIn Profile →
                  </a>
                  {member.website_url && (
                    <a href={member.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-[11px]">
                      🌐 Website
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* VACANT ROLE / FELLOWSHIP INTAKE CARDS */}
            <div className="bg-[#030611] border border-dashed border-gray-800 hover:border-amber-500/40 rounded-2xl p-6 text-center space-y-4 flex flex-col justify-center items-center">
              <span className="text-2xl">🏛️</span>
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                  OPEN FELLOWSHIP POSITION
                </span>
                <h3 className="text-sm font-bold text-gray-300 uppercase mt-1">
                  {selectedOffice === 'TECH' ? 'Associate Technology Fellow' :
                   selectedOffice === 'POLICY' ? 'Senior Legal & Policy Fellow' :
                   selectedOffice === 'REGIONAL' ? 'Zonal Regional Coordinator' :
                   'Fellowship & Advisory Role'}
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                This position is open for candidates in the 2026 admissions cycle.
              </p>
              <Link 
                href="/academy/enroll" 
                className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold uppercase hover:bg-amber-500 hover:text-black transition"
              >
                Apply For Role →
              </Link>
            </div>

          </div>
        )}

        {/* FOOTER */}
        <div className="border-t border-gray-800 pt-6 text-center space-y-2 text-xs text-gray-500">
          <p>
            PEOPLE & YOUTH • Sovereign Operating System for Leadership & Research
          </p>
          <a href={ORG_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
            Official Organization LinkedIn: https://www.linkedin.com/company/https-www.peopleandyouth.org-/
          </a>
        </div>

      </div>
    </div>
  );
}