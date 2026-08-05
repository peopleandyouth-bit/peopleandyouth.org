import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const { data: article } = await supabase
    .from('institution_content')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!article) {
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

    return { title: 'Article Not Found | People & Youth' };
  }

  return {
    title: `${article.title} | People & Youth`,
    description: article.subtitle || `Published by ${article.author_name}`,
  };
}

export default async function DynamicArticlePage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    notFound();
  }

  let record: {
    title: string;
    subtitle?: string;
    category: string;
    author_name: string;
    read_time: string;
    created_at: string;
    raw_html: string;
    id?: string;
  } | null = null;

  // 1. Query 'institution_content' (CIMS / Universal CMS)
  const { data: cimsData } = await supabase
    .from('institution_content')
    .select('*')
    .eq('slug', slug)
    .single();

  if (cimsData) {
    record = {
      title: cimsData.title,
      subtitle: cimsData.subtitle,
      category: cimsData.domain || cimsData.entity_type?.toUpperCase() || 'EDITORIAL',
      author_name: cimsData.author_name || 'Swaraj Shandilya',
      read_time: '~6 min read',
      created_at: cimsData.created_at,
      raw_html: cimsData.raw_html,
      id: cimsData.id,
    };
  } else {
    // 2. Query 'watermarked_essays' (Split-Screen Publisher)
    const { data: essayData } = await supabase
      .from('watermarked_essays')
      .select('*')
      .eq('slug', slug)
      .single();

    if (essayData) {
      record = {
        title: essayData.title,
        subtitle: essayData.subtitle,
        category: essayData.category || 'ESSAY',
        author_name: essayData.author_name || 'Swaraj Shandilya',
        read_time: essayData.read_time || '~5 min read',
        created_at: essayData.created_at,
        raw_html: essayData.raw_html,
        id: essayData.id,
      };
    } else {
      // 3. Query legacy 'articles' table
      const { data: legacyData } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (legacyData) {
        record = {
          title: legacyData.title,
          subtitle: legacyData.subtitle || legacyData.excerpt,
          category: legacyData.category || 'ARTICLE',
          author_name: legacyData.author_name || 'Swaraj Shandilya',
          read_time: legacyData.read_time || '~5 min read',
          created_at: legacyData.created_at,
          raw_html: legacyData.content || legacyData.raw_html,
          id: legacyData.id,
        };
      }
    }
  }

  // If no record matched the requested slug across all tables, return 404
  if (!record) {
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
          <Link href="/admin/cms" className="text-gray-400 hover:text-amber-400 transition-colors">
            ⚙️ CIMS HQ
          </Link>
        </div>
        <span className="text-amber-400 font-bold uppercase tracking-wider">{record.category}</span>
      </div>

      <article className="max-w-4xl mx-auto bg-[#EAEAEA] text-[#222222] p-8 sm:p-14 rounded-2xl relative shadow-2xl border border-gray-300 overflow-hidden">
        {/* WATERMARK BACKGROUND LAYER */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center font-sans font-black text-6xl text-black rotate-[-30deg] uppercase tracking-widest whitespace-nowrap">
          OFFICIAL RECORD • PEOPLE & YOUTH • DO NOT DUPLICATE
        </div>

        {/* HEADER */}
        <header className="border-b border-gray-300 pb-6 mb-8 text-center relative z-10 font-sans">
          <div className="text-[10px] font-bold tracking-widest uppercase text-amber-800 mb-1">
            {record.category}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B192C] leading-tight mb-3">
            {record.title}
          </h1>
          {record.subtitle && <p className="text-sm italic text-gray-600 mb-4">{record.subtitle}</p>}

          <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500 font-mono pt-2 border-t border-gray-200">
            <span>By <strong>{record.author_name}</strong></span>
            <span>•</span>
            <span>{record.read_time}</span>
            <span>•</span>
            <span>{new Date(record.created_at).toLocaleDateString()}</span>
          </div>
        </header>

        {/* BODY CONTENT */}
        <div
          className="prose prose-lg max-w-none text-[#222222] leading-relaxed relative z-10 font-serif"
          dangerouslySetInnerHTML={{ __html: record.raw_html }}
        />

        {/* FOOTER */}
        <footer className="mt-12 pt-6 border-t border-gray-300 font-mono text-[10px] text-gray-500 flex flex-wrap justify-between items-center gap-2 relative z-10">
          <span>Record ID: {record.id || 'SOVEREIGN-RECORD'}</span>
          <span>Sovereign Knowledge Infrastructure • peopleandyouth.org</span>
        </footer>
      </article>
    </main>
  );
}