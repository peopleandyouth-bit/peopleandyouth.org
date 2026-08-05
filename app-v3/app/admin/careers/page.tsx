'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function CareersERPPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [roleApplied, setRoleApplied] = useState('Research Associate');
  const [resumeUrl, setResumeUrl] = useState('');
  const [score, setScore] = useState('85');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data } = await supabase.from('career_applications').select('*').order('created_at', { ascending: false });
    if (data) setApps(data);
    setLoading(false);
  };

  const handleCreateApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('career_applications').insert([{
      applicant_name: applicantName,
      email,
      role_applied: roleApplied,
      resume_url: resumeUrl,
      assessment_score: parseInt(score) || 0,
      notes
    }]);

    if (!error) {
      setApplicantName('');
      setEmail('');
      setResumeUrl('');
      fetchApplications();
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-10 space-y-8">
      <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-6 gap-4 max-w-7xl mx-auto">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            HUMAN CAPITAL & FELLOWSHIPS
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Careers & Fellowship ERP</h1>
        </div>
        <Link href="/admin/dashboard" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200">
          ← Dashboard HQ
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleCreateApplicant} className="lg:col-span-1 bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase border-b border-white/10 pb-2">
            Register Applicant Intake
          </h2>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Applicant Name</label>
            <input
              type="text"
              required
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Role / Fellowship</label>
            <select
              value={roleApplied}
              onChange={(e) => setRoleApplied(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white"
            >
              <option value="Research Associate">Research Associate</option>
              <option value="Policy Analyst">Policy Analyst</option>
              <option value="Legal Fellow">Legal Fellow</option>
              <option value="Tech Architect">Tech Architect</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Assessment Score (0-100)</label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-amber-400 font-bold"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Resume / Portfolio Link</label>
            <input
              type="text"
              placeholder="https://..."
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-amber-400 text-black font-extrabold rounded-xl uppercase">
            Log Candidate
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase border-b border-white/10 pb-2">
            Applicant Pipeline ({apps.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading Pipeline...</div>
          ) : apps.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-gray-500">
              No applicants logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((a) => (
                <div key={a.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 bg-amber-400/10 text-amber-400 font-bold uppercase text-[9px]">
                      {a.role_applied}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{a.applicant_name}</h3>
                    <p className="text-gray-400 text-[10px]">{a.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-amber-400">{a.assessment_score}/100</div>
                    <span className="text-[9px] uppercase font-mono text-emerald-400">{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}