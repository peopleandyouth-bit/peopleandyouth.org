import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 0;

export const metadata = {
  title: 'Public Publications & Essays | People & Youth',
  description: 'Official published essays, research whitepapers, and strategic commentaries from People & Youth.',
};

export default async function EssaysIndexPage() {
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#030611] text-white font-sans selection:bg-amber-400 selection:text-black">
      <header className="border-b border-white/10 bg-[#070b19] px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-amber-400 font-extrabold text-xs tracking-widest uppercase hover:underline">
            ← PEOPLE & YOUTH HQ
          </Link>
          <span className="text-xs font-mono text-gray-400">PUBLIC KNOWLEDGE REPOSITORY</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-3 border-b border-white/10 pb-6">
          <span className="text-amber-400 font-mono text-xs uppercase font-bold tracking-widest block">
            EDITORIAL & RESEARCH
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Publications & Strategic Essays
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl">
            Explore independent inquiries, institutional analyses, policy critiques, and dialectical commentaries published by People & Youth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles && articles.length > 0 ? (
            articles.map((item, idx) => (
              <Link
                key={idx}
                href={`/articles/${item.slug}`}
                className="group p-6 bg-white/5 border border-white/10 hover:border-amber-400/50 rounded-2xl transition-all duration-300 flex flex-col justify-between space-y-4 hover:bg-white/[0.07]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-amber-400 font-bold uppercase">{item.category || 'General'}</span>
                    <span className="text-gray-500">
                      {new Date(item.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {item.title}
                  </h2>

                  <p className="text-gray-400 text-xs line-clamp-3 font-serif leading-relaxed">
                    {item.subtitle || item.excerpt || 'Read official publication...'}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs font-mono text-amber-400 group-hover:underline">
                  <span>Read Full Essay →</span>
                  <span className="text-gray-500 text-[10px]">By {item.author_name || 'Swaraj Shandilya'}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 p-12 bg-white/5 border border-white/10 rounded-2xl text-center font-mono text-gray-400 text-sm">
              No public articles found. Check back soon for new publications.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}