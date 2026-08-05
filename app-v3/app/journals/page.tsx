'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const DOMAINS = [
  'Education Renaissance', 'Trade Renaissance', 'Policy Renaissance',
  'Finance Renaissance', 'Climate Renaissance', 'Technology Renaissance',
  'Law Renaissance', 'Agriculture Renaissance', 'Health Renaissance',
  'Innovation Renaissance', 'AI Renaissance', 'Global Affairs Renaissance'
];

export default function RenaissanceJournalsPage() {
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Submission State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [abstractText, setAbstractText] = useState('');
  const [authors, setAuthors] = useState('Swaraj Shandilya');
  const [manuscriptUrl, setManuscriptUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data } = await supabase.from('journal_submissions').select('*').order('created_at', { ascending: false });
    if (data) setSubmissions(data);
    setLoading(false);
  };

  const handleSubmitPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('Submitting manuscript for Peer-Review...');

    const { error } = await supabase.from('journal_submissions').insert([{
      journal_domain: domain,
      title,
      abstract_text: abstractText,
      authors: [authors],
      manuscript_url: manuscriptUrl,
      review_status: 'submitted'
    }]);

    if (!error) {
      setStatusMsg('Paper successfully registered for Editorial Board Peer Review!');
      setTitle('');
      setAbstractText('');
      setManuscriptUrl('');
      setShowSubmitModal(false);
      fetchSubmissions();
    } else {
      setStatusMsg(`Error: ${error.message}`);
    }
  };

  const filtered = selectedDomain === 'All' 
    ? submissions 
    : submissions.filter(s => s.journal_domain === selectedDomain);

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            ACADEMIC & RESEARCH PRESS
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Renaissance Journals</h1>
          <p className="text-gray-400 text-[11px] mt-1">
            Peer-reviewed, DOI-ready academic journal network across 12 strategic frontiers.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold uppercase tracking-wider hover:from-amber-300 transition-all shadow-xl"
          >
            📄 Submit Manuscript
          </button>
          <Link href="/dissent-dias" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
            ← Editorials
          </Link>
        </div>
      </header>

      {/* DOMAINS GRID */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDomain('All')}
          className={`px-3 py-1.5 rounded-lg border transition-all text-[11px] ${
            selectedDomain === 'All' ? 'bg-amber-400 text-black border-amber-400 font-bold' : 'bg-white/5 text-gray-400 border-white/10'
          }`}
        >
          All Journals
        </button>
        {DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDomain(d)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-[11px] ${
              selectedDomain === d ? 'bg-amber-400 text-black border-amber-400 font-bold' : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a1024] border border-white/20 p-6 rounded-2xl max-w-xl w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-amber-400 uppercase">Submit Manuscript for Peer Review</h2>
              <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmitPaper} className="space-y-3">
              <div>
                <label className="block text-gray-400 text-[10px] uppercase mb-1">Journal Target</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2 text-white"
                >
                  {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] uppercase mb-1">Paper Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] uppercase mb-1">Abstract</label>
                <textarea
                  rows={4}
                  required
                  value={abstractText}
                  onChange={(e) => setAbstractText(e.target.value)}
                  className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] uppercase mb-1">Manuscript PDF URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={manuscriptUrl}
                  onChange={(e) => setManuscriptUrl(e.target.value)}
                  className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-400 text-black font-extrabold uppercase hover:bg-amber-300"
              >
                Submit Paper to Editorial Board
              </button>
            </form>
          </div>
        </div>
      )}

      {/* JOURNAL PAPERS FEED */}
      <section className="max-w-7xl mx-auto space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">
          Published Papers & Peer-Review Submissions ({filtered.length})
        </h2>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading Academic Journal Records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl text-gray-500">
            No papers found for this journal category. Submit the first manuscript above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((paper) => (
              <div key={paper.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 font-bold uppercase">
                    {paper.journal_domain}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold">
                    {paper.review_status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">{paper.title}</h3>
                <p className="text-gray-300 text-[11px] leading-relaxed">{paper.abstract_text}</p>
                <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>Authors: {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}</span>
                  <span>DOI: {paper.doi || 'DOI Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}