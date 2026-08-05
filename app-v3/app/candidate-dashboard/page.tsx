'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CandidateDashboardPage() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem('py_candidate_session');
    if (raw) setSession(JSON.parse(raw));
  }, []);

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline">← Main Platform</Link>
        <span>PEOPLEANDYOUTH.ORG &middot; CANDIDATE DASHBOARD</span>
      </div>

      <div className="max-w-5xl mx-auto p-6 sm:p-12 space-y-8">
        <header className="border-b border-white/10 pb-6 flex justify-between items-end flex-wrap gap-4">
          <div>
            <span className="text-amber-400 font-bold text-[9px] uppercase tracking-widest block">APPLICANT PORTAL</span>
            <h1 className="text-3xl font-extrabold text-white mt-1">Candidate Command Center</h1>
          </div>
          {session && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
              ● Active Candidate Session
            </span>
          )}
        </header>

        {session ? (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-gray-400 text-[9px] uppercase block">Candidate Name</span>
                  <span className="text-sm font-bold text-white">{session.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase block">Candidate ID</span>
                  <span className="text-sm font-bold text-amber-400">{session.candidateId}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase block">Application ID</span>
                  <span className="text-sm font-bold text-amber-400">{session.applicationId}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-amber-400 font-bold text-[10px] uppercase">Applied Opportunity:</span>
                <h3 className="text-lg font-bold text-white">{session.opportunityTitle}</h3>
                <p className="text-gray-400 text-[11px]">{session.department} &middot; {session.opportunityType}</p>
              </div>
            </div>

            {/* UNIFIED APPLICANT PIPELINE STAGES */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase">Unified Pipeline Progression</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-bold text-center">
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl">✓ Eligibility Check</div>
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl">✓ 6-Stage Application</div>
                <div className="p-3 bg-amber-400/20 border border-amber-400 text-amber-300 rounded-xl animate-pulse">● Automated Screening</div>
                <div className="p-3 bg-white/5 text-gray-500 rounded-xl">HR & Domain Review</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl space-y-3">
            <p className="text-gray-400">No active application session found in browser.</p>
            <Link href="/careers" className="px-5 py-2.5 bg-amber-400 text-black font-extrabold uppercase rounded-xl inline-block">
              Browse Opportunities →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}