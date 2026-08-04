'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default function EditorialPortalLandingPage() {
  const [essays, setEssays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watermarked_essays')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (data) {
        setEssays(data);
      }
    } catch (err) {
      console.error('Database connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-sans selection:bg-[#C59B27] selection:text-black">
      
      {/* ADMIN QUICK BAR */}
      {isAdmin && (
        <div className="bg-[#C59B27] text-black px-6 py-2.5 font-mono text-xs font-bold flex justify-between items-center sticky top-0 z-50 border-b border-black/20">
          <span className="bg-black text-[#C59B27] px-2 py-0.5 rounded text-[10px]">ADMIN SESSION ACTIVE</span>
          <div className="flex gap-4">
            <Link href="/admin/essays" className="hover:underline">📜 Publish New Item</Link>
            <Link href="/admin/print" className="hover:underline">🖨️ Print Studio</Link>
          </div>
        </div>
      )}

      {/* PORTAL HEADER */}
      <header className="border-b border-white/10 bg-gradient-to-b from-[#0B192C] to-[#070b19] py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-[#C59B27] font-mono text-xs font-bold tracking-[4px] uppercase block">
            Dissent Dias • Sovereign Editorial Forum
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold text-white tracking-tight">
            Question. Reflect. Act.
          </h1>
          <p className="text-gray-400 font-serif italic text-base sm:text-lg max-w-2xl mx-auto">
            Empirical research, constitutional transparency, and philosophical inquiry.
          </p>
        </div>
      </header>

      {/* DYNAMIC ESSAY FEED */}
      <section className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        <div className="border-b border-white/10 pb-4 flex justify-between items-end">
          <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-wider">Live Publications Ledger</h2>
          <span className="text-xs font-mono text-[#C59B27] font-bold">{essays.length} Document(s) Active</span>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-gray-400 space-y-3">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Syncing live content from database...</p>
          </div>
        ) : essays.length === 0 ? (
          <div className="py-16 text-center font-mono text-xs text-gray-400 bg-white/5 rounded-2xl border border-white/10 p-8 space-y-4">
            <p className="text-amber-400 font-bold">No active essays found in Supabase.</p>
            <p>Publish an essay through the Admin Publisher to populate this portal instantly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {essays.map((item) => (
              <div 
                key={item.id || item.slug}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4 hover:border-[#C59B27]/50 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono text-[#C59B27]">
                    <span className="uppercase font-bold tracking-widest">{item.category}</span>
                    <span>{item.read_time}</span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-white group-hover:text-[#C59B27] transition-colors">
                    <Link href={`/essay/${item.slug}`}>{item.title}</Link>
                  </h3>

                  {item.subtitle && (
                    <p className="text-gray-400 font-serif italic text-sm">
                      "{item.subtitle}"
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-300">{item.author_name}</span>
                  <Link 
                    href={`/essay/${item.slug}`} 
                    className="px-4 py-2 rounded-lg bg-[#C59B27] text-black font-bold hover:bg-yellow-300 transition-all"
                  >
                    Read Essay →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>

    </main>
  );
}