'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const ELABORATE_CATEGORIES = [
  "Philosophy & Public Policy",
  "Political Theory & Ethics",
  "Law & Constitutional Frameworks",
  "RTI & Statutory Audits",
  "Judicial Reform & PIL",
  "Public Economics & Finance",
  "CAG Audits & Fiscal Policy",
  "Trade & Macroeconomics",
  "Demographic Capital & Youth Policy",
  "AI Policy & Ethics",
  "Technology & Cyber Law",
  "Civic Technology",
  "Foreign Policy & Geopolitics",
  "Global Affairs & Strategic Security",
  "Climate Economics & Sustainability",
  "Educational Systems & Governance",
  "Science & Strategic Innovation",
  "Institutional Critique & Reform"
];

export default function SplitScreenPublisherPage() {
  const router = useRouter();

  const [essays, setEssays] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Philosophy & Public Policy');
  const [authorName, setAuthorName] = useState('Swaraj Shandilya');
  const [readTime, setReadTime] = useState('~5 min read');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [rawHtml, setRawHtml] = useState('<p>Write your essay body content here...</p>');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchEssays();
  }, []);

  const fetchEssays = async () => {
    const { data, error } = await supabase
      .from('watermarked_essays')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEssays(data);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!selectedId) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleSelectEssay = (id: string) => {
    if (!id) {
      resetForm();
      return;
    }
    const essay = essays.find((e) => e.id === id);
    if (essay) {
      setSelectedId(essay.id);
      setTitle(essay.title || '');
      setSubtitle(essay.subtitle || '');
      setCategory(essay.category || 'Philosophy & Public Policy');
      setAuthorName(essay.author_name || 'Swaraj Shandilya');
      setReadTime(essay.read_time || '~5 min read');
      setSlug(essay.slug || '');
      setStatus(essay.status || 'published');
      setRawHtml(essay.raw_html || '');
      setMessage(null);
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    setTitle('');
    setSubtitle('');
    setCategory('Philosophy & Public Policy');
    setAuthorName('Swaraj Shandilya');
    setReadTime('~5 min read');
    setSlug('');
    setStatus('published');
    setRawHtml('<p>Write your essay body content here...</p>');
    setMessage(null);
  };

  const insertFormatting = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = `${openTag}${selectedText || 'text'}${closeTag}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    setRawHtml(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + (selectedText.length || 4));
    }, 50);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const randomString = Math.random().toString(36).substring(2, 9);
      const fileName = `${Date.now()}-${randomString}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('essay-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('essay-assets')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      const imageTag = `\n<figure class="my-6"><img src="${publicUrl}" alt="Embedded Asset" class="rounded-xl shadow-lg w-full" /><figcaption class="text-center text-xs text-gray-500 mt-2">Official Archive Visual Asset</figcaption></figure>\n`;
      setRawHtml((prev) => prev + imageTag);
      setMessage({ type: 'success', text: 'Image uploaded and injected successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Image upload failed.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!title || !slug || !rawHtml) {
      setMessage({ type: 'error', text: 'Title, Slug, and HTML Content are required.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload = {
      title,
      subtitle,
      category,
      author_name: authorName,
      read_time: readTime,
      slug,
      status,
      raw_html: rawHtml,
    };

    try {
      if (selectedId) {
        const { error } = await supabase
          .from('watermarked_essays')
          .update(payload)
          .eq('id', selectedId);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Essay updated successfully!' });
      } else {
        const { data, error } = await supabase
          .from('watermarked_essays')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (data) setSelectedId(data.id);
        setMessage({ type: 'success', text: 'New essay published successfully!' });
      }

      fetchEssays();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save essay.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs flex flex-col h-screen overflow-hidden">
      <header className="border-b border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4 bg-[#0a1024]">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-amber-400 transition-colors">
            ← Dashboard
          </Link>
          <span className="text-white/20">|</span>
          <h1 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Split-Screen Publisher + Media Uploader
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedId || ''}
            onChange={(e) => handleSelectEssay(e.target.value)}
            className="bg-[#070b19] border border-white/20 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
          >
            <option value="">➕ Create New Essay</option>
            {essays.map((item) => (
              <option key={item.id} value={item.id}>
                {item.status === 'draft' ? '📝 [DRAFT] ' : '📜 '} {item.title}
              </option>
            ))}
          </select>

          {selectedId && (
            <button
              onClick={resetForm}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300"
            >
              New
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold hover:from-amber-300 transition-all shadow-lg"
          >
            {loading ? 'Saving...' : selectedId ? '💾 Update Record' : '🚀 Publish Record'}
          </button>
        </div>
      </header>

      {message && (
        <div
          className={`px-6 py-2 text-center text-xs font-bold ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border-b border-red-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* LEFT COLUMN: FORM */}
        <div className="p-6 overflow-y-auto space-y-4 border-r border-white/10 bg-[#070b19]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Essay Title..."
                className="w-full bg-white/5 border border-white/15 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="essay-url-slug"
                className="w-full bg-white/5 border border-white/15 rounded-lg p-2.5 text-amber-300 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Subtitle / Excerpt</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Brief summary or philosophical thesis..."
              className="w-full bg-white/5 border border-white/15 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ELABORATE CATEGORY DROPDOWN MENU */}
            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1">Category Select</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#070b19] border border-amber-400/50 rounded-lg p-2.5 text-amber-300 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
              >
                {ELABORATE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#070b19] text-white font-mono">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1">Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase text-[10px] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                className="w-full bg-white/5 border border-white/15 rounded-lg p-2.5 text-amber-400 font-bold focus:border-amber-400 focus:outline-none"
              >
                <option value="published" className="bg-[#070b19]">Published</option>
                <option value="draft" className="bg-[#070b19]">Draft</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-gray-400 uppercase text-[10px]">HTML Body & Media Uploader</label>
              <label className="cursor-pointer px-3 py-1 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-all text-[10px]">
                {uploading ? 'Uploading...' : '📁 Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2 bg-white/5 border border-white/10 rounded-t-lg">
              <button
                type="button"
                onClick={() => insertFormatting('<h2>', '</h2>')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-bold"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<h3>', '</h3>')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-bold"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<p>', '</p>')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
              >
                Paragraph
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<strong>', '</strong>')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<em>', '</em>')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<blockquote class="border-l-4 border-amber-500 pl-4 italic">', '</blockquote>')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
              >
                Quote
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={15}
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              className="w-full bg-[#030611] border border-white/15 rounded-b-lg p-4 font-mono text-xs text-amber-100 focus:border-amber-400 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PARALLEL PREVIEW */}
        <div className="p-6 overflow-y-auto bg-[#11162b] space-y-4">
          <div className="flex justify-between items-center text-[10px] uppercase text-gray-400 tracking-wider">
            <span>Live Watermarked Reader Preview</span>
            <span className={status === 'published' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              • {status.toUpperCase()} MODE
            </span>
          </div>

          <article className="bg-[#EAEAEA] text-[#222222] p-8 rounded-2xl relative shadow-2xl border border-gray-300 font-serif select-none overflow-hidden min-h-[600px]">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center font-sans font-black text-5xl text-black rotate-[-30deg] uppercase tracking-widest whitespace-nowrap">
              OFFICIAL RECORD • PEOPLE & YOUTH • DO NOT DUPLICATE
            </div>

            <header className="border-b border-gray-300 pb-4 mb-6 text-center relative z-10 font-sans">
              {/* REAL-TIME DYNAMIC CATEGORY RENDER */}
              <div className="text-[10px] font-bold tracking-widest uppercase text-amber-800 mb-1">
                {category}
              </div>
              <h1 className="text-2xl font-extrabold text-[#0B192C] leading-tight mb-2">
                {title || 'Untitled Essay'}
              </h1>
              {subtitle && <p className="text-xs italic text-gray-600 mb-3">{subtitle}</p>}

              <div className="flex justify-center items-center gap-3 text-[10px] text-gray-500 font-mono pt-2 border-t border-gray-200">
                <span>By <strong>{authorName}</strong></span>
                <span>•</span>
                <span>{readTime}</span>
              </div>
            </header>

            <div
              className="prose prose-sm max-w-none text-[#222222] leading-relaxed relative z-10 font-serif"
              dangerouslySetInnerHTML={{ __html: rawHtml || '<p class="text-gray-400">Preview empty...</p>' }}
            />
          </article>
        </div>
      </div>
    </main>
  );
}