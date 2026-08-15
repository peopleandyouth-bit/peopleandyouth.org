'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function InvestorRelationsPage() {
  const [cmsConfig, setCmsConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Application Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [investorType, setInvestorType] = useState('Angel');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [proposedTicket, setProposedTicket] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    const { data } = await supabase
      .from('investor_cms_config')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setCmsConfig(data);
    }
    setLoading(false);
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email) return;

    setSubmitting(true);
    const { error } = await supabase.from('investor_profiles').insert({
      full_name: fullName,
      email,
      phone: phone || null,
      organization: organization || null,
      investor_type: investorType,
      linkedin_url: linkedinUrl || null,
      proposed_ticket_inr: proposedTicket ? Number(proposedTicket) : null,
      verification_status: 'PENDING',
      access_level: 'REGISTERED'
    });

    setSubmitting(false);
    if (error) {
      alert('Application error: ' + error.message);
    } else {
      setSubmitted(true);
    }
  }

  const metrics = cmsConfig?.platform_metrics || {};
  const funds = cmsConfig?.use_of_funds || {};

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* LEGAL DISCLAIMER BANNER */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-center text-[11px] text-amber-300 font-mono">
        ⚖️ PRE-INCORPORATION PROSPECTUS • Expressions of interest only. Not an offer of securities or legally binding investment solicitation.
      </div>

      {/* NAVIGATION */}
      <header className="border-b border-gray-800/80 bg-[#070b19]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
          <span className="text-sm font-black tracking-widest uppercase text-white">PEOPLE & YOUTH</span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded transition"
          >
            Request Access
          </button>
        </div>
      </header>

      {/* 01 — HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 space-y-6">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">01 / INSTITUTIONAL PROSPECTUS</span>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none">
          PEOPLE & YOUTH
        </h1>
        <p className="text-xl md:text-2xl font-serif text-gray-300 italic">
          Building Institutions. Building Generations. At the heart of change.
        </p>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl font-sans">
          "An emerging institutional ecosystem connecting people, knowledge, participation, opportunity and markets."
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-widest rounded transition"
          >
            Explore the Opportunity
          </button>
          <a
            href="#thesis"
            className="px-6 py-3 border border-gray-700 hover:border-amber-400 text-gray-300 text-xs font-bold uppercase tracking-widest rounded transition"
          >
            Partner With Us
          </a>
        </div>
      </section>

      {/* 02 — INVESTMENT THESIS */}
      <section id="thesis" className="border-t border-gray-800/60 bg-[#070b19] py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">02 / INVESTMENT THESIS</span>
          <blockquote className="text-lg md:text-2xl font-serif text-amber-100/90 italic leading-relaxed border-l-2 border-amber-400 pl-6 py-2">
            "We believe institutions are the most enduring form of social change—and that the next generation deserves institutions built with participation, trust, and imagination at their core."
          </blockquote>
        </div>
      </section>

      {/* 03 — THE PROBLEM */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">03 / THE PROBLEM</span>
          <h2 className="text-2xl font-black text-white uppercase mt-1">Fragmented Continuum</h2>
          <p className="text-sm text-gray-400 mt-2">
            "The problem is that society has people, ideas, aspirations and resources—but lacks enough trusted institutions capable of connecting them."
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          {['People', 'Knowledge', 'Institutions', 'Opportunity', 'Markets'].map((item, idx) => (
            <div key={idx} className="p-4 bg-[#070b19] border border-gray-800 rounded-lg">
              <span className="text-xs font-mono text-amber-400 block">0{idx + 1}</span>
              <span className="text-sm font-bold text-white mt-1 block uppercase">{item}</span>
              <span className="text-[10px] text-red-400 mt-1 block">Disconnected</span>
            </div>
          ))}
        </div>
      </section>

      {/* 04 — EXISTING SYSTEM vs P&Y */}
      <section className="bg-[#070b19] border-y border-gray-800/60 py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">04 / THE EXISTING SYSTEM</span>
            <p className="text-sm text-gray-300 mt-2">
              "The world currently solves it through fragmented institutions—each built to address a particular need, but seldom designed to connect participation, knowledge, opportunity and markets into one continuum."
            </p>
          </div>
          <div className="p-6 bg-[#030611] border border-amber-500/20 rounded-xl space-y-4 text-center">
            <div className="flex flex-wrap justify-center gap-2 text-xs font-mono text-gray-400">
              <span>Government</span> • <span>Education</span> • <span>NGOs</span> • <span>Consulting</span> • <span>Media</span> • <span>Business</span> • <span>Academia</span>
            </div>
            <div className="text-amber-400 text-sm font-bold">↓ Fragmented Outcomes</div>
            <div className="pt-2 border-t border-gray-800 text-emerald-400 font-bold text-sm uppercase">
              People & Youth is designed to connect the continuum.
            </div>
          </div>
        </div>
      </section>

      {/* 05 — WHAT WE ARE BUILDING */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">05 / WHAT WE ARE BUILDING</span>
        <h2 className="text-2xl font-black text-white uppercase">Autonomous Institutional Ecosystem</h2>
        <p className="text-sm md:text-base text-gray-300 leading-relaxed font-serif">
          "We are building an autonomous institutional ecosystem that connects people, knowledge, participation, opportunity and markets—turning fragmented aspirations into organised action and creating the bridges through which individuals, communities and institutions can build and prosper together."
        </p>
      </section>

      {/* 06 — FIRST WEDGE */}
      <section className="bg-[#070b19] border-y border-gray-800/60 py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">06 / FIRST WEDGE</span>
          <p className="text-sm text-gray-300">
            "Our first wedge is the institutional and professional ecosystem around young talent—connecting people to knowledge, experts, opportunities and markets, while giving institutions a trusted channel to discover, engage and build with the next generation."
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs text-center font-mono">
            <div className="p-3 bg-[#030611] border border-gray-800 rounded">Youth Leaders</div>
            <div className="p-3 bg-[#030611] border border-gray-800 rounded">Experts & Consultants</div>
            <div className="p-3 bg-[#030611] border border-gray-800 rounded">Research & Knowledge</div>
            <div className="p-3 bg-[#030611] border border-gray-800 rounded">Institutions</div>
            <div className="p-3 bg-[#030611] border border-amber-500/40 text-amber-400 font-bold rounded">Markets & Opportunities</div>
          </div>
          <p className="text-xs font-mono text-gray-400 text-center">Note: Youth is the entry point, NOT the ceiling.</p>
        </div>
      </section>

      {/* 07 — INSTITUTIONAL ARCHITECTURE */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">07 / INSTITUTIONAL ARCHITECTURE</span>
          <h2 className="text-2xl font-black text-white uppercase mt-1">ONE VISION. MULTIPLE INSTITUTIONS.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-[#070b19] border border-gray-800 rounded-xl space-y-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">CURRENT</span>
            <h3 className="text-sm font-bold text-white uppercase">PEOPLE & YOUTH</h3>
            <p className="text-xs text-gray-400">Institutional Umbrella & Platform Infrastructure</p>
          </div>
          <div className="p-5 bg-[#070b19] border border-gray-800 rounded-xl space-y-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">PLANNED</span>
            <h3 className="text-sm font-bold text-white uppercase">TRUST</h3>
            <p className="text-xs text-gray-400">Public Interest & Philanthropic Mandates</p>
          </div>
          <div className="p-5 bg-[#070b19] border border-gray-800 rounded-xl space-y-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">VISION</span>
            <h3 className="text-sm font-bold text-white uppercase">ENTERPRISE</h3>
            <p className="text-xs text-gray-400">Commercial Ventures & Advisory Services</p>
          </div>
          <div className="p-5 bg-[#070b19] border border-gray-800 rounded-xl space-y-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">VISION</span>
            <h3 className="text-sm font-bold text-white uppercase">CITIZENSHIP</h3>
            <p className="text-xs text-gray-400">Public Participation & Reader Dispatches</p>
          </div>
        </div>
      </section>

      {/* 13 — WHAT WE HAVE BUILT (DYNAMIC METRICS) */}
      <section className="bg-[#070b19] border-y border-gray-800/60 py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">13 / WHAT WE HAVE BUILT</span>
            <h2 className="text-2xl font-black text-white uppercase mt-1">Platform Infrastructure & Metrics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#030611] border border-gray-800 rounded-lg">
              <span className="text-xs font-mono text-gray-400 uppercase block">Articles</span>
              <span className="text-2xl font-black text-amber-400">{metrics.articles ?? 5}</span>
            </div>
            <div className="p-4 bg-[#030611] border border-gray-800 rounded-lg">
              <span className="text-xs font-mono text-gray-400 uppercase block">Journals</span>
              <span className="text-2xl font-black text-amber-400">{metrics.journals ?? 18}</span>
            </div>
            <div className="p-4 bg-[#030611] border border-gray-800 rounded-lg">
              <span className="text-xs font-mono text-gray-400 uppercase block">Knowledge Caves</span>
              <span className="text-2xl font-black text-amber-400">{metrics.knowledge_caves ?? 18}</span>
            </div>
            <div className="p-4 bg-[#030611] border border-gray-800 rounded-lg">
              <span className="text-xs font-mono text-gray-400 uppercase block">Consultants</span>
              <span className="text-2xl font-black text-amber-400">{metrics.consultants ?? 150}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 14 — CAPITAL ASK */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">14 / CAPITAL ASK</span>
          <h2 className="text-2xl font-black text-white uppercase mt-1">Fundraising Parameters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#070b19] border border-amber-500/30 rounded-xl space-y-2">
            <span className="text-xs font-mono text-gray-400 uppercase block">Target Raise</span>
            <span className="text-3xl font-black text-amber-400">
              ₹{cmsConfig?.target_raise_inr ? (cmsConfig.target_raise_inr / 10000000).toFixed(1) + ' Crore' : '5.0 Crore'}
            </span>
            <span className="text-[10px] text-gray-400 block font-mono">Status: {cmsConfig?.round_status || 'Exploring'}</span>
          </div>
          <div className="p-6 bg-[#070b19] border border-gray-800 rounded-xl space-y-2">
            <span className="text-xs font-mono text-gray-400 uppercase block">Ticket Size Range</span>
            <span className="text-xl font-bold text-white">
              ₹{cmsConfig?.min_ticket_inr ? Number(cmsConfig.min_ticket_inr).toLocaleString() : '50,000'} – ₹{cmsConfig?.max_ticket_inr ? Number(cmsConfig.max_ticket_inr).toLocaleString() : '10,000,00'}
            </span>
          </div>
          <div className="p-6 bg-[#070b19] border border-gray-800 rounded-xl space-y-2">
            <span className="text-xs font-mono text-gray-400 uppercase block">Valuation</span>
            <span className="text-xl font-bold text-amber-400">{cmsConfig?.valuation_status || 'Not determined'}</span>
            <span className="text-[10px] text-gray-400 block font-mono">Target Closing: {cmsConfig?.closing_date || '2027-08-20'}</span>
          </div>
        </div>
      </section>

      {/* 15 — USE OF FUNDS */}
      <section className="bg-[#070b19] border-y border-gray-800/60 py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">15 / USE OF FUNDS</span>
            <h2 className="text-2xl font-black text-white uppercase mt-1">Proposed Capital Allocation Matrix</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {Object.entries(funds).map(([key, val]: [string, any]) => (
              <div key={key} className="p-3 bg-[#030611] border border-gray-800 rounded">
                <span className="font-mono text-gray-400 uppercase block">{key.replace('_', ' ')}</span>
                <span className="text-lg font-bold text-amber-400">{val}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 17 — FOUNDER'S THESIS */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-6">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">17 / FOUNDER'S THESIS</span>
        <blockquote className="text-base md:text-lg font-serif text-gray-200 leading-relaxed border-l-2 border-amber-400 pl-6 py-2">
          "People & Youth should not merely be participating in the change around us. It should be one of the institutions helping organise it."
        </blockquote>
      </section>

      {/* INVESTOR ACCESS REQUEST MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#070b19] border border-amber-500/30 rounded-xl p-6 max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase">REQUEST DATA ROOM ACCESS</h3>
              <button onClick={() => { setModalOpen(false); setSubmitted(false); }} className="text-gray-400 hover:text-white text-xs">✕ Close</button>
            </div>

            {submitted ? (
              <div className="p-6 text-center space-y-3">
                <span className="text-emerald-400 font-bold text-sm block">✓ Verification Application Received</span>
                <p className="text-xs text-gray-300">Your investor access request has been recorded. Once verified by the Founder's Office, access permissions will be granted.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1">Full Name *</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-[#030611] border border-gray-800 p-2 rounded text-white outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1">Email Address *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#030611] border border-gray-800 p-2 rounded text-white outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1">Organization / Entity</label>
                  <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full bg-[#030611] border border-gray-800 p-2 rounded text-white outline-none focus:border-amber-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase mb-1">Investor Type</label>
                    <select value={investorType} onChange={(e) => setInvestorType(e.target.value)} className="w-full bg-[#030611] border border-gray-800 p-2 rounded text-white outline-none">
                      <option value="Angel">Angel Investor</option>
                      <option value="VC">Venture Capital</option>
                      <option value="Family Office">Family Office</option>
                      <option value="Institutional">Institutional</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase mb-1">Proposed Ticket (₹)</label>
                    <input type="number" value={proposedTicket} onChange={(e) => setProposedTicket(e.target.value)} placeholder="e.g. 50000" className="w-full bg-[#030611] border border-gray-800 p-2 rounded text-white outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider rounded transition">
                  {submitting ? 'Submitting...' : 'Submit Access Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}