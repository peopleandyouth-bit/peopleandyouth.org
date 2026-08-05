'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ApplyButton } from '@/components/OpportunityApplyEngine';

export default function GlobalCareersAndLeadershipPortal() {
  const [activeTab, setActiveTab] = useState<'framework' | 'workflow' | 'life' | 'dashboard'>('framework');
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ALL 13 DIVISIONS & 140+ VERBATIM ROLES
  const divisionsData = [
    {
      division: 'Executive Leadership',
      category: 'Core Executive Board',
      roles: [
        'Founder & Chief Executive Officer',
        'Chief Operating Officer',
        'Chief Strategy Officer',
        'Chief Financial Officer',
        'Chief Technology Officer',
        'Chief Research Officer',
        'Chief Editorial Officer',
        'Chief Growth Officer',
        'Chief Partnerships Officer',
        'Chief Communications Officer',
        'Chief Legal & Governance Officer',
        'Chief Human Resources Officer'
      ]
    },
    {
      division: 'Institution Development & Advisory',
      category: 'People & Youth Advisory',
      roles: [
        'Strategy Consultant',
        'Public Policy Consultant',
        'Market Entry Consultant',
        'CSR Consultant',
        'Institutional Development Consultant',
        'Governance Consultant',
        'Research Consultant',
        'Economic Development Consultant',
        'Rural Transformation Consultant',
        'Education Consultant'
      ]
    },
    {
      division: 'Research & Knowledge',
      category: 'People & Youth Research Institute',
      roles: [
        'Research Associate',
        'Senior Research Associate',
        'Policy Analyst',
        'Economist',
        'Data Analyst',
        'Statistical Researcher',
        'Monitoring & Evaluation Specialist',
        'Knowledge Curator',
        'Research Fellow',
        'Senior Fellow',
        'Distinguished Fellow'
      ]
    },
    {
      division: 'Editorial & Publications',
      category: 'Dissent Dias & Renaissance Series',
      roles: [
        'Editor-in-Chief (Dissent Dias)',
        'Managing Editor (Dissent Dias)',
        'Editorial Associate (Dissent Dias)',
        'Copy Editor (Dissent Dias)',
        'Investigative Writer (Dissent Dias)',
        'Feature Writer (Dissent Dias)',
        'Opinion Columnist (Dissent Dias)',
        'Podcast Producer (Dissent Dias)',
        'Multimedia Journalist (Dissent Dias)',
        'Journal Editor (Renaissance Series)',
        'Peer Review Coordinator (Renaissance Series)',
        'Academic Editor (Renaissance Series)',
        'Publication Manager (Renaissance Series)',
        'Citation Specialist (Renaissance Series)',
        'Production Editor (Renaissance Series)',
        'Editorial Reviewer (Renaissance Series)'
      ]
    },
    {
      division: 'Technology & AI',
      category: 'Institution Technology Division',
      roles: [
        'Software Engineer',
        'Full Stack Developer',
        'Backend Engineer',
        'Frontend Engineer',
        'AI Engineer',
        'Machine Learning Engineer',
        'DevOps Engineer',
        'Cloud Engineer',
        'UI/UX Designer',
        'Product Designer',
        'QA Engineer',
        'Cybersecurity Engineer',
        'Database Architect',
        'Product Manager'
      ]
    },
    {
      division: 'Business & Growth',
      category: 'Growth Division',
      roles: [
        'Business Development Manager',
        'Strategic Partnerships Lead',
        'Sales Manager',
        'Marketing Manager',
        'Growth Marketing Associate',
        'Digital Marketing Specialist',
        'Brand Strategist',
        'Corporate Relations Manager',
        'Sponsorship Manager',
        'CRM Specialist',
        'Community Growth Manager'
      ]
    },
    {
      division: 'Finance & Investments',
      category: 'Finance Division',
      roles: [
        'Finance Associate',
        'Financial Analyst',
        'Investment Research Associate',
        'Treasury Associate',
        'Accounts Executive',
        'Grants & Funding Manager',
        'CSR Partnerships Manager'
      ]
    },
    {
      division: 'Operations',
      category: 'Operations Division',
      roles: [
        'Operations Manager',
        'Project Manager',
        'Programme Manager',
        'Event Manager',
        'Logistics Coordinator',
        'Procurement Executive',
        'Administration Executive'
      ]
    },
    {
      division: 'Human Capital',
      category: 'Talent & Culture',
      roles: [
        'Talent Acquisition Associate',
        'HR Business Partner',
        'Learning & Development Manager',
        'Volunteer Coordinator',
        'Fellowship Manager',
        'Leadership Development Manager'
      ]
    },
    {
      division: 'Legal & Governance',
      category: 'Legal & Compliance Division',
      roles: [
        'Legal Associate',
        'Compliance Officer',
        'Governance Analyst',
        'Contracts Manager',
        'Intellectual Property Associate'
      ]
    },
    {
      division: 'Communications',
      category: 'Media & Public Relations',
      roles: [
        'Public Relations Manager',
        'Media Relations Officer',
        'Government Relations Associate',
        'Communications Specialist',
        'Speech Writer',
        'Social Media Manager',
        'Graphic Designer',
        'Motion Graphics Designer',
        'Video Editor'
      ]
    },
    {
      division: 'Leadership Network',
      category: 'District, State, National, Global & Campus Networks',
      roles: [
        'District Coordinator',
        'District Research Lead',
        'District Outreach Lead',
        'District Partnerships Lead',
        'State Director',
        'State Operations Manager',
        'State Research Coordinator',
        'State Partnerships Lead',
        'National Programme Director',
        'National Research Director',
        'National Editorial Director',
        'Country Director (Global Chapters)',
        'Regional Director (Global Chapters)',
        'Continental Director (Global Chapters)',
        'Global Council Member',
        'Campus Ambassador',
        'Campus President',
        'Campus Research Lead',
        'Campus Editorial Lead',
        'Campus Events Lead',
        'Campus Technology Lead'
      ]
    },
    {
      division: 'Fellowships & Internships',
      category: 'Special Programmes',
      roles: [
        'Public Policy Fellowship',
        'Leadership Fellowship',
        'Research Fellowship',
        'Editorial Fellowship',
        'Technology Fellowship',
        'Rural Innovation Fellowship',
        'Governance Fellowship',
        'Market Intelligence Fellowship',
        'Strategy Internship',
        'Marketing Internship',
        'Finance Internship',
        'Consulting Internship',
        'Research Internship',
        'Editorial Internship',
        'Product Internship',
        'AI Internship',
        'Operations Internship',
        'HR Internship'
      ]
    }
  ];

  // 17-LINK NAVIGATION STRUCTURE
  const navStructure = [
    'Explore Opportunities', 'Early Careers', 'Experienced Professionals', 'Fellowships', 
    'Campus Leadership', 'Global Chapters', 'Consulting Network', 'Editorial Board', 
    'Research Network', 'Volunteer Corps', 'Internship Programme', 'Youth Ambassador Programme', 
    'District Leadership Programme', 'Country Leadership Programme', 'Life at People & Youth', 
    'Hiring Process', 'Candidate Dashboard'
  ];

  // 9-STAGE HIRING WORKFLOW
  const workflowSteps = [
    { num: '01', title: 'Application Submitted', desc: 'Candidate submits profile through 6-stage gateway.' },
    { num: '02', title: 'Initial Screening', desc: 'Recruitment board reviews credentials against division requirements.' },
    { num: '03', title: 'Skill Assessment', desc: 'Practical evaluation, analytical case study, or technical test.' },
    { num: '04', title: 'HR Interaction', desc: 'Culture fit alignment, institutional expectations, and operational terms.' },
    { num: '05', title: 'Domain Interview', desc: 'In-depth review with Division Chiefs and Senior Fellows.' },
    { num: '06', title: 'Leadership Interview', desc: 'Strategic alignment session with Executive Board Members.' },
    { num: '07', title: 'Reference Verification', desc: 'Background validation, academic verification, and work history check.' },
    { num: '08', title: 'Final Decision', desc: 'Official selection confirmation by the Institutional Board.' },
    { num: '09', title: 'Offer & Onboarding', desc: 'Issuance of offer letter, credential provisioning, and orientation.' }
  ];

  // LIFE AT PEOPLE & YOUTH (11 ASPECTS)
  const lifeAspects = [
    { title: 'Our Mission', text: 'Bridging academic rigor, statutory policy analysis, and youth-led governance to build institutions that shape society.' },
    { title: 'Institutional Values', text: 'Uncompromised integrity, dialectical inquiry, evidence-based research, and dedication to public service.' },
    { title: 'Culture & Principles', text: 'Intellectual freedom without borrowed certainty. Solitude in reflection, excellence in praxis.' },
    { title: 'Learning Environment', text: 'Direct mentorship under former coordinators, data engineers, researchers, and legal strategists.' },
    { title: 'Leadership Opportunities', text: 'Direct ownership of university chapters, district research initiatives, and global policy publications.' },
    { title: 'Global Collaboration', text: 'Interdisciplinary teams spanning strategy, AI, law, research, economics, and community development.' },
    { title: 'Research Ecosystem', text: 'Unrestricted access to the 4 Sovereign Mountain Ranges, 17 Knowledge Caves, and statutory audit data.' },
    { title: 'Editorial Independence', text: 'Dissent Dias peer-review freedom, protected opinion columnists, and rigorous academic publishing.' },
    { title: 'Innovation & Technology', text: 'Sovereign PostgreSQL database pipelines, AI knowledge engines, and modern Next.js platform architectures.' },
    { title: 'Diversity & Inclusion', text: 'Equal opportunity leadership across gender, region, academic background, and socio-economic background.' },
    { title: 'Career Growth Framework', text: 'Clear progression routes from Campus Ambassadors and Interns to Fellows, Directors, and Division Chiefs.' }
  ];

  // Live Search & Filter Logic
  const filteredDivisions = useMemo(() => {
    return divisionsData.map((div) => {
      if (selectedDivision !== 'All' && div.division !== selectedDivision) return null;

      const matchingRoles = div.roles.filter((r) => {
        if (!searchQuery.trim()) return true;
        return r.toLowerCase().includes(searchQuery.toLowerCase());
      });

      if (matchingRoles.length === 0) return null;

      return {
        ...div,
        roles: matchingRoles
      };
    }).filter(Boolean);
  }, [selectedDivision, searchQuery]);

  const totalRoleCount = useMemo(() => {
    return divisionsData.reduce((acc, d) => acc + d.roles.length, 0);
  }, []);

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      {/* TOP UTILITY HEADER */}
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
          ← Return to Main Platform
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 font-bold">PEOPLE & YOUTH</span>
          <span>&middot;</span>
          <span className="text-amber-300">GLOBAL RECRUITMENT ARCHITECTURE</span>
        </div>
      </div>

      {/* INSTITUTIONAL BRAND MASTHEAD */}
      <header className="border-b border-white/10 px-6 py-12 max-w-7xl mx-auto space-y-6 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold uppercase text-[10px] tracking-widest">
          PEOPLE & YOUTH &middot; GLOBAL CAREERS & LEADERSHIP PORTAL
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white uppercase font-serif tracking-tight">
          Build Institutions. Shape Society. Lead the Future.
        </h1>

        <p className="text-gray-300 text-sm italic font-serif max-w-3xl mx-auto leading-relaxed">
          Join People & Youth in building one of the world's most ambitious youth-led institutions spanning research, technology, public policy, consulting, publishing, leadership, and community development. Whether you are a student, researcher, designer, engineer, strategist, consultant, or changemaker, there is a place for your talent.
        </p>

        {/* SIGNATURE STATEMENT */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl max-w-4xl mx-auto text-left font-serif text-xs text-gray-300 leading-relaxed italic border-l-4 border-l-amber-400">
          <strong className="text-amber-400 font-mono uppercase not-italic block mb-1 text-[10px]">SIGNATURE STATEMENT</strong>
          "We do not merely recruit employees. We cultivate institution builders. Every role at People & Youth contributes to strengthening knowledge, empowering communities, advancing research, and creating sustainable institutions that serve society with integrity, innovation, and purpose."
        </div>
      </header>

      {/* NAVIGATION STRUCTURE (17 LINKS) */}
      <nav className="border-b border-white/10 bg-[#070b19] px-6 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-4 text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap">
          <span className="text-amber-400 font-extrabold border-r border-white/10 pr-4">STRUCTURE:</span>
          {navStructure.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item === 'Hiring Process') setActiveTab('workflow');
                else if (item === 'Life at People & Youth') setActiveTab('life');
                else if (item === 'Candidate Dashboard') setActiveTab('dashboard');
                else setActiveTab('framework');
              }}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN VIEW TAB SELECTOR */}
      <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-8">
        <div className="flex flex-wrap justify-center gap-3 border-b border-white/10 pb-6">
          <button
            onClick={() => setActiveTab('framework')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase transition-all ${
              activeTab === 'framework' ? 'bg-amber-400 text-black shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            🏛️ Career Framework ({totalRoleCount} Active Roles across 13 Divisions)
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase transition-all ${
              activeTab === 'workflow' ? 'bg-amber-400 text-black shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            ⚙️ Hiring Workflow (9 Stages)
          </button>

          <button
            onClick={() => setActiveTab('life')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase transition-all ${
              activeTab === 'life' ? 'bg-amber-400 text-black shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            🌱 Life at People & Youth
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase transition-all ${
              activeTab === 'dashboard' ? 'bg-amber-400 text-black shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            🖥️ Candidate Dashboard
          </button>
        </div>

        {/* TAB 1: CAREER FRAMEWORK & DIVISIONS */}
        {activeTab === 'framework' && (
          <div className="space-y-8">
            {/* SEARCH & FILING DROPDOWN FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`🔍 Search ${totalRoleCount} roles across all 13 divisions (e.g., Economist, AI Engineer, Director, Fellow)...`}
                className="w-full md:w-96 bg-[#070b19] border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none text-xs"
              />

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase shrink-0">Filter Division:</span>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="bg-[#070b19] border border-white/20 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none text-xs"
                >
                  <option value="All">All 13 Divisions</option>
                  {divisionsData.map((d) => (
                    <option key={d.division} value={d.division}>{d.division}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DIVISIONS & ROLE CARDS GRID */}
            <div className="space-y-12">
              {filteredDivisions.map((div: any) => (
                <div key={div.division} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div>
                      <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">{div.category}</span>
                      <h2 className="text-xl font-extrabold text-white">{div.division}</h2>
                    </div>
                    <span className="bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
                      {div.roles.length} Roles Registered
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {div.roles.map((roleName: string, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/10 hover:border-amber-400/60 p-4 rounded-2xl flex flex-col justify-between space-y-3 group transition-all"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-amber-400/80 uppercase block">
                            {div.division}
                          </span>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                            {roleName}
                          </h3>
                        </div>

                        {/* REUSABLE UNIVERSAL APPLY BUTTON */}
                        <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                          <ApplyButton
                            opportunityId={`py-role-${roleName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                            opportunityType={div.category}
                            department={div.division}
                            title={roleName}
                            location="Global / Remote / Hybrid"
                          />
                          <div className="flex justify-between items-center text-[9px] text-gray-400 pt-1">
                            <button
                              onClick={() => alert(`Saved "${roleName}" to your bookmarks.`)}
                              className="hover:text-amber-300 text-left"
                            >
                              🔖 Save for Later
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert(`Copied share link for ${roleName}`);
                              }}
                              className="hover:text-amber-300 text-right"
                            >
                              🔗 Share
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: HIRING WORKFLOW (9 STAGES) */}
        {activeTab === 'workflow' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-amber-400 font-bold uppercase text-[10px]">TRANSPARENT RECRUITMENT</span>
              <h2 className="text-3xl font-black uppercase font-serif">The 9-Stage Hiring Workflow</h2>
              <p className="text-gray-400 text-xs italic font-serif">A structured, meritocratic evaluation pipeline designed to assess vision, analytical rigor, and cultural alignment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workflowSteps.map((step) => (
                <div key={step.num} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 relative overflow-hidden">
                  <div className="text-3xl font-extrabold text-amber-400/30 font-mono absolute top-4 right-4">
                    {step.num}
                  </div>
                  <span className="text-amber-400 font-bold text-[10px] uppercase">STAGE {step.num}</span>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  <p className="text-gray-400 text-[11px] leading-relaxed font-serif">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LIFE AT PEOPLE & YOUTH */}
        {activeTab === 'life' && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-amber-400 font-bold uppercase text-[10px]">INSTITUTIONAL CULTURE</span>
              <h2 className="text-3xl font-black uppercase font-serif">Life at People & Youth</h2>
              <p className="text-gray-400 text-xs italic font-serif">Cultivating a high-performance ecosystem grounded in scholarship, innovation, and public service.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lifeAspects.map((aspect, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2 border-l-2 border-l-amber-400">
                  <h3 className="text-base font-bold text-amber-300">{aspect.title}</h3>
                  <p className="text-gray-300 text-[11px] leading-relaxed font-serif">{aspect.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CANDIDATE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 max-w-4xl mx-auto text-center">
            <span className="text-amber-400 font-bold uppercase text-[10px]">APPLICANT PORTAL</span>
            <h2 className="text-3xl font-black uppercase font-serif">Candidate Dashboard</h2>
            <p className="text-gray-400 text-xs italic font-serif max-w-md mx-auto">
              Monitor active applications, upload certificates, receive interview invitations, and track offer status.
            </p>
            <Link
              href="/candidate-dashboard"
              className="px-6 py-3 bg-amber-400 text-black font-extrabold uppercase rounded-xl inline-block hover:bg-amber-300 text-xs"
            >
              Open Candidate Dashboard Engine →
            </Link>
          </div>
        )}
      </div>

      {/* INSTITUTIONAL FOOTER */}
      <footer className="border-t border-white/10 bg-[#040711] mt-12 py-12 px-6 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center text-[10px] text-gray-500 gap-4">
          <span>&copy; 2026 People & Youth &middot; Global Careers & Leadership Portal &middot; www.peopleandyouth.org</span>
          <span>Build Institutions. Shape Society. Lead the Future.</span>
        </div>
      </footer>
    </main>
  );
}