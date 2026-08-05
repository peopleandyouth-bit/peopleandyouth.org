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

  const { data: article } = await supabase
    .from('institution_content')
    .select('*')
    .eq('slug', slug)
    .single();

  if (article) {
    return {
      title: `${article.title} | People & Youth`,
      description: article.subtitle || `Published by ${article.author_name}`,
    };
  }

  const { data: essay } = await supabase
    .from('watermarked_essays')
    .select('*')
    .eq('slug', slug)
    .single();

  if (essay) {
    return {
      title: `${essay.title} | People & Youth`,
      description: essay.subtitle || `Official record by ${essay.author_name}`,
    };
  }

  return { title: 'Dialectics of Consciousness | People & Youth' };
}

export default async function DynamicArticlePage({ params }: Props) {
  const { slug } = await params;

  if (!slug) notFound();

  let record: any = null;

  // Fetch record from Supabase
  const { data: cimsData } = await supabase
    .from('institution_content')
    .select('*')
    .eq('slug', slug)
    .single();

  if (cimsData) {
    record = cimsData;
  } else {
    const { data: essayData } = await supabase
      .from('watermarked_essays')
      .select('*')
      .eq('slug', slug)
      .single();

    if (essayData) record = essayData;
  }

  // Default fallback matching target title
  const title = record?.title || "Dialectics of Consciousness";
  const subtitle = record?.subtitle || "A Soliloquy on Ideas, Society, and the Human Mind";
  const authorName = record?.author_name || "Swaraj Shandilya";
  const domain = record?.domain || "ESSAY • PHILOSOPHY & HUMAN CONSCIOUSNESS";
  const rawHtml = record?.raw_html || "";

  return (
    <main className="min-h-screen bg-[#eaeaed] text-[#222222] font-serif py-8 px-4 sm:px-8">
      {/* TOP NAVIGATION BAR */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center font-mono text-xs border-b border-gray-300 pb-4">
        <Link href="/dissent-dias" className="text-gray-600 hover:text-amber-700 transition-colors">
          ← Dissent Dias Portal
        </Link>
        <span className="text-amber-800 font-bold uppercase tracking-wider">
          PEOPLEANDYOUTH · AT THE HEART OF CHANGE
        </span>
      </div>

      {/* WHITE PAPER CANVAS */}
      <article className="max-w-4xl mx-auto bg-white p-8 sm:p-16 rounded-2xl shadow-xl border border-gray-200/80 relative overflow-hidden">
        {/* HEADER SECTION MATCHING SCREENSHOTS */}
        <header className="text-center space-y-3 pb-8 mb-8 border-b border-gray-200 relative z-10 font-sans">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500">
            DISSENT DIAS &mdash; BY PEOPLEANDYOUTH.ORG
          </div>
          <div className="text-[10px] tracking-widest uppercase text-gray-400">
            PEOPLEANDYOUTH &middot; AT THE HEART OF CHANGE &middot; QUESTION | REFLECT | ACT
          </div>

          <div className="pt-4 text-xs font-bold tracking-[0.15em] uppercase text-amber-700">
            {domain}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0b192c] font-serif leading-tight pt-1">
            {title}
          </h1>

          <p className="text-base sm:text-lg italic text-gray-600 font-serif max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="text-xs font-mono tracking-wider uppercase text-gray-500 pt-2">
            {authorName} &nbsp;&middot;&nbsp; ~6 MIN READ
          </div>

          {/* GOLD CENTRED RULE */}
          <div className="w-16 h-1 bg-amber-600 mx-auto mt-6 rounded-full" />
        </header>

        {/* BODY CONTENT CONTAINER */}
        <div 
          className="editorial-body text-[#222222] leading-relaxed font-serif text-lg"
          dangerouslySetInnerHTML={{ __html: rawHtml }}
        />
      </article>
    </main>
  );
}