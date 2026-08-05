'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function PolicyRepositoryAdminPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);

  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('RTI Filing');
  const [summary, setSummary] = useState('');
  const [authorName, setAuthorName] = useState('Swaraj Shandilya');
  const [fileUrl, setFileUrl] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('policy_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const randomString = Math.random().toString(36).substring(2, 7);
      const fileName = `policy-${Date.now()}-${randomString}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('essay-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('essay-assets')
        .getPublicUrl(fileName);

      setFileUrl(publicUrlData.publicUrl);
      setMessage({ type: 'success', text: 'Document attachment uploaded successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'File upload failed.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) {
      setMessage({ type: 'error', text: 'Title and Summary are required.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('policy_documents').insert([
        {
          title,
          document_type: documentType,
          summary,
          file_url: fileUrl,
          author_name: authorName,
          status,
        },
      ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Policy document published successfully!' });
      setTitle('');
      setSummary('');
      setFileUrl('');
      fetchDocuments();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save document.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this record?')) return;

    const { error } = await supabase.from('policy_documents').delete().eq('id', id);
    if (!error) {
      fetchDocuments();
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-10 space-y-8">
      <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-6 gap-4 max-w-6xl mx-auto">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            CIVIC MECHANISMS & LEGAL ARCHIVE
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Legal & Policy Repository</h1>
          <p className="text-gray-400 text-[11px] mt-0.5">
            Log RTI applications, CAG audit critiques, PIL petitions, and policy briefs.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-gray-200"
        >
          ← Master Dashboard
        </Link>
      </div>

      {message && (
        <div
          className={`max-w-6xl mx-auto p-3 text-center rounded-xl font-bold ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-1 bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-white/10 pb-2">
            Log New Legal / Policy Record
          </h2>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Campus Infrastructure PIL Petition..."
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Document Classification</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="RTI Filing">RTI Application / Record Request</option>
              <option value="CAG Critique">CAG Audit Review & Policy Critique</option>
              <option value="PIL Draft">Public Interest Litigation (PIL) Petition</option>
              <option value="Policy Audit">Policy Audit & Institutional Analysis</option>
              <option value="Research Paper">Academic / Strategic Research Paper</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Author / Legal Lead</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Executive Summary / Legal Abstract</label>
            <textarea
              rows={4}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summary of legal statutory grounds, RTI query scope, or audit findings..."
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">PDF Attachment / Evidence URL</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-[#070b19] border border-white/20 rounded-lg p-2 text-white focus:border-amber-400 focus:outline-none text-[10px]"
              />
              <label className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 text-amber-400 font-bold rounded-lg transition-all text-[10px] whitespace-nowrap">
                {uploading ? 'Uploading...' : '📎 Upload PDF'}
                <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Publication Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-amber-400 font-bold focus:border-amber-400 focus:outline-none"
            >
              <option value="published">Published (Public Repository)</option>
              <option value="draft">Draft (Internal Legal Review)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold uppercase tracking-wider hover:from-amber-300 transition-all shadow-xl mt-2"
          >
            {loading ? 'Saving Record...' : '⚖️ Register Policy Document'}
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">
            Archival Document Ledger ({documents.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading Legal Repository...</div>
          ) : documents.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-gray-500">
              No legal or policy records registered yet.
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3 relative group">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 font-bold uppercase text-[9px]">
                        {doc.document_type}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{doc.title}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-gray-500 hover:text-red-400 text-xs px-2 py-1 rounded bg-white/5 hover:bg-red-500/10 transition-colors"
                    >
                      🗑️ Remove
                    </button>
                  </div>

                  <p className="text-gray-300 text-[11px] leading-relaxed">{doc.summary}</p>

                  <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <span>Lead: {doc.author_name}</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    {doc.file_url ? (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 font-bold hover:underline"
                      >
                        📄 Download PDF Evidence →
                      </a>
                    ) : (
                      <span className="italic text-gray-600">No PDF Attached</span>
                    )}
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