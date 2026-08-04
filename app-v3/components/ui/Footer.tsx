'use client';

import React from 'react';
import Link from 'next/link';

const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050814] text-white font-mono text-xs pt-16 pb-12 selection:bg-cyan-500 selection:text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* TOP BRAND & SLOGAN ROW */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-10">
          <div className="flex items-center gap-3">
            <img src={BRAND_LOGO_URL} alt="Logo" className="h-10 w-auto rounded-lg object-contain bg-white/10 p-1 border border-white/20" />
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">People &amp; Youth</span>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mt-0.5 block">Digital Institution &amp; Sovereign Platform</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs max-w-md font-sans">
            विद्यार्थी नागरिक जन चेतना मंच — Empowering youth leadership, empirical research, grassroots transparency, and constitutional morality.
          </p>
        </div>

        {/* 6-COLUMN INSTITUTIONAL NAVIGATION TREE */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          
          {/* COLUMN 1: INSTITUTIONAL IDENTITY */}
          <div className="space-y-3">
            <h4 className="text-cyan-400 font-bold uppercase text-[11px] tracking-wider border-b border-cyan-500/30 pb-2">Institution</h4>
            <ul className="space-y-2 text-gray-300 font-sans text-xs">
              <li><Link href="/about" className="hover:text-cyan-300 transition-colors">About &amp; Mandate</Link></li>
              <li><Link href="/constitution" className="hover:text-amber-300 transition-colors">📜 Constitution</Link></li>
              <li><Link href="/passports" className="hover:text-cyan-300 transition-colors">Civic Passports</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-300 transition-colors">Universal OS HQ</Link></li>
              <li><Link href="/admin/cims" className="hover:text-cyan-300 transition-colors">CIMS Asset Suite</Link></li>
            </ul>
          </div>

          {/* COLUMN 2: KNOWLEDGE VAULT */}
          <div className="space-y-3">
            <h4 className="text-cyan-400 font-bold uppercase text-[11px] tracking-wider border-b border-cyan-500/30 pb-2">Knowledge Vault</h4>
            <ul className="space-y-2 text-gray-300 font-sans text-xs">
              <li><Link href="/mountains" className="hover:text-cyan-300 transition-colors">🏔️ 4 Mountain Ranges</Link></li>
              <li><Link href="/caves" className="hover:text-cyan-300 transition-colors">🏛️ 17 Knowledge Caves</Link></li>
              <li><Link href="/research" className="hover:text-cyan-300 transition-colors">Empirical Datasets</Link></li>
              <li><Link href="/upload" className="hover:text-cyan-300 transition-colors">Document Hub</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: ACADEMIC & PUBLICATIONS */}
          <div className="space-y-3">
            <h4 className="text-cyan-400 font-bold uppercase text-[11px] tracking-wider border-b border-cyan-500/30 pb-2">Publications</h4>
            <ul className="space-y-2 text-gray-300 font-sans text-xs">
              <li><Link href="/journals" className="hover:text-cyan-300 transition-colors">14 Renaissance Journals</Link></li>
              <li><Link href="/dissent-dias" className="hover:text-amber-300 transition-colors">Dissent Dias Forum</Link></li>
              <li><Link href="/submit-paper" className="hover:text-cyan-300 transition-colors">Submit Manuscript</Link></li>
              <li><Link href="/essay" className="hover:text-cyan-300 transition-colors">Essay Submissions</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: GOVERNANCE & OMBUDSMAN */}
          <div className="space-y-3">
            <h4 className="text-cyan-400 font-bold uppercase text-[11px] tracking-wider border-b border-cyan-500/30 pb-2">Governance</h4>
            <ul className="space-y-2 text-gray-300 font-sans text-xs">
              <li><Link href="/advisory" className="hover:text-cyan-300 transition-colors">14 Advisory Divisions</Link></li>
              <li><Link href="/transparency" className="hover:text-cyan-300 transition-colors">Transparency Scorecards</Link></li>
              <li><Link href="/admin/grievance" className="hover:text-cyan-300 transition-colors">Ombudsman Desk</Link></li>
              <li><Link href="/districts" className="hover:text-cyan-300 transition-colors">District Command</Link></li>
            </ul>
          </div>

          {/* COLUMN 5: OPPORTUNITIES & TALENT */}
          <div className="space-y-3">
            <h4 className="text-cyan-400 font-bold uppercase text-[11px] tracking-wider border-b border-cyan-500/30 pb-2">Opportunities</h4>
            <ul className="space-y-2 text-gray-300 font-sans text-xs">
              <li><Link href="/fellowships" className="hover:text-cyan-300 transition-colors">Fellowships &amp; Grants</Link></li>
              <li><Link href="/careers" className="hover:text-cyan-300 transition-colors">ATS Careers Portal</Link></li>
              <li><Link href="/internships" className="hover:text-cyan-300 transition-colors">National Internships</Link></li>
              <li><Link href="/events" className="hover:text-cyan-300 transition-colors">Summits &amp; Assemblies</Link></li>
            </ul>
          </div>

          {/* COLUMN 6: MEMBERSHIP & LEGAL DISCLOSURES */}
          <div className="space-y-3">
            <h4 className="text-cyan-400 font-bold uppercase text-[11px] tracking-wider border-b border-cyan-500/30 pb-2">Membership &amp; Legal</h4>
            <ul className="space-y-2 text-gray-300 font-sans text-xs">
              <li><Link href="/sign-in" className="hover:text-emerald-300 font-bold text-emerald-400 transition-colors">🔑 Sovereign Sign-In</Link></li>
              <li><Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-gray-300 transition-colors">Legal Disclosures</Link></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT & DIGITAL SEAL */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-gray-500 text-[11px] gap-4">
          <p>&copy; 2026 People &amp; Youth Digital Institution (peopleandyouth.org). All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400 font-mono text-[10px]">
            <span>Cryptographic Digital Seal: <strong className="text-cyan-400">0x8F92...SEAL</strong></span>
            <span>•</span>
            <span>Version 10.0 Sovereign Standard</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
