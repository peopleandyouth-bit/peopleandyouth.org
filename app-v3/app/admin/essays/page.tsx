'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminEssayPublisherPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    category: 'Philosophy & Human Consciousness',
    author_name: 'Swaraj Shandilya',
    author_bio: 'Founder at peopleandyouth.org | MBA(IB) IIFT',
    read_time: '~6 min read',
    raw_html: ''
  });

  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [previewTab, setPreviewTab] = useState<'editor' | 'preview' | 'split'>('split');

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.raw_html) {
      setStatusMessage('❌ Please fill in the Title, Slug, and Raw HTML content.');
      return;
    }

    setPublishing(true);
    setStatusMessage('');

    try {
      const { error } = await supabase
        .from('watermarked_essays')
        .upsert([
          {
            ...formData,
            status: 'published',
            created_at: new Date().toISOString()
          }
        ], { onConflict: 'slug' });

      if (error) {
        setStatusMessage(`❌ Error publishing: ${error.message}`);
      } else {
        setStatusMessage(`✅ Published live! Accessible at /essay/${formData.slug}`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ System error: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-4 gap-4">
          <div>
            <span className="text-amber-400 font-bold uppercase tracking-widest block">SOVEREIGN PUBLISHING CONSOLE</span>
            <h1 className="text-2xl font-extrabold text-white">Dynamic Essay Studio</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 rounded-lg p-1 flex gap-1">
              <button 
                type="button"
                onClick={() => setPreviewTab('editor')} 
                className={`px-3 py-1.5 rounded ${previewTab === 'editor' ? 'bg-amber-400 text-black font-bold' : 'text-gray-400'}`}
              >
                Editor
              </button>
              <button 
                type="button"
                onClick={() => setPreviewTab('split')} 
                className={`px-3 py-1.5 rounded ${previewTab === 'split' ? 'bg-amber-400 text-black font-bold' : 'text-gray-400'}`}
              >
                Split View
              </button>
              <button 
                type="button"
                onClick={() => setPreviewTab('preview')} 
                className={`px-3 py-1.5 rounded ${previewTab === 'preview' ? 'bg-amber-400 text-black font-bold' : 'text-gray-400'}`}
              >
                Live Preview
              </button>
            </div>
            <Link href="/dissent-dias" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">🏛️ Portal</Link>
            <Link href="/admin/print" className="px-4 py-2 rounded-lg bg-amber-400 text-black font-bold">🖨️ Print Studio</Link>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-xl bg-white/10 border border-amber-400 text-amber-300 font-bold">
            {statusMessage}
          </div>
        )}

        {/* FORM + PREVIEW CONTAINER */}
        <form onSubmit={handlePublish} className="space-y-6">
          
          {/* METADATA FIELDS */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 uppercase mb-1">Title</label>
              <input 
                type="text" 
                required 
                value={formData.title} 
                onChange={handleTitleChange} 
                placeholder="Dialectics of Consciousness"
                className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase mb-1">URL Slug</label>
              <input 
                type="text" 
                required 
                value={formData.slug} 
                onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                className="w-full bg-[#070b19] border border-amber-400/40 rounded-lg p-2.5 text-amber-300 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase mb-1">Category</label>
              <input 
                type="text" 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-400 uppercase mb-1">Subtitle</label>
              <input 
                type="text" 
                value={formData.subtitle} 
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})} 
                placeholder="A Soliloquy on Ideas, Society, and the Human Mind"
                className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase mb-1">Author Name</label>
              <input 
                type="text" 
                value={formData.author_name} 
                onChange={(e) => setFormData({...formData, author_name: e.target.value})} 
                className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* SPLIT / EDITOR / PREVIEW MAIN CANVAS */}
          <div className={`grid gap-6 ${previewTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* RAW HTML EDITOR */}
            {(previewTab === 'editor' || previewTab === 'split') && (
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 flex flex-col">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="uppercase font-bold">HTML / Content Markup</span>
                  <span>Supports &lt;h2&gt;, &lt;p&gt;, &lt;blockquote&gt;, &lt;ul&gt;</span>
                </div>
                <textarea 
                  rows={22}
                  required 
                  value={formData.raw_html} 
                  onChange={(e) => setFormData({...formData, raw_html: e.target.value})} 
                  placeholder="<h2>I. The Age of False Dichotomies</h2>&#10;<p>Write your essay paragraphs here...</p>&#10;<blockquote>'Quote text here'</blockquote>"
                  className="w-full bg-[#070b19] border border-white/20 rounded-lg p-4 font-mono text-xs text-gray-200 focus:border-amber-400 focus:outline-none flex-1 leading-relaxed"
                />
              </div>
            )}

            {/* LIVE WATERMARKED PREVIEW */}
            {(previewTab === 'preview' || previewTab === 'split') && (
              <div className="bg-[#EAEAEA] text-[#222222] p-8 rounded-2xl font-serif relative overflow-hidden border border-gray-300 max-h-[700px] overflow-y-auto">
                <div className="text-center pb-3 mb-6 border-b border-gray-300">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-[#0B192C] font-sans">Live Watermark Preview</div>
                  <div className="text-[9px] uppercase text-amber-700 font-bold font-sans mt-0.5">{formData.category}</div>
                  <h1 className="text-2xl font-bold text-[#0B192C] mt-1">{formData.title || 'Untitled Essay'}</h1>
                  <p className="italic text-xs text-gray-600 mt-1">{formData.subtitle}</p>
                </div>

                <div 
                  className="prose prose-sm max-w-none text-[#222222] leading-relaxed font-serif"
                  dangerouslySetInnerHTML={{ __html: formData.raw_html || '<p class="italic text-gray-400 text-center py-10">Live essay body preview will render here as you type...</p>' }}
                />
              </div>
            )}

          </div>

          <button 
            type="submit" 
            disabled={publishing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-sm uppercase tracking-wider hover:from-amber-300 transition-all shadow-xl"
          >
            {publishing ? 'Saving to Database Ledger...' : '🚀 Publish Essay Live to Platform'}
          </button>
        </form>

      </div>
    </main>
  );
}