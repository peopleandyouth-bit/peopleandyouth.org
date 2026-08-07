import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SchemaRegistry } from '@/lib/schema-registry';
import { ExecutiveOfficeMetadata } from '@/types/institution-os';

export const revalidate = 0;

interface Props {
  params: Promise<{ officeSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { officeSlug } = await params;
  const office = await SchemaRegistry.getEntityBySlug('office', officeSlug);

  if (!office) return { title: 'Executive Chamber | People & Youth' };

  return {
    title: `${office.title} — Executive Office | People & Youth`,
    description: office.summary || 'Official Virtual Chamber & Executive Suite.',
  };
}

export default async function VirtualOfficePage({ params }: Props) {
  const { officeSlug } = await params;
  const office = await SchemaRegistry.getEntityBySlug('office', officeSlug);

  if (!office) {
    notFound();
  }

  const meta: ExecutiveOfficeMetadata = (office.metadata || {}) as ExecutiveOfficeMetadata;

  return (
    <main className="min-h-screen bg-[#030611] text-white font-sans selection:bg-amber-400 selection:text-black">
      {/* HEADER UTILITY BAR */}
      <header className="border-b border-white/10 bg-[#070b19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-amber-400 font-black tracking-widest text-xs uppercase hover:underline">
            ← PEOPLE & YOUTH HQ
          </Link>
          <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
            <span className="text-amber-300 font-bold uppercase">EXECUTIVE CHAMBERS</span>
            <span>&middot;</span>
            <span className="text-emerald-400 font-bold">● VIRTUAL OFFICE ACTIVE</span>
          </div>
        </div>
      </header>

      {/* HERO VIRTUAL CHAMBER SUITE */}
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16 space-y-12">
        <div className="bg-[#070b19]/70 border border-amber-500/30 rounded-3xl p-8 sm:p-12 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10 max-w-4xl">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 font-bold uppercase">
                {meta.chamber_name || 'Executive Suite'}
              </span>
              <span className="text-gray-500">&bull;</span>
              <span className="text-gray-400">SOVEREIGN GOVERNANCE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              {office.title}
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 font-serif italic leading-relaxed">
              &ldquo;{meta.strategic_vision || office.summary}&rdquo;
            </p>

            <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <span className="text-gray-500 uppercase text-[9px] block">Chamber Incumbent</span>
                <strong className="text-white text-sm">{meta.incumbent_name || 'Incumbent Leader'}</strong>
                <span className="text-amber-400 text-[10px] block">{meta.incumbent_title}</span>
              </div>

              <div>
                <span className="text-gray-500 uppercase text-[9px] block">Official Protocol Contact</span>
                <span className="text-gray-300 block">{meta.contact_email || 'contact@peopleandyouth.org'}</span>
              </div>

              <div>
                <span className="text-gray-500 uppercase text-[9px] block">Chamber Status</span>
                <span className="text-emerald-400 font-bold block">● Open for Governance & Advisory</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHAMBER CONTENT & OFFICIAL MESSAGES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN MESSAGE & INITIATIVES */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#070b19]/50 border border-white/10 rounded-3xl p-8 space-y-6">
              <h2 className="text-xl font-bold text-amber-400 font-mono uppercase tracking-wider">
                Official Office Dispatch & Message
              </h2>
              <div
                className="prose prose-invert prose-amber max-w-none font-serif text-gray-200 leading-relaxed text-base"
                dangerouslySetInnerHTML={{ __html: office.content_markup || meta.official_message || '<p>No active chamber dispatches available.</p>' }}
              />
            </div>

            {meta.initiatives && meta.initiatives.length > 0 && (
              <div className="bg-[#070b19]/50 border border-white/10 rounded-3xl p-8 space-y-4">
                <h3 className="text-lg font-bold text-white font-mono uppercase">
                  Institutional Directives & Initiatives
                </h3>
                <ul className="space-y-3 font-mono text-xs text-gray-300">
                  {meta.initiatives.map((init, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-amber-400 font-bold">#{i + 1}</span>
                      <span>{init}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SIDEBAR TIMELINE & TEAM */}
          <div className="space-y-6">
            {meta.timeline && (
              <div className="bg-[#070b19]/50 border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-amber-400 font-mono uppercase">
                  Chamber Milestones
                </h3>
                <div className="space-y-3 font-mono text-xs">
                  {meta.timeline.map((item, idx) => (
                    <div key={idx} className="border-l-2 border-amber-400/40 pl-3 space-y-0.5">
                      <span className="text-amber-300 font-bold text-[10px]">{item.year}</span>
                      <p className="text-gray-300 text-[11px]">{item.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#070b19]/50 border border-white/10 rounded-3xl p-6 space-y-4 font-mono text-xs text-gray-400">
              <h3 className="text-sm font-bold text-white uppercase">Chamber Secretariat</h3>
              <p>For official inquiries, bilateral dialogue, or institutional partnerships:</p>
              <a
                href={`mailto:${meta.contact_email || 'contact@peopleandyouth.org'}`}
                className="block w-full py-2.5 bg-amber-400 text-black font-extrabold text-center rounded-xl hover:bg-amber-300 transition-all text-xs uppercase"
              >
                Send Official Dispatch →
              </a>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}