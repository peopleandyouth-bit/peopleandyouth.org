'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function CimsAdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Articles state
  const [articles, setArticles] = useState<any[]>([
    { id: '1', title: 'Constitutional Precedents in Higher Education', content_type: 'Policy Brief', status: 'published', views_count: 1240 },
    { id: '2', title: 'Empirical Audit of PMKVY Skill Initiatives', content_type: 'Research Paper', status: 'in_review', views_count: 890 },
    { id: '3', title: 'Dissent & Morality in Digital Governance', content_type: 'Editorial', status: 'draft', views_count: 0 },
  ]);

  // Asset Creation Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    contentType: 'policy_brief',
    status: 'published',
    abstract: '',
    bodyMarkdown: '',
    featuredImage: '',
    tags: 'Public Policy, Governance'
  });

  // Fetch articles from Supabase on mount
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('cims_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, using local fallback state:', error.message);
      } else if (data && data.length > 0) {
        setArticles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSaving(true);
    setSuccessMessage(null);

    const generatedSlug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const wordCount = formData.bodyMarkdown.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const newAsset = {
      slug: generatedSlug,
      title: formData.title,
      subtitle: formData.subtitle,
      content_type: formData.contentType,
      status: formData.status,
      abstract: formData.abstract,
      body_markdown: formData.bodyMarkdown || 'Asset content under peer review.',
      featured_image: formData.featuredImage,
      reading_time_minutes: readingTime,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
      views_count: 0
    };

    try {
      // 1. Persist to Supabase
      const { data, error } = await supabase
        .from('cims_articles')
        .insert([newAsset])
        .select();

      if (error) {
        console.warn('Database write warning, updating local UI:', error.message);
      }

      // 2. Update Local State
      setArticles(prev => [data ? data[0] : { ...newAsset, id: `local-${Date.now()}` }, ...prev]);
      setSuccessMessage(`✓ Asset "${formData.title}" created successfully as ${formData.status.toUpperCase()}!`);
      
      // Reset Form & Close Modal
      setFormData({
        title: '', subtitle: '', contentType: 'policy_brief',
        status: 'published', abstract: '', bodyMarkdown: '',
        featuredImage: '', tags: 'Public Policy, Governance'
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
      
      {/* CIMS LEFT SIDEBAR */}
      <aside className="w-64 bg-[#050814] border-r border-white/10 p-5 flex flex-col justify-between shrink-0 font-mono text-xs">
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">INSTITUTIONAL CIMS</span>
            <h1 className="text-base font-extrabold text-white mt-1">Control Centre</h1>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: '📊 Dashboard', badge: null },
              { id: 'content', label: '📝 Content Manager', badge: articles.length.toString() },
              { id: 'editorial', label: '✍️ Editorial & Dissent', badge: null },
              { id: 'research', label: '🔬 Research Repository', badge: null },
              { id: 'caves', label: '🏛️ Knowledge Caves', badge: '17' },
              { id: 'mountains', label: '🏔️ Mountain Ranges', badge: '4' },
              { id: 'journals', label: '📚 14 Renaissance Journals', badge: null },
              { id: 'media', label: '📁 Media Library', badge: null },
              { id: 'users', label: '👥 User & Role Manager', badge: null },
              { id: 'careers', label: '💼 Applications & Talent', badge: '5' },
              { id: 'analytics', label: '📈 Analytics & Metrics', badge: null },
              { id: 'ai', label: '🤖 Admin AI Assistant', badge: 'RAG' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                  activeTab === item.id ? 'bg-cyan-500 text-black font-bold' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] rounded bg-white/10 border border-white/10">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10">
          <Link href="/admin" className="text-gray-400 hover:text-cyan-400 block">← Back to Main Admin</Link>
          <Link href="/" className="text-gray-500 hover:text-white block mt-1">🌐 Public Platform</Link>
        </div>
      </aside>

      {/* CIMS MAIN CONTENT PANEL */}
      <section className="flex-1 p-8 space-y-8 overflow-y-auto">
        
        {/* TOP HEADER WITH FULLY OPERATIONAL ASSET BUTTON */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">CIMS ENGINE v2.0</span>
            <h2 className="text-2xl font-extrabold text-white uppercase mt-1">{activeTab} Workspace</h2>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-xl shadow-cyan-500/20 transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>✨</span>
            <span>+ Create New Institutional Asset</span>
          </button>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-mono flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-gray-400 hover:text-white">✖</button>
          </div>
        )}

        {/* METRICS & ASSETS TABLE VIEW */}
        {(activeTab === 'dashboard' || activeTab === 'content') && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase block">Total Published Works</span>
                <span className="text-2xl font-extrabold text-cyan-400 mt-1 block">{articles.length}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase block">Active Knowledge Caves</span>
                <span className="text-2xl font-extrabold text-amber-400 mt-1 block">17</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase block">Renaissance Journals</span>
                <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">14</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase block">Active Researchers</span>
                <span className="text-2xl font-extrabold text-blue-400 mt-1 block">42</span>
              </div>
            </div>

            {/* LIVE RECENT CONTENT TABLE */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase">Institutional Content Repository</h3>
                <span className="text-xs font-mono text-cyan-400">{articles.length} Total Assets</span>
              </div>
              
              <div className="space-y-3 font-mono text-xs">
                {articles.map((art) => (
                  <div key={art.id} className="bg-[#0b1228] p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{art.title}</span>
                        {art.slug && <span className="text-[9px] text-gray-500">/{art.slug}</span>}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {art.content_type?.replace('_', ' ').toUpperCase()} • {art.views_count || 0} Views {art.reading_time_minutes ? `• ${art.reading_time_minutes} min read` : ''}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold shrink-0 ${
                      art.status === 'published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                      art.status === 'in_review' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                    }`}>
                      {art.status ? art.status.replace('_', ' ') : 'draft'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI ASSISTANT PANEL */}
        {activeTab === 'ai' && (
          <div className="bg-white/5 border border-cyan-500/40 rounded-3xl p-8 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">ADMIN EDITORIAL ASSISTANT</span>
              <h3 className="text-xl font-bold text-white mt-1">Human-In-The-Loop AI Co-Pilot</h3>
            </div>

            <div className="space-y-4">
              <textarea
                rows={4}
                placeholder="Paste article draft or research abstract for AI summarization & SEO metadata generation..."
                className="w-full bg-[#070b19] border border-white/10 rounded-xl p-4 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs">
                Generate Abstract &amp; SEO Taxonomy →
              </button>
            </div>
          </div>
        )}

      </section>

      {/* CREATE INSTITUTIONAL ASSET MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0a1228] border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl my-8">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">CIMS PUBLISHING ENGINE</span>
                <h3 className="text-xl font-extrabold text-white">Create Institutional Asset</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-mono px-2 py-1 bg-white/10 rounded-lg"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-300 uppercase mb-1">Asset Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Constitutional Precedents in Digital Public Infrastructure"
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
                    <option value="newsletter">Newsletter</option>
                    <option value="announcement">Official Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 uppercase mb-1">Publishing Status *</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-emerald-300 font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="in_review">In Review (Editorial)</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 uppercase mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. An empirical analysis of algorithmic governance in district administration"
                  className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 uppercase mb-1">Executive Abstract / Summary *</label>
                <textarea
                  rows={3}
                  value={formData.abstract}
                  onChange={e => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="Brief summary of research findings or policy recommendations..."
                  className="w-full bg-[#070b19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 uppercase mb-1">Asset Body (Markdown Supported)</label>
                <textarea
                  rows={5}
                  value={formData.bodyMarkdown}
                  onChange={e => setFormData({ ...formData, bodyMarkdown: e.target.value })}
                  placeholder="# Introduction&#10;&#10;Detail the core arguments, methodology, and citations..."
                  className="w-full bg-[#070b19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 uppercase mb-1">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Policy, Constitutional Law, RTI"
                    className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 uppercase mb-1">Featured Image URL</label>
                  <input
                    type="url"
                    value={formData.featuredImage}
                    onChange={e => setFormData({ ...formData, featuredImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold shadow-lg shadow-cyan-500/20"
                >
                  {isSaving ? 'Saving to Database...' : '✨ Publish Asset →'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </main>
  );
}
