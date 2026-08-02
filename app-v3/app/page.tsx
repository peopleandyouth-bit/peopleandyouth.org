'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// CONSTANT ASSETS & URLS
const RAZORPAY_URL = "https://rzp.io/rzp/gLKmbVf";
const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";
const INSTA_QR_URL = "https://i.postimg.cc/pd7M9jTk/Insta-VNJCM.jpg";
const WHATSAPP_QR_URL = "https://i.postimg.cc/bY1fJshc/Whatsapp-VNJCM.jpg";
const YOUTUBE_QR_URL = "https://i.postimg.cc/FHT448Qm/You-Tube-VNJCM.jpg";

const LINKEDIN_URL = "https://www.linkedin.com/company/vidyarthi-nagrik-jan-chetna-manch";
const FACEBOOK_URL = "https://www.facebook.com/share/1ZGB3ZQKqE/";
const YOUTUBE_URL = "https://www.youtube.com/@peopleandyouth";
const INSTAGRAM_URL = "https://www.instagram.com/peopleandyouth";

export default function HomePage() {
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* HEADER & NAVIGATION BAR */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src={BRAND_LOGO_URL} 
              alt="People & Youth Logo" 
              className="h-10 w-auto rounded-lg object-contain bg-white/10 p-1 border border-white/20"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                People &amp; Youth
              </span>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mt-0.5">
                Digital Institution
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/about" className="hover:text-cyan-400 transition-colors">
              About Mandate
            </Link>
            <Link href="/submit-paper" className="hover:text-cyan-400 transition-colors">
              Policy Journals
            </Link>
            <Link href="/rural-consulting" className="hover:text-cyan-400 transition-colors">
              Rural Consulting
            </Link>
            <Link href="/editorial-policy" className="hover:text-cyan-400 transition-colors">
              Editorial Standards
            </Link>
          </nav>

          {/* Direct Razorpay Checkout Header Button */}
          <div className="flex items-center gap-3">
            <a
              href={RAZORPAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 transform hover:scale-105"
            >
              <span>💳</span>
              <span>Claim Passport <span className="line-through text-black/60 text-[11px]">₹1,000</span> ₹499</span>
            </a>
          </div>

        </div>
      </header>

      {/* MAIN HOME CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-24">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Sovereign Digital Youth Platform
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            India&apos;s Sovereign Platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">Public Policy Research</span> &amp; Governance
          </h1>
          
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
            Empowering students, researchers, and young advocates to publish peer-reviewed policy briefs, conduct institutional audits, and claim verified digital Civic Passports.
          </p>

          {/* KEY METRICS BANNER */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/10 text-center">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">Non-Partisan</p>
              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Civic Rigor</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">Verified</p>
              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Civic Passports</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">Peer-Reviewed</p>
              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Policy Journals</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">Direct</p>
              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">RTI &amp; Audit Action</p>
            </div>
          </div>
        </section>

        {/* 🏆 SHOWROOM SPOTLIGHT: 3D FLIPPING CIVIC PASSPORT SHOWCASE */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0c1638] via-[#070b19] to-[#0a1836] border-2 border-cyan-500/50 rounded-3xl p-8 sm:p-14 shadow-[0_0_60px_rgba(6,182,212,0.2)] space-y-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                <span>🔥</span> FEATURED EDITION • SPECIAL SHOWROOM DISPLAY
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">The Sovereign Civic Passport</h2>
              <p className="text-xs text-gray-300 mt-1">Verified lifetime digital credential mapping your jurisdiction &amp; policy contributions.</p>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="text-right">
                <span className="text-[10px] text-amber-300 uppercase font-mono font-bold block">Exclusive Inaugural Offer</span>
                <span className="line-through text-gray-400 text-xs mr-1.5">₹1,000</span>
                <span className="text-2xl font-extrabold text-amber-400">₹499</span>
                <span className="text-[10px] text-emerald-400 font-bold block">✓ Lifetime Free Access</span>
              </div>
              <a
                href={RAZORPAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105"
              >
                Claim (₹499) &rarr;
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* 3D FLIPPING CARD COMPONENT */}
            <div className="lg:col-span-6 space-y-4">
              <div 
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="group [perspective:1000px] w-full max-w-md mx-auto h-[290px] cursor-pointer"
              >
                <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isCardFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-blue-950/95 via-[#0b132e] to-cyan-950/95 border-2 border-cyan-400/70 rounded-2xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl group-hover:border-cyan-300">
                    
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img 
                          src={BRAND_LOGO_URL} 
                          alt="Logo" 
                          className="h-9 w-auto rounded-md object-contain bg-white/10 p-0.5 border border-white/20"
                        />
                        <div>
                          <p className="text-xs font-extrabold text-white tracking-wider">PEOPLE &amp; YOUTH</p>
                          <p className="text-[9px] text-cyan-400 font-mono uppercase tracking-widest">SOVEREIGN CIVIC PASSPORT</p>
                        </div>
                      </div>

                      <span className="bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-mono px-2.5 py-1 rounded-full font-bold">
                        ~~₹1,000~~ ₹499
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">Civic Passport Holder</p>
                        <p className="text-xl font-extrabold text-white tracking-wide">Swaraj Shandilya</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest">Jurisdiction</p>
                          <p className="font-semibold text-gray-200">Delhi, India</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest">Passport ID</p>
                          <p className="font-mono text-cyan-300 font-bold">PY-2026-612030</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                      <p className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <span>✓</span> VERIFIED TIER 1 FELLOW
                      </p>
                      <p className="text-[10px] font-mono text-cyan-400 italic">Click card to flip 🔄</p>
                    </div>

                  </div>

                  {/* BACK SIDE (PERMANENT QR CODES) */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-[#0a122c] via-[#070b19] to-blue-950 border-2 border-amber-400/70 rounded-2xl p-5 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
                    
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <img src={BRAND_LOGO_URL} alt="Logo" className="h-6 w-auto" />
                        <span className="text-[10px] font-mono font-bold text-gray-200">OFFICIAL VERIFICATION SEAL</span>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400">peopleandyouth.org</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center my-2">
                      <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex flex-col items-center">
                        <img src={INSTA_QR_URL} alt="Instagram QR" className="h-16 w-16 rounded-md object-cover mb-1 border border-white/20" />
                        <span className="text-[9px] font-bold text-pink-400 font-mono">Instagram</span>
                      </div>

                      <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex flex-col items-center">
                        <img src={WHATSAPP_QR_URL} alt="WhatsApp QR" className="h-16 w-16 rounded-md object-cover mb-1 border border-white/20" />
                        <span className="text-[9px] font-bold text-emerald-400 font-mono">WhatsApp</span>
                      </div>

                      <div className="bg-white/5 p-2 rounded-xl border border-white/10 flex flex-col items-center">
                        <img src={YOUTUBE_QR_URL} alt="YouTube QR" className="h-16 w-16 rounded-md object-cover mb-1 border border-white/20" />
                        <span className="text-[9px] font-bold text-red-400 font-mono">YouTube</span>
                      </div>
                    </div>

                    <div className="text-[9px] text-gray-400 text-center font-mono border-t border-white/10 pt-2">
                      Sovereign Document Issued by Vidyarthi Nagrik Jan Chetna Manch (VNJCM) • Non-Transferable
                    </div>

                  </div>

                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline font-bold"
                >
                  🔄 Toggle Preview (Front Identity / Back QR Codes)
                </button>
              </div>
            </div>

            {/* KEY PASSPORT PRIVILEGES */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Showroom Privileges &amp; Institutional Perks</h3>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong>Lifetime Free Access:</strong> One-time ₹499 payment (strikethrough offer from ~~₹1,000~~) with zero annual recurring fees.</span>
                </li>
                <li className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>Priority Peer-Review:</strong> Fast-track evaluation across all 11 Renaissance Publications.</span>
                </li>
                <li className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>VNJCM Leadership Network:</strong> Direct leadership rights for grassroots RTI monitoring &amp; civic audits.</span>
                </li>
              </ul>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={RAZORPAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105"
                >
                  Pay ₹499 &amp; Claim Passport Now &rarr;
                </a>
                <Link
                  href="/about"
                  className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 font-bold text-sm text-center transition-all"
                >
                  Explore Institutional Mandate
                </Link>
              </div>
            </div>

          </div>

        </section>

        {/* SYSTEM ARCHITECTURE / FOUR PILLARS */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">SYSTEM ARCHITECTURE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How People &amp; Youth Operates</h2>
            <p className="text-sm text-gray-400">
              A four-tier decentralized framework built for academic integrity and public accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-400/50 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold font-mono text-base flex items-center justify-center">
                  01
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">Civic Passports</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Establish a verified digital passport mapping your district, educational background, and policy interests.
                </p>
              </div>
              <div className="pt-6">
                <a href={RAZORPAY_URL} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-400 hover:underline">
                  Claim for ₹499 &rarr;
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-400/50 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold font-mono text-base flex items-center justify-center">
                  02
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Policy Publications</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Submit open-access research papers, legal commentaries, and economic analyses to peer-reviewed journals.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/about#upload-research" className="text-xs font-bold text-blue-400 hover:underline">
                  Submit Research &rarr;
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-400/50 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold font-mono text-base flex items-center justify-center">
                  03
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">Dissent Dias</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Engage in structured, constitutional debates addressing public finance, institutional readiness, and reforms.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/about" className="text-xs font-bold text-cyan-400 hover:underline">
                  Read Charter &rarr;
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-400/50 transition-all group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold font-mono text-base flex items-center justify-center">
                  04
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Rural Consulting</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Connecting policy scholars with grassroots rural governance, municipal planning, and local development.
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

        {/* DETAILED INSTITUTIONAL MANDATE HIGHLIGHT CARD */}
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

      </div>

      {/* FULL 4-COLUMN FOOTER WITH LEGAL & SOCIAL LINKS */}
      <footer className="border-t border-white/10 bg-[#050814] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={BRAND_LOGO_URL} alt="Brand Logo" className="h-8 w-auto rounded-md" />
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

            {/* Governance & Legal Column */}
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Governance &amp; Legal</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/editorial-policy" className="hover:text-white transition-colors">Editorial Guidelines</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Social Network Column */}
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Social Network</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn ↗</a></li>
                <li><a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook ↗</a></li>
                <li><a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube ↗</a></li>
                <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram ↗</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-500">
            <p>&copy; 2026 People &amp; Youth Digital Institution (VNJCM). All rights reserved.</p>
          </div>

        </div>
      </footer>

    </main>
  );
}