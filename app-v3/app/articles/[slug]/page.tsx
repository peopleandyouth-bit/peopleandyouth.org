import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 0; // Ensure live fresh content on every request

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from('articles')
    .select('title, subtitle, category')
    .eq('slug', slug)
    .single();

  if (!article) return { title: 'Article Not Found | People & Youth' };

  return {
    title: `${article.title} — People & Youth`,
    description: article.subtitle || 'Read official publications on People & Youth.',
  };
}

export default async function PublicArticlePage({ params }: Props) {
  const { slug } = await params;

  // Fetch article directly from Supabase
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !article) {
    // Fallback search in public_publications_feed view if needed
    const { data: feedArticle } = await supabase
      .from('public_publications_feed')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!feedArticle) {
      notFound();
    }
  }

  const record = article || {};

  return (
    <main className="min-h-screen bg-[#030611] text-white selection:bg-amber-400 selection:text-black font-sans">
      {/* HEADER UTILITY BAR */}
      <header className="border-b border-white/10 bg-[#070b19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-amber-400 font-black tracking-widest text-xs uppercase hover:underline">
            ← PEOPLE & YOUTH HQ
          </Link>
          <div className="flex items-center gap-4 text-[11px] font-mono text-gray-400">
            <Link href="/essays" className="hover:text-amber-300 transition-colors">
              PUBLICATIONS FEED
            </Link>
            <span>&middot;</span>
            <span className="text-amber-400 font-bold uppercase">{record.category || 'Editorial'}</span>
          </div>
        </div>
      </header>

      {/* ARTICLE CONTAINER */}
      <article className="max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-8">
        
        {/* MASTHEAD & CATEGORY */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 font-bold uppercase">
              {record.category || 'Science & Strategic Innovation'}
            </span>
            <span className="text-gray-500">&bull;</span>
            <span className="text-gray-400">PEOPLE & YOUTH OFFICIAL RECORD</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {record.title}
          </h1>

          {record.subtitle && (
            <p className="text-lg sm:text-xl text-gray-300 font-serif italic leading-relaxed">
              {record.subtitle}
            </p>
          )}

          {/* AUTHOR METADATA BAR */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-gray-400 border-t border-white/5">
            <div>
              <span className="text-white font-bold block text-sm">
                Author: {record.author_name || 'Swaraj Shandilya'}
              </span>
              <span className="text-gray-400 text-[11px] block max-w-2xl mt-0.5">
                Founder at peopleandyouth.org &bull; Social Impact Leadership
              </span>
            </div>

            <div className="text-left sm:text-right text-[11px]">
              <time className="block text-amber-300 font-bold">
                Published: {new Date(record.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
              <span className="text-gray-500">Official Archival Record</span>
            </div>
          </div>
        </div>

        {/* HTML CONTENT BODY */}
        <div className="prose prose-invert prose-amber max-w-none font-serif text-gray-200 leading-relaxed text-base sm:text-lg space-y-6">
          {record.content ? (
            <div dangerouslySetInnerHTML={{ __html: record.content }} />
          ) : (
            <p className="font-sans text-gray-400 italic">No content markup stored for this record.</p>
          )}
        </div>

        {/* FOOTER CALL TO ACTION */}
        <div className="pt-12 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white font-mono">PEOPLE & YOUTH INSTITUTION</h4>
            <p className="text-xs text-gray-400">Independent Research, Civic Engagement & Knowledge Advancement</p>
          </div>
          <Link
            href="/essays"
            className="px-6 py-3 bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-300 transition-all shadow-lg"
          >
            Explore More Publications →
          </Link>
        </div>

      </article>
    </main>
  );
}