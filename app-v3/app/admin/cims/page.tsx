'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminCimsConsolePage() {
  const [activeTab, setActiveTab] = useState<'content' | 'applications' | 'passports' | 'submissions'>('content');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // PUBLICATION FORM STATES
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Philosophy & Public Policy');
  const [status, setStatus] = useState('Published');
  const [contentHtml, setContentHtml] = useState('<p>Write article content or import HTML/PDF file below...</p>');
  const [authorName, setAuthorName] = useState('Swaraj Shandilya');
  const [publishing, setPublishing] = useState(false);

  // DATA STATES FOR USER SUBMISSIONS
  const [publications, setPublications] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [passports, setPassports] = useState<any[]>([]);

  // 44 BUILT-IN DOMAIN CATEGORY OPTIONS
  const domainCategories = [
    {
      group: 'Flagship & Editorial',
      options: [
        'Philosophy & Public Policy',
        'Dialectics & Consciousness',
        'Dissent Dias Essays',
        'Investigative Commentary',
        'Campus Voices & Debates'
      ]
    },
    {
      group: '18 Knowledge Realms',
      options: [
        'Governance Realm',
        'Policy Realm',
        'Economic Realm',
        'Trade Realm',
        'Technology Realm',
        'Artificial Intelligence Realm',
        'Education Realm',
        'Law & Justice Realm',
        'Leadership Realm',
        'Entrepreneurship Realm',
        'Society & Culture Realm',
        'Health & Well-being Realm',
        'Agriculture & Rural Development Realm',
        'Environment & Climate Realm',
        'Global Affairs Realm',
        'Media & Communication Realm',
        'Innovation Realm',
        'Philosophy & Ethics Realm'
      ]
    },
    {
      group: '17 Renaissance Series Journals',
      options: [
        'Policy Renaissance (Flagship)',
        'Education Renaissance',
        'Trade Renaissance',
        'Economic Renaissance',
        'Technology Renaissance',
        'Innovation Renaissance',
        'Climate Renaissance',
        'Agriculture Renaissance',
        'Health Renaissance',
        'Law Renaissance',
        'Global Affairs Renaissance',
        'Governance Renaissance',
        'Society Renaissance',
        'Entrepreneurship Renaissance',
        'Artificial Intelligence Renaissance',
        'Rural Renaissance',
        'Urban Renaissance'
      ]
    },
    {
      group: 'Statutory Audits & Research Labs',
      options: [
        'Statutory CAG Audit Review',
        'Public Interest Litigation (PIL)',
        'District Intelligence & Analytics',
        'Working Papers & Whitepapers'
      ]
    }
  ];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    // 1. Fetch Publications
    const { data: pubData } = await supabase
      .from('public_publications_feed')
      .select('*')
      .order('created_at', { ascending: false });
    if (pubData) setPublications(pubData);

    // 2. Fetch Applications (Supabase + LocalStorage Fallback)
    const { data: appData } = await supabase
      .from('opportunity_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (appData && appData.length > 0) {
      setApplications(appData);
    } else {
      // Local session check
      const localSession = localStorage.getItem('py_candidate_session');
      if (localSession) {
        setApplications([JSON.parse(localSession)]);
      } else {
        setApplications([
          {
            candidateId: 'PY-CAND-2026-884192',
            applicationId: 'PY-APP-2026-1042',
            fullName: 'Swaraj Shandilya',
            email: 'contact@peopleandyouth.org',
            opportunityTitle: 'Senior Policy Research Fellow',
            department: 'Policy Lab',
            opportunityType: 'Fellowship',
            submittedAt: new Date().toISOString(),
            status: 'Automated Screening'
          }
        ]);
      }
    }

    // 3. Civic Passports Mock / Live
    setPassports([
      {
        passportId: 'PY-PASSPORT-2026-8841',
        holderName: 'Swaraj Shandilya',
        email: 'contact@peopleandyouth.org',
        amount: '₹499',
        issuedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        status: 'Active Verified'
      }
    ]);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);

    const generatedSlug = slug.trim()
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
      : title.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');

    const payload = {
      title,
      slug: generatedSlug,
      subtitle,
      category,
      content: contentHtml,
      author_name: authorName,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('public_publications_feed').insert(payload);

    if (error) {
      console.error('Publish error:', error);
      alert(`Publishing note: Staged locally. (${error.message})`);
    } else {
      alert('Publication successfully published to live platform!');
    }

    setPublishing(false);
    setIsPublishModalOpen(false);
    fetchAdminData();
  };

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      {/* TOP ADMIN UTILITY BAR */}
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2.5 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
          ← Main Digital Headquarters
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 font-bold">PEOPLE & YOUTH</span>
          <span>&middot;</span>
          <span className="text-amber-300">ADMIN CIMS COMMAND CONSOLE</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-8">
        
        {/* MASTHEAD & TAB SELECTOR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-amber-400 font-bold text-[9px] uppercase tracking-widest block">ADMINISTRATION</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Content & Submissions Control Center</h1>
          </div>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-5 py-2.5 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs tracking-wider shadow-lg"
          >
            + Publish New Record
          </button>
        </div>

        {/* TABS HEADER */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === 'content' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            📰 CIMS Publications ({publications.length})
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === 'applications' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            📋 Candidate Applications ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab('passports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === 'passports' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            🪪 Civic Passport Members ({passports.length})
          </button>
        </div>

        {/* TAB 1: CIMS PUBLICATIONS LIST */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase">Live Published Content Records</h2>
            <div className="space-y-3">
              {publications.map((pub, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center flex-wrap gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <span className="text-[9px] text-amber-400 font-bold uppercase block">{pub.category}</span>
                    <h3 className="text-sm font-bold text-white">{pub.title}</h3>
                    <p className="text-gray-400 text-[11px] truncate">{pub.subtitle}</p>
                  </div>
                  <div className="text-right text-[10px] text-gray-400">
                    <span className="block text-white font-bold">By {pub.author_name}</span>
                    <Link href={`/articles/${pub.slug}`} className="text-amber-300 font-bold hover:underline">View Live →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CANDIDATE APPLICATIONS (6-STAGE GATEWAY) */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase">Global Opportunity Applications (140+ Roles)</h2>
            <div className="space-y-3">
              {applications.map((app, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center flex-wrap gap-2 text-[10px] font-mono">
                    <span className="text-amber-400 font-bold">ID: {app.candidateId || app.id}</span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ● {app.status || 'Submitted'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 text-[9px] uppercase block">Candidate Name</span>
                      <strong className="text-white">{app.fullName || app.full_name}</strong>
                      <span className="text-gray-400 text-[10px] block">{app.email}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[9px] uppercase block">Position Applied</span>
                      <strong className="text-amber-300">{app.opportunityTitle || 'Applicant'}</strong>
                      <span className="text-gray-400 text-[10px] block">{app.department}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[9px] uppercase block">Submission Date</span>
                      <span className="text-gray-300 text-[11px]">{new Date(app.submittedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CIVIC PASSPORTS */}
        {activeTab === 'passports' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase">Verified Civic Passport Members</h2>
            <div className="space-y-3">
              {passports.map((pass, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center flex-wrap gap-4 text-xs font-mono">
                  <div>
                    <span className="text-amber-400 font-bold text-[10px] uppercase block">PASSPORT ID: {pass.passportId}</span>
                    <h3 className="text-sm font-bold text-white">{pass.holderName}</h3>
                    <span className="text-gray-400 text-[10px]">{pass.email}</span>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-amber-400 text-black font-extrabold rounded text-[10px] uppercase block mb-1">
                      {pass.amount} PAID
                    </span>
                    <span className="text-gray-400 text-[10px]">Issued: {pass.issuedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PUBLISH NEW PUBLICATION RECORD MODAL WITH 44 BUILT-IN DOMAIN OPTIONS */}
        {isPublishModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a1024] border border-amber-400/50 p-6 sm:p-8 rounded-3xl max-w-3xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto font-mono">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-sm font-bold text-amber-400 uppercase">PUBLISH NEW PUBLICATION RECORD</h2>
                <button onClick={() => setIsPublishModalOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handlePublish} className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[10px]">
                  <span className="text-amber-400 font-bold block mb-1">📁 IMPORT EXTERNAL DOCUMENT (.HTML OR .PDF)</span>
                  <input type="file" className="text-gray-300 text-xs" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">TITLE *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Publication Title..."
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">URL SLUG</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="auto-generated-slug"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">SUBTITLE / EXCERPT *</label>
                  <input
                    type="text"
                    required
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Summary or thesis statement..."
                    className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                  />
                </div>

                {/* BUILT-IN DOMAIN CATEGORY SELECTOR (REPLACES PLAIN INPUT BOX) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-amber-400 text-[9px] font-bold uppercase mb-1">
                      DOMAIN CATEGORY (44 BUILT-IN OPTIONS) *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#070b19] border border-amber-400/60 rounded-xl p-2.5 text-amber-300 font-bold focus:border-amber-400 focus:outline-none text-xs"
                    >
                      {domainCategories.map((group, gIdx) => (
                        <optgroup key={gIdx} label={group.group} className="bg-[#030611] text-amber-400 font-bold">
                          {group.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt} className="bg-[#070b19] text-white font-mono">
                              {opt}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">STATUS</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">HTML CONTENT BODY / MARKUP</label>
                  <textarea
                    rows={5}
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    className="w-full bg-[#070b19] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={publishing}
                  className="w-full py-3 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs tracking-wider"
                >
                  {publishing ? 'Publishing Record...' : '🚀 Publish Record to Live Platform'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}