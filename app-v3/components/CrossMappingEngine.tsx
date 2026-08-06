'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { OpportunityApplySection } from '@/components/OpportunityApplyEngine';

export interface CrossMappingProps {
  slugPath: string;
  title: string;
  subtitle?: string;
  division?: string;
}

export default function UniversalCrossMappingComponent({ slugPath, title, subtitle = 'Institutional Node', division = 'General' }: CrossMappingProps) {
  const [content, setContent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNodeContent();
  }, [slugPath]);

  const fetchNodeContent = async () => {
    setLoading(true);
    // Query Supabase for dynamic content uploaded via CIMS admin console
    const formattedSlug = slugPath.replace(/^\//, '').replace(/\//g, '-');
    
    const { data } = await supabase
      .from('public_publications_feed')
      .select('*')
      .or(`slug.eq.${formattedSlug},category.ilike.%${title}%`)
      .limit(1)
      .maybeSingle();

    if (data) {
      setContent(data);
    } else {
      setContent(null);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* TOP UTILITY BAR */}
        <div className="border-b border-white/10 bg-[#070b19] px-6 py-2.5 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
          <Link href="/" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
            ← Return to Main Digital Headquarters
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 font-bold">PEOPLE & YOUTH</span>
            <span>&middot;</span>
            <span className="text-amber-300">NODE: {slugPath}</span>
          </div>
        </div>

        {/* MASTHEAD */}
        <header className="border-b border-white/10 px-6 py-12 max-w-6xl mx-auto space-y-4 text-center">
          <span className="px-3.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-[10px] uppercase rounded-full tracking-widest">
            {division} &middot; INSTITUTIONAL NODE
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight text-white">
            {title}
          </h1>
          <p className="text-gray-400 text-xs italic font-serif max-w-xl mx-auto">
            {subtitle}
          </p>
        </header>

        <div className="max-w-6xl mx-auto p-6 sm:p-12 space-y-12">
          
          {/* DYNAMIC CONTENT OR WORK IN PROGRESS DISPLAY */}
          {loading ? (
            <div className="py-16 text-center text-gray-500 font-mono animate-pulse">
              Querying Institution OS Records for {title}...
            </div>
          ) : content ? (
            /* ADMIN UPLOADED CONTENT PRESENT */
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6 font-serif">
              <div className="border-b border-white/10 pb-4 flex justify-between items-center flex-wrap gap-2">
                <span className="text-amber-400 font-bold font-mono text-[10px] uppercase">PUBLISHED RECORD &middot; {content.category}</span>
                <span className="text-gray-400 font-mono text-[10px]">By {content.author_name}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{content.title}</h2>
              <p className="text-gray-300 text-sm italic leading-relaxed">{content.subtitle}</p>
              <div className="text-gray-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap pt-4 border-t border-white/10">
                {content.content || 'Manuscript records staged. Full analytical brief available in Grand Library.'}
              </div>
            </div>
          ) : (
            /* WORK IN PROGRESS FALLBACK WITH ADMIN NOTICE */
            <div className="bg-gradient-to-br from-[#070b19] via-[#0b142d] to-[#040711] border border-amber-400/30 p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold text-lg mx-auto">
                ⚙️
              </div>
              <div className="space-y-2">
                <span className="px-4 py-1.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 font-bold font-mono text-xs uppercase tracking-widest rounded-full inline-block">
                  work in progress
                </span>
                <h2 className="text-2xl font-black text-white uppercase font-serif pt-2">
                  Institutional Node Staged
                </h2>
                <p className="text-gray-300 text-xs font-serif max-w-lg mx-auto leading-relaxed">
                  This section is registered within the People & Youth digital architecture. As the Editorial & Research Board publishes new whitepapers or uploads content from the Admin Console, records will appear here automatically.
                </p>
              </div>

              <div className="pt-2 text-[10px] text-gray-500 font-mono">
                Admin Publishing Console: <Link href="/admin/login" className="text-amber-300 font-bold hover:underline">Institution OS CIMS Login →</Link>
              </div>
            </div>
          )}

          {/* CROSS-MAPPING / CROSS-POLLINATION SECTION */}
          <section className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">INSTITUTIONAL CROSS-MAPPING</span>
              <h2 className="text-2xl font-extrabold text-white font-serif">Connected Knowledge Ecosystem</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              {/* CONNECTED REALM */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 hover:border-amber-400/50 transition-all">
                <span className="text-amber-400 font-bold text-[9px] uppercase block">01 &middot; KNOWLEDGE REALM</span>
                <h3 className="text-base font-bold text-white">Policy & Governance Realm</h3>
                <p className="text-gray-400 text-[11px] leading-relaxed">Explore statutory frameworks, public administration caves, and audit repositories.</p>
                <Link href="/realms" className="text-amber-300 font-bold text-[10px] hover:underline block pt-2">
                  Access Knowledge Realms →
                </Link>
              </div>

              {/* CONNECTED JOURNALS */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 hover:border-amber-400/50 transition-all">
                <span className="text-amber-400 font-bold text-[9px] uppercase block">02 &middot; PUBLICATIONS PRESS</span>
                <h3 className="text-base font-bold text-white">Renaissance Series & Dissent Dias</h3>
                <p className="text-gray-400 text-[11px] leading-relaxed">Peer-reviewed scholarly journals and longform philosophical essays.</p>
                <Link href="/renaissance-series" className="text-amber-300 font-bold text-[10px] hover:underline block pt-2">
                  Browse Renaissance Journals →
                </Link>
              </div>

              {/* CONNECTED CIVIC PASSPORT */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 hover:border-amber-400/50 transition-all">
                <span className="text-amber-400 font-bold text-[9px] uppercase block">03 &middot; MEMBER VERIFICATION</span>
                <h3 className="text-base font-bold text-white">Civic Passport Pass</h3>
                <p className="text-gray-400 text-[11px] leading-relaxed">Unlock verified research credentials, member discussions, and digital certificates.</p>
                <Link href="/passport" className="text-amber-300 font-bold text-[10px] hover:underline block pt-2">
                  View Civic Passport ID →
                </Link>
              </div>
            </div>
          </section>

          {/* CONNECTED RECRUITMENT OPPORTUNITY */}
          <OpportunityApplySection
            opportunityId={`node-opp-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            opportunityType="Institutional Node Opportunities"
            department={division}
            title={`${title} Fellow / Specialist`}
            location="Global / Remote"
          />

        </div>
      </div>

      <footer className="border-t border-white/10 bg-[#040711] py-8 px-6 text-center text-gray-500 text-[10px] font-mono">
        &copy; 2026 People & Youth &middot; www.peopleandyouth.org &middot; All Rights Reserved.
      </footer>
    </main>
  );
}