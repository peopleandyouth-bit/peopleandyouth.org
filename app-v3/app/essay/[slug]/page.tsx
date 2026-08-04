'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default function DynamicWatermarkedEssayPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap Next.js dynamic params
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [essay, setEssay] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchEssay();
    checkAdmin();
  }, [slug]);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.user_metadata?.role === 'admin') {
      setIsAdmin(true);
    }
  };

  const fetchEssay = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watermarked_essays')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setEssay(data);
        setNotFound(false);
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b19] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Fetching sovereign publication record...</span>
        </div>
      </main>
    );
  }

  if (notFound || !essay) {
    return (
      <main className="min-h-screen bg-[#070b19] text-white flex flex-col items-center justify-center font-mono text-xs p-6 text-center space-y-4">
        <span className="text-4xl">🏛️</span>
        <h1 className="text-xl font-bold text-amber-400">404 — Publication Record Not Found</h1>
        <p className="text-gray-400 max-w-md">
          No active essay found matching <code className="bg-white/10 px-2 py-1 rounded text-white">/essay/{slug}</code> in the database ledger.
        </p>
        <Link href="/dissent-dias" className="px-6 py-2.5 rounded-xl bg-amber-400 text-black font-bold hover:bg-yellow-300">
          ← Return to Editorial Portal
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAEAEA] text-[#222222] font-serif relative overflow-x-hidden selection:bg-[#C59B27] selection:text-white">
      
      {/* FLOATING ADMIN CONTROLS */}
      {isAdmin && (
        <div className="bg-[#0B192C] text-[#C59B27] px-6 py-2.5 font-mono text-xs font-bold flex justify-between items-center border-b border-[#C59B27] sticky top-0 z-50 print:hidden">
          <span>🛡️ ADMIN ACCESS: Active Session Detected</span>
          <div className="flex gap-4">
            <Link href="/admin/print" className="hover:underline text-white">🖨️ Print Studio</Link>
            <Link href="/admin/essays" className="hover:underline text-white">📜 Publisher HQ</Link>
          </div>
        </div>
      )}

      {/* SVG DYNAMIC WATERMARK */}
      <style jsx global>{`
        .page-watermark-layer {
          position: relative;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='200' viewBox='0 0 350 200'%3E%3Ctext x='20' y='100' fill='rgba(11, 25, 44, 0.08)' font-size='16' font-family='Georgia, serif' font-weight='bold' transform='rotate(-25 175 100)'%3Epeopleandyouth.org • Copyright Protected%3C/text%3E%3C/svg%3E");
          background-repeat: repeat;
        }

        @media print {
          @page { size: A4; margin: 15mm; }
          body { background: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .page-watermark-layer {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='200' viewBox='0 0 350 200'%3E%3Ctext x='20' y='100' fill='rgba(11, 25, 44, 0.15)' font-size='18' font-family='Georgia, serif' font-weight='bold' transform='rotate(-25 175 100)'%3Epeopleandyouth.org • Sovereign Academic Record%3C/text%3E%3C/svg%3E") !important;
            background-repeat: repeat !important;
          }
        }
      `}</style>

      {/* NAV BAR */}
      <div className="bg-[#0B192C] text-white font-mono text-xs py-3 px-6 flex justify-between items-center border-b border-[#C59B27]/40 print:hidden">
        <Link href="/dissent-dias" className="font-bold tracking-wider hover:text-[#C59B27] flex items-center gap-2">
          <span>🏛️</span>
          <span>peopleandyouth.org / Editorial Portal</span>
        </Link>
        <span className="text-gray-400 text-[10px]">SOVEREIGN WATERMARKED ESSAY</span>
      </div>

      {/* ESSAY CANVAS */}
      <article className="max-w-[210mm] mx-auto my-6 bg-white p-8 sm:p-16 shadow-2xl page-watermark-layer border border-gray-200 relative">
        
        <div className="text-center pb-4 mb-8 border-b border-gray-200">
          <div className="text-xs font-bold tracking-[3px] uppercase text-[#0B192C] font-sans">Dissent Dias — by peopleandyouth.org</div>
          <div className="text-[10px] tracking-[2px] uppercase text-[#5B6470] mt-1 font-sans">Peopleandyouth · At the Heart of Change · Question | Reflect | Act</div>
        </div>

        <div className="text-center text-[#C59B27] uppercase tracking-[2.5px] text-xs font-bold mb-3 font-sans">
          {essay.category || 'Essay • Philosophy & Public Policy'}
        </div>

        <h1 className="text-center text-[#0B192C] text-3xl sm:text-4xl font-bold mb-2 leading-tight">
          {essay.title}
        </h1>

        {essay.subtitle && (
          <p className="text-center italic text-lg text-[#5B6470] mb-2">
            {essay.subtitle}
          </p>
        )}

        <div className="text-center text-xs text-[#5B6470] tracking-wider uppercase mb-6 font-sans">
          {essay.author_name || 'Swaraj Shandilya'} &nbsp;·&nbsp; {essay.read_time || '~5 min read'}
        </div>

        <hr className="border-t-2 border-[#C59B27] w-16 mx-auto mb-8" />

        <div className="flex gap-4 items-start bg-[#F4F6F9] rounded p-4 mb-8 font-sans">
          <div className="w-12 h-12 rounded-full bg-[#0B192C] text-white flex items-center justify-center font-bold text-lg shrink-0">
            {essay.author_name ? essay.author_name.split(' ').map((n: string) => n[0]).join('') : 'PY'}
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-[#0B192C]">{essay.author_name || 'Swaraj Shandilya'}</div>
            <div className="text-[#5B6470] leading-relaxed">{essay.author_bio || 'Founder at peopleandyouth.org'}</div>
            <div className="text-[#C59B27] font-bold">peopleandyouth.org</div>
          </div>
        </div>

        {/* DYNAMIC RAW HTML BODY */}
        <div 
          className="prose prose-lg max-w-none text-[#222222] leading-relaxed font-serif"
          dangerouslySetInnerHTML={{ __html: essay.raw_html }} 
        />

        <div className="mt-12 pt-6 border-t border-gray-200 text-center font-sans">
          <div className="font-bold text-[#0B192C] text-sm">{essay.author_name}</div>
          <div className="text-xs text-[#5B6470] max-w-md mx-auto mt-1">{essay.author_bio}</div>
          <div className="text-xs text-[#C59B27] font-bold mt-1">peopleandyouth.org</div>
        </div>

      </article>

    </main>
  );
}