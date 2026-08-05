import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: essay } = await supabase
    .from('watermarked_essays')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!essay) {
    return {
      title: 'Document Not Found | People & Youth',
    };
  }

  return {
    title: `${essay.title} | People & Youth`,
    description: essay.subtitle || `Sovereign record by ${essay.author_name}`,
    openGraph: {
      title: essay.title,
      description: essay.subtitle || `A sovereign publication on ${essay.category}.`,
      type: 'article',
      publishedTime: essay.created_at,
      authors: [essay.author_name],
      siteName: 'People & Youth',
    },
    twitter: {
      card: 'summary_large_image',
      title: essay.title,
      description: essay.subtitle || `A sovereign publication on ${essay.category}.`,
    },
  };
}

export default async function DynamicEssayReaderPage({ params }: Props) {
  const { slug } = await params;

  // Increment view counter atomically in background
  try {
    await supabase.rpc('increment_essay_views', { essay_slug: slug });
  } catch (e) {
    console.error('Failed to register telemetry view:', e);
  }

  // Fetch updated document record
  const { data: essay, error } = await supabase
    .from('watermarked_essays')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !essay) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-serif p-4 sm:p-8 select-none">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center font-mono text-xs border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/dissent-dias" className="text-gray-400 hover:text-amber-400 transition-colors">
            ← Editorial Portal
          </Link>
          <span className="text-white/20">|</span>
          <Link href="/policy" className="text-gray-400 hover:text-amber-400 transition-colors">
            ⚖️ Policy Archive
          </Link>
        </div>
        <span className="text-amber-400 font-bold uppercase tracking-wider">{essay.category}</span>
      </div>

      <article className="max-w-4xl mx-auto bg-[#EAEAEA] text-[#222222] p-8 sm:p-14 rounded-2xl relative shadow-2xl border border-gray-300 overflow-hidden">
        {/* WATERMARK BACKGROUND LAYER */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center font-sans font-black text-6xl text-black rotate-[-30deg] uppercase tracking-widest whitespace-nowrap">
          OFFICIAL RECORD • PEOPLE & YOUTH • DO NOT DUPLICATE
        </div>

        {/* ESSAY HEADER */}
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

        {/* ESSAY BODY CONTENT */}
        <div 
          className="prose prose-lg max-w-none text-[#222222] leading-relaxed relative z-10 font-serif"
          dangerouslySetInnerHTML={{ __html: essay.raw_html }}
        />

        {/* FOOTER METADATA */}
        <footer className="mt-12 pt-6 border-t border-gray-300 font-mono text-[10px] text-gray-500 flex flex-wrap justify-between items-center gap-2 relative z-10">
          <span>Record ID: {essay.id}</span>
          <span>Sovereign Knowledge Infrastructure • peopleandyouth.org</span>
        </footer>
      </article>
    </main>
  );
}