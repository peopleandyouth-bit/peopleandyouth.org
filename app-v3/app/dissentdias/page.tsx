'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const FEATURED_ESSAY = {
  slug: 'dialectics-of-consciousness',
  title: 'Dialectics of Consciousness',
  subtitle: 'A Soliloquy on Ideas, Society, and the Human Mind',
  category: 'Philosophy & Human Consciousness',
  author_name: 'Swaraj Shandilya',
  read_time: '~6 min read',
  excerpt: 'Our age is fascinated by binaries. We are encouraged to choose between Left and Right, Capitalism and Socialism, Tradition and Modernity...'
};

export default function EditorialPortalLandingPage() {
  const [essays, setEssays] = useState<any[]>([FEATURED_ESSAY]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchEssays();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.user_metadata?.role === 'admin') {
      setIsAdmin(true);
    }
  };

  const fetchEssays = async () => {
    try {
      const { data } = await supabase.from('watermarked_essays').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setEssays(data);
      }
    } catch (err) {
      console.error('Using default editorial collection.');
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-sans selection:bg-[#C59B27] selection:text-black">
      
      {/* ADMIN FLOATING QUICK ACTION BAR (VISIBLE ONLY TO LOGGED-IN ADMIN) */}
      {isAdmin && (
        <div className="bg-[#C59B27] text-black px-6 py-2.5 font-mono text-xs font-bold flex justify-between items-center sticky top-0 z-50 shadow-xl border-b border-black/20">
          <div className="flex items-center gap-3">
            <span className="bg-black text-[#C59B27] px-2 py-0.5 rounded text-[10px]">ADMIN LOGGED IN</span>
            <span>Editorial Portal HQ</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/essays" className="hover:underline">📜 Upload New Essay</Link>
            <Link href="/admin/print" className="hover:underline">🖨️ Open Print Studio</Link>
            <Link href="/admin/dashboard" className="hover:underline">🖥️ Master Control</Link>
          </div>
        </div>
      )}

      {/* PORTAL MASTHEAD HERO */}
      <header className="border-b border-white/10 bg-gradient-to-b from-[#0B192C] to-[#070b19] py-16 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-[#C59B27] font-mono text-xs font-bold tracking-[4px] uppercase block">
            Dissent Dias • Sovereign Editorial Forum
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold text-white tracking-tight leading-tight">
            Question. Reflect. Act.
          </h1>
          <p className="text-gray-400 font-serif italic text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A platform dedicated to philosophical inquiry, constitutional transparency, and youth leadership towards praxis.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4 text-xs font-mono">
            <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-gray-300">
              🏛️ peopleandyouth.org Official Publications
            </span>
            <span className="bg-amber-500/10 border border-amber-400/30 px-4 py-2 rounded-full text-amber-300">
              🛡️ Copyright &amp; Watermark Protected
            </span>
          </div>
        </div>
      </header>

      {/* FEATURED ESSAY SECTION (ARRIVES ON FIRST PAGE) */}
      <section className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        <div className="border-b border-white/10 pb-4 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-wider">Primary Essay Release</h2>
            <p className="text-xs font-mono text-gray-400 mt-1">Featured publication ready for reading</p>
          </div>
          <span className="text-xs font-mono text-[#C59B27] font-bold">Vol. I • 2026 Edition</span>
        </div>

        {/* HERO ESSAY CARD */}
        <div className="bg-gradient-to-br from-[#0B192C] to-white/5 border border-white/10 rounded-2xl p-8 sm:p-12 space-y-6 hover:border-[#C59B27]/50 transition-all shadow-2xl relative group">
          <div className="flex flex-wrap justify-between items-center text-xs font-mono text-[#C59B27] gap-2">
            <span className="uppercase font-bold tracking-widest">{essays[0]?.category || 'Philosophy & Human Consciousness'}</span>
            <span>{essays[0]?.read_time || '~6 min read'}</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight group-hover:text-[#C59B27] transition-colors">
            <Link href={`/essay/${essays[0]?.slug}`}>{essays[0]?.title}</Link>
          </h3>

          <p className="text-gray-300 font-serif italic text-lg sm:text-xl">
            "{essays[0]?.subtitle}"
          </p>

          <p className="text-gray-400 font-serif text-sm sm:text-base leading-relaxed max-w-3xl">
            {essays[0]?.excerpt || 'Every significant transformation has emerged not from the victory of one absolute over another, but from the dialogue between opposing forces...'}
          </p>

          <div className="pt-4 flex flex-wrap justify-between items-center gap-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C59B27] text-black font-serif font-bold flex items-center justify-center text-sm">
                SS
              </div>
              <div className="text-xs font-mono">
                <div className="font-bold text-white">{essays[0]?.author_name || 'Swaraj Shandilya'}</div>
                <div className="text-gray-400">Founder at peopleandyouth.org</div>
              </div>
            </div>

            <Link
              href={`/essay/${essays[0]?.slug}`}
              className="px-6 py-3 rounded-xl bg-[#C59B27] text-black font-mono font-bold text-xs hover:bg-yellow-400 transition-all flex items-center gap-2"
            >
              <span>Read Full Watermarked Essay →</span>
            </Link>
          </div>
        </div>

        {/* ALL ESSAYS GRID */}
        {essays.length > 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-white border-b border-white/10 pb-3">Editorial Catalog</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {essays.slice(1).map((item) => (
                <div key={item.slug} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 hover:border-amber-400/50 transition-all">
                  <span className="text-[10px] font-mono uppercase text-[#C59B27] font-bold">{item.category}</span>
                  <h4 className="text-xl font-serif font-bold text-white hover:text-[#C59B27]">
                    <Link href={`/essay/${item.slug}`}>{item.title}</Link>
                  </h4>
                  <p className="text-xs font-serif italic text-gray-400">{item.subtitle}</p>
                  <div className="pt-2 flex justify-between items-center text-xs font-mono text-gray-400">
                    <span>{item.author_name}</span>
                    <Link href={`/essay/${item.slug}`} className="text-[#C59B27] font-bold hover:underline">Read →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* PUBLIC MEMBER COMMUNITY FOOTER */}
      <footer className="border-t border-white/10 bg-[#050814] py-12 px-6 text-center font-mono text-xs space-y-4">
        <p className="text-gray-400">peopleandyouth.org • Sovereign Digital Platform</p>
        <p className="text-gray-500 text-[10px]">All rights reserved. Unauthorized printing and commercial distribution are restricted.</p>
      </footer>

    </main>
  );
}