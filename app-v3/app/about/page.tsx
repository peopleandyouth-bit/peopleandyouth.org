'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// DATA STRUCTURES
const MOUNTAINS = [
  { id: 'm1', name: 'Constitutional Literacy', cave: 'Constitution Cave', icon: '📜' },
  { id: 'm2', name: 'Public Policy', cave: 'Policy Cave', icon: '🏛' },
  { id: 'm3', name: 'Education', cave: 'Education Cave', icon: '🎓' },
  { id: 'm4', name: 'Democratic Participation', cave: 'Democracy Cave', icon: '🗳' },
  { id: 'm5', name: 'Governance', cave: 'Urban & Local Governance Cave', icon: '⚙️' },
  { id: 'm6', name: 'Economic Development', cave: 'Economy Cave', icon: '📈' },
  { id: 'm7', name: 'Trade & Commerce', cave: 'Trade Cave', icon: '🌐' },
  { id: 'm8', name: 'Technology & AI', cave: 'Technology & AI Cave', icon: '💻' },
  { id: 'm9', name: 'Climate & Sustainability', cave: 'Climate Cave', icon: '🌱' },
  { id: 'm10', name: 'Agriculture & Food Security', cave: 'Agriculture Cave', icon: '🌾' },
  { id: 'm11', name: 'Healthcare & Public Health', cave: 'Public Health Cave', icon: '🏥' },
  { id: 'm12', name: 'Law & Justice', cave: 'Judiciary Cave', icon: '⚖️' },
  { id: 'm13', name: 'International Relations', cave: 'Foreign Policy Cave', icon: '🗺' },
  { id: 'm14', name: 'Public Administration', cave: 'RTI & Public Finance Cave', icon: '📊' },
  { id: 'm15', name: 'Innovation & Entrepreneurship', cave: 'Startup & Innovation Cave', icon: '💡' },
  { id: 'm16', name: 'Leadership & Ethics', cave: 'Ethics & Civic Leadership Cave', icon: '🛡' },
];

const KNOWLEDGE_CAVES = [
  'Constitution Cave', 'Democracy Cave', 'Education Cave', 'Trade Cave', 
  'Economy Cave', 'Judiciary Cave', 'Election Cave', 'RTI Cave', 
  'Technology Cave', 'Artificial Intelligence Cave', 'Climate Cave', 
  'Agriculture Cave', 'Rural Development Cave', 'Urban Governance Cave', 
  'Public Finance Cave', 'Foreign Policy Cave', 'Social Justice Cave'
];

const RENAISSANCE_PUBLICATIONS = [
  { title: 'Policy Renaissance', tag: 'Flagship Journal', desc: 'Leading open-access scholarship on public administration & governance.' },
  { title: 'Trade Renaissance', tag: 'Specialized Journal', desc: 'Global commerce, tariff policy, and economic integration.' },
  { title: 'Education Renaissance', tag: 'Specialized Journal', desc: 'Higher education readiness, pedagogy, and institutional access.' },
  { title: 'Governance Renaissance', tag: 'Specialized Journal', desc: 'Civil service reform, municipal systems, and administrative efficiency.' },
  { title: 'Constitutional Renaissance', tag: 'Specialized Journal', desc: 'Fundamental rights, judicial precedents, and constitutionalism.' },
  { title: 'Technology Renaissance', tag: 'Specialized Journal', desc: 'AI ethics, digital infrastructure, and sovereign data governance.' },
  { title: 'Healthcare Renaissance', tag: 'Specialized Journal', desc: 'Public health resilience, bioethics, and health economics.' },
  { title: 'Innovation Renaissance', tag: 'Specialized Journal', desc: 'Grassroots innovation, technology transfer, and startup ecosystems.' },
  { title: 'Climate Renaissance', tag: 'Specialized Journal', desc: 'Environmental justice, energy transition, and climate policy.' },
  { title: 'Youth Renaissance', tag: 'Specialized Journal', desc: 'Youth leadership, civic engagement, and student advocacy.' },
  { title: 'International Renaissance', tag: 'Specialized Journal', desc: 'Geopolitics, multilateral diplomacy, and international law.' },
];

const RESEARCH_DIVISIONS = [
  { name: 'Civic Observatory', type: 'Real-time Monitoring', desc: 'Tracking public policy implementation and legislative proceedings live.' },
  { name: 'People\'s Data Lab', type: 'Open Data', desc: 'Crowdsourced datasets, civic audits, and demographic policy analytics.' },
  { name: 'Research Repository', type: 'Peer-Reviewed Archive', desc: 'Centralized database storing thousands of indexed student & scholar papers.' },
  { name: 'Policy Laboratories', type: 'Experimental Labs', desc: 'Simulating policy interventions and regulatory sandbox evaluations.' },
  { name: 'White Papers', type: 'Institutional Statements', desc: 'Authoritative institutional frameworks addressing systemic national challenges.' },
  { name: 'Working Papers', type: 'Early Scholarship', desc: 'In-progress research published to invite constructive peer feedback.' },
  { name: 'Issue Briefs', type: 'Executive Summaries', desc: 'Rapid, concise analyses designed for quick policy-maker comprehension.' },
  { name: 'Legislative Analysis', type: 'Legal Scrutiny', desc: 'Clause-by-clause legal and constitutional evaluation of pending bills.' },
  { name: 'Impact Assessment Studies', type: 'Empirical Audits', desc: 'Field-level evaluations measuring real-world outcomes of government schemes.' },
  { name: 'Public Consultation Papers', type: 'Deliberative Drafts', desc: 'Open feedback papers inviting citizen critique before policy finalization.' },
  { name: 'Open Knowledge Archives', type: 'Public Knowledge Repository', desc: 'Free, un-monetized institutional archives accessible to all citizens globally.' },
];

export default function AboutPage() {
  const [selectedMountain, setSelectedMountain] = useState<string | null>(null);
  const [selectedCave, setSelectedCave] = useState<string | null>(null);

  // Upload Form State
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    author: '',
    email: '',
    targetJournal: 'Policy Renaissance',
    targetCave: 'Constitution Cave',
    abstract: '',
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 5000);
    setUploadFormData({
      title: '',
      author: '',
      email: '',
      targetJournal: 'Policy Renaissance',
      targetCave: 'Constitution Cave',
      abstract: '',
    });
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* HEADER WITH TOP ₹499 PAYMENT BUTTON */}
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

          <div className="flex items-center gap-3 sm:gap-4">
            {/* 499 PAYMENT LINK BUTTON */}
            <Link
              href="/signin?plan=passport"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <span>💳</span>
              <span>Claim Passport (₹499)</span>
            </Link>

            <Link
              href="/signin"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all hidden sm:inline-block"
            >
              Build Civic Profile
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 py-16 w-full flex-1 space-y-28">
        
        {/* PREFACE & INSTITUTIONAL SCRIPT BANNER */}
        <section className="space-y-8 max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            Sovereign Institutional Charter
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Building Institutions. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Empowering Humanity.</span>
          </h1>

          <blockquote className="border-l-4 border-cyan-400 pl-6 my-8 text-left text-gray-300 italic text-base sm:text-lg bg-white/5 p-6 rounded-r-2xl">
            &ldquo;The progress of civilization has never been determined solely by the wealth of nations, the power of governments, or the influence of corporations. It has been shaped by informed citizens, courageous ideas, ethical leadership, and institutions that endure beyond generations.&rdquo;
          </blockquote>

          <div className="text-left space-y-6 text-gray-300 text-sm sm:text-base leading-relaxed">
            <p>
              People &amp; Youth is an independent, non-partisan, and globally inclusive civic knowledge institution founded upon the belief that knowledge is humanity&apos;s greatest public resource and that every individual, irrespective of geography, language, culture, nationality, religion, socioeconomic background, or political identity, deserves an equal opportunity to learn, contribute, lead, and participate in shaping a better future.
            </p>
            <p>
              We are not merely a website, a publication, a campaign, or an organization. We aspire to become an enduring institution dedicated to advancing knowledge, strengthening democratic societies, cultivating ethical leadership, promoting constitutional values, encouraging evidence-based public policy, and creating meaningful opportunities for young people to transform ideas into action.
            </p>
            <p>
              In an era defined by technological revolutions, artificial intelligence, environmental challenges, geopolitical uncertainty, economic transformation, and an unprecedented flow of information, the world&apos;s greatest need is not simply access to knowledge, but institutions capable of transforming knowledge into wisdom, dialogue into cooperation, research into public policy, and aspirations into lasting social progress.
            </p>
            <p className="font-semibold text-cyan-300 text-center text-lg pt-2">
              People &amp; Youth exists to serve that purpose.
            </p>
            <p>
              We envision a world where a first-generation learner in a remote village, a student in a metropolitan university, a researcher in an international laboratory, an entrepreneur building the next generation of technologies, a journalist seeking truth, a policymaker designing institutions, or a citizen committed to public service all find equal dignity within a shared ecosystem of knowledge and civic participation.
            </p>
            <p>
              We reject the notion that opportunity should be determined by privilege or geography. We believe that talent is universally distributed, while access to opportunity is not. Our responsibility is to help narrow that gap by creating an open platform where ideas, evidence, and collaboration become instruments of human progress.
            </p>
            <p>
              Every publication we produce, every research initiative we undertake, every dialogue we facilitate, every fellowship we establish, every campaign we organize, and every partnership we build is guided by one enduring conviction: <strong>institutions become stronger when informed citizens participate responsibly in public life.</strong>
            </p>
          </div>
        </section>

        {/* 💳 FEATURED CIVIC PASSPORT CARD SYSTEM SECTION (HIGH VISIBILITY) */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0c1638] via-[#070b19] to-[#0a1836] border border-cyan-500/50 rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">OFFICIAL CIVIC CREDENTIAL SYSTEM</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Sovereign Civic Passport</h2>
              <p className="text-xs text-gray-300 mt-1">Verified lifetime institutional identity for student researchers &amp; policy advocates.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-400/40">
                Annual Institutional Pass: ₹499
              </span>
              <Link
                href="/signin?plan=passport"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                Get Passport Now &rarr;
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Passport Mock Card */}
            <div className="lg:col-span-6 bg-gradient-to-br from-blue-950/90 via-[#0b132e] to-cyan-950/90 border border-cyan-400/60 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl backdrop-blur-xl group hover:border-cyan-300 transition-all">
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-2.5 py-1 rounded-md text-sm">
                    P&amp;Y
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white tracking-wide">PEOPLE &amp; YOUTH</p>
                    <p className="text-[9px] text-cyan-400 font-mono uppercase tracking-widest">VERIFIED CIVIC PASSPORT</p>
                  </div>
                </div>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-[11px] font-mono px-3 py-1 rounded-full font-bold shadow-md shadow-cyan-500/10">
                  PY-2026-612030
                </span>
              </div>

              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Passport Holder</p>
                  <p className="text-xl font-extrabold text-white">Swaraj Shandilya</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Jurisdiction</p>
                    <p className="font-semibold text-gray-200">Delhi, India</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Institutional Role</p>
                    <p className="font-semibold text-cyan-400">Research Fellow</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">Verification Status</p>
                    <p className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span>✓</span> ACTIVE MEMBER (TIER 1)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">Valid Thru</p>
                    <p className="text-xs font-mono text-gray-200">2026 – 2027</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passport Privileges Breakdown */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Passport Privileges &amp; Institutional Access</h3>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>Priority Peer-Review:</strong> Guaranteed fast-track editorial processing across all 11 Renaissance Publications.</span>
                </li>
                <li className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>VNJCM Leadership Rights:</strong> Vote and lead regional RTI drives, public audits, and municipal governance workshops.</span>
                </li>
                <li className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>People&apos;s Data Lab Access:</strong> Unrestricted download access to open datasets, white papers, and working papers.</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/signin?plan=passport"
                  className="inline-block w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all"
                >
                  Enroll &amp; Generate Your Passport ID (₹499) &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* INSTITUTIONAL ECOSYSTEM DIAGRAM */}
        <section className="bg-gradient-to-br from-blue-950/40 via-[#0a122c] to-cyan-950/40 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">SYSTEM ARCHITECTURE</span>
            <h2 className="text-3xl font-extrabold text-white">Our Institutional Ecosystem</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              People &amp; Youth is designed as a living ecosystem where knowledge, dialogue, research, leadership, and public participation continuously reinforce one another.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <span className="text-2xl">🌍</span>
              <h3 className="text-lg font-bold text-white">People &amp; Youth</h3>
              <p className="text-xs font-mono text-cyan-400">The Global Civic Knowledge Institution</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                The parent institution dedicated to advancing knowledge, democratic participation, constitutional values, youth leadership, interdisciplinary research, civic innovation, and evidence-based public policy.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <span className="text-2xl">🏛</span>
              <h3 className="text-lg font-bold text-white">VNJCM</h3>
              <p className="text-xs font-mono text-cyan-400">The Civic Action Network</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Vidyarthi Nagrik Jan Chetna Manch serves as the civic engagement pillar. Through constitutional awareness, grassroots leadership, and public accountability, it transforms knowledge into action.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <span className="text-2xl">🌲</span>
              <h3 className="text-lg font-bold text-white">Forest of Civic Renaissance</h3>
              <p className="text-xs font-mono text-cyan-400">Intellectual Landscape</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Represents the intellectual landscape housing Mountains of Knowledge and specialized Knowledge Caves where research, learning, and collaboration converge.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <span className="text-2xl">📰</span>
              <h3 className="text-lg font-bold text-white">Dissent Dias</h3>
              <p className="text-xs font-mono text-cyan-400">Public Discourse Platform</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Built upon the conviction that democracy flourishes when disagreement is informed by evidence, expressed with dignity, and guided by constitutional values.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <span className="text-2xl">📚</span>
              <h3 className="text-lg font-bold text-white">Renaissance Publications</h3>
              <p className="text-xs font-mono text-cyan-400">Flagship &amp; Specialized Journals</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Knowledge achieves permanence through publication. Policy Renaissance leads specialized interdisciplinary journals advancing global scholarship.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <span className="text-2xl">🔬</span>
              <h3 className="text-lg font-bold text-white">Research &amp; Open Knowledge</h3>
              <p className="text-xs font-mono text-cyan-400">11 Specialized Research Divisions</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Advancing empirical research through Civic Observatory, People&apos;s Data Lab, Policy Laboratories, Legislative Analysis, and Open Knowledge Archives.
              </p>
            </div>
          </div>
        </section>

        {/* 🏛 VIDYARTHI NAGRIK JAN CHETNA MANCH (VNJCM) SECTION */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">CIVIC ACTION NETWORK</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">🏛 Vidyarthi Nagrik Jan Chetna Manch (VNJCM)</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-400/30">
              Grassroots Civic Pillar
            </span>
          </div>

          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
            <p>
              Vidyarthi Nagrik Jan Chetna Manch (VNJCM) serves as the civic engagement pillar of People &amp; Youth. Through constitutional awareness, grassroots leadership, public accountability, community participation, and civic initiatives, it transforms knowledge into meaningful public action.
            </p>
            <p>
              VNJCM bridges academic policy research with real-world citizens, enabling students and regional youth to lead local RTI drives, conduct municipal performance audits, and foster constitutional literacy across villages, towns, and university campuses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="bg-[#0b1228] p-4 rounded-xl border border-white/5">
              <h4 className="text-sm font-bold text-white">Constitutional Literacy</h4>
              <p className="text-xs text-gray-400 mt-1">Spreading fundamental rights awareness across grassroots communities.</p>
            </div>
            <div className="bg-[#0b1228] p-4 rounded-xl border border-white/5">
              <h4 className="text-sm font-bold text-white">RTI &amp; Accountability Drives</h4>
              <p className="text-xs text-gray-400 mt-1">Filing right to information requests to ensure scheme implementation.</p>
            </div>
            <div className="bg-[#0b1228] p-4 rounded-xl border border-white/5">
              <h4 className="text-sm font-bold text-white">Youth Civic Brigades</h4>
              <p className="text-xs text-gray-400 mt-1">Organizing youth forums to audit public infrastructure and local governance.</p>
            </div>
          </div>
        </section>

        {/* 🌲 THE FOREST OF CIVIC RENAISSANCE: MOUNTAINS & KNOWLEDGE CAVES */}
        <section className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">INTELLECTUAL LANDSCAPE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">🌲 The Forest of Civic Renaissance</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Where Every Path Leads to Knowledge. The Forest represents the intellectual landscape of the institution—a place where every discipline contributes to a deeper understanding of society and every learner can explore new paths of inquiry.
            </p>
          </div>

          {/* Mountains List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⛰</span> The Mountains of Knowledge <span className="text-xs font-normal text-gray-400">(Click a mountain to reveal its Knowledge Cave)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MOUNTAINS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMountain(m.name);
                    setSelectedCave(m.cave);
                  }}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    selectedMountain === m.name
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                  }`}
                >
                  <span className="text-xl mb-2">{m.icon}</span>
                  <div>
                    <p className="text-xs font-bold">{m.name}</p>
                    <p className="text-[10px] text-cyan-400 mt-1 font-mono">→ {m.cave}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Knowledge Caves Repository */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🏞</span> Specialized Knowledge Caves
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Living repositories containing research papers, policy briefs, explainers, open datasets, and case studies.
                </p>
              </div>
              {selectedCave && (
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs border border-cyan-400/40">
                  Selected: {selectedCave}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {KNOWLEDGE_CAVES.map((cave) => (
                <button
                  key={cave}
                  onClick={() => setSelectedCave(cave)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all border ${
                    selectedCave === cave
                      ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                      : 'bg-[#0b1228] text-gray-300 border-white/10 hover:border-white/30'
                  }`}
                >
                  🏞 {cave}
                </button>
              ))}
            </div>

            {selectedCave && (
              <div className="p-4 rounded-xl bg-[#0b1228] border border-cyan-500/30 text-xs space-y-2">
                <p className="font-bold text-cyan-300 font-mono">Currently Exploring: {selectedCave}</p>
                <p className="text-gray-300">
                  This Knowledge Cave functions as a specialized open-access vault hosting verified scholarship, legislative analysis, and empirical datasets for {selectedCave}.
                </p>
                <div className="pt-2 flex gap-3">
                  <a href="#upload-research" className="text-cyan-400 font-bold underline">Submit paper to {selectedCave} &rarr;</a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 📰 DISSENT DIAS SECTION */}
        <section className="bg-gradient-to-br from-blue-950/60 via-[#0a122c] to-cyan-950/60 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">EDITORIAL &amp; DISCOURSE PLATFORM</span>
            <h2 className="text-3xl font-extrabold text-white">📰 Dissent Dias</h2>
            <p className="text-xs text-gray-300 font-mono">Powered by Vidyarthi Nagrik Jan Chetna Manch</p>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            Dissent Dias is our editorial and public discourse platform built upon the conviction that democracy flourishes when disagreement is informed by evidence, expressed with dignity, and guided by constitutional values. It serves as a home for long-form essays, editorials, debates, interviews, public letters, student voices, research reviews, podcasts, multimedia storytelling, and evidence-based public dialogue.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div className="bg-white/5 p-4 rounded-xl text-center">
              <p className="text-sm font-bold text-white">Long-Form Essays</p>
              <p className="text-[10px] text-gray-400 mt-1">Deep policy critiques</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl text-center">
              <p className="text-sm font-bold text-white">Public Debates</p>
              <p className="text-[10px] text-gray-400 mt-1">Evidence-based forums</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl text-center">
              <p className="text-sm font-bold text-white">Student Voices</p>
              <p className="text-[10px] text-gray-400 mt-1">Grassroots perspectives</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl text-center">
              <p className="text-sm font-bold text-white">Policy Podcasts</p>
              <p className="text-[10px] text-gray-400 mt-1">Audio storytelling</p>
            </div>
          </div>
        </section>

        {/* 📚 RENAISSANCE PUBLICATIONS */}
        <section className="space-y-8">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">SCHOLARLY JOURNALS</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">📚 Renaissance Publications</h2>
            <p className="text-xs text-gray-400 mt-1">Knowledge achieves permanence through publication.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RENAISSANCE_PUBLICATIONS.map((pub) => (
              <div key={pub.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-cyan-400/40 transition-all">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold text-white">{pub.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-400/30">
                    {pub.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{pub.desc}</p>
                <div className="pt-2">
                  <a href="#upload-research" className="text-xs font-bold text-cyan-400 hover:underline">
                    Submit Paper to {pub.title} &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🔬 RESEARCH, INNOVATION & PUBLIC KNOWLEDGE (11 DIVISIONS) */}
        <section className="space-y-8">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">RESEARCH INFRASTRUCTURE</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">🔬 Research, Innovation &amp; Public Knowledge</h2>
            <p className="text-xs text-gray-400 mt-1">The institution advances empirical research through 11 dedicated divisions:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {RESEARCH_DIVISIONS.map((div) => (
              <div key={div.name} className="bg-[#0b1228] border border-white/10 rounded-2xl p-6 space-y-3 hover:border-cyan-500/50 transition-all">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-white">{div.name}</h3>
                  <span className="text-[10px] font-mono text-cyan-400">{div.type}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{div.desc}</p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-cyan-300 font-mono">
                    Division Active • Open Access
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* UPLOAD RESEARCH PAPER SECTION */}
        <section id="upload-research" className="bg-gradient-to-br from-blue-950/80 via-[#0a122c] to-cyan-950/80 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">OPEN SCHOLARSHIP PORTAL</span>
            <h2 className="text-3xl font-extrabold text-white">Submit Your Research Paper</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Submit your manuscripts, policy briefs, or working papers to our peer-reviewed Renaissance Publications and Knowledge Caves.
            </p>
          </div>

          {uploadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono">
              ✓ Research paper submitted successfully! Our editorial board will review your manuscript within 5 business days.
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Paper Title *</label>
              <input
                type="text"
                value={uploadFormData.title}
                onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                placeholder="e.g. Constitutional Morality in Digital Public Infrastructure"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Primary Author Name *</label>
              <input
                type="text"
                value={uploadFormData.author}
                onChange={(e) => setUploadFormData({ ...uploadFormData, author: e.target.value })}
                placeholder="e.g. Dr. Ananya Sharma"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Author Email *</label>
              <input
                type="email"
                value={uploadFormData.email}
                onChange={(e) => setUploadFormData({ ...uploadFormData, email: e.target.value })}
                placeholder="author@institution.org"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Target Renaissance Journal *</label>
              <select
                value={uploadFormData.targetJournal}
                onChange={(e) => setUploadFormData({ ...uploadFormData, targetJournal: e.target.value })}
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                {RENAISSANCE_PUBLICATIONS.map((pub) => (
                  <option key={pub.title} value={pub.title}>{pub.title}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Target Knowledge Cave *</label>
              <select
                value={uploadFormData.targetCave}
                onChange={(e) => setUploadFormData({ ...uploadFormData, targetCave: e.target.value })}
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                {KNOWLEDGE_CAVES.map((cave) => (
                  <option key={cave} value={cave}>{cave}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Abstract / Summary *</label>
              <textarea
                rows={4}
                value={uploadFormData.abstract}
                onChange={(e) => setUploadFormData({ ...uploadFormData, abstract: e.target.value })}
                placeholder="Provide a concise 150-250 word summary of your research methodology, empirical findings, and policy recommendations..."
                className="w-full bg-[#070b19] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all"
              >
                Submit Paper for Review &rarr;
              </button>
            </div>
          </form>
        </section>

        {/* 🎓 LEADERSHIP & LEARNING & 🤝 GLOBAL PARTICIPATION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
            <span className="text-2xl">🎓</span>
            <h3 className="text-2xl font-bold text-white">Leadership &amp; Learning</h3>
            <p className="text-xs font-mono text-cyan-400">Knowledge finds its highest purpose when it develops people.</p>
            <p className="text-xs text-gray-300 leading-relaxed">
              People &amp; Youth nurtures future leaders through: Constitutional Academy, Leadership Institute, Public Policy School, Civic Innovation Labs, Research Fellowships, Editorial Fellowships, Campus Chapters, Mentorship Programmes, and Global Youth Networks.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
            <span className="text-2xl">🤝</span>
            <h3 className="text-2xl font-bold text-white">Global Participation</h3>
            <p className="text-xs font-mono text-cyan-400">Vasudhaiva Kutumbakam — The World is One Family</p>
            <p className="text-xs text-gray-300 leading-relaxed">
              This institution welcomes every individual who believes that ideas can improve society. Whether you are a student, researcher, educator, entrepreneur, policymaker, journalist, artist, or technologist, there is a meaningful place for you within this ecosystem.
            </p>
          </div>
        </section>

        {/* OUR GUIDING PHILOSOPHY & VISION */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Our Guiding Philosophy</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                The moral foundation of People &amp; Youth is inspired by the timeless Indian civilizational ideal of <strong>&ldquo;Vasudhaiva Kutumbakam&rdquo;</strong> — &ldquo;The World is One Family.&rdquo;
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                It reminds us that while humanity speaks different languages and lives under different governments, our aspirations remain similar. Every individual seeks dignity, opportunity, knowledge, justice, security, and the freedom to contribute meaningfully to society.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Our Mission &amp; Vision</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                <strong>Mission:</strong> To empower individuals through knowledge, cultivate ethical leadership, advance evidence-based research, strengthen democratic institutions, promote constitutional values, and create opportunities for every young person to participate meaningfully.
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                <strong>Vision:</strong> To become one of the world&apos;s most trusted independent civic knowledge institutions — connecting research with policy, education with leadership, and dialogue with democracy.
              </p>
            </div>
          </div>
        </section>

        {/* AN INVITATION TO BUILD */}
        <section className="text-center bg-gradient-to-r from-blue-950 via-[#0a122c] to-cyan-950 border border-cyan-500/40 rounded-3xl p-8 sm:p-14 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">An Invitation to Build</h2>
          <p className="text-gray-300 text-sm max-w-2xl mx-auto leading-relaxed">
            People &amp; Youth is not an institution we ask you to join; it is a shared endeavour we invite you to build. Together, let us build more than an organization. Let us build an ecosystem where curiosity becomes knowledge, knowledge becomes wisdom, wisdom becomes public service, and public service strengthens humanity.
          </p>
          <div className="pt-2">
            <p className="text-cyan-400 font-bold text-base">
              Welcome to People &amp; Youth — at the heart of change 💙.
            </p>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        <p>&copy; 2026 People &amp; Youth Digital Institution. All rights reserved.</p>
      </footer>
    </main>
  );
}