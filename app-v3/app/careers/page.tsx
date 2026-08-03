'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';

// CONSTANT ASSETS & URLS
const RAZORPAY_URL = "https://rzp.io/rzp/gLKmbVf";
const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";

const LINKEDIN_URL = "https://www.linkedin.com/company/vidyarthi-nagrik-jan-chetna-manch";
const FACEBOOK_URL = "https://www.facebook.com/share/1ZGB3ZQKqE/";
const YOUTUBE_URL = "https://www.youtube.com/@peopleandyouth";
const INSTAGRAM_URL = "https://www.instagram.com/peopleandyouth";

// CAREER DOMAINS DATA MATRIX
const CAREER_DOMAINS = [
  {
    id: 'policy',
    name: 'Public Policy & Governance',
    icon: '🏛',
    roles: [
      'Policy Analyst', 'Research Associate', 'Legislative Researcher',
      'Policy Consultant', 'Policy Fellow', 'Governance Associate', 'Public Affairs Associate'
    ]
  },
  {
    id: 'research',
    name: 'Research & Empirical Analytics',
    icon: '🔬',
    roles: [
      'Research Analyst', 'Research Associate', 'Data Researcher',
      'Survey Specialist', 'Research Fellow', 'Research Coordinator', 'Knowledge Associate'
    ]
  },
  {
    id: 'editorial',
    name: 'Editorial & Journalism',
    icon: '✍️',
    roles: [
      'Editor', 'Assistant Editor', 'Copy Editor', 'Content Reviewer',
      'Proofreader', 'Magazine Coordinator', 'Editorial Fellow', 'Publication Associate'
    ]
  },
  {
    id: 'dissent-dias',
    name: 'Dissent Dias Discourse',
    icon: '📰',
    roles: [
      'Editorial Writer', 'Opinion Editor', 'Podcast Host', 'Interviewer',
      'Community Moderator', 'Research Writer', 'Fact-checking Associate'
    ]
  },
  {
    id: 'renaissance-pubs',
    name: 'Renaissance Publications',
    icon: '📚',
    roles: [
      'Journal Editor', 'Managing Editor', 'Peer Review Coordinator',
      'Publication Associate', 'Academic Outreach Associate', 'Research Communications'
    ]
  },
  {
    id: 'tech',
    name: 'Technology & AI Engineering',
    icon: '💻',
    roles: [
      'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'UI/UX Designer', 'Mobile Developer', 'AI Engineer', 'Cloud Engineer',
      'DevOps Engineer', 'Cyber Security Associate', 'QA Engineer', 'Database Administrator'
    ]
  },
  {
    id: 'product',
    name: 'Product & Systems Design',
    icon: '⚙️',
    roles: [
      'Product Manager', 'Product Designer', 'UX Researcher',
      'Business Analyst', 'Technical Project Manager'
    ]
  },
  {
    id: 'marcom',
    name: 'Marketing & Communications',
    icon: '📢',
    roles: [
      'Brand Manager', 'Growth Associate', 'Digital Marketing Specialist',
      'SEO Specialist', 'Social Media Manager', 'Graphic Designer', 'Video Editor',
      'Content Strategist', 'Communications Associate', 'Public Relations Manager'
    ]
  },
  {
    id: 'bizdev',
    name: 'Business Development & Strategic Alliances',
    icon: '🤝',
    roles: [
      'Strategic Partnerships', 'Corporate Relations', 'Institutional Partnerships',
      'Fundraising Associate', 'Grant Writer', 'Alliance Manager', 'Community Partnerships'
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Treasury',
    icon: '📊',
    roles: [
      'Finance Associate', 'Financial Planning', 'Treasury Associate',
      'Accounts Associate', 'Investment Research Analyst', 'Financial Strategy', 'Compliance Associate'
    ]
  },
  {
    id: 'consulting',
    name: 'Institutional Consulting',
    icon: '📈',
    roles: [
      'Management Consultant', 'Strategy Associate', 'Operations Consultant',
      'Organizational Development', 'Institutional Excellence Consultant'
    ]
  },
  {
    id: 'legal',
    name: 'Legal & Constitutional Compliance',
    icon: '⚖️',
    roles: [
      'Legal Research Associate', 'Policy & Compliance', 'Contracts Associate', 'Governance Compliance'
    ]
  },
  {
    id: 'hr',
    name: 'Human Resources & Talent',
    icon: '👥',
    roles: [
      'Talent Acquisition', 'People Operations', 'Learning & Development',
      'Volunteer Relations', 'Culture & Engagement'
    ]
  },
  {
    id: 'operations',
    name: 'Operations & Project Management',
    icon: '🔄',
    roles: [
      'Program Manager', 'Operations Associate', 'Regional Operations',
      'Administrative Coordinator', 'Project Coordinator', 'Documentation Specialist'
    ]
  },
  {
    id: 'campaigns',
    name: 'Campaigns & Grassroots Advocacy',
    icon: '📣',
    roles: [
      'Campaign Manager', 'Campaign Strategist', 'Grassroots Coordinator',
      'Public Mobilisation Associate', 'Advocacy Coordinator', 'Community Engagement Manager', 'Issue Campaign Lead'
    ]
  },
  {
    id: 'events',
    name: 'Events & Global Summits',
    icon: '🗓',
    roles: [
      'Event Planner', 'Conference Coordinator', 'Summit Manager',
      'Protocol Associate', 'Guest Relations', 'Event Operations', 'Logistics Manager'
    ]
  },
  {
    id: 'leadership',
    name: 'Institutional Leadership Roles',
    icon: '🛡',
    roles: [
      'Chief of Staff', 'Executive Assistant', 'Program Director',
      'Director – Research', 'Director – Technology', 'Director – Editorial',
      'Director – Campaigns', 'Director – Partnerships', 'Director – Operations',
      'Director – Communications', 'Regional Director', 'National Director'
    ]
  }
];

export default function CareersPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('policy');
  const [resumeSubmitted, setResumeSubmitted] = useState<boolean>(false);
  const [candidateForm, setCandidateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    primaryDomain: 'Public Policy & Governance',
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: '',
    portfolioUrl: '',
    coverNote: ''
  });

  const handleResumeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResumeSubmitted(true);
    setTimeout(() => setResumeSubmitted(false), 6000);
    setCandidateForm({
      fullName: '',
      email: '',
      phone: '',
      primaryDomain: 'Public Policy & Governance',
      linkedinUrl: '',
      githubUrl: '',
      websiteUrl: '',
      portfolioUrl: '',
      coverNote: ''
    });
  };

  const activeDomainObj = CAREER_DOMAINS.find(d => d.id === selectedDomain) || CAREER_DOMAINS[0];

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* STICKY HEADER */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/about" className="hover:text-cyan-400 transition-colors">
              About Mandate
            </Link>
            <Link href="/careers" className="text-cyan-400 font-bold border-b-2 border-cyan-400 py-1">
              Careers &amp; Opportunities
            </Link>
            <Link href="/submit-paper" className="hover:text-cyan-400 transition-colors">
              Policy Journals
            </Link>
            <Link href="/rural-consulting" className="hover:text-cyan-400 transition-colors">
              Rural Consulting
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <GoogleTranslate />
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

      {/* TOP SUB-NAVIGATION BAR FOR OPPORTUNITY PATHWAYS */}
      <div className="bg-[#0b132e] border-b border-white/10 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-start md:justify-center gap-6 text-xs font-mono whitespace-nowrap text-gray-300">
          <a href="#opportunities" className="hover:text-cyan-400 transition-colors">💼 Career Opportunities</a>
          <span className="text-gray-600">•</span>
          <a href="#district-coordinators" className="hover:text-cyan-400 transition-colors">🏛 District Coordinators</a>
          <span className="text-gray-600">•</span>
          <a href="#youth-ambassadors" className="hover:text-cyan-400 transition-colors">🌟 Youth Ambassadors</a>
          <span className="text-gray-600">•</span>
          <a href="#internships" className="hover:text-cyan-400 transition-colors">🎓 Internships</a>
          <span className="text-gray-600">•</span>
          <a href="#candidate-portal" className="hover:text-cyan-400 transition-colors">📁 Candidate Dashboard</a>
          <span className="text-gray-600">•</span>
          <a href="#life-at-py" className="hover:text-cyan-400 transition-colors">🌱 Life at P&amp;Y</a>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-24">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            PEOPLE &amp; YOUTH CAREERS &amp; OPPORTUNITIES
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Build Institutions. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">Build Your Legacy.</span>
          </h1>
          
          <blockquote className="border-l-4 border-cyan-400 pl-6 my-6 text-left text-gray-300 italic text-base sm:text-lg bg-white/5 p-6 rounded-r-2xl max-w-3xl mx-auto">
            &ldquo;The world&apos;s greatest institutions are not built by founders alone. They are built by people who choose to contribute their knowledge, creativity and commitment to something larger than themselves.&rdquo;
          </blockquote>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            Whether you are a policy researcher in Nairobi, a software engineer in Bengaluru, a designer in London, a finance graduate in New York, or a student in a rural district, there is a meaningful place for you within People &amp; Youth.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="#opportunities"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all text-center"
            >
              Explore Opportunities &rarr;
            </a>
            <a
              href="#candidate-portal"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 font-bold text-sm text-center transition-all"
            >
              Submit Your Resume / Profile
            </a>
          </div>
        </section>

        {/* SECURE CANDIDATE DASHBOARD & RESUME BANK PORTAL */}
        <section id="candidate-portal" className="bg-gradient-to-br from-[#0c1638] via-[#070b19] to-[#0a1836] border-2 border-cyan-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          
          <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">TALENT PLATFORM &amp; CANDIDATE DASHBOARD</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">Submit to the Global Resume Bank</h2>
              <p className="text-xs text-gray-300 mt-1">Our secure Talent Repository indexes candidates for current and upcoming institutional openings globally.</p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-400/40">
              ● Open Candidate Registration
            </span>
          </div>

          {/* Interactive Candidate Dashboard Modules Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-cyan-400 text-xs font-mono font-bold block">01. Profile</span>
              <span className="text-[10px] text-gray-400">Bio &amp; Identity</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-cyan-400 text-xs font-mono font-bold block">02. Resume/CV</span>
              <span className="text-[10px] text-gray-400">PDF Repository</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-cyan-400 text-xs font-mono font-bold block">03. Portfolio</span>
              <span className="text-[10px] text-gray-400">Papers &amp; Works</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-cyan-400 text-xs font-mono font-bold block">04. Tasks</span>
              <span className="text-[10px] text-gray-400">Skill Assessments</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-cyan-400 text-xs font-mono font-bold block">05. Status</span>
              <span className="text-[10px] text-gray-400">Interview Tracking</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="text-cyan-400 text-xs font-mono font-bold block">06. Identity</span>
              <span className="text-[10px] text-gray-400">Civic Passport</span>
            </div>
          </div>

          {resumeSubmitted && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono">
              ✓ Candidate profile successfully registered into the People &amp; Youth Resume Bank! You will receive notification updates on active openings.
            </div>
          )}

          {/* Candidate Registration Form */}
          <form onSubmit={handleResumeSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Full Name *</label>
              <input
                type="text"
                value={candidateForm.fullName}
                onChange={e => setCandidateForm({...candidateForm, fullName: e.target.value})}
                placeholder="e.g. Swaraj Shandilya"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Email Address *</label>
              <input
                type="email"
                value={candidateForm.email}
                onChange={e => setCandidateForm({...candidateForm, email: e.target.value})}
                placeholder="candidate@domain.org"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Primary Domain *</label>
              <select
                value={candidateForm.primaryDomain}
                onChange={e => setCandidateForm({...candidateForm, primaryDomain: e.target.value})}
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                {CAREER_DOMAINS.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">LinkedIn Profile URL</label>
              <input
                type="url"
                value={candidateForm.linkedinUrl}
                onChange={e => setCandidateForm({...candidateForm, linkedinUrl: e.target.value})}
                placeholder="https://linkedin.com/in/profile"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">GitHub / Website URL</label>
              <input
                type="url"
                value={candidateForm.githubUrl}
                onChange={e => setCandidateForm({...candidateForm, githubUrl: e.target.value})}
                placeholder="https://github.com/username or personal site"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Portfolio / Research Link</label>
              <input
                type="url"
                value={candidateForm.portfolioUrl}
                onChange={e => setCandidateForm({...candidateForm, portfolioUrl: e.target.value})}
                placeholder="Link to Policy Briefs / Google Drive / Publications"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Cover Note &amp; Statement of Intent *</label>
              <textarea
                rows={3}
                value={candidateForm.coverNote}
                onChange={e => setCandidateForm({...candidateForm, coverNote: e.target.value})}
                placeholder="Describe how your expertise aligns with building People & Youth as a sovereign civic knowledge institution..."
                className="w-full bg-[#070b19] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all"
              >
                Submit Profile to Resume Bank &rarr;
              </button>
            </div>
          </form>
        </section>

        {/* COMPLETE CAREER DOMAINS & ROLE EXPANSION MATRIX */}
        <section id="opportunities" className="space-y-8">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">CAREER OPPORTUNITIES MATRIX</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Explore Institutional Domains &amp; Open Roles</h2>
            <p className="text-xs text-gray-400 mt-1">Select any domain below to review active role specializations across our global structure.</p>
          </div>

          {/* Domain Category Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {CAREER_DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all border flex items-center gap-2 ${
                  selectedDomain === domain.id
                    ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/30'
                }`}
              >
                <span>{domain.icon}</span>
                <span>{domain.name}</span>
              </button>
            ))}
          </div>

          {/* Active Domain Roles Grid */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{activeDomainObj.icon}</span>
                  <span>{activeDomainObj.name}</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">Specialized career paths housed within this institutional department.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-400/30">
                {activeDomainObj.roles.length} Open Specializations
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeDomainObj.roles.map((roleName) => (
                <div key={roleName} className="bg-[#0b1228] p-5 rounded-2xl border border-white/10 hover:border-cyan-400/50 transition-all space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">{roleName}</h4>
                    <p className="text-[11px] text-gray-400 mt-1">Global / Regional / Remote</p>
                  </div>
                  <div className="pt-2 flex justify-between items-center border-t border-white/5 text-xs">
                    <span className="text-[10px] font-mono text-emerald-400">● Accepting Applications</span>
                    <a href="#candidate-portal" className="text-cyan-400 font-bold hover:underline">Apply &rarr;</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GEOGRAPHIC LEADERSHIP & CHAPTER ARCHITECTURE */}
        <section id="district-coordinators" className="space-y-10">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">DECENTRALIZED GOVERNANCE</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Geographic Chapters &amp; Grassroots Leadership</h2>
            <p className="text-xs text-gray-400 mt-1">People &amp; Youth operates across a multi-tiered geographic structure from global capitals to rural district blocks.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-xs text-cyan-300">Global Chapters</div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-xs text-cyan-300">Regional Chapters</div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-xs text-cyan-300">National Chapters</div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-xs text-cyan-300">State Chapters</div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-xs text-cyan-300">District Chapters</div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-xs text-cyan-300">Campus Chapters</div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-xs text-cyan-300">Community Chapters</div>
          </div>

          {/* District Coordinators Mandate Card */}
          <div className="bg-gradient-to-br from-blue-950/70 via-[#0a122c] to-cyan-950/70 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">CRITICAL CIVIC ROLE</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">District Coordinator Mandate</h3>
              </div>
              <a href="#candidate-portal" className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all">
                Apply as District Coordinator &rarr;
              </a>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              The District Coordinator serves as the official institutional representative of People &amp; Youth within a district, bridging grassroots citizens with national policy research.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-3">
                <h4 className="text-sm font-mono font-bold text-cyan-400 uppercase">Core Responsibilities</h4>
                <ul className="space-y-2 text-xs text-gray-300 list-disc pl-4">
                  <li>Building and directing regional volunteer networks</li>
                  <li>Organising local civic awareness events &amp; constitutional forums</li>
                  <li>Collaborating with schools, colleges, and municipal bodies</li>
                  <li>Recruiting and mentoring regional Youth Ambassadors</li>
                  <li>Coordinating ground-level RTI monitoring and research initiatives</li>
                  <li>Representing People &amp; Youth before local public stakeholders</li>
                  <li>Preparing quarterly impact reports &amp; district publications</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-mono font-bold text-amber-400 uppercase">Eligibility Criteria</h4>
                <ul className="space-y-2 text-xs text-gray-300 list-disc pl-4">
                  <li>Demonstrated leadership &amp; public interest commitment</li>
                  <li>Excellent regional communication &amp; stakeholder management skills</li>
                  <li>Uncompromising integrity and adherence to non-partisan ethics</li>
                  <li>Prior experience in community engagement or student advocacy preferred</li>
                  <li>Deep familiarity with district-level governance &amp; social dynamics</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* YOUTH AMBASSADOR & INTERNSHIP PROGRAMMES */}
        <section id="youth-ambassadors" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Youth Ambassador Card */}
          <div id="youth-ambassador-card" className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">CAMPUS &amp; COMMUNITY OUTREACH</span>
              <h3 className="text-2xl font-bold text-white">🌟 Youth Ambassador Programme</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Become the face of People &amp; Youth in your school, college, university, workplace, or local community.
              </p>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-white">Ambassador Responsibilities:</p>
                <ul className="space-y-1.5 text-xs text-gray-400 list-disc pl-4">
                  <li>Promote civic awareness &amp; constitutional literacy</li>
                  <li>Organise campus discussions, debates &amp; campaigns</li>
                  <li>Recruit student volunteers and build local partnerships</li>
                  <li>Support Renaissance Publications &amp; student submissions</li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <a href="#candidate-portal" className="inline-block text-xs font-bold text-cyan-400 hover:underline">
                Apply for Youth Ambassador Role &rarr;
              </a>
            </div>
          </div>

          {/* Internship Programme Card */}
          <div id="internships" className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">EARLY CAREER DEVELOPMENT</span>
              <h3 className="text-2xl font-bold text-white">🎓 Institutional Internship Programme</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Structured 8 to 16 week internships designed to equip students with rigorous hands-on institutional experience.
              </p>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-white">Active Internship Streams:</p>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300">Public Policy</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300">Research</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300">Technology</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300">Editorial</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300">Finance</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300">Marketing</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300">Operations</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono pt-2">✓ Verified Institutional Certificates issued upon successful completion.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <a href="#candidate-portal" className="inline-block text-xs font-bold text-cyan-400 hover:underline">
                Apply for Internships &rarr;
              </a>
            </div>
          </div>

        </section>

        {/* APPLICATION WORKFLOW ROADMAP */}
        <section className="space-y-8">
          <div className="border-b border-white/10 pb-4 text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">TRANSPARENT SELECTION PROCESS</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Application Workflow</h2>
            <p className="text-xs text-gray-400 mt-1">Every candidate passes through a structured, merit-based selection lifecycle.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs font-mono text-cyan-400 font-bold block">STEP 01</span>
              <p className="text-xs font-bold text-white">Create Profile</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs font-mono text-cyan-400 font-bold block">STEP 02</span>
              <p className="text-xs font-bold text-white">Upload Resume</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs font-mono text-cyan-400 font-bold block">STEP 03</span>
              <p className="text-xs font-bold text-white">Skill Assessment</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs font-mono text-cyan-400 font-bold block">STEP 04</span>
              <p className="text-xs font-bold text-white">Application Review</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs font-mono text-cyan-400 font-bold block">STEP 05</span>
              <p className="text-xs font-bold text-white">Interview</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs font-mono text-cyan-400 font-bold block">STEP 06</span>
              <p className="text-xs font-bold text-white">Onboarding &amp; Identity</p>
            </div>
          </div>
        </section>

        {/* LIFE AT PEOPLE & YOUTH (CULTURE) */}
        <section id="life-at-py" className="bg-gradient-to-br from-[#0c1638] via-[#070b19] to-[#0a1836] border border-cyan-500/30 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">OUR CULTURE</span>
            <h2 className="text-3xl font-extrabold text-white">Life at People &amp; Youth</h2>
            <p className="text-xs text-gray-400">We prioritize purpose, analytical rigor, and public contribution over conventional corporate hierarchies.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2"><span>🎯</span> Mission-Driven Work</h4>
              <p className="text-xs text-gray-300 leading-relaxed">Every research paper, campaign, and software commit contributes directly to democratic transparency.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2"><span>📚</span> Learning Culture</h4>
              <p className="text-xs text-gray-300 leading-relaxed">Continuous mentorship, open research repositories, and interdisciplinary skill acquisition.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2"><span>🌍</span> Global &amp; Flexible</h4>
              <p className="text-xs text-gray-300 leading-relaxed">Contribute from anywhere across the world with flexible hybrid and remote engagement models.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2"><span>🔍</span> Research-First Approach</h4>
              <p className="text-xs text-gray-300 leading-relaxed">Decisions are backed by empirical data, constitutional precedents, and rigorous peer review.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2"><span>🛡</span> Ethical Leadership</h4>
              <p className="text-xs text-gray-300 leading-relaxed">Cultivating public service values, non-partisan integrity, and institutional accountability.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2"><span>💡</span> Civic Innovation</h4>
              <p className="text-xs text-gray-300 leading-relaxed">Deploying cutting-edge digital infrastructure and data tools for public good.</p>
            </div>
          </div>
        </section>

        {/* FUTURE EXPANSION HORIZON */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">PLATFORM ROADMAP</span>
            <h3 className="text-xl font-bold text-white mt-1">Future Expansion Horizon</h3>
            <p className="text-xs text-gray-400 mt-0.5">Architected for upcoming AI-driven talent matchmaking &amp; internal performance analytics.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono text-gray-300">
            <div className="p-3 rounded-xl bg-[#0b1228] border border-white/5">● AI Job Matchmaking</div>
            <div className="p-3 rounded-xl bg-[#0b1228] border border-white/5">● Volunteer-to-Career Pathways</div>
            <div className="p-3 rounded-xl bg-[#0b1228] border border-white/5">● Internal Talent Marketplace</div>
            <div className="p-3 rounded-xl bg-[#0b1228] border border-white/5">● Mentorship Matching Engine</div>
            <div className="p-3 rounded-xl bg-[#0b1228] border border-white/5">● District Impact Dashboards</div>
            <div className="p-3 rounded-xl bg-[#0b1228] border border-white/5">● Application Analytics</div>
            <div className="p-3 rounded-xl bg-[#0b1228] border border-white/5">● LMS Learning Integration</div>
            <div className="p-3 rounded-xl bg-[#0b1228] border border-white/5">● Performance Analytics</div>
          </div>
        </section>

      </div>

      {/* STANDARDIZED FOOTER */}
      <footer className="border-t border-white/10 bg-[#050814] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Institution</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Mandate</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers &amp; Opportunities</Link></li>
                <li><Link href="/submit-paper" className="hover:text-white transition-colors">Submit Policy Research</Link></li>
                <li><Link href="/rural-consulting" className="hover:text-white transition-colors">Rural Consulting</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Governance &amp; Legal</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/editorial-policy" className="hover:text-white transition-colors">Editorial Guidelines</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

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
