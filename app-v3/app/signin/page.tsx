'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Data Lists
const INTEREST_OPTIONS = [
  'Public Policy', 'Education', 'Trade', 'Constitution', 'Economy',
  'Governance', 'Elections', 'RTI', 'Technology', 'Artificial Intelligence',
  'Climate', 'Agriculture', 'Rural Development', 'Urban Governance',
  'Healthcare', 'International Relations', 'Entrepreneurship', 'Gender Studies',
  'Social Justice', 'Law', 'Data Science'
];

const PARTICIPATION_OPTIONS = [
  'Read', 'Publish Articles', 'Volunteer', 'Conduct Research',
  'Join Campaigns', 'Attend Events', 'Join Campus Chapter',
  'Become a Fellow', 'Mentor', 'Receive Newsletter'
];

const SKILL_OPTIONS = [
  'Research', 'Writing', 'Public Speaking', 'Graphic Design',
  'Video Editing', 'Data Analysis', 'Coding', 'Photography',
  'Event Management', 'Fundraising', 'Legal Research', 'Translation'
];

const ROLES = [
  'Student', 'Research Scholar', 'Working Professional', 'Civil Servant',
  'Entrepreneur', 'Journalist', 'Teacher', 'Advocate', 'Other'
];

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('register');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    // Tier 1
    fullName: '',
    email: '',
    password: '',
    country: 'India',
    state: '',
    cityDistrict: '',
    ageGroup: '18-24',
    termsAccepted: false,

    // Tier 2
    role: 'Student',
    institution: '',
    course: '',
    graduationYear: '',
    organization: '',
    designation: '',
    sector: '',
    interests: [] as string[],
    participation: [] as string[],
    skills: [] as string[],
    languages: 'English, Hindi',
    linkedin: '',
    github: '',
    orcid: '',
    website: '',

    // Tier 3
    whyJoin: '',
    passionateIssue: '',
    pastPublications: '',
    leadCampusChapter: false,
    cvFileName: ''
  });

  // Toggle selection arrays
  const toggleSelection = (field: 'interests' | 'participation' | 'skills', item: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const generatedMemberId = `PY-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Civic Profile Created Successfully! Your ID is: ${generatedMemberId}`);
  };

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

          <div className="flex items-center space-x-3 text-sm">
            <span className="text-gray-400 hidden sm:inline">
              {authMode === 'register' ? 'Already have a profile?' : "New to P&Y?"}
            </span>
            <button
              onClick={() => {
                setAuthMode(authMode === 'register' ? 'signin' : 'register');
                setStep(1);
              }}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 font-semibold transition-all"
            >
              {authMode === 'register' ? 'Sign In' : 'Build Civic Profile'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1">
        {authMode === 'signin' ? (
          /* SIGN IN FORM */
          <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Access Civic Portal</h2>
            <p className="text-sm text-gray-400 text-center mb-8">
              Sign in to manage your publications, research, and Civic Passport.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@institution.org"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all text-sm"
              >
                Sign In
              </button>
            </form>
          </div>
        ) : (
          /* CIVIC PROFILE REGISTRATION WIZARD */
          <div>
            {/* Title & Onboarding Intro */}
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Civic Identity Onboarding
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Civic Profile</span>
              </h1>
              <p className="text-gray-400 text-sm mt-2 max-w-xl mx-auto">
                Join India&apos;s sovereign digital youth institution. Build your verified Civic Passport for policy research and grassroots action.
              </p>
            </div>

            {/* Wizard Steps Navigation Bar */}
            <div className="flex items-center justify-between max-w-xl mx-auto mb-10 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />

              <button
                onClick={() => setStep(1)}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  step === 1
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-[#070b19] border border-white/20 text-gray-300'
                }`}
              >
                <span>1</span> Tier 1: Registration
              </button>

              <button
                onClick={() => setStep(2)}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  step === 2
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-[#070b19] border border-white/20 text-gray-300'
                }`}
              >
                <span>2</span> Tier 2: Profile
              </button>

              <button
                onClick={() => setStep(3)}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  step === 3
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-[#070b19] border border-white/20 text-gray-300'
                }`}
              >
                <span>3</span> Tier 3: Engagement
              </button>
            </div>

            {/* FORM CONTAINER */}
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
              
              {/* STEP 1: MINIMAL REGISTRATION */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white">Tier 1: Minimal Registration</h3>
                    <p className="text-xs text-gray-400 mt-1">Required to establish your baseline account credentials.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ananya@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Age Group *</label>
                      <select
                        value={formData.ageGroup}
                        onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                        className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Under 18">Under 18</option>
                        <option value="18-24">18–24 (Youth Target)</option>
                        <option value="25-34">25–34</option>
                        <option value="35-50">35–50</option>
                        <option value="50+">50+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Country *</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">State / UT *</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="e.g. Delhi, Maharashtra, Gujarat"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">City or District *</label>
                      <input
                        type="text"
                        value={formData.cityDistrict}
                        onChange={(e) => setFormData({ ...formData, cityDistrict: e.target.value })}
                        placeholder="e.g. New Delhi / Ahmedabad"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      className="mt-1 accent-cyan-500 rounded"
                      required
                    />
                    <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed">
                      I accept the <Link href="/terms" className="text-cyan-400 underline">Terms of Use</Link>, <Link href="/privacy" className="text-cyan-400 underline">Privacy Policy</Link>, and <Link href="/editorial-policy" className="text-cyan-400 underline">Editorial Guidelines</Link> of People &amp; Youth.
                    </label>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!formData.fullName || !formData.email || !formData.termsAccepted}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
                    >
                      Continue to Civic Profile &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CIVIC PROFILE */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white">Tier 2: Civic &amp; Academic Profile</h3>
                    <p className="text-xs text-gray-400 mt-1">This powers tailored recommendations across Dissent Dias and research journals.</p>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-3">Academic &amp; Professional Role</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: r })}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                            formData.role === r
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conditional Role Details */}
                  {formData.role === 'Student' || formData.role === 'Research Scholar' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Institution</label>
                        <input
                          type="text"
                          placeholder="e.g. IIFT, DU, IIT"
                          value={formData.institution}
                          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Course / Major</label>
                        <input
                          type="text"
                          placeholder="e.g. Public Policy, MBA, Law"
                          value={formData.course}
                          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Graduation Year</label>
                        <input
                          type="text"
                          placeholder="2027"
                          value={formData.graduationYear}
                          onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Organization</label>
                        <input
                          type="text"
                          placeholder="Org Name"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Designation</label>
                        <input
                          type="text"
                          placeholder="Analyst / Advocate"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Sector</label>
                        <input
                          type="text"
                          placeholder="Governance / Legal / Tech"
                          value={formData.sector}
                          onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Areas of Interest Multi-select */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                      Areas of Interest <span className="text-gray-500 font-normal">(Select multiple)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((item) => {
                        const selected = formData.interests.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleSelection('interests', item)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selected
                                ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                            }`}
                          >
                            {selected ? '✓ ' : '+ '}{item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills Multi-select */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                      Skills &amp; Capabilities <span className="text-gray-500 font-normal">(For volunteer matching)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map((item) => {
                        const selected = formData.skills.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleSelection('skills', item)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selected
                                ? 'bg-blue-500 text-white border-blue-400 font-bold'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                            }`}
                          >
                            {selected ? '✓ ' : '+ '}{item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Linked Accounts */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Academic &amp; Professional Links</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="url"
                        placeholder="LinkedIn Profile URL"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                      <input
                        type="url"
                        placeholder="GitHub / Portfolio URL"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="ORCID iD (Researchers)"
                        value={formData.orcid}
                        onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 text-xs font-semibold hover:bg-white/5"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20"
                    >
                      Institutional Engagement &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: INSTITUTIONAL ENGAGEMENT & PASSPORT PREVIEW */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white">Tier 3: Institutional Engagement</h3>
                    <p className="text-xs text-gray-400 mt-1">Deepen your participation and unlock your official Civic Passport ID.</p>
                  </div>

                  {/* Civic Passport Card Live Preview */}
                  <div className="bg-gradient-to-br from-blue-950/80 via-[#0a122c] to-cyan-950/80 border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">PEOPLE &amp; YOUTH — CIVIC PASSPORT PREVIEW</span>
                        <h4 className="text-xl font-extrabold text-white mt-1">{formData.fullName || 'Member Name'}</h4>
                        <p className="text-xs text-gray-400">{formData.role} • {formData.cityDistrict || 'District'}, {formData.state || 'State'}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-mono px-3 py-1 rounded-full font-bold">
                          {generatedMemberId}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center">
                      <div>
                        <p className="text-xs text-gray-400">Publications</p>
                        <p className="text-lg font-bold text-cyan-400">00</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Civic Hours</p>
                        <p className="text-lg font-bold text-cyan-400">00</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Impact Score</p>
                        <p className="text-lg font-bold text-cyan-400">100 pts</p>
                      </div>
                    </div>
                  </div>

                  {/* Contribution Questions */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Why do you want to join People &amp; Youth?</label>
                      <textarea
                        rows={2}
                        placeholder="Briefly state your primary objective or vision..."
                        value={formData.whyJoin}
                        onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">What governance or public policy issue are you most passionate about?</label>
                      <input
                        type="text"
                        placeholder="e.g. Higher Education Transparency, RTI Accountability, Rural Enterprise"
                        value={formData.passionateIssue}
                        onChange={(e) => setFormData({ ...formData, passionateIssue: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Campus Leadership Checkbox */}
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                    <input
                      type="checkbox"
                      id="chapter"
                      checked={formData.leadCampusChapter}
                      onChange={(e) => setFormData({ ...formData, leadCampusChapter: e.target.checked })}
                      className="accent-cyan-500 rounded h-4 w-4"
                    />
                    <label htmlFor="chapter" className="text-xs text-gray-300">
                      <strong>Campus Chapter Leadership:</strong> I am interested in establishing or leading a People &amp; Youth Chapter at my institution/city.
                    </label>
                  </div>

                  <div className="pt-6 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 text-xs font-semibold hover:bg-white/5"
                    >
                      &larr; Back
                    </button>

                    <button
                      type="submit"
                      className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.02]"
                    >
                      Generate Civic Passport &amp; Complete Registration
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        <p>&copy; 2026 People &amp; Youth Digital Institution. All rights reserved.</p>
      </footer>
    </main>
  );
}