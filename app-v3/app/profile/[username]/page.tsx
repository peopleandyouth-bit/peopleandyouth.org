'use client';

import React from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const username = params.username || 'swarajshandilya';

  const profile = {
    fullName: "Swaraj Shandilya",
    username: username,
    passportId: "PY-2026-612030",
    institution: "Indian Institute of Foreign Trade (IIFT)",
    district: "Delhi",
    country: "India",
    tier: "Verified Tier 1 Fellow",
    biography: "Researcher focused on higher education governance, institutional transparency, and grassroots Right to Information (RTI) audits.",
    skills: ["Public Policy", "Constitutional Law", "Empirical Audits", "Data Analytics"],
    publications: [
      { title: "Campus Readiness & Institutional Approvals: An Empirical Audit", journal: "Policy Renaissance", year: "2026" },
      { title: "Constitutional Morality in Digital Public Infrastructure", journal: "Constitutional Renaissance", year: "2025" }
    ],
    impactScore: 840,
    volunteerHours: 124
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 flex flex-col justify-between">
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg text-white">People &amp; Youth</Link>
          <GoogleTranslate />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 w-full flex-1 space-y-10">
        <section className="bg-gradient-to-br from-blue-950 via-[#0a122c] to-cyan-950 border-2 border-cyan-500/40 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center font-black text-2xl text-cyan-300">
                SS
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{profile.fullName}</h1>
                <p className="text-xs text-cyan-400 font-mono mt-0.5">@{profile.username} • {profile.institution}</p>
                <p className="text-[11px] text-gray-400 font-mono">{profile.district}, {profile.country}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-right">
              <span className="text-[10px] text-amber-300 uppercase font-mono block">Civic Passport ID</span>
              <span className="text-xl font-mono font-bold text-cyan-300">{profile.passportId}</span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">✓ {profile.tier}</span>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">{profile.biography}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            {profile.skills.map(s => (
              <span key={s} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-cyan-300">
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">📚 Verified Publications &amp; Research Papers</h2>
          
          <div className="space-y-4">
            {profile.publications.map((p, idx) => (
              <div key={idx} className="bg-[#0b1228] p-5 rounded-2xl border border-white/10 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5">{p.journal} • {p.year}</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">● Peer Reviewed</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
