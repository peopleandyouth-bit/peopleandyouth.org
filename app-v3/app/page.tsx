'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';

const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";
const RAZORPAY_URL = "https://rzp.io/rzp/gLKmbVf";

const LINKEDIN_URL = "https://www.linkedin.com/company/vidyarthi-nagrik-jan-chetna-manch";
const FACEBOOK_URL = "https://www.facebook.com/share/1ZGB3ZQKqE/";
const YOUTUBE_URL = "https://www.youtube.com/@peopleandyouth";
const INSTAGRAM_URL = "https://www.instagram.com/peopleandyouth";

// INSTITUTIONAL DIRECTORY FOR QUICK SEARCH
const SYSTEM_DIRECTORY = [
  { title: "Supreme Constitution (Volume I)", route: "/constitution", desc: "Founding charter, vision, core values, & civilizational philosophy", category: "Governance" },
  { title: "Careers & Candidate Portal", route: "/careers", desc: "6-step application, 17 domains, district mandates, & ambassador framework", category: "Talent" },
  { title: "Renaissance Policy Journals", route: "/submit-paper", desc: "Open-access peer-review portal for 11 journals & 17 Knowledge Caves", category: "Research" },
  { title: "Rural Governance & Advisory", route: "/rural-consulting", desc: "Panchayati Raj technical assistance, municipal audits, & leadership labs", category: "Consulting" },
  { title: "Universal OS Dashboard", route: "/dashboard", desc: "Central digital HQ, Civic Impact Score ledger, & volunteer tracking", category: "Platform OS" },
  { title: "Public Profiles & Passports", route: "/profile/swarajshandilya", desc: "Sovereign credential cards, verified research, & skills ledger", category: "Identity" },
  { title: "Department Workspaces", route: "/departments/research", desc: "Kanban task boards & project management across 15+ departments", category: "Workspaces" },
  { title: "Private Admin Control Panel", route: "/admin", desc: "Passkey-protected candidate application & passport ledger manager", category: "Admin" },
  { title: "About Mandate & Civic Passport", route: "/about", desc: "3D interactive card, ₹499 Razorpay verification, & institutional charter", category: "Charter" },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const filteredDirectory = searchQuery.trim() === '' 
    ? [] 
    : SYSTEM_DIRECTORY.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      });
      const data = await res.json();
      setAiResponse(data.answer || 'No institutional citation found.');
    } catch (err) {
      setAiResponse('Unable to connect to Institutional Knowledge RAG Engine.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* GLOBAL HEADER */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <Link href="/" className="flex items-center gap-3 shrink-0">
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

          {/* TOP NAV LINKS */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-mono tracking-tight text-gray-300">
            <Link href="/constitution" className="hover:text-amber-300 transition-colors text-amber-400 font-bold">📜 Constitution</Link>
            <Link href="/careers" className="hover:text-cyan-300 transition-colors text-cyan-400 font-bold">💼 Careers</Link>
            <Link href="/submit-paper" className="hover:text-white transition-colors">🔬 Journals</Link>
            <Link href="/rural-consulting" className="hover:text-white transition-colors">🌾 Rural Advisory</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">🖥️ OS HQ</Link>
            <Link href="/admin" className="hover:text-white transition-colors">🔒 Admin</Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <GoogleTranslate />
            <a
              href={RAZORPAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 transform hover:scale-105"
            >
              <span>💳</span>
              <span className="hidden sm:inline">Civic Passport</span> ₹499
            </a>
          </div>
        </div>
      </header>

      {/* HERO & SEARCH ENGINE SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-16">
        
        {/* HERO BANNER */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            GLOBAL CIVIC KNOWLEDGE INSTITUTION
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Building Institutions. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-amber-300">
              Empowering Humanity.
            </span>
          </h1>
          
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            India&apos;s sovereign digital platform for public policy research, empirical governance audits, constitutional literacy, and decentralized civic leadership.
          </p>

          {/* REAL-TIME INSTITUTIONAL SEARCH BAR */}
          <div className="max-w-2xl mx-auto pt-2 relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔎 Direct Jump Search: Type 'Careers', 'Constitution', 'Admin', 'RTI'..."
                className="w-full bg-[#0b1228] border-2 border-cyan-500/50 focus:border-cyan-400 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none shadow-2xl font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-400 hover:text-white"
                >
                  ✖ Clear
                </button>
              )}
            </div>

            {/* SEARCH RESULTS DROPDOWN */}
            {filteredDirectory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#070b19] border-2 border-cyan-400 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto text-left p-2 space-y-1 backdrop-blur-2xl">
                {filteredDirectory.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.route}
                    className="block p-3 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-cyan-500/30"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">{item.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* EMBEDDED ASK PEOPLE & YOUTH AI BOX */}
        <section className="max-w-3xl mx-auto bg-gradient-to-br from-[#0c1638] via-[#070b19] to-[#0a1836] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">INSTITUTIONAL SEARCH ENGINE</span>
              <h3 className="text-lg font-bold text-white">Ask People &amp; Youth AI</h3>
            </div>
            <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono rounded-full">
              RAG Engine v1.0
            </span>
          </div>

          <form onSubmit={handleAiAsk} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask about RTI guidelines, constitutional principles, or research papers..."
              className="flex-1 bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isAiLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs shrink-0 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              {isAiLoading ? 'Searching...' : 'Query AI →'}
            </button>
          </form>

          {aiResponse && (
            <div className="p-4 rounded-xl bg-[#0b1228] border border-cyan-400/30 text-xs text-gray-200 font-mono leading-relaxed space-y-1">
              <span className="text-cyan-400 font-bold block">📜 Institutional AI Response:</span>
              <p>{aiResponse}</p>
            </div>
          )}
        </section>

        {/* MASTER SHOWCASE GRID (ALL 10 MAJOR DEVELOPMENTS) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">COMPLETE PLATFORM MAP</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Explore All Platform Modules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. CONSTITUTION */}
            <Link href="/constitution" className="bg-white/5 border border-amber-500/40 hover:border-amber-400 p-6 rounded-3xl space-y-3 transition-all group shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-3xl">📜</span>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">Governing Charter</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">Supreme Constitution</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Read Volume I of our founding charter establishing institutional vision, values, and civilizational philosophy.
              </p>
              <span className="text-xs font-mono text-amber-400 font-bold block">Open Founding Charter &rarr;</span>
            </Link>

            {/* 2. CAREERS */}
            <Link href="/careers" className="bg-white/5 border border-cyan-500/40 hover:border-cyan-400 p-6 rounded-3xl space-y-3 transition-all group shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-3xl">💼</span>
                <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/30">17 Domains</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">Careers &amp; Opportunities</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                6-step candidate portal for District Coordinators, Youth Ambassadors, Researchers, and Fellows.
              </p>
              <span className="text-xs font-mono text-cyan-400 font-bold block">Apply to Open Roles &rarr;</span>
            </Link>

            {/* 3. RESEARCH */}
            <Link href="/submit-paper" className="bg-white/5 border border-blue-500/40 hover:border-blue-400 p-6 rounded-3xl space-y-3 transition-all group shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-3xl">🔬</span>
                <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">11 Journals</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">Policy Publications</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Open-access research manuscript portal for legal scholars and policy researchers contributing to 17 Knowledge Caves.
              </p>
              <span className="text-xs font-mono text-blue-400 font-bold block">Submit Policy Paper &rarr;</span>
            </Link>

            {/* 4. RURAL CONSULTING */}
            <Link href="/rural-consulting" className="bg-white/5 border border-emerald-500/40 hover:border-emerald-400 p-6 rounded-3xl space-y-3 transition-all group shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-3xl">🌾</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">Advisory</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">Rural Governance</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Panchayati Raj technical assistance, municipal audits, and grassroots district leadership labs.
              </p>
              <span className="text-xs font-mono text-emerald-400 font-bold block">Request Advisory Partnership &rarr;</span>
            </Link>

            {/* 5. OS DASHBOARD */}
            <Link href="/dashboard" className="bg-white/5 border border-cyan-500/40 hover:border-cyan-400 p-6 rounded-3xl space-y-3 transition-all group shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-3xl">🖥️</span>
                <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/30">System OS</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">Universal Dashboard</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Digital headquarters tracking Civic Impact Scores, volunteer hours, and assigned role badges.
              </p>
              <span className="text-xs font-mono text-cyan-400 font-bold block">Enter Dashboard HQ &rarr;</span>
            </Link>

            {/* 6. PUBLIC PROFILES */}
            <Link href="/profile/swarajshandilya" className="bg-white/5 border border-amber-500/40 hover:border-amber-400 p-6 rounded-3xl space-y-3 transition-all group shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-3xl">👤</span>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">Verification</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">Universal Profile &amp; Passport</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Sovereign digital identity card with QR verification, verified research publications, and skills ledger.
              </p>
              <span className="text-xs font-mono text-amber-400 font-bold block">View Public Profile &rarr;</span>
            </Link>

            {/* 7. WORKSPACES */}
            <Link href="/departments/research" className="bg-white/5 border border-purple-500/40 hover:border-purple-400 p-6 rounded-3xl space-y-3 transition-all group shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-3xl">⚙️</span>
                <span className="text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-400/30">Kanban Board</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">Department Workspaces</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Institutional project manager tracking tasks across Editorial, Research, Technology, and Campaigns.
              </p>
              <span className="text-xs font-mono text-purple-400 font-bold block">Open Workspace &rarr;</span>
            </Link>

            {/* 8. ADMIN CONTROL PANEL */}
            <Link href="/admin" className="bg-white/5 border border-red-500/40 hover:border-red-400 p-6 rounded-3xl space-y-3 transition-all group shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-3xl">🔒</span>
                <span className="text-[10px] font-mono uppercase bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full border border-red-400/30">Passkey Access</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-red-300 transition-colors">Admin Control Panel</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Private dashboard to review candidates, view PDF resumes, update review statuses, and inspect issued passports.
              </p>
              <span className="text-xs font-mono text-red-400 font-bold block">Authenticate Admin &rarr;</span>
            </Link>

            {/* 9. CHARTER & PASSPORT */}
            <Link href="/about" className="bg-white/5 border border-cyan-500/40 hover:border-cyan-400 p-6 rounded-3xl space-y-3 transition-all group shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-3xl">🏛️</span>
                <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/30">Mandate</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">About Mandate &amp; Showcase</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Learn about Vidyarthi Nagrik Jan Chetna Manch (VNJCM), inspect our 3D Civic Passport card, and view Knowledge Caves.
              </p>
              <span className="text-xs font-mono text-cyan-400 font-bold block">Read Institutional Mandate &rarr;</span>
            </Link>

          </div>
        </section>

      </div>

      {/* UNIFIED FOOTER */}
      <footer className="border-t border-white/10 bg-[#050814] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={BRAND_LOGO_URL} alt="Brand Logo" className="h-8 w-auto rounded-md" />
                <span className="font-extrabold text-base tracking-tight text-white">
                  People &amp; Youth
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                India&apos;s sovereign digital youth organisation for public policy, empirical research, and institutional accountability.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Portals &amp; Charters</p>
              <ul className="space-y-2 text-xs text-gray-400 font-mono">
                <li><Link href="/about" className="hover:text-white transition-colors">About Mandate</Link></li>
                <li><Link href="/constitution" className="hover:text-amber-300 text-amber-400 font-semibold transition-colors">📜 Supreme Constitution</Link></li>
                <li><Link href="/careers" className="hover:text-cyan-300 text-cyan-400 font-semibold transition-colors">💼 Careers &amp; Roles</Link></li>
                <li><Link href="/submit-paper" className="hover:text-white transition-colors">🔬 Submit Policy Research</Link></li>
                <li><Link href="/rural-consulting" className="hover:text-white transition-colors">🌾 Rural Advisory</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">System OS &amp; Admin</p>
              <ul className="space-y-2 text-xs text-gray-400 font-mono">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">🖥️ Universal OS Dashboard</Link></li>
                <li><Link href="/profile/swarajshandilya" className="hover:text-white transition-colors">👤 Universal Profile</Link></li>
                <li><Link href="/departments/research" className="hover:text-white transition-colors">⚙️ Workspaces</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">🔒 Admin Panel</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Social Network</p>
              <ul className="space-y-2 text-xs text-gray-400 font-mono">
                <li><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn ↗</a></li>
                <li><a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook ↗</a></li>
                <li><a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube ↗</a></li>
                <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram ↗</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-500 font-mono">
            <p>&copy; 2026 People &amp; Youth Digital Institution (VNJCM). All rights reserved.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
