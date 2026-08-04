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
    author_bio: 'Founder at peopleandyouth.org',
    read_time: '6 min read',
    raw_html: ''
  });

  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

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
    setPublishing(true);
    setStatusMessage('');

    try {
      const { data, error } = await supabase
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
        setStatusMessage(`✅ Published successfully! Live at /essay/${formData.slug}`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ System error: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <span className="text-amber-400 font-bold uppercase tracking-widest block">ADMIN PUBLISHING CONSOLE</span>
            <h1 className="text-2xl font-extrabold text-white">Dynamic Essay Studio</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/dissent-dias" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">🏛️ Portal View</Link>
            <Link href="/admin/print" className="px-4 py-2 rounded-lg bg-amber-400 text-black font-bold">🖨️ Print Studio</Link>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-xl bg-white/10 border border-amber-400 text-amber-300 font-bold">
            {statusMessage}
          </div>
        )}

        <form onSubmit={handlePublish} className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 uppercase mb-2">Essay Title</label>
              <input 
                type="text" 
                required 
                value={formData.title} 
                onChange={handleTitleChange} 
                placeholder="e.g. Dialectics of Consciousness"
                className="w-full bg-[#070b19] border border-white/20 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase mb-2">URL Slug (Auto-generated)</label>
              <input 
                type="text" 
                required 
                value={formData.slug} 
                onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                className="w-full bg-[#070b19] border border-amber-400/40 rounded-lg p-3 text-amber-300 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 uppercase mb-2">Subtitle</label>
              <input 
                type="text" 
                value={formData.subtitle} 
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})} 
                placeholder="e.g. A Soliloquy on Ideas and Society"
                className="w-full bg-[#070b19] border border-white/20 rounded-lg p-3 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase mb-2">Category</label>
              <input 
                type="text" 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className="w-full bg-[#070b19] border border-white/20 rounded-lg p-3 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 uppercase mb-2">Raw HTML Content</label>
            <textarea 
              rows={12}
              required 
              value={formData.raw_html} 
              onChange={(e) => setFormData({...formData, raw_html: e.target.value})} 
              placeholder="<p>Write or paste your HTML essay body here...</p>"
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-4 font-mono text-sm text-gray-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={publishing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-sm uppercase tracking-wider hover:from-amber-300 transition-all shadow-xl"
          >
            {publishing ? 'Publishing to Database Ledger...' : '🚀 Publish Essay Live to Platform'}
          </button>
        </form>

      </div>
    </main>
  );
}