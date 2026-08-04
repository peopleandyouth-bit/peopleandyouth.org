'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const DEFAULT_ESSAY = {
  slug: 'dialectics-of-consciousness',
  title: 'Dialectics of Consciousness',
  subtitle: 'A Soliloquy on Ideas, Society, and the Human Mind',
  category: 'Essay • Philosophy & Human Consciousness',
  author_name: 'Swaraj Shandilya',
  author_bio: 'Founder at peopleandyouth.org | Ex-Coordinator, The Public Policy Club, IIFT | MBA(IB) IIFT (2025–27)',
  read_time: '~6 min read',
  status: 'published'
};

export default function WatermarkedEssayReaderPage({ params }: { params: { slug: string } }) {
  const slug = params.slug || 'dialectics-of-consciousness';
  const [essay, setEssay] = useState<any>(DEFAULT_ESSAY);

  useEffect(() => {
    fetchEssay();
  }, [slug]);

  const fetchEssay = async () => {
    try {
      const { data } = await supabase
        .from('watermarked_essays')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) setEssay(data);
    } catch (err) {
      console.error('Using default fallback essay rendering.');
    }
  };

  return (
    <main className="min-h-screen bg-[#EAEAEA] text-[#222222] font-serif relative overflow-x-hidden selection:bg-[#C59B27] selection:text-white">
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
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="bg-[#0B192C] text-white font-mono text-xs py-3 px-6 flex justify-between items-center border-b border-[#C59B27]/40 print:hidden">
        <Link href="/" className="font-bold tracking-wider hover:text-[#C59B27] flex items-center gap-2">
          <span>🏛️</span>
          <span>peopleandyouth.org</span>
        </Link>
        <span className="text-gray-400 text-[10px]">SOVEREIGN WATERMARKED ESSAY • NO UNAUTHORIZED REPRODUCTION</span>
      </div>

      <div className="max-w-[210mm] mx-auto my-6 bg-white p-8 sm:p-16 shadow-2xl page-watermark-layer border border-gray-200 relative">
        <div className="text-center pb-4 mb-8 border-b border-gray-200">
          <div className="text-xs font-bold tracking-[3px] uppercase text-[#0B192C] font-sans">Dissent Dias — by peopleandyouth.org</div>
          <div className="text-[10px] tracking-[2px] uppercase text-[#5B6470] mt-1 font-sans">Peopleandyouth · At the Heart of Change · Question | Reflect | Act</div>
        </div>

        <div className="text-center text-[#C59B27] uppercase tracking-[2.5px] text-xs font-bold mb-3 font-sans">
          {essay?.category || 'Essay • Philosophy & Human Consciousness'}
        </div>

        <h1 className="text-center text-[#0B192C] text-3xl sm:text-4xl font-bold mb-2 leading-tight">
          {essay?.title || 'Dialectics of Consciousness'}
        </h1>

        <p className="text-center italic text-lg text-[#5B6470] mb-2">
          {essay?.subtitle || 'A Soliloquy on Ideas, Society, and the Human Mind'}
        </p>

        <div className="text-center text-xs text-[#5B6470] tracking-wider uppercase mb-6 font-sans">
          {essay?.author_name || 'Swaraj Shandilya'} &nbsp;·&nbsp; {essay?.read_time || '~6 min read'}
        </div>

        <hr className="border-t-2 border-[#C59B27] w-16 mx-auto mb-8" />

        <div className="flex gap-4 items-start bg-[#F4F6F9] rounded p-4 mb-8 font-sans">
          <div className="w-12 h-12 rounded-full bg-[#0B192C] text-white flex items-center justify-center font-bold text-lg shrink-0">
            SS
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-[#0B192C]">{essay?.author_name || 'Swaraj Shandilya'}</div>
            <div className="text-[#5B6470] leading-relaxed">{essay?.author_bio || 'Founder at peopleandyouth.org'}</div>
            <div className="text-[#C59B27] font-bold">peopleandyouth.org</div>
          </div>
        </div>

        {essay?.raw_html ? (
          <div className="prose prose-lg max-w-none text-[#222222] leading-relaxed font-serif" dangerouslySetInnerHTML={{ __html: essay.raw_html }} />
        ) : (
          <div className="space-y-6 text-base sm:text-lg leading-relaxed text-[#222222]">
            <div className="bg-[#F4F6F9] border-l-4 border-[#C59B27] p-5 italic text-[#3a3f47] text-sm">
              <p className="mb-2">This is neither a political manifesto nor an attempt to persuade.</p>
              <p className="mb-2">It is a soliloquy — a conversation with oneself, written in the hope that others may find reflections of their own questions within it.</p>
              <p>Ideas are not conclusions to be accepted; they are invitations to think.</p>
            </div>
            <h2 className="text-[#0B192C] text-2xl font-bold border-b border-gray-200 pb-2 mt-8">I. The Age of False Dichotomies</h2>
            <p>Our age is fascinated by binaries. We are encouraged to choose between Left and Right, Capitalism and Socialism, Tradition and Modernity, Desire and Suppression, as though human civilization advances only by choosing one extreme over another.</p>
            <p>Yet history tells a different story. Every significant transformation has emerged not from the victory of one absolute over another, but from the dialogue between opposing forces.</p>
            <blockquote className="bg-[#F4F6F9] border-l-4 border-[#C59B27] my-6 p-5 italic font-bold text-[#0B192C]">
              "True capitalism and true socialism are not enemies. Their highest forms meet in synthesis."
            </blockquote>
            <p>The future rarely belongs to ideological purity. It belongs to intellectual evolution.</p>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-200 text-center font-sans">
          <div className="font-bold text-[#0B192C] text-sm">{essay?.author_name || 'Swaraj Shandilya'}</div>
          <div className="text-xs text-[#5B6470] max-w-md mx-auto mt-1">{essay?.author_bio || 'Founder at peopleandyouth.org'}</div>
          <div className="text-xs text-[#C59B27] font-bold mt-1">peopleandyouth.org</div>
        </div>
      </div>
    </main>
  );
}