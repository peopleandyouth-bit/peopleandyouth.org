'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthenticatedCIMSPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [domain, setDomain] = useState('Philosophy & Public Policy');
  const [rawHtml, setRawHtml] = useState('<p>Write article content or upload an HTML/PDF file below...</p>');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }

    setUser(session.user);
    await fetchLiveArticles();
    setLoading(false);
  };

  const fetchLiveArticles = async () => {
    const { data, error } = await supabase
      .from('institution_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(generatedSlug);
  };

  // HTML & PDF FILE INGESTION HANDLER
  const handleDocumentImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    setMsg(null);

    if (fileExt === 'html' || fileExt === 'htm') {
      // 1. INGEST HTML FILE
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setRawHtml(content);

        // Auto-extract Title if missing
        const derivedTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        if (!title) {
          handleTitleChange(derivedTitle.charAt(0).toUpperCase() + derivedTitle.slice(1));
        }

        setMsg({ type: 'success', text: `HTML document "${file.name}" loaded into editor!` });
      };
      reader.readAsText(file);
    } else if (fileExt === 'pdf') {
      // 2. INGEST PDF FILE
      setUploadingFile(true);
      try {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

        const { error: uploadError } = await supabase.storage
          .from('essay-assets')
          .upload(fileName, file, { contentType: 'application/pdf' });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('essay-assets')
          .getPublicUrl(fileName);

        const pdfUrl = publicUrlData.publicUrl;

        // Construct Embedded Responsive PDF Viewer Wrapper
        const pdfEmbedHtml = `
<div class="pdf-viewer-wrapper my-8 font-sans">
  <div class="flex justify-between items-center bg-[#0B192C] text-white p-4 rounded-t-xl border-b-2 border-[#C59B27]">
    <div class="flex items-center gap-2">
      <span class="text-amber-400 font-bold">📄 OFFICIAL PDF DOCUMENT:</span>
      <span class="font-mono text-xs text-gray-300">${file.name}</span>
    </div>
    <a href="${pdfUrl}" target="_blank" download class="px-4 py-1.5 bg-[#C59B27] text-black font-extrabold text-xs rounded hover:bg-yellow-400 transition-colors uppercase">
      Download PDF 📥
    </a>
  </div>
  <iframe src="${pdfUrl}" class="w-full h-[850px] rounded-b-xl border border-gray-300 shadow-xl" title="${file.name}"></iframe>
</div>`;

        setRawHtml(pdfEmbedHtml);

        const derivedTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        if (!title) {
          handleTitleChange(derivedTitle.charAt(0).toUpperCase() + derivedTitle.slice(1));
        }

        setMsg({ type: 'success', text: `PDF uploaded successfully! Viewer embedded.` });
      } catch (err: any) {
        setMsg({ type: 'error', text: err.message || 'PDF upload failed.' });
      } finally {
        setUploadingFile(false);
      }
    } else {
      setMsg({ type: 'error', text: 'Please select a valid .html or .pdf document file.' });
    }

    e.target.value = '';
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !rawHtml) {
      setMsg({ type: 'error', text: 'Title, Slug, and Body Content are required.' });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      const authorEmailName = user?.email ? user.email.split('@')[0] : 'Swaraj Shandilya';

      const { error } = await supabase.from('institution_content').insert([
        {
          title,
          slug,
          subtitle,
          domain,
          entity_type: 'article',
          author_name: authorEmailName,
          raw_html: rawHtml,
          status,
        },
      ]);

      if (error) throw error;

      setMsg({ type: 'success', text: `Publication record created! Live at /articles/${slug}` });
      setTitle('');
      setSlug('');
      setSubtitle('');
      setRawHtml('<p>Write article content or upload an HTML/PDF file below...</p>');
      setIsModalOpen(false);

      fetchLiveArticles();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save record to database.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this publication record?')) return;

    const { error } = await supabase.from('institution_content').delete().eq('id', id);
    if (!error) {
      fetchLiveArticles();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = 'sb-access-token=; path=/; max-age=0';
    document.cookie = 'sb-refresh-token=; path=/; max-age=0';
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b19] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Credentials & Synchronizing Database...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs flex">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col justify-between bg-[#040711] hidden md:flex">
        <div className="space-y-6">
          <div>
            <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest block">
              AUTHENTICATED CONSOLE
            </span>
            <h1 className="text-lg font-extrabold text-white mt-1">CIMS Admin HQ</h1>
            <p className="text-gray-500 text-[10px] truncate mt-0.5">{user?.email}</p>
          </div>

          <nav className="space-y-2">
            <Link href="/admin/cims" className="block px-3.5 py-2.5 rounded-xl bg-amber-400 text-black font-extrabold">
              📰 CIMS Publisher
            </Link>
            <Link href="/admin/dashboard" className="block px-3.5 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 transition-colors">
              📊 Master Dashboard
            </Link>
            <Link href="/admin/policy" className="block px-3.5 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 transition-colors">
              ⚖️ Policy Repository
            </Link>
            <Link href="/admin/print" className="block px-3.5 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 transition-colors">
              🖨️ Print Studio
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl font-bold hover:bg-red-500/30 transition-all"
        >
          🚪 End Session
        </button>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 p-6 sm:p-10 space-y-6 overflow-y-auto">
        <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-6 gap-4">
          <div>
            <span className="text-amber-400 font-bold uppercase text-[10px]">SOVEREIGN CIMS V2.0</span>
            <h2 className="text-2xl font-extrabold text-white">DASHBOARD WORKSPACE</h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold hover:from-amber-300 transition-all shadow-xl"
          >
            ✨ + Create New Article / Paper
          </button>
        </div>

        {msg && (
          <div
            className={`p-3 text-center rounded-xl font-bold ${
              msg.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* PUBLISH MODAL WITH HTML / PDF IMPORT */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handleCreateArticle}
              className="bg-[#0a1024] border border-white/20 p-6 rounded-2xl max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-amber-400 uppercase">Publish New Publication Record</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>

              {/* FILE IMPORT BAR (.HTML or .PDF) */}
              <div className="bg-[#070b19] border border-amber-400/30 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-amber-300 font-bold uppercase text-[10px]">
                    📥 Import External Document (.HTML or .PDF)
                  </label>
                  <span className="text-[9px] text-gray-400">Auto-Extracts Content / Embeds PDF</span>
                </div>
                <input
                  type="file"
                  accept=".html,.htm,.pdf"
                  onChange={handleDocumentImport}
                  disabled={uploadingFile}
                  className="w-full text-xs text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-black hover:file:bg-amber-300 cursor-pointer"
                />
                {uploadingFile && (
                  <p className="text-[10px] text-amber-400 font-bold animate-pulse">Uploading PDF to Supabase Storage...</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-[10px] uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Publication Title..."
                    className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] uppercase mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-amber-300 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] uppercase mb-1">Subtitle / Excerpt</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Summary or thesis statement..."
                  className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-[10px] uppercase mb-1">Domain Category</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                    className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-amber-400 font-bold focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] uppercase mb-1">HTML Content Body / Markup</label>
                <textarea
                  rows={8}
                  required
                  value={rawHtml}
                  onChange={(e) => setRawHtml(e.target.value)}
                  className="w-full bg-[#030611] border border-white/20 rounded-lg p-3 text-amber-100 font-mono text-[11px] focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving || uploadingFile}
                className="w-full py-3 rounded-xl bg-amber-400 text-black font-extrabold uppercase hover:bg-amber-300 transition-all shadow-lg"
              >
                {saving ? 'Publishing to Database...' : '🚀 Publish Record Live'}
              </button>
            </form>
          </div>
        )}

        {/* LIVE DATABASE LEDGER */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              PUBLISHED ASSETS & PERMALINKS ({articles.length} Total Works)
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold">• CONNECTED TO POSTGRESQL</span>
          </div>

          {articles.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-gray-500">
              No live publications found in database. Click "+ Create New Article / Paper" to publish your first record.
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4 hover:border-amber-400/50 transition-all"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 font-bold text-[9px] uppercase">
                      {item.domain || item.entity_type}
                    </span>
                    <h4 className="text-base font-bold text-white">{item.title}</h4>
                    <p className="text-[10px] text-gray-400">
                      Direct Permalink:{' '}
                      <a
                        href={`/articles/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-300 underline font-mono"
                      >
                        /articles/{item.slug} ↗
                      </a>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${
                        item.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-colors text-[10px]"
                    >
                      Delete
                    </button>
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