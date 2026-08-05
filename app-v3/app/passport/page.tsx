'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function DigitalPassportPage() {
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPassport();
  }, []);

  const fetchPassport = async () => {
    setLoading(true);
    const { data } = await supabase.from('digital_passports').select('*').limit(1).single();

    if (data) {
      setPassport(data);
    } else {
      // Default Seed Passport
      setPassport({
        full_name: 'Swaraj Shandilya',
        passport_number: 'PY-PASS-2026-0001',
        member_tier: 'Founder & Executive Lead',
        skills: ['Public Policy', 'RTI Litigation', 'System Architecture', 'Civic Technology'],
        leadership_score: 980,
        volunteer_hours: 340,
        research_index: 42,
        achievements: ['Founder at peopleandyouth.org', 'PIL Petition Author', 'Master Systems Architect']
      });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      <header className="max-w-4xl mx-auto border-b border-white/10 pb-6 flex justify-between items-center">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            SOVEREIGN CITIZEN & MEMBER ID
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Digital Passport</h1>
        </div>
        <Link href="/dissent-dias" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-gray-200">
          ← Editorial Portal
        </Link>
      </header>

      {loading ? (
        <div className="py-20 text-center text-gray-500 max-w-4xl mx-auto">Loading Passport Ledger...</div>
      ) : (
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0a1024] to-[#111936] border-2 border-amber-400/40 p-8 sm:p-12 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden">
          {/* PASSPORT WATERMARK EMBLEM */}
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-9xl font-black uppercase text-amber-400">
            PY
          </div>

          <div className="flex flex-wrap justify-between items-start gap-6 border-b border-white/10 pb-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold uppercase text-[9px] border border-amber-400/30">
                {passport.member_tier}
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-3">{passport.full_name}</h2>
              <p className="text-amber-400 font-mono text-xs mt-1">ID: {passport.passport_number}</p>
            </div>

            {/* QR CODE DISPLAY */}
            <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center space-y-1">
              <div className="w-24 h-24 bg-black rounded-lg flex items-center justify-center text-[10px] text-white text-center p-2 font-bold leading-tight">
                VERIFIED MEMBER QR CODE
              </div>
              <span className="text-[8px] text-black font-bold uppercase tracking-wider">PY-AUTH-SECURE</span>
            </div>
          </div>

          {/* SCORES MATRIX */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-gray-400 text-[10px] uppercase">Leadership Score</span>
              <div className="text-3xl font-extrabold text-amber-400">{passport.leadership_score}</div>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-gray-400 text-[10px] uppercase">Volunteer Hours</span>
              <div className="text-3xl font-extrabold text-emerald-400">{passport.volunteer_hours} hrs</div>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-gray-400 text-[10px] uppercase">Research Index</span>
              <div className="text-3xl font-extrabold text-blue-400">{passport.research_index} pts</div>
            </div>
          </div>

          {/* SKILLS & ACHIEVEMENTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Verified Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {passport.skills?.map((skill: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-white/10 border border-white/15 rounded-lg text-white text-[11px]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Institutional Distinctions</h3>
              <ul className="space-y-1 text-gray-300 text-[11px]">
                {passport.achievements?.map((ach: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-amber-400">🏅</span> {ach}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}