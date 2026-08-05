'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function PublicPolicyLabPage() {
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    setLoading(true);
    const { data } = await supabase.from('policy_lab_initiatives').select('*').order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setInitiatives(data);
    } else {
      // Default Seed Initiative
      setInitiatives([
        {
          id: '1',
          title: 'Campus Infrastructure & Civic Audit Reform',
          problem_statement: 'Deficiencies in public campus governance, maintenance transparency, and statutory RTI compliance across institutional centers.',
          lead_researcher: 'Swaraj Shandilya',
          stage: 'submitted_to_gov',
          white_paper_url: '/policy',
          impact_summary: 'Drafted Apex Court PIL petition and submitted RTI queries resulting in formal administrative review.'
        }
      ]);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            CIVIC INNOVATION & IMPACT ENGINE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Public Policy Lab</h1>
          <p className="text-gray-400 text-[11px] mt-1">
            End-to-end civic research lifecycle: Problem Identification → White Paper → Policy Adoption.
          </p>
        </div>
        <Link href="/policy" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
          ⚖️ Legal Repository
        </Link>
      </header>

      {/* INITIATIVES FEED */}
      <section className="max-w-7xl mx-auto space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">
          Active Policy Initiatives ({initiatives.length})
        </h2>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading Policy Lab...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initiatives.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 font-bold uppercase">
                    Stage: {item.stage.replace('_', ' ')}
                  </span>
                  <span className="text-gray-500 font-mono">Lead: {item.lead_researcher}</span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-gray-300 text-[11px] leading-relaxed">{item.problem_statement}</p>

                {item.impact_summary && (
                  <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl text-amber-300 text-[10px]">
                    <strong>Impact Outcome:</strong> {item.impact_summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}