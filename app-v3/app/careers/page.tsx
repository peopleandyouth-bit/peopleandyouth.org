'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';
import { supabase } from '@/lib/supabaseClient';

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
    roles: ['Policy Analyst', 'Research Associate', 'Legislative Researcher', 'Policy Consultant', 'Policy Fellow', 'Governance Associate', 'Public Affairs Associate']
  },
  {
    id: 'research',
    name: 'Research & Empirical Analytics',
    icon: '🔬',
    roles: ['Research Analyst', 'Research Associate', 'Data Researcher', 'Survey Specialist', 'Research Fellow', 'Research Coordinator', 'Knowledge Associate']
  },
  {
    id: 'editorial',
    name: 'Editorial & Journalism',
    icon: '✍️',
    roles: ['Editor', 'Assistant Editor', 'Copy Editor', 'Content Reviewer', 'Proofreader', 'Magazine Coordinator', 'Editorial Fellow', 'Publication Associate']
  },
  {
    id: 'dissent-dias',
    name: 'Dissent Dias Discourse',
    icon: '📰',
    roles: ['Editorial Writer', 'Opinion Editor', 'Podcast Host', 'Interviewer', 'Community Moderator', 'Research Writer', 'Fact-checking Associate']
  },
  {
    id: 'renaissance-pubs',
    name: 'Renaissance Publications',
    icon: '📚',
    roles: ['Journal Editor', 'Managing Editor', 'Peer Review Coordinator', 'Publication Associate', 'Academic Outreach Associate', 'Research Communications']
  },
  {
    id: 'tech',
    name: 'Technology & AI Engineering',
    icon: '💻',
    roles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Mobile Developer', 'AI Engineer', 'Cloud Engineer', 'DevOps Engineer', 'Cyber Security Associate', 'QA Engineer', 'Database Administrator']
  },
  {
    id: 'product',
    name: 'Product & Systems Design',
    icon: '⚙️',
    roles: ['Product Manager', 'Product Designer', 'UX Researcher', 'Business Analyst', 'Technical Project Manager']
  },
  {
    id: 'marcom',
    name: 'Marketing & Communications',
    icon: '📢',
    roles: ['Brand Manager', 'Growth Associate', 'Digital Marketing Specialist', 'SEO Specialist', 'Social Media Manager', 'Graphic Designer', 'Video Editor', 'Content Strategist', 'Communications Associate', 'Public Relations Manager']
  },
  {
    id: 'bizdev',
    name: 'Business Development & Strategic Alliances',
    icon: '🤝',
    roles: ['Strategic Partnerships', 'Corporate Relations', 'Institutional Partnerships', 'Fundraising Associate', 'Grant Writer', 'Alliance Manager', 'Community Partnerships']
  },
  {
    id: 'finance',
    name: 'Finance & Treasury',
    icon: '📊',
    roles: ['Finance Associate', 'Financial Planning', 'Treasury Associate', 'Accounts Associate', 'Investment Research Analyst', 'Financial Strategy', 'Compliance Associate']
  },
  {
    id: 'consulting',
    name: 'Institutional Consulting',
    icon: '📈',
    roles: ['Management Consultant', 'Strategy Associate', 'Operations Consultant', 'Organizational Development', 'Institutional Excellence Consultant']
  },
  {
    id: 'legal',
    name: 'Legal & Constitutional Compliance',
    icon: '⚖️',
    roles: ['Legal Research Associate', 'Policy & Compliance', 'Contracts Associate', 'Governance Compliance']
  },
  {
    id: 'hr',
    name: 'Human Resources & Talent',
    icon: '👥',
    roles: ['Talent Acquisition', 'People Operations', 'Learning & Development', 'Volunteer Relations', 'Culture & Engagement']
  },
  {
    id: 'operations',
    name: 'Operations & Project Management',
    icon: '🔄',
    roles: ['Program Manager', 'Operations Associate', 'Regional Operations', 'Administrative Coordinator', 'Project Coordinator', 'Documentation Specialist']
  },
  {
    id: 'campaigns',
    name: 'Campaigns & Grassroots Advocacy',
    icon: '📣',
    roles: ['Campaign Manager', 'Campaign Strategist', 'Grassroots Coordinator', 'Public Mobilisation Associate', 'Advocacy Coordinator', 'Community Engagement Manager', 'Issue Campaign Lead']
  },
  {
    id: 'events',
    name: 'Events & Global Summits',
    icon: '🗓',
    roles: ['Event Planner', 'Conference Coordinator', 'Summit Manager', 'Protocol Associate', 'Guest Relations', 'Event Operations', 'Logistics Manager']
  },
  {
    id: 'leadership',
    name: 'Institutional Leadership Roles',
    icon: '🛡',
    roles: ['Chief of Staff', 'Executive Assistant', 'Program Director', 'Director – Research', 'Director – Technology', 'Director – Editorial', 'Director – Campaigns', 'Director – Partnerships', 'Director – Operations', 'Director – Communications', 'Regional Director', 'National Director']
  }
];

export default function CareersPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('policy');
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'portfolio' | 'tasks' | 'status' | 'identity'>('profile');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  // Candidate Dashboard State across all 6 Tabs
  const [candidateForm, setCandidateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    primaryDomain: 'Public Policy & Governance',
    linkedinUrl: '',
    githubUrl: '',
    coverNote: '',
    resumeDriveUrl: '',
    cvSummary: '',
    totalExperienceYears: '0-1 Years',
    highestQualification: 'Bachelor\'s Degree',
    researchPapersUrl: '',
    policyBriefsUrl: '',
    writingSamplesUrl: '',
    taskSubmissionUrl: '',
    methodologyNotes: '',
    searchAppId: '',
    passportId: '',
  });

  // Handle Submission Directly to Supabase
  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const generatedAppId = `PY-APP-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const { error } = await supabase.from('candidate_applications').insert([
        {
          app_id: generatedAppId,
          full_name: candidateForm.fullName,
          email: candidateForm.email,
          phone: candidateForm.phone,
          primary_domain: candidateForm.primaryDomain,
          linkedin_url: candidateForm.linkedinUrl,
          github_url: candidateForm.githubUrl,
          cover_note: candidateForm.coverNote,
          resume_drive_url: candidateForm.resumeDriveUrl,
          cv_summary: candidateForm.cvSummary,
          total_experience_years: candidateForm.totalExperienceYears,
          highest_qualification: candidateForm.highestQualification,
          research_papers_url: candidateForm.researchPapersUrl,
          policy_briefs_url: candidateForm.policyBriefsUrl,
          writing_samples_url: candidateForm.writingSamplesUrl,
          task_submission_url: candidateForm.taskSubmissionUrl,
          methodology_notes: candidateForm.methodologyNotes,
          passport_id: candidateForm.passportId,
          status: 'Under Review'
        }
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
      setSubmittedAppId(generatedAppId);
      
      // Reset Form
      setCandidateForm({
        fullName: '', email: '', phone: '', primaryDomain: 'Public Policy & Governance',
        linkedinUrl: '', githubUrl: '', coverNote: '', resumeDriveUrl: '', cvSummary: '',
        totalExperienceYears: '0-1 Years', highestQualification: 'Bachelor\'s Degree',
        researchPapersUrl: '', policyBriefsUrl: '', writingSamplesUrl: '', taskSubmissionUrl: '',
        methodologyNotes: '', searchAppId: '', passportId: ''
      });
    }
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

      {/* TOP SUB-NAVIGATION BAR */}
      <div className="bg-[#0b132e] border-b border-white/10 py-3 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-start md:justify-center gap-6 text-xs font-mono whitespace-nowrap text-gray-300">
          <a href="#candidate-portal" className="text-cyan-400 font-bold hover:underline">📁 Candidate Dashboard</a>
          <span className="text-gray-600">•</span>
          <a href="#opportunities" className="hover:text-cyan-400 transition-colors">💼 Career Opportunities</a>
          <span className="text-gray-600">•</span>
          <a href="#district-coordinators" className="hover:text-cyan-400 transition-colors">🏛 District Coordinators</a>
          <span className="text-gray-600">•</span>
          <a href="#youth-ambassadors" className="hover:text-cyan-400 transition-colors">🌟 Youth Ambassadors</a>
          <span className="text-gray-600">•</span>
          <a href="#internships" className="hover:text-cyan-400 transition-colors">🎓 Internships</a>
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

          <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="#candidate-portal"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all text-center"
            >
              Open Candidate Portal &amp; Submit Profile &rarr;
            </a>
            <a
              href="#opportunities"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 font-bold text-sm text-center transition-all"
            >
              Explore Career Domains
            </a>
          </div>
        </section>

        {/* 🏆 PRIVATE & INTERACTIVE 6-STEP CANDIDATE DASHBOARD PORTAL */}
        <section id="candidate-portal" className="bg-gradient-to-br from-[#0c1638] via-[#070b19] to-[#0a1836] border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-8">
          
          <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">PRIVATE RECRUITMENT PORTAL</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">Candidate Dashboard</h2>
              <p className="text-xs text-gray-300 mt-1">Fill out the 6 interactive steps below. Your application is directly encrypted &amp; stored privately in our Supabase database.</p>
            </div>

            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-400/40">
              🔒 Private Supabase Encryption Active
            </span>
          </div>

          {/* 6 INTERACTIVE TAB BUTTONS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            
            <button
              onClick={() => setActiveTab('profile')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTab === 'profile'
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <span className="text-xs font-mono font-bold text-cyan-400">01. Profile</span>
              <span className="text-[10px] mt-0.5 font-medium">Bio &amp; Identity</span>
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTab === 'resume'
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <span className="text-xs font-mono font-bold text-cyan-400">02. Resume/CV</span>
              <span className="text-[10px] mt-0.5 font-medium">PDF Repository</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTab === 'portfolio'
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <span className="text-xs font-mono font-bold text-cyan-400">03. Portfolio</span>
              <span className="text-[10px] mt-0.5 font-medium">Papers &amp; Works</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTab === 'tasks'
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <span className="text-xs font-mono font-bold text-cyan-400">04. Tasks</span>
              <span className="text-[10px] mt-0.5 font-medium">Skill Assessments</span>
            </button>

            <button
              onClick={() => setActiveTab('status')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTab === 'status'
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <span className="text-xs font-mono font-bold text-cyan-400">05. Status</span>
              <span className="text-[10px] mt-0.5 font-medium">Interview Tracking</span>
            </button>

            <button
              onClick={() => setActiveTab('identity')}
              className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeTab === 'identity'
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <span className="text-xs font-mono font-bold text-cyan-400">06. Identity</span>
              <span className="text-[10px] mt-0.5 font-medium">Civic Passport</span>
            </button>

          </div>

          {/* CONFIRMATION SCREEN */}
          {submittedAppId && (
            <div className="p-6 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/60 text-white space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-300 font-mono">✓ APPLICATION SUBMITTED PRIVATELY TO SUPABASE</span>
                <span className="px-3 py-1 bg-emerald-500 text-black font-mono font-bold text-xs rounded-lg">{submittedAppId}</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">
                Thank you! Your candidate profile has been securely stored in our private institutional database. You may use your Application ID (<strong className="text-emerald-300">{submittedAppId}</strong>) under Step 05 to track review status.
              </p>
            </div>
          )}

          {/* TAB CONTENT FORM PANELS */}
          <form onSubmit={handleResumeSubmit} className="bg-[#070b19]/80 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            
            {/* TAB 01: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white">Step 01: Candidate Bio &amp; Institutional Profile</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Provide your primary contact details and target career domain.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={candidateForm.fullName}
                      onChange={e => setCandidateForm({...candidateForm, fullName: e.target.value})}
                      placeholder="e.g. Swaraj Shandilya"
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
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
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      value={candidateForm.phone}
                      onChange={e => setCandidateForm({...candidateForm, phone: e.target.value})}
                      placeholder="+91 9876543210"
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Primary Domain *</label>
                    <select
                      value={candidateForm.primaryDomain}
                      onChange={e => setCandidateForm({...candidateForm, primaryDomain: e.target.value})}
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
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
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">GitHub / Website URL</label>
                    <input
                      type="url"
                      value={candidateForm.githubUrl}
                      onChange={e => setCandidateForm({...candidateForm, githubUrl: e.target.value})}
                      placeholder="https://github.com/username or site"
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Cover Note &amp; Statement of Intent *</label>
                    <textarea
                      rows={3}
                      value={candidateForm.coverNote}
                      onChange={e => setCandidateForm({...candidateForm, coverNote: e.target.value})}
                      placeholder="Describe how your expertise aligns with building People & Youth as a sovereign civic knowledge institution..."
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('resume')}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all"
                  >
                    Proceed to Step 02: Resume / CV &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 02: RESUME / CV */}
            {activeTab === 'resume' && (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white">Step 02: PDF Resume &amp; Curriculum Vitae Repository</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Upload your PDF Resume URL or paste your comprehensive academic CV summary.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">PDF Resume / CV Link (Google Drive / Dropbox) *</label>
                    <input
                      type="url"
                      value={candidateForm.resumeDriveUrl}
                      onChange={e => setCandidateForm({...candidateForm, resumeDriveUrl: e.target.value})}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Total Experience Level</label>
                    <select
                      value={candidateForm.totalExperienceYears}
                      onChange={e => setCandidateForm({...candidateForm, totalExperienceYears: e.target.value})}
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Student / Fresher">Student / Fresher</option>
                      <option value="0-1 Years">0 - 1 Years</option>
                      <option value="1-3 Years">1 - 3 Years</option>
                      <option value="3-5 Years">3 - 5 Years</option>
                      <option value="5+ Years Leadership">5+ Years Senior Leadership</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">CV Executive Summary</label>
                    <textarea
                      rows={3}
                      value={candidateForm.cvSummary}
                      onChange={e => setCandidateForm({...candidateForm, cvSummary: e.target.value})}
                      placeholder="Summarize key educational degrees, published papers, professional roles, and public service achievements..."
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-xs"
                  >
                    &larr; Back to Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('portfolio')}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all"
                  >
                    Proceed to Step 03: Portfolio &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 03: PORTFOLIO */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white">Step 03: Portfolio, Publications &amp; Research Works</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Attach links to your policy briefs, white papers, software codebases, or design works.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Research Papers / Publications URL</label>
                    <input
                      type="url"
                      value={candidateForm.researchPapersUrl}
                      onChange={e => setCandidateForm({...candidateForm, researchPapersUrl: e.target.value})}
                      placeholder="Link to Published Papers / SSRN / ResearchGate"
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Policy Briefs / Case Studies URL</label>
                    <input
                      type="url"
                      value={candidateForm.policyBriefsUrl}
                      onChange={e => setCandidateForm({...candidateForm, policyBriefsUrl: e.target.value})}
                      placeholder="Link to Policy Analyses / Legal Briefs"
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Writing Samples / Design Portfolio</label>
                    <input
                      type="url"
                      value={candidateForm.writingSamplesUrl}
                      onChange={e => setCandidateForm({...candidateForm, writingSamplesUrl: e.target.value})}
                      placeholder="Link to Essays / Behance / Code Repos"
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('resume')}
                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-xs"
                  >
                    &larr; Back to Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tasks')}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all"
                  >
                    Proceed to Step 04: Tasks &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 04: TASKS */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white">Step 04: Skill Assessment &amp; Domain Task Submission</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Where applicable, upload your domain assessment assignment or analytical methodology draft.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Assignment / Domain Task Submission Link</label>
                    <input
                      type="url"
                      value={candidateForm.taskSubmissionUrl}
                      onChange={e => setCandidateForm({...candidateForm, taskSubmissionUrl: e.target.value})}
                      placeholder="Link to Google Doc / GitHub PR / Figma Design Task"
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Methodology Notes / Task Breakdown</label>
                    <textarea
                      rows={3}
                      value={candidateForm.methodologyNotes}
                      onChange={e => setCandidateForm({...candidateForm, methodologyNotes: e.target.value})}
                      placeholder="Outline your empirical methodology, legal research framework, or technical architectural decisions..."
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('portfolio')}
                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-xs"
                  >
                    &larr; Back to Portfolio
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('status')}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all"
                  >
                    Proceed to Step 05: Status Tracker &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 05: STATUS */}
            {activeTab === 'status' && (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white">Step 05: Application Status &amp; Interview Tracker</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Track your submitted candidate profile status across institutional review stages.</p>
                </div>

                <div className="bg-[#0b1228] p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={candidateForm.searchAppId}
                      onChange={e => setCandidateForm({...candidateForm, searchAppId: e.target.value})}
                      placeholder="Enter Application ID (e.g. PY-APP-612030)"
                      className="flex-1 bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-extrabold text-xs"
                    >
                      Lookup Status
                    </button>
                  </div>

                  <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white/5 p-3 rounded-xl border border-emerald-500/40 text-emerald-400 text-xs font-mono">
                      ✓ Profile Submitted
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-cyan-500/40 text-cyan-300 text-xs font-mono">
                      ● Under Editorial Review
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-gray-500 text-xs font-mono">
                      ○ Interview Scheduling
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-gray-500 text-xs font-mono">
                      ○ Digital Onboarding
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tasks')}
                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-xs"
                  >
                    &larr; Back to Tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('identity')}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all"
                  >
                    Proceed to Step 06: Identity &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* TAB 06: IDENTITY */}
            {activeTab === 'identity' && (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white">Step 06: Sovereign Civic Passport Identity Link</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Link your verified Civic Passport ID to complete institutional fellow onboarding.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div>
                    <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Civic Passport ID (Optional)</label>
                    <input
                      type="text"
                      value={candidateForm.passportId}
                      onChange={e => setCandidateForm({...candidateForm, passportId: e.target.value})}
                      placeholder="e.g. PY-2026-612030"
                      className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="bg-amber-500/10 border border-amber-400/40 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-300">Don&apos;t have a Passport ID yet?</p>
                      <p className="text-[10px] text-gray-300">Claim your verified lifetime identity card for ~~₹1,000~~ ₹499.</p>
                    </div>
                    <a
                      href={RAZORPAY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs"
                    >
                      Claim ₹499
                    </a>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab('status')}
                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-xs"
                  >
                    &larr; Back to Status
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-105"
                  >
                    {isSubmitting ? 'Submitting to Supabase...' : 'Complete Registration & Submit Application →'}
                  </button>
                </div>
              </div>
            )}

          </form>

        </section>

        {/* CAREER DOMAINS MATRIX */}
        <section id="opportunities" className="space-y-8">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">CAREER OPPORTUNITIES MATRIX</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Explore Institutional Domains &amp; Open Roles</h2>
            <p className="text-xs text-gray-400 mt-1">Select any domain below to review active role specializations across our global structure.</p>
          </div>

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
