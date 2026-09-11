'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type ApplicationResponse = {
  success?: boolean;
  status?: string;
  message?: string;
  error?: string;
};

const platformMetrics = [
  ['Articles', '5'],
  ['Journals', '18'],
  ['Knowledge Caves', '18'],
  ['Consultants', '150'],
  ['Institutional Partners', '5'],
  ['Applicants', '600+'],
  ['Contributors', '20+'],
  ['Social Reach', '1,000+'],
];

const architecture = [
  {
    number: '01',
    title: 'People & Youth',
    label: 'CURRENT',
    text: 'Institutional umbrella and digital platform infrastructure.',
  },
  {
    number: '02',
    title: 'Trust',
    label: 'PLANNED',
    text: 'Public-interest, philanthropic and civic mandates.',
  },
  {
    number: '03',
    title: 'Enterprise',
    label: 'VISION',
    text: 'Commercial ventures, advisory and professional services.',
  },
  {
    number: '04',
    title: 'Citizenship',
    label: 'VISION',
    text: 'Public participation, readership and civic engagement.',
  },
];

const useOfFunds = [
  ['Platform & Technology', '30%'],
  ['Talent & Institutions', '25%'],
  ['Research & Knowledge', '20%'],
  ['Market Development', '15%'],
  ['Operations & Governance', '10%'],
];

