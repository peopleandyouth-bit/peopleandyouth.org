'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CareersPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantResume, setApplicantResume] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const activeRoles = [
    { title: "Senior Policy Research Fellow", dept: "Policy Lab", type: "Full-Time / Hybrid", desc: "Lead empirical analysis on CAG audit reports, statutory frameworks, and PIL draft petitions." },
    { title: "Journal & Content Editor", dept: "Dissent Dias & Journals", type: "Part-Time / Remote", desc: "Review philosophical soliloquies, edit incoming essays, and manage publication standards." },
    { title: "Data & Systems Infrastructure Engineer", dept: "Technology & CIMS", type: "Contract / Remote", desc: "Maintain Next.js, Supabase PostgreSQL, and sovereign data pipeline architectures." },
    { title: "Youth Praxis & Chapter Coordinator", dept: "Civic Outreach", type: "Volunteer / Leadership", desc: "Expand People & Youth university chapters and lead youth-focused civic engagements." }
  ];

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(`Thank you, ${applicantName}! Your application for "${selectedRole}" has been received. Our team will reach out via ${applicantEmail}.`);
    setApplicantName('');
    setApplicantEmail('');
    setApplicantResume('');
    setTimeout(() => {
      setSelectedRole(null);
      setMsg(null);
    }, 4000);
  };

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline">← Main Newsroom</Link>
        <span>PEOPLEANDYOUTH.ORG &middot; TALENT & APPLICATIONS PORTAL</span>
      </div>

      <header className="border-b border-white/10 px-6 py-10 max-w-5xl mx-auto space-y-3 text-center">
        <span className="text-amber-400 font-bold uppercase tracking-[0.2em] text-[10px]">JOIN THE INSTITUTION</span>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase font-serif tracking-tight">Careers & Opportunities</h1>
        <p className="text-gray-400 text-sm italic font-serif max-w-2xl mx-auto">
          Help Build the Sovereign Knowledge Platform Empowering Youth Leadership and Civic Praxis
        </p>
      </header>

      <div className="max-w-5xl mx-auto p-6 sm:p-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeRoles.map((role, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 hover:border-amber-400/50 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                  <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">{role.dept}</span>
                  <span className="text-gray-400">{role.type}</span>
                </div>
                <h3 className="text-base font-bold text-white">{role.title}</h3>
                <p className="text-gray-400 text-[11px] leading-relaxed">{role.desc}</p>
              </div>

              <button
                onClick={() => setSelectedRole(role.title)}
                className="w-full py-2 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all mt-4"
              >
                Apply for Position →
              </button>
            </div>
          ))}
        </div>

        {/* APPLICATION MODAL */}
        {selectedRole && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a1024] border border-amber-400/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase">Apply: {selectedRole}</h3>
                <button onClick={() => setSelectedRole(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              {msg ? (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl font-bold text-center">
                  {msg}
                </div>
              ) : (
                <form onSubmit={handleSubmitApplication} className="space-y-3">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Full Name</label>
                    <input type="text" required value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">Email Address</label>
                    <input type="email" required value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">LinkedIn / Portfolio / Resume URL</label>
                    <input type="url" required value={applicantResume} onChange={(e) => setApplicantResume(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all">
                    Submit Application
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}