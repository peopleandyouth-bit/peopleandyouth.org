'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default function DynamicEssayReaderPage({ params }: Props) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [essay, setEssay] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citationFormat, setCitationFormat] = useState<'APA' | 'MLA' | 'Chicago'>('APA');

  useEffect(() => {
    fetchEssay();
  }, [slug]);

  const fetchEssay = async () => {
    setLoading(true);
    try {
      await supabase.rpc('increment_essay_views', { essay_slug: slug });
    } catch (e) {
      console.error(e);
    }

    const { data } = await supabase
      .from('watermarked_essays')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (data) setEssay(data);
    setLoading(false);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      const textToRead = `${essay.title}. ${essay.subtitle || ''}. ${essay.raw_html.replace(/<[^>]*>?/gm, '')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  const getFormattedCitation = () => {
    if (!essay) return '';
    const year = new Date(essay.created_at).getFullYear();
    const dateStr = new Date(essay.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const url = `https://peopleandyouth.org/essay/${essay.slug}`;

    if (citationFormat === 'APA') {
      return `${essay.author_name}. (${year}). ${essay.title}. People & Youth. ${url}`;
    } else if (citationFormat === 'MLA') {
      return `${essay.author_name}. "${essay.title}." People & Youth, ${dateStr}, ${url}.`;
    } else {
      return `${essay.author_name}. "${essay.title}." People & Youth (${dateStr}). ${url}.`;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b19] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Decrypting Sovereign Record...</span>
        </div>
      </main>
    );
  }

  if (!essay) {
    return (
      <main className="min-h-screen bg-[#070b19] text-white flex flex-col items-center justify-center font-mono text-xs space-y-4">
        <p className="text-gray-400">Publication record not found.</p>
        <Link href="/dissent-dias" className="px-4 py-2 bg-amber-400 text-black font-bold rounded-xl">
          ← Return to Editorial Portal
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-serif p-4 sm:p-8 select-none">
      {/* HEADER CONTROL BAR */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap justify-between items-center font-mono text-xs border-b border-white/10 pb-4 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dissent-dias" className="text-gray-400 hover:text-amber-400 transition-colors">
            ← Editorial Portal
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/knowledge" className="text-gray-400 hover:text-amber-400 transition-colors">
            🧠 Knowledge Engine
          </Link>
        </div>

        {/* READER TOOLS */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSpeech}
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] transition-all ${
              speaking ? 'bg-amber-400 text-black font-bold' : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/30'
            }`}
          >
            {speaking ? '🔊 Pause Speech' : '🎙️ Audio Reader'}
          </button>

          <button
            onClick={() => setShowCitationModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-amber-400 transition-all font-mono text-[10px]"
          >
            📜 Cite Article
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-amber-400 transition-all font-mono text-[10px]"
          >
            🖨️ Print PDF
          </button>
        </div>
      </div>

      {/* CITATION MODAL */}
      {showCitationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono text-xs">
          <div className="bg-[#0a1024] border border-white/20 p-6 rounded-2xl max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-amber-400 uppercase">Academic Citation Generator</h3>
              <button onClick={() => setShowCitationModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="flex gap-2">
              {(['APA', 'MLA', 'Chicago'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setCitationFormat(fmt)}
                  className={`px-3 py-1 rounded-lg border text-[10px] ${
                    citationFormat === fmt ? 'bg-amber-400 text-black font-bold' : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <div className="bg-[#030611] border border-white/15 p-4 rounded-xl text-amber-100 font-mono text-[11px] break-all">
              {getFormattedCitation()}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(getFormattedCitation());
                alert('Citation copied to clipboard!');
              }}
              className="w-full py-2 bg-amber-400 text-black font-extrabold rounded-xl uppercase"
            >
              Copy Citation
            </button>
          </div>
        </div>
      )}

      {/* ESSAY CANVAS */}
      <article className="max-w-4xl mx-auto bg-[#EAEAEA] text-[#222222] p-8 sm:p-14 rounded-2xl relative shadow-2xl border border-gray-300 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center font-sans font-black text-6xl text-black rotate-[-30deg] uppercase tracking-widest whitespace-nowrap">
          OFFICIAL RECORD • PEOPLE & YOUTH • DO NOT DUPLICATE
        </div>

        <header className="border-b border-gray-300 pb-6 mb-8 text-center relative z-10 font-sans">
          <div className="text-[10px] font-bold tracking-widest uppercase text-amber-800 mb-1">{essay.category}</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B192C] leading-tight mb-3">{essay.title}</h1>
          {essay.subtitle && <p className="text-sm italic text-gray-600 mb-4">{essay.subtitle}</p>}
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500 font-mono pt-2 border-t border-gray-200">
            <span>By <strong>{essay.author_name}</strong></span>
            <span>•</span>
            <span>{essay.read_time}</span>
            <span>•</span>
            <span>{new Date(essay.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span className="text-amber-800 font-bold">👁️ {essay.views || 1} Reads</span>
          </div>
        </header>

        <div 
          className="prose prose-lg max-w-none text-[#222222] leading-relaxed relative z-10 font-serif"
          dangerouslySetInnerHTML={{ __html: essay.raw_html }}
        />

        <footer className="mt-12 pt-6 border-t border-gray-300 font-mono text-[10px] text-gray-500 flex flex-wrap justify-between items-center gap-2 relative z-10">
          <span>Record ID: {essay.id}</span>
          <span>Sovereign Knowledge Infrastructure • peopleandyouth.org</span>
        </footer>
      </article>
    </main>
  );
}