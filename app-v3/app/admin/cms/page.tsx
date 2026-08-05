'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const ENTITY_TYPES = [
  'essay', 'magazine', 'journal', 'policy', 'report', 
  'book', 'event', 'course', 'podcast', 'video', 
  'press_release', 'case_study', 'government_submission'
];

export default function UniversalCMSPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [entityType, setEntityType] = useState('policy');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [domain, setDomain] = useState('Public Policy & Law');
  const [authorName, setAuthorName] = useState('Swaraj Shandilya');
  const [rawHtml, setRawHtml] = useState('<p>Write content body here...</p>');
  const [status, setStatus] = useState('published');
  const [msg, setMsg] = useState<any>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const { data } = await supabase.from('institution_content').select('*').order('created_at', { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const { error } = await supabase.from('institution_content').insert([{
      entity_type: entityType,
      title,
      slug,
      subtitle,
      domain,
      author_name: authorName,
      raw_html: rawHtml,
      status
    }]);

    if (error) {
      setMsg({ type: 'error', text: error.message });
    } else {
      setMsg({ type: 'success', text: `Published new ${entityType.toUpperCase()} successfully!` });
      setTitle('');
      setSlug('');
      setSubtitle('');
      fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-10 space-y-8">
      <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-6 gap-4 max-w-7xl mx-auto">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            INSTITUTION OPERATING PLATFORM
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Universal Master CMS</h1>
          <p className="text-gray-400 text-[11px] mt-0.5">Publish across all 13 institutional formats from one command center.</p>
        </div>
        <Link href="/admin/dashboard" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-gray-200">
          ← Dashboard HQ
        </Link>
      </div>

      {msg && (
        <div className={`max-w-7xl mx-auto p-3 text-center rounded-xl font-bold ${msg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
          {msg.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-1 bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-white/10 pb-2">
            Publish New Entity
          </h2>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Entity Format</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-amber-300 font-bold focus:outline-none"
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Entity Title..."
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">URL Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Domain / Category</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Author / Lead</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">HTML Content</label>
            <textarea
              rows={8}
              required
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              className="w-full bg-[#030611] border border-white/20 rounded-lg p-3 text-amber-100 focus:outline-none font-mono text-[11px]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold uppercase tracking-wider hover:from-amber-300 transition-all shadow-xl"
          >
            🚀 Publish to Institution Network
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">
            Institutional Master Ledger ({records.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading Master CMS...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 font-bold uppercase">
                      {item.entity_type}
                    </span>
                    <span className="text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>
                  <p className="text-gray-400 text-[10px]">Domain: {item.domain} | Author: {item.author_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}