'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminPage() {
  const [passkey, setPasskey] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [passports, setPassports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'applications' | 'passports'>('applications');
  const [filterDomain, setFilterDomain] = useState<string>('All');

  // Hardcoded Admin Key (Change this or use env variable)
  const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_PASSKEY || 'peopleandyouth@0007';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === ADMIN_KEY) {
      setIsAuthenticated(true);
      fetchAdminData();
    } else {
      alert('Invalid Admin Passkey');
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch Candidate Applications
      const { data: appsData, error: appsError } = await supabase
        .from('candidate_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsData) setApplications(appsData);
      if (appsError) console.error('Apps Fetch Error:', appsError);

      // Fetch Civic Passports
      const { data: passData, error: passError } = await supabase
        .from('civic_passports')
        .select('*')
        .order('created_at', { ascending: false });

      if (passData) setPassports(passData);
      if (passError) console.error('Passports Fetch Error:', passError);
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('candidate_applications')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setApplications(applications.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } else {
      alert('Failed to update status');
    }
  };

  const filteredApps = filterDomain === 'All' 
    ? applications 
    : applications.filter(a => a.primary_domain === filterDomain);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#070b19] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 border border-cyan-500/40 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">RESTRICTED ACCESS</span>
            <h1 className="text-2xl font-extrabold text-white">Institutional Control Panel</h1>
            <p className="text-xs text-gray-400">Enter administrator passkey to access candidate database &amp; passport ledgers.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Admin Passkey</label>
              <input
                type="password"
                value={passkey}
                onChange={e => setPasskey(e.target.value)}
                placeholder="Enter passkey (default: peopleandyouth@0007)"
                className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all"
            >
              Authenticate &amp; Open Dashboard &rarr;
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-gray-500 hover:text-cyan-400 font-mono">← Back to Public Website</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b19] text-white p-6 sm:p-10 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">ADMINISTRATIVE DASHBOARD</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">People &amp; Youth Control Center</h1>
          <p className="text-xs text-gray-400 mt-0.5">Managing private Supabase candidate records &amp; issued Civic Passports.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono border border-white/10"
          >
            🔄 Refresh Data
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-mono border border-red-500/30"
          >
            🔒 Lock Session
          </button>
        </div>
      </div>

      {/* METRICS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <span className="text-xs font-mono text-gray-400 block">Total Candidate Submissions</span>
          <span className="text-3xl font-extrabold text-cyan-400 mt-1 block">{applications.length}</span>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <span className="text-xs font-mono text-gray-400 block">Civic Passports Issued</span>
          <span className="text-3xl font-extrabold text-amber-400 mt-1 block">{passports.length}</span>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <span className="text-xs font-mono text-gray-400 block">Under Review</span>
          <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">
            {applications.filter(a => a.status === 'Under Review').length}
          </span>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <span className="text-xs font-mono text-gray-400 block">Shortlisted / Interviewed</span>
          <span className="text-3xl font-extrabold text-blue-400 mt-1 block">
            {applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled').length}
          </span>
        </div>
      </div>

      {/* TAB SELECTOR */}
      <div className="flex gap-4 border-b border-white/10 pb-3">
        <button
          onClick={() => setSelectedTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            selectedTab === 'applications' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          Candidate Applications ({applications.length})
        </button>
        <button
          onClick={() => setSelectedTab('passports')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            selectedTab === 'passports' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          Civic Passport Holders ({passports.length})
        </button>
      </div>

      {/* APPLICATIONS PANEL */}
      {selectedTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-400">Filter by Domain:</span>
            <select
              value={filterDomain}
              onChange={e => setFilterDomain(e.target.value)}
              className="bg-[#0b1228] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="All">All Domains</option>
              <option value="Public Policy & Governance">Public Policy &amp; Governance</option>
              <option value="Research & Empirical Analytics">Research &amp; Empirical Analytics</option>
              <option value="Technology & AI Engineering">Technology &amp; AI Engineering</option>
              <option value="Editorial & Journalism">Editorial &amp; Journalism</option>
            </select>
          </div>

          {isLoading ? (
            <p className="text-xs font-mono text-cyan-400">Loading Supabase records...</p>
          ) : filteredApps.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center border border-dashed border-white/10 rounded-2xl">
              No candidate submissions found in database.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => (
                <div key={app.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-cyan-500/40 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="text-xs font-mono text-cyan-400 font-bold">{app.app_id}</span>
                      <h3 className="text-lg font-bold text-white">{app.full_name}</h3>
                      <p className="text-xs text-gray-400">{app.email} • {app.phone || 'No phone'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-400">Status:</span>
                      <select
                        value={app.status || 'Under Review'}
                        onChange={e => updateStatus(app.id, e.target.value)}
                        className="bg-[#0b1228] border border-cyan-500/50 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono font-bold"
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Onboarded">Onboarded</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 block font-mono text-[10px]">Domain:</span>
                      <span className="font-semibold text-white">{app.primary_domain}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block font-mono text-[10px]">Experience:</span>
                      <span className="font-semibold text-white">{app.total_experience_years || 'Fresher'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block font-mono text-[10px]">LinkedIn:</span>
                      {app.linkedin_url ? (
                        <a href={app.linkedin_url} target="_blank" rel="noreferrer" className="text-cyan-400 underline">View Profile ↗</a>
                      ) : <span className="text-gray-600">None</span>}
                    </div>
                    <div>
                      <span className="text-gray-500 block font-mono text-[10px]">Resume Link:</span>
                      {app.resume_drive_url ? (
                        <a href={app.resume_drive_url} target="_blank" rel="noreferrer" className="text-amber-400 font-bold underline">Open Resume PDF ↗</a>
                      ) : <span className="text-gray-600">None</span>}
                    </div>
                  </div>

                  {app.cover_note && (
                    <div className="bg-[#0b1228] p-3 rounded-xl border border-white/5 text-xs text-gray-300">
                      <span className="text-gray-500 block font-mono text-[10px] mb-1">Statement of Intent:</span>
                      &ldquo;{app.cover_note}&rdquo;
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-gray-500 text-right">
                    Submitted on: {new Date(app.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PASSPORTS PANEL */}
      {selectedTab === 'passports' && (
        <div className="space-y-4">
          {passports.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center border border-dashed border-white/10 rounded-2xl">
              No Civic Passports issued yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {passports.map((pass) => (
                <div key={pass.id} className="bg-white/5 border border-amber-500/30 rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{pass.passport_id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                      {pass.status}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{pass.holder_name}</h4>
                  <p className="text-xs text-gray-400">{pass.email} • {pass.phone || 'N/A'}</p>
                  <p className="text-[11px] text-gray-500 font-mono">Payment ID: {pass.payment_id} ({pass.amount_paid})</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </main>
  );
}
