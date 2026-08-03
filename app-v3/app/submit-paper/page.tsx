'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';
import { supabase } from '@/lib/supabaseClient';

const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";

const JOURNALS = [
  'Policy Renaissance', 'Trade Renaissance', 'Education Renaissance',
  'Governance Renaissance', 'Constitutional Renaissance', 'Technology Renaissance',
  'Healthcare Renaissance', 'Innovation Renaissance', 'Climate Renaissance',
  'Youth Renaissance', 'International Renaissance'
];

const CAVES = [
  'Constitution Cave', 'Democracy Cave', 'Education Cave', 'Trade Cave', 
  'Economy Cave', 'Judiciary Cave', 'Election Cave', 'RTI Cave', 
  'Technology Cave', 'Artificial Intelligence Cave', 'Climate Cave', 
  'Agriculture Cave', 'Rural Development Cave', 'Urban Governance Cave', 
  'Public Finance Cave', 'Foreign Policy Cave', 'Social Justice Cave'
];

export default function SubmitPaperPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPaperId, setSubmittedPaperId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    primaryAuthor: '',
    authorEmail: '',
    affiliation: '',
    targetJournal: 'Policy Renaissance',
    targetCave: 'Constitution Cave',
    abstract: '',
    manuscriptUrl: '',
    keywords: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const generatedPaperId = `PY-PAPER-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const { error } = await supabase.from('research_papers').insert([
        {
          paper_id: generatedPaperId,
          title: form.title,
          primary_author: form.primaryAuthor,
          author_email: form.authorEmail,
          institutional_affiliation: form.affiliation,
          target_journal: form.targetJournal,
          target_cave: form.targetCave,
          abstract: form.abstract,
          manuscript_url: form.manuscriptUrl,
          keywords: form.keywords,
          status: 'Under Peer Review'
        }
      ]);

      if (error) console.error('Supabase error:', error);
      setSubmittedPaperId(generatedPaperId);
      setForm({
        title: '', primaryAuthor: '', authorEmail: '', affiliation: '',
        targetJournal: 'Policy Renaissance', targetCave: 'Constitution Cave',
        abstract: '', manuscriptUrl: '', keywords: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={BRAND_LOGO_URL} alt="Logo" className="h-10 w-auto rounded-lg object-contain bg-white/10 p-1 border border-white/20" />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">People &amp; Youth</span>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mt-0.5">Digital Institution</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/about" className="hover:text-cyan-400 transition-colors">About Mandate</Link>
            <Link href="/careers" className="hover:text-cyan-400 transition-colors">Careers &amp; Opportunities</Link>
            <Link href="/submit-paper" className="text-cyan-400 font-bold border-b-2 border-cyan-400 py-1">Policy Journals</Link>
            <Link href="/rural-consulting" className="hover:text-cyan-400 transition-colors">Rural Consulting</Link>
          </nav>

          <GoogleTranslate />
        </div>
      </header>

      {/* CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1 space-y-12">
        
        <div className="text-center space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            RENAISSANCE PUBLICATIONS SCHOLARSHIP PORTAL
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Submit Your Policy Research</h1>
          <p className="text-gray-300 text-sm max-w-2xl mx-auto leading-relaxed">
            Open-access manuscript submission portal for researchers, students, and legal scholars contributing to our 11 Renaissance Journals &amp; Knowledge Caves.
          </p>
        </div>

        {submittedPaperId && (
          <div className="p-6 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/60 text-white space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-emerald-300 font-mono">✓ MANUSCRIPT SUBMITTED FOR PEER REVIEW</span>
              <span className="px-3 py-1 bg-emerald-500 text-black font-mono font-bold text-xs rounded-lg">{submittedPaperId}</span>
            </div>
            <p className="text-xs text-gray-200">
              Your paper has been indexed into our editorial queue. Our peer review board will evaluate your manuscript within 5 business days.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#0c1638] via-[#070b19] to-[#0a1836] border border-cyan-500/40 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Paper Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="e.g. Constitutional Morality in Digital Public Infrastructure"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Primary Author Name *</label>
              <input
                type="text"
                value={form.primaryAuthor}
                onChange={e => setForm({...form, primaryAuthor: e.target.value})}
                placeholder="e.g. Dr. Ananya Sharma"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Author Email *</label>
              <input
                type="email"
                value={form.authorEmail}
                onChange={e => setForm({...form, authorEmail: e.target.value})}
                placeholder="author@institution.org"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Institutional Affiliation</label>
              <input
                type="text"
                value={form.affiliation}
                onChange={e => setForm({...form, affiliation: e.target.value})}
                placeholder="e.g. Delhi University / IIFT GIFT City"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Target Renaissance Journal *</label>
              <select
                value={form.targetJournal}
                onChange={e => setForm({...form, targetJournal: e.target.value})}
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                {JOURNALS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Target Knowledge Cave *</label>
              <select
                value={form.targetCave}
                onChange={e => setForm({...form, targetCave: e.target.value})}
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                {CAVES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Manuscript PDF Link (Google Drive / Dropbox) *</label>
              <input
                type="url"
                value={form.manuscriptUrl}
                onChange={e => setForm({...form, manuscriptUrl: e.target.value})}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Abstract / Summary *</label>
              <textarea
                rows={4}
                value={form.abstract}
                onChange={e => setForm({...form, abstract: e.target.value})}
                placeholder="Provide a concise 150-250 word summary of research methodology and policy recommendations..."
                className="w-full bg-[#070b19] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Manuscript for Peer Review →'}
            </button>
          </div>
        </form>

      </div>

    </main>
  );
}
