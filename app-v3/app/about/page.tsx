'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* Header */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-3 py-1.5 rounded-lg text-lg tracking-wider">
              P&amp;Y
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                People &amp; Youth
              </span>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mt-0.5">
                Digital Institution
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all"
            >
              Build Civic Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-16 w-full flex-1 space-y-24">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <span className="inline-block px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Institutional Mandate &amp; Sovereign Charter
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Bridging Rigorous Policy Research, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Public Accountability</span>, and Youth Empowerment
          </h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
            People &amp; Youth is India&apos;s sovereign digital youth institution. We provide a non-partisan, decentralized platform designed to equip young citizens, scholars, and professionals with verified civic identities, peer-reviewed policy journals, and institutional transparency mechanisms.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/10 text-center">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-2xl font-extrabold text-cyan-400">100%</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">Non-Partisan Rigor</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-2xl font-extrabold text-cyan-400">Verified</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">Civic Passports</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-2xl font-extrabold text-cyan-400">Open</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">Policy Journals</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-2xl font-extrabold text-cyan-400">Action</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">RTI &amp; Audit Tools</p>
            </div>
          </div>
        </section>

        {/* VISUAL ARCHITECTURE DIAGRAM & WORKFLOW */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">Institutional Workflow Architecture</h2>
            <p className="text-sm text-gray-400 mt-2">
              From individual onboarding to systemic governance reform—how our ecosystem connects research to action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:border-cyan-400/50 transition-all group">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold font-mono text-sm flex items-center justify-center">
                    01
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">ONBOARDING</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">Civic Identity &amp; Passport</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Establish a verified digital profile. Each member receives a unique Civic Passport ID (<span className="font-mono text-cyan-400">PY-2026-XXXXXX</span>) mapping their geographic jurisdiction, academic background, and primary policy focus.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-gray-400">
                Outcomes: Verified Profile • Regional Mapping
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:border-blue-400/50 transition-all group">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold font-mono text-sm flex items-center justify-center">
                    02
                  </span>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">SCHOLARSHIP</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Peer-Reviewed Journals</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Publish open-access research papers, legal briefs, and policy commentaries through our editorial boards. Papers undergo structured peer review to ensure analytical precision and empirical integrity.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-gray-400">
                Outcomes: Academic Submissions • Policy Publications
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:border-cyan-400/50 transition-all group">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold font-mono text-sm flex items-center justify-center">
                    03
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">DELIBERATION</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">Dissent Dias &amp; Dialogue</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Participate in structured, high-order deliberative forums. Members engage in respectful, constitutional-first debates analyzing legislative proposals, public finance, and institutional reforms.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-gray-400">
                Outcomes: Policy Debates • Position Statements
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:border-blue-400/50 transition-all group">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold font-mono text-sm flex items-center justify-center">
                    04
                  </span>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">ACCOUNTABILITY</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Grassroots Action &amp; RTI</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Convert research findings into legal accountability. Leverage Right to Information (RTI) monitoring, institutional readiness audits, and public consulting to challenge administrative opacity.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-gray-400">
                Outcomes: Filed RTIs • Public Audit Reports
              </div>
            </div>

          </div>
        </section>

        {/* CORE POLICY DISCIPLINES */}
        <section className="space-y-8">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">RESEARCH DISCIPLINE MAP</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Key Focus Areas</h2>
            </div>
            <p className="text-xs text-gray-400 max-w-sm">
              Our research ecosystem spans key domains essential for sustainable governance and economic resilience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="text-cyan-400 font-bold text-lg">01. Public Policy &amp; Constitutional Rights</div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Analyzing legislative drafts, fundamental rights compliance, constitutional machinery, and public administration transparency.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="text-cyan-400 font-bold text-lg">02. Higher Education &amp; Due Diligence</div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Auditing institutional readiness, statutory approvals, campus infrastructure, and academic integrity across higher education programs.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="text-cyan-400 font-bold text-lg">03. Right to Information (RTI)</div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Utilizing the RTI framework to request public data, evaluate scheme implementations, and enforce government accountability.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="text-cyan-400 font-bold text-lg">04. Technology, AI &amp; Governance</div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Evaluating digital public infrastructure, artificial intelligence regulation, privacy laws, and sovereign data governance.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="text-cyan-400 font-bold text-lg">05. Economic Trade &amp; Public Finance</div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Monitoring public expenditure, Comptroller and Auditor General (CAG) reports, skill development funding, and international trade policy.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="text-cyan-400 font-bold text-lg">06. Rural Development &amp; Urban Systems</div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Grassroots consulting, local body governance, municipal accountability, and sustainable rural economic planning.
              </p>
            </div>
          </div>
        </section>

        {/* INSTITUTIONAL CHARTER & PHILOSOPHY */}
        <section className="bg-gradient-to-br from-blue-950/60 via-[#0a122c] to-cyan-950/60 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-10">
          <div className="max-w-3xl space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">OUR GOVERNANCE PHILOSOPHY</span>
            <h2 className="text-3xl font-extrabold text-white">The People &amp; Youth Institutional Charter</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              We stand for systemic integrity, analytical independence, and democratic empowerment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            <div className="space-y-3 border-l-2 border-cyan-400 pl-5">
              <h3 className="text-lg font-bold text-white">Sovereign Youth Representation</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Youth must not merely be consumers of policy—they must be active architects. We provide the institutional infrastructure to turn student perspectives into formally published policy position papers.
              </p>
            </div>

            <div className="space-y-3 border-l-2 border-blue-400 pl-5">
              <h3 className="text-lg font-bold text-white">Evidence Over Rhetoric</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                All submissions, debates, and public statements must be backed by empirical data, legal precedents, official audit reports, or primary documentation obtained through transparent inquiry.
              </p>
            </div>

            <div className="space-y-3 border-l-2 border-cyan-400 pl-5">
              <h3 className="text-lg font-bold text-white">Institutional Accountability</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Whether monitoring public expenditure under government schemes or verifying statutory compliance for educational programs, we advocate for total operational and financial transparency.
              </p>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION & ONBOARDING PROMPT */}
        <section className="text-center bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-14 space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Claim Your Official Civic Passport</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Become part of India&apos;s digital youth network. Establish your verified profile, submit policy research, and contribute to public accountability.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/signin"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all"
            >
              Build Your Civic Profile &rarr;
            </Link>
            <Link
              href="/submit-paper"
              className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 font-bold text-sm transition-all"
            >
              Submit Research Paper
            </Link>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        <p>&copy; 2026 People &amp; Youth Digital Institution. All rights reserved.</p>
      </footer>
    </main>
  );
}