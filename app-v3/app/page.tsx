'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* HEADER & NAVIGATION BAR */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
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

          {/* Desktop Navigation Routes */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link 
              href="/about" 
              className="hover:text-cyan-400 transition-colors py-1 border-b-2 border-transparent hover:border-cyan-400"
            >
              About Mandate
            </Link>
            <Link 
              href="/submit-paper" 
              className="hover:text-cyan-400 transition-colors py-1 border-b-2 border-transparent hover:border-cyan-400"
            >
              Policy Journals
            </Link>
            <Link 
              href="/rural-consulting" 
              className="hover:text-cyan-400 transition-colors py-1 border-b-2 border-transparent hover:border-cyan-400"
            >
              Rural Consulting
            </Link>
            <Link 
              href="/editorial-policy" 
              className="hover:text-cyan-400 transition-colors py-1 border-b-2 border-transparent hover:border-cyan-400"
            >
              Editorial Standards
            </Link>
          </nav>

          {/* CTA Action Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all"
            >
              Build Civic Profile
            </Link>
          </div>

        </div>
      </header>

      {/* MAIN HOME PAGE CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1 space-y-28">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Sovereign Digital Youth Platform
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            India&apos;s Independent Platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Public Policy Research</span> &amp; Governance
          </h1>
          
          <p className="text-gray-300 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto">
            Empowering students, researchers, and young advocates to publish peer-reviewed policy briefs, conduct institutional audits, and claim verified digital Civic Passports.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/signin"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all text-center"
            >
              Generate Civic Passport &rarr;
            </Link>
            
            <Link
              href="/about"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 font-bold text-sm transition-all text-center"
            >
              Explore Institutional Charter
            </Link>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-white/10 text-center">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <p className="text-3xl font-extrabold text-cyan-400">Non-Partisan</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Civic Rigor</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <p className="text-3xl font-extrabold text-cyan-400">Verified</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Civic Passports</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <p className="text-3xl font-extrabold text-cyan-400">Peer-Reviewed</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Policy Journals</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <p className="text-3xl font-extrabold text-cyan-400">Direct</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">RTI &amp; Audit Action</p>
            </div>
          </div>
        </section>

        {/* CORE INSTITUTIONAL PILLARS */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">SYSTEM ARCHITECTURE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How People &amp; Youth Operates</h2>
            <p className="text-sm text-gray-400">
              A four-tier decentralized framework built for academic integrity and public accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-400/50 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold font-mono text-base flex items-center justify-center">
                  01
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">Civic Passports</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Establish a verified digital passport mapping your district, educational background, and policy interests for national youth collaboration.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/signin" className="text-xs font-bold text-cyan-400 hover:underline">
                  Get Verified &rarr;
                </Link>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-400/50 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold font-mono text-base flex items-center justify-center">
                  02
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Policy Publications</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Submit open-access research papers, legal commentaries, and economic analyses to our peer-reviewed policy journals.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/submit-paper" className="text-xs font-bold text-blue-400 hover:underline">
                  Submit Research &rarr;
                </Link>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-400/50 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold font-mono text-base flex items-center justify-center">
                  03
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">Dissent Dias</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Engage in structured, constitutional debates addressing public finance, institutional readiness, and administrative reforms.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/about" className="text-xs font-bold text-cyan-400 hover:underline">
                  Read Charter &rarr;
                </Link>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-400/50 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold font-mono text-base flex items-center justify-center">
                  04
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Rural Consulting</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Connecting policy scholars with grassroots rural governance, municipal planning, and local development programs.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/rural-consulting" className="text-xs font-bold text-blue-400 hover:underline">
                  Explore Consulting &rarr;
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* DETAILED ABOUT MANDATE HIGHLIGHT CARD */}
        <section className="bg-gradient-to-br from-blue-950/60 via-[#0a122c] to-cyan-950/60 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">ABOUT PEOPLE &amp; YOUTH</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Institutional Transparency &amp; Rigorous Public Accountability
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                We believe that democracy thrives when youth transition from passive onlookers to active policy architects. From evaluating Right to Information (RTI) implementation to auditing campus readiness in higher education, our institution empowers young citizens with verified evidence.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-block px-6 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs sm:text-sm hover:bg-cyan-500/30 transition-all"
                >
                  Read Full Institutional Mandate &amp; Workflow &rarr;
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 text-center">
              <div className="text-cyan-400 font-bold text-lg">Quick Mandate Links</div>
              <div className="flex flex-col gap-2.5 text-xs">
                <Link href="/about" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 transition-all text-left flex justify-between items-center">
                  <span>Institutional Workflow</span>
                  <span className="text-cyan-400">&rarr;</span>
                </Link>
                <Link href="/editorial-policy" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 transition-all text-left flex justify-between items-center">
                  <span>Editorial Guidelines</span>
                  <span className="text-cyan-400">&rarr;</span>
                </Link>
                <Link href="/privacy" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 transition-all text-left flex justify-between items-center">
                  <span>Privacy Policy</span>
                  <span className="text-cyan-400">&rarr;</span>
                </Link>
                <Link href="/terms" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 transition-all text-left flex justify-between items-center">
                  <span>Terms of Use</span>
                  <span className="text-cyan-400">&rarr;</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="text-center bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-14 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Take Your Place in Policy Governance?
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto leading-relaxed">
            Create your profile, claim your sovereign Civic Passport ID, and contribute to public policy research today.
          </p>
          <div className="pt-2">
            <Link
              href="/signin"
              className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all"
            >
              Build Your Civic Profile Now &rarr;
            </Link>
          </div>
        </section>

      </div>

      {/* FOOTER WITH COMPLETE ROUTE MAP */}
      <footer className="border-t border-white/10 bg-[#050814] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-2.5 py-1 rounded-lg text-base">
                  P&amp;Y
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  People &amp; Youth
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                India&apos;s sovereign digital youth institution for public policy, empirical research, and institutional accountability.
              </p>
            </div>

            {/* Institution Column */}
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Institution</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Mandate</Link></li>
                <li><Link href="/signin" className="hover:text-white transition-colors">Civic Passport</Link></li>
                <li><Link href="/submit-paper" className="hover:text-white transition-colors">Submit Policy Research</Link></li>
                <li><Link href="/rural-consulting" className="hover:text-white transition-colors">Rural Consulting</Link></li>
              </ul>
            </div>

            {/* Legal & Compliance Column */}
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Governance</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/editorial-policy" className="hover:text-white transition-colors">Editorial Guidelines</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Contact / Portal Column */}
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Civic Access</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Access your member dashboard or register for a verified Civic Passport ID.
              </p>
              <Link href="/signin" className="inline-block text-xs font-bold text-cyan-400 underline">
                Member Sign In Portal &rarr;
              </Link>
            </div>

          </div>

          <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-500">
            <p>&copy; 2026 People &amp; Youth Digital Institution. All rights reserved.</p>
          </div>

        </div>
      </footer>

    </main>
  );
}