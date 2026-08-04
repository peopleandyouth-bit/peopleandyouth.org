'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function CimsAdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [articles, setArticles] = useState<any[]>([
    { id: '1', slug: 'constitutional-precedents-dpi', title: 'Constitutional Morality in Digital Public Infrastructure', content_type: 'Policy Brief', status: 'published', views_count: 1240 },
    { id: '2', slug: 'pmkvy-cag-audit-report', title: 'Empirical Audit of PMKVY Skill Initiatives', content_type: 'Research Paper', status: 'in_review', views_count: 890 },
    { id: '3', slug: 'dissent-and-governance-2026', title: 'Dissent & Morality in Digital Governance', content_type: 'Editorial', status: 'draft', views_count: 0 },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    contentType: 'policy_brief',
    status: 'published',
    abstract: '',
    bodyMarkdown: '',
    featuredImage: '',
    pdfUrl: '',
    tags: 'Public Policy, Governance'
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data } = await supabase
        .from('cims_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setArticles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generatedSlug = formData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const liveArticleUrl = `https://peopleandyouth.org/articles/${generatedSlug || 'your-article-slug'}`;

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSaving(true);
    setSuccessMessage(null);

    const wordCount = formData.bodyMarkdown.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const newAsset = {
      slug: generatedSlug,
      title: formData.title,
      subtitle: formData.subtitle,
      content_type: formData.contentType,
      status: formData.status,
      abstract: formData.abstract,
      body_markdown: formData.bodyMarkdown || 'Long-form empirical body text.',
      featured_image: formData.featuredImage,
      pdf_url: formData.pdfUrl,
      reading_time_minutes: readingTime,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
      views_count: 0
    };

    try {
      const { data } = await supabase
        .from('cims_articles')
        .insert([newAsset])
        .select();

      setArticles(prev => [data ? data[0] : { ...newAsset, id: `local-${Date.now()}` }, ...prev]);
      setSuccessMessage(`✓ Asset Published! Live Permalink: /articles/${generatedSlug}`);
      
      setFormData({
        title: '', subtitle: '', contentType: 'policy_brief',
        status: 'published', abstract: '', bodyMarkdown: '',
        featuredImage: '', pdfUrl: '', tags: 'Public Policy, Governance'
      });
      setIsModalOpen(false);

    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white flex relative selection:bg-cyan-500 selection:text-black">
      
      {/* EXPANDED FULL-HEIGHT LEFT SIDEBAR */}
      <aside className="w-72 bg-[#050814] border-r border-white/10 p-6 flex flex-col justify-between shrink-0 font-mono text-xs sticky top-0 h-screen overflow-y-auto z-30">
        <div className="space-y-6">
          
          <div className="border-b border-cyan-500/30 pb-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">SOVEREIGN CIMS v2.0</span>
            </div>
            <h1 className="text-lg font-extrabold text-white mt-1 tracking-tight">Institutional HQ</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">Control Centre &amp; Publishing Engine</p>
          </div>

          {/* COMPLETE EXPANDED MODULE NAVIGATION */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: '📊 Institutional Dashboard', badge: null },
              { id: 'content', label: '📝 Content & Articles', badge: articles.length.toString() },
              { id: 'editorial', label: '✍️ Editorial & Dissent Dias', badge: null },
              { id: 'research', label: '🔬 Research & Policy Briefs', badge: null },
              { id: 'caves', label: '🏛️ 17 Knowledge Caves', badge: '17' },
              { id: 'mountains', label: '🏔️ 4 Mountain Ranges', badge: '4' },
              { id: 'journals', label: '📚 14 Renaissance Journals', badge: '14' },
              { id: 'media', label: '📁 Media & PDF Repository', badge: null },
              { id: 'users', label: '👥 User & Role Permissions', badge: '22 Roles' },
              { id: 'careers', label: '💼 Talent & Applications', badge: '5' },
              { id: 'analytics', label: '📈 Metrics & Analytics', badge: null },
              { id: 'ai', label: '🤖 Admin AI Co-Pilot', badge: 'RAG' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between border ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black border-cyan-400 font-extrabold shadow-lg shadow-cyan-500/20' 
                    : 'text-gray-300 border-transparent hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <span className="truncate pr-1">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[9px] rounded-md shrink-0 font-mono font-bold ${
                    activeTab === item.id ? 'bg-black/30 text-black' : 'bg-white/10 text-cyan-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-2">
          <Link href="/admin" className="text-gray-400 hover:text-cyan-300 block transition-colors">← Main Admin Control</Link>
          <Link href="/" className="text-gray-500 hover:text-white block transition-colors">🌐 Public Platform</Link>
        </div>
      </aside>

      {/* MAIN CONTENT PANEL */}
      <section className="flex-1 p-8 space-y-8 overflow-y-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">CIMS OPERATIONS HUB</span>
            <h2 className="text-2xl font-extrabold text-white uppercase mt-1">{activeTab.replace('_', ' ')} Workspace</h2>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-xl shadow-cyan-500/20 transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>✨</span>
            <span>+ Create New Article / Paper</span>
          </button>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-mono flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-gray-400 hover:text-white">✖</button>
          </div>
        )}

        {/* ARTICLES TABLE */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3 font-mono">
            <h3 className="text-sm font-bold text-white uppercase">Published Assets &amp; Permalinks</h3>
            <span className="text-xs text-cyan-400">{articles.length} Total Works</span>
          </div>
          
          <div className="space-y-3 font-mono text-xs">
            {articles.map((art) => (
              <div key={art.id} className="bg-[#0b1228] p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{art.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400">
                    <span className="text-cyan-400">Type: {art.content_type?.replace('_', ' ').toUpperCase()}</span>
                    <span>Views: {art.views_count || 0}</span>
                    <Link href={`/articles/${art.slug}`} target="_blank" className="text-amber-300 font-bold hover:underline">
                      🔗 Direct Article Permalink: /articles/{art.slug} ↗
                    </Link>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold shrink-0 ${
                  art.status === 'published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}>
                  {art.status || 'published'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* CREATE ARTICLE MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0a1228] border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl my-8">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">LONG-FORM PUBLISHING WORKSPACE</span>
                <h3 className="text-xl font-extrabold text-white">Create Premium Article / Paper</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-mono px-2 py-1 bg-white/10 rounded-lg"
              >
                ✖
              </button>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 font-mono text-xs space-y-1">
              <span className="text-cyan-400 font-bold block">🔗 Direct Article Permalinks:</span>
              <span className="text-gray-300 font-bold select-all block break-all">{liveArticleUrl}</span>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-300 uppercase mb-1">Article Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Constitutional Morality in Digital Public Infrastructure"
                  className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 uppercase mb-1">Content Type *</label>
                  <select
                    value={formData.contentType}
                    onChange={e => setFormData({ ...formData, contentType: e.target.value })}
                    className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="policy_brief">Policy Brief</option>
                    <option value="research_paper">Research Paper</option>
                    <option value="editorial">Editorial / Essay</option>
                    <option value="white_paper">White Paper</option>
                    <option value="case_study">Case Study</option>
                    <option value="report">Institutional Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 uppercase mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-emerald-300 font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="published">Published (Live at Permalink)</option>
                    <option value="in_review">In Review</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 uppercase mb-1">Executive Abstract *</label>
                <textarea
                  rows={2}
                  value={formData.abstract}
                  onChange={e => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="Pull-quote highlight summary..."
                  className="w-full bg-[#070b19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-amber-400 font-bold uppercase">Article Body (10,000 Capacity Workspace) *</label>
                  <span className={`font-mono text-[10px] ${formData.bodyMarkdown.length > 10000 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                    {formData.bodyMarkdown.length} / 10,000 Characters
                  </span>
                </div>
                <textarea
                  rows={8}
                  maxLength={10000}
                  value={formData.bodyMarkdown}
                  onChange={e => setFormData({ ...formData, bodyMarkdown: e.target.value })}
                  placeholder="Type or paste article body text (Markdown supported)..."
                  className="w-full bg-[#070b19] border border-white/10 rounded-xl p-4 text-white font-sans text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan-300 uppercase mb-1">📄 Attach PDF Whitepaper URL</label>
                  <input
                    type="url"
                    value={formData.pdfUrl}
                    onChange={e => setFormData({ ...formData, pdfUrl: e.target.value })}
                    placeholder="https://.../report.pdf"
                    className="w-full bg-[#070b19] border border-cyan-500/40 rounded-xl px-4 py-2.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 uppercase mb-1">🖼️ Featured Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.featuredImage}
                    onChange={e => setFormData({ ...formData, featuredImage: e.target.value })}
                    placeholder="https://.../cover.jpg"
                    className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold shadow-lg shadow-cyan-500/20"
                >
                  {isSaving ? 'Publishing...' : '✨ Publish Article to Live URL →'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </main>
  );
}