export default function InvestorRelationsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ApplicationResponse | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [investorType, setInvestorType] = useState('Angel');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [proposedTicket, setProposedTicket] = useState('');

  function openAccess() {
    setResult(null);
    setModalOpen(true);
  }

  function closeAccess() {
    if (submitting) return;
    setModalOpen(false);
    setResult(null);
  }

  async function handleApply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName.trim() || !email.trim()) return;

    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/investors/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          organization,
          investorType,
          linkedinUrl,
          proposedTicket,
        }),
      });

      const data = (await response.json()) as ApplicationResponse;

      if (!response.ok && !data.success) {
        setResult({
          success: false,
          status: data.status,
          error: data.error || data.message || 'Unable to submit the request.',
        });
        return;
      }

      setResult(data);
    } catch {
      setResult({
        success: false,
        error: 'Unable to connect to the investor application service.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-amber-400 selection:text-black">

      {/* ─────────────────────────────────────────────────────────────
          NOTICE
      ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-amber-400/20 bg-amber-400/[0.06] px-6 py-2.5 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300">
          Pre-incorporation investor communication · Expressions of interest only · Not an offer of securities
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          NAVIGATION
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 transition group-hover:scale-125" />
            <span className="text-xs font-black uppercase tracking-[0.22em]">
              People & Youth
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <a
              href="#thesis"
              className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400 transition hover:text-white md:block"
            >
              Thesis
            </a>

            <a
              href="#platform"
              className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400 transition hover:text-white md:block"
            >
              Platform
            </a>

            <button
              onClick={openAccess}
              className="rounded-full bg-amber-400 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-black transition hover:bg-amber-300"
            >
              Request Access
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          HERO
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(251,191,36,0.10),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 lg:px-10 lg:pb-32 lg:pt-32">
          <div className="max-w-5xl">
            <p className="mb-7 text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
              01 / Institutional Prospectus
            </p>

            <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.045em] sm:text-7xl lg:text-[7.5rem]">
              Building
              <br />
              Institutions.
            </h1>

            <p className="mt-8 max-w-3xl font-serif text-xl italic leading-8 text-neutral-300 sm:text-2xl">
              Building generations. At the heart of change.
            </p>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">
              People & Youth is building an institutional ecosystem connecting
              people, knowledge, participation, opportunity and markets.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={openAccess}
                className="rounded-full bg-amber-400 px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:bg-amber-300"
              >
                Explore the Opportunity
              </button>

              <a
                href="#thesis"
                className="rounded-full border border-white/20 px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:border-white/50"
              >
                Read the Thesis
              </a>
            </div>
          </div>

          <div className="mt-20 grid border-t border-white/10 pt-6 sm:grid-cols-3">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                Current Stage
              </p>
              <p className="mt-2 text-sm font-semibold">
                Pre-incorporation / Building
              </p>
            </div>

            <div className="mt-5 sm:mt-0">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                Proposed Raise
              </p>
              <p className="mt-2 text-sm font-semibold">₹5 Crore</p>
            </div>

            <div className="mt-5 sm:mt-0">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                Current Round
              </p>
              <p className="mt-2 text-sm font-semibold text-amber-400">
                Exploring
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          THESIS
      ───────────────────────────────────────────────────────────── */}
      <section id="thesis" className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            02 / Investment Thesis
          </p>

          <blockquote className="mt-8 max-w-5xl border-l border-amber-400 pl-7 font-serif text-2xl italic leading-10 text-neutral-200 sm:text-4xl sm:leading-[1.25]">
            We believe institutions are the most enduring form of social
            change — and that the next generation deserves institutions built
            with participation, trust and imagination at their core.
          </blockquote>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PROBLEM
      ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
                03 / The Problem
              </p>

              <h2 className="mt-5 text-4xl font-black uppercase tracking-tight sm:text-5xl">
                A fragmented
                <br />
                continuum.
              </h2>
            </div>

            <div>
              <p className="max-w-2xl text-lg leading-8 text-neutral-400">
                Society has people, ideas, aspirations and resources — but
                lacks enough trusted institutions capable of connecting them.
              </p>

              <div className="mt-10 grid grid-cols-2 border-l border-t border-white/10 sm:grid-cols-5">
                {['People', 'Knowledge', 'Institutions', 'Opportunity', 'Markets'].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="border-b border-r border-white/10 p-5"
                    >
                      <span className="text-[9px] font-mono text-amber-400">
                        0{index + 1}
                      </span>
                      <p className="mt-6 text-xs font-bold uppercase">
                        {item}
                      </p>
                      <p className="mt-2 text-[9px] uppercase tracking-wider text-neutral-600">
                        Disconnected
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PLATFORM
      ───────────────────────────────────────────────────────────── */}
      <section id="platform" className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            04 / The Platform
          </p>

          <div className="mt-6 max-w-4xl">
            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
              One ecosystem.
              <br />
              Multiple bridges.
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-neutral-400">
              People & Youth is designed to connect participation, knowledge,
              professional expertise, institutional capacity and economic
              opportunity into one continuously expanding ecosystem.
            </p>
          </div>

          <div className="mt-16 grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['01', 'People', 'Youth leaders, professionals, citizens and emerging talent.'],
              ['02', 'Knowledge', 'Research, journals, essays, knowledge systems and ideas.'],
              ['03', 'Institutions', 'Experts, consultants, organisations and institutional partners.'],
              ['04', 'Opportunity', 'Projects, markets, careers, advisory and economic participation.'],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="min-h-[240px] border-b border-r border-white/10 p-7"
              >
                <span className="text-[9px] font-mono text-amber-400">
                  {number}
                </span>

                <h3 className="mt-14 text-xl font-bold uppercase">{title}</h3>

                <p className="mt-4 text-sm leading-6 text-neutral-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FIRST WEDGE
      ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            05 / First Wedge
          </p>

          <div className="mt-7 grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Youth is the
              <br />
              entry point.
            </h2>

            <div>
              <p className="text-lg leading-8 text-neutral-400">
                Our first wedge is the institutional and professional
                ecosystem around young talent — connecting people to knowledge,
                experts, opportunities and markets.
              </p>

              <p className="mt-6 text-lg leading-8 text-neutral-400">
                The long-term opportunity extends beyond youth. Youth is where
                the ecosystem begins, not where it ends.
              </p>

              <div className="mt-10 flex flex-wrap gap-2">
                {[
                  'Youth Leaders',
                  'Experts',
                  'Research',
                  'Institutions',
                  'Markets',
                  'Opportunities',
                ].map((item) => (
                  <span
                    key={item}
                    className="border border-white/10 px-4 py-2 text-[9px] font-mono uppercase tracking-wider text-neutral-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          ARCHITECTURE
      ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            06 / Institutional Architecture
          </p>

          <h2 className="mt-6 text-4xl font-black uppercase tracking-tight sm:text-6xl">
            One vision.
            <br />
            Multiple institutions.
          </h2>

          <div className="mt-14 grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {architecture.map((item) => (
              <div
                key={item.number}
                className="border-b border-r border-white/10 p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-amber-400">
                    {item.number}
                  </span>

                  <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-500">
                    {item.label}
                  </span>
                </div>

                <h3 className="mt-16 text-lg font-bold uppercase">
                  {item.title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-neutral-500">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TRACTION
      ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            07 / What Has Been Built
          </p>

          <h2 className="mt-6 text-4xl font-black uppercase tracking-tight sm:text-6xl">
            Infrastructure
            <br />
            already in motion.
          </h2>

          <div className="mt-14 grid grid-cols-2 border-l border-t border-white/10 sm:grid-cols-4">
            {platformMetrics.map(([label, value]) => (
              <div
                key={label}
                className="border-b border-r border-white/10 p-6 sm:p-8"
              >
                <p className="text-3xl font-black tracking-tight text-amber-400 sm:text-4xl">
                  {value}
                </p>
                <p className="mt-3 text-[9px] font-mono uppercase tracking-[0.16em] text-neutral-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CAPITAL
      ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            08 / Capital Strategy
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="border border-amber-400/30 bg-amber-400/[0.04] p-8">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                Target Raise
              </p>
              <p className="mt-5 text-5xl font-black text-amber-400">
                ₹5 Crore
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Current status: Exploring
              </p>
            </div>

            <div className="border border-white/10 p-8">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                Indicative Ticket
              </p>
              <p className="mt-5 text-3xl font-black">
                ₹50K — ₹10L
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Investor participation range
              </p>
            </div>

            <div className="border border-white/10 p-8">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                Valuation
              </p>
              <p className="mt-5 text-3xl font-black">
                To be determined
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Subject to institutional structuring
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          USE OF FUNDS
      ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            09 / Proposed Use of Funds
          </p>

          <div className="mt-10 max-w-4xl border-t border-white/10">
            {useOfFunds.map(([label, percentage]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-white/10 py-5"
              >
                <span className="text-sm text-neutral-300">{label}</span>
                <span className="font-mono text-sm font-bold text-amber-400">
                  {percentage}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FOUNDER
      ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            10 / Founder's Thesis
          </p>

          <blockquote className="mt-8 max-w-5xl font-serif text-2xl italic leading-10 text-neutral-200 sm:text-4xl">
            People & Youth should not merely be participating in the change
            around us. It should be one of the institutions helping organise
            it.
          </blockquote>

          <p className="mt-8 text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-600">
            — Founder's Office · People & Youth
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10 lg:py-32">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400">
            Institutional Access
          </p>

          <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-black uppercase tracking-tight sm:text-6xl">
            Interested in building with us?
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-neutral-500">
            Request investor access to begin the institutional review process
            and receive access to materials as they become available.
          </p>

          <button
            onClick={openAccess}
            className="mt-9 rounded-full bg-amber-400 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-amber-300"
          >
            Request Investor Access
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-[9px] font-mono uppercase tracking-[0.16em] text-neutral-600 sm:flex-row">
          <span>People & Youth</span>
          <span>Investor Relations · Confidential Materials</span>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          ACCESS MODAL
      ───────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/90 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-xl border border-white/10 bg-[#0b0b0b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400">
                  Investor Relations
                </p>
                <h3 className="mt-1 text-sm font-bold uppercase tracking-wider">
                  Request Data Room Access
                </h3>
              </div>

              <button
                onClick={closeAccess}
                className="text-xs text-neutral-500 transition hover:text-white"
              >
                Close
              </button>
            </div>

            {result ? (
              <div className="px-6 py-12 text-center">
                {result.success ? (
                  <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 text-emerald-400">
                      ✓
                    </div>

                    <h4 className="mt-6 text-lg font-bold uppercase">
                      {result.status === 'APPROVED'
                        ? 'Access Already Approved'
                        : 'Application Received'}
                    </h4>

                    <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-500">
                      {result.message ||
                       '... Your investor access request has been recorded and will be reviewed by the Founder\'s Office.'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-400/30 text-red-400">
                      !
                    </div>

                    <h4 className="mt-6 text-lg font-bold uppercase">
                      Unable to Submit
                    </h4>

                    <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-500">
                      {result.error || result.message}
                    </p>

                    <button
                      onClick={() => setResult(null)}
                      className="mt-7 rounded-full border border-white/20 px-6 py-3 text-[10px] font-bold uppercase tracking-wider"
                    >
                      Try Again
                    </button>
                  </>
                )}

                <button
                  onClick={closeAccess}
                  className="mt-8 text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-5 px-6 py-7">
                <div>
                  <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    className="w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(event) => setOrganization(event.target.value)}
                      className="w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                      Investor Type
                    </label>
                    <select
                      value={investorType}
                      onChange={(event) => setInvestorType(event.target.value)}
                      className="w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-amber-400"
                    >
                      <option value="Angel">Angel Investor</option>
                      <option value="VC">Venture Capital</option>
                      <option value="Family Office">Family Office</option>
                      <option value="Institutional">Institutional</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                      Proposed Ticket (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={proposedTicket}
                      onChange={(event) => setProposedTicket(event.target.value)}
                      placeholder="50000"
                      className="w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(event) => setLinkedinUrl(event.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="border-t border-white/10 pt-5">
                  <p className="text-[9px] leading-5 text-neutral-600">
                    Submission does not constitute an investment commitment,
                    securities offer or binding agreement. Investor access is
                    subject to institutional verification and approval.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-400 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Submitting Request...' : 'Submit Access Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
