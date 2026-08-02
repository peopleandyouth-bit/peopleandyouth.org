'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Country, State, City } from 'country-state-city';
import { createClient } from '@/lib/supabase/client';

// Data Lists
const INTEREST_OPTIONS = [
  'Public Policy', 'Education', 'Trade', 'Constitution', 'Economy',
  'Governance', 'Elections', 'RTI', 'Technology', 'Artificial Intelligence',
  'Climate', 'Agriculture', 'Rural Development', 'Urban Governance',
  'Healthcare', 'International Relations', 'Entrepreneurship', 'Gender Studies',
  'Social Justice', 'Law', 'Data Science'
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

interface SupabaseUser {
  id?: string;
  member_id: string;
  full_name: string;
  email: string;
  role: string;
  country: string;
  state: string;
  city_district: string;
  interests: string[];
  skills: string[];
  created_at?: string;
}

export default function AuthPage() {
  const supabase = createClient();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('register');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Location State
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>('IN');
  const [selectedStateIso, setSelectedStateIso] = useState<string>('');

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    country: 'India',
    state: '',
    cityDistrict: '',
    ageGroup: '18-24',
    termsAccepted: false,
    role: 'Student',
    interests: [] as string[],
    skills: [] as string[],
    whyJoin: '',
    passionateIssue: '',
  });

  // Check active session from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const active = localStorage.getItem('py_current_user');
      if (active) {
        try {
          setCurrentUser(JSON.parse(active));
        } catch {
          localStorage.removeItem('py_current_user');
        }
      }
    }
  }, []);

  // Location Cascading Dropdowns
  const allCountries = useMemo(() => Country.getAllCountries(), []);
  
  const availableStates = useMemo(() => {
    return selectedCountryIso ? State.getStatesOfCountry(selectedCountryIso) : [];
  }, [selectedCountryIso]);

  const availableCities = useMemo(() => {
    return selectedCountryIso && selectedStateIso 
      ? City.getCitiesOfState(selectedCountryIso, selectedStateIso) 
      : [];
  }, [selectedCountryIso, selectedStateIso]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryIso = e.target.value;
    const countryObj = allCountries.find((c) => c.isoCode === countryIso);
    
    setSelectedCountryIso(countryIso);
    setSelectedStateIso('');
    setFormData((prev) => ({
      ...prev,
      country: countryObj ? countryObj.name : '',
      state: '',
      cityDistrict: ''
    }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateIso = e.target.value;
    const stateObj = availableStates.find((s) => s.isoCode === stateIso);

    setSelectedStateIso(stateIso);
    setFormData((prev) => ({
      ...prev,
      state: stateObj ? stateObj.name : '',
      cityDistrict: ''
    }));
  };

  const toggleSelection = (field: 'interests' | 'skills', item: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  // REGISTER USER TO SUPABASE
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    const newMemberId = `PY-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const cleanEmail = formData.email.toLowerCase().trim();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            member_id: newMemberId,
            full_name: formData.fullName,
            email: cleanEmail,
            password: formData.password,
            role: formData.role,
            country: formData.country,
            state: formData.state,
            city_district: formData.cityDistrict,
            age_group: formData.ageGroup,
            interests: formData.interests,
            skills: formData.skills,
            why_join: formData.whyJoin,
            passionate_issue: formData.passionateIssue,
          },
        ])
        .select();

      if (error) {
        if (error.code === '23505') {
          setAuthError('An account with this email address already exists. Please sign in instead.');
        } else {
          setAuthError(error.message);
        }
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const userProfile: SupabaseUser = {
          member_id: data[0].member_id,
          full_name: data[0].full_name,
          email: data[0].email,
          role: data[0].role,
          country: data[0].country,
          state: data[0].state,
          city_district: data[0].city_district,
          interests: data[0].interests || [],
          skills: data[0].skills || [],
          created_at: data[0].created_at,
        };

        localStorage.setItem('py_current_user', JSON.stringify(userProfile));
        setCurrentUser(userProfile);
      }
    } catch {
      setAuthError('Failed to connect to authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SIGN IN USER WITH SUPABASE
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    const cleanEmail = loginEmail.toLowerCase().trim();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', loginPassword)
        .single();

      if (error || !data) {
        setAuthError('Invalid email or password. Please check your credentials.');
      } else {
        const userProfile: SupabaseUser = {
          member_id: data.member_id,
          full_name: data.full_name,
          email: data.email,
          role: data.role,
          country: data.country,
          state: data.state,
          city_district: data.city_district,
          interests: data.interests || [],
          skills: data.skills || [],
          created_at: data.created_at,
        };

        localStorage.setItem('py_current_user', JSON.stringify(userProfile));
        setCurrentUser(userProfile);
      }
    } catch {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('py_current_user');
    }
    setCurrentUser(null);
    setAuthMode('signin');
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

          {currentUser ? (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs transition-all"
            >
              Sign Out
            </button>
          ) : (
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-gray-400 hidden sm:inline">
                {authMode === 'register' ? 'Already have a profile?' : "New to P&Y?"}
              </span>
              <button
                onClick={() => {
                  setAuthMode(authMode === 'register' ? 'signin' : 'register');
                  setStep(1);
                  setAuthError('');
                }}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 font-semibold transition-all text-xs sm:text-sm"
              >
                {authMode === 'register' ? 'Sign In' : 'Build Civic Profile'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1">
        
        {/* LOGGED-IN DASHBOARD VIEW */}
        {currentUser ? (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-950/80 via-[#0a122c] to-cyan-950/80 border border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-8">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
                    Verified Civic Member
                  </span>
                  <h1 className="text-3xl font-extrabold text-white">{currentUser.full_name}</h1>
                  <p className="text-sm text-gray-400 mt-1">
                    {currentUser.role} • {currentUser.city_district}, {currentUser.state}, {currentUser.country}
                  </p>
                </div>
                <div>
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-sm font-mono px-4 py-2 rounded-full font-bold shadow-lg shadow-cyan-500/10">
                    {currentUser.member_id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-center">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Member ID</p>
                  <p className="text-sm font-bold text-cyan-400 mt-1">{currentUser.member_id}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Publications</p>
                  <p className="text-base font-bold text-cyan-400 mt-1">0 Submissions</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Civic Hours</p>
                  <p className="text-base font-bold text-cyan-400 mt-1">0 Hours</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Impact Score</p>
                  <p className="text-base font-bold text-cyan-400 mt-1">100 Pts</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-bold text-white">Areas of Policy Interest</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentUser.interests && currentUser.interests.length > 0 ? (
                    currentUser.interests.map((item) => (
                      <span key={item} className="bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No specific interests selected.</p>
                  )}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-bold text-white">Skills &amp; Capabilities</h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentUser.skills && currentUser.skills.length > 0 ? (
                    currentUser.skills.map((item) => (
                      <span key={item} className="bg-blue-950/50 border border-blue-500/30 text-blue-300 text-xs px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No specific skills selected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : authMode === 'signin' ? (
          /* SIGN IN FORM */
          <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Access Civic Portal</h2>
            <p className="text-sm text-gray-400 text-center mb-6">
              Sign in to manage your publications, research, and Civic Passport.
            </p>

            {authError && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed">
                {authError}
              </div>
            )}

            <form onSubmit={handleSignInSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all text-sm"
              >
                {loading ? 'Authenticating...' : 'Sign In →'}
              </button>
            </form>
          </div>
        ) : (
          /* CIVIC PROFILE REGISTRATION WIZARD */
          <div>
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

            {authError && (
              <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center leading-relaxed">
                {authError}
              </div>
            )}

            {/* Wizard Steps Navigation Bar */}
            <div className="flex items-center justify-between max-w-xl mx-auto mb-10 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />

              <button
                type="button"
                onClick={() => setStep(1)}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  step === 1
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-[#070b19] border border-white/20 text-gray-300'
                }`}
              >
                <span>1</span> Registration
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  step === 2
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-[#070b19] border border-white/20 text-gray-300'
                }`}
              >
                <span>2</span> Profile
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  step === 3
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-[#070b19] border border-white/20 text-gray-300'
                }`}
              >
                <span>3</span> Engagement
              </button>
            </div>

            {/* FORM CONTAINER */}
            <form onSubmit={handleRegisterSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
              
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
                        className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
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
                        className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
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
                        className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
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

                    {/* COUNTRY SELECT */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">Country *</label>
                      <select
                        value={selectedCountryIso}
                        onChange={handleCountryChange}
                        className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                        required
                      >
                        <option value="">Select Country</option>
                        {allCountries.map((c) => (
                          <option key={c.isoCode} value={c.isoCode}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* STATE / UT SELECT */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">State / UT *</label>
                      <select
                        value={selectedStateIso}
                        onChange={handleStateChange}
                        disabled={!selectedCountryIso || availableStates.length === 0}
                        className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                        required
                      >
                        <option value="">
                          {availableStates.length > 0 ? 'Select State / UT' : 'Select Country First'}
                        </option>
                        {availableStates.map((s) => (
                          <option key={s.isoCode} value={s.isoCode}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CITY / DISTRICT SELECT */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">City or District *</label>
                      {availableCities.length > 0 ? (
                        <select
                          value={formData.cityDistrict}
                          onChange={(e) => setFormData({ ...formData, cityDistrict: e.target.value })}
                          className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                          required
                        >
                          <option value="">Select City / District</option>
                          {availableCities.map((city) => (
                            <option key={city.name} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formData.cityDistrict}
                          onChange={(e) => setFormData({ ...formData, cityDistrict: e.target.value })}
                          placeholder={selectedStateIso ? "Type your City or District" : "Select State first"}
                          disabled={!selectedStateIso}
                          className="w-full bg-[#0b1228] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                          required
                        />
                      )}
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
                      disabled={!formData.fullName || !formData.email || !formData.password || !formData.state || !formData.cityDistrict || !formData.termsAccepted}
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

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                      Skills &amp; Capabilities
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

              {/* STEP 3: INSTITUTIONAL ENGAGEMENT */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-xl font-bold text-white">Tier 3: Institutional Engagement</h3>
                    <p className="text-xs text-gray-400 mt-1">Deepen your participation and unlock your official Civic Passport ID.</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-950/80 via-[#0a122c] to-cyan-950/80 border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">PEOPLE &amp; YOUTH — CIVIC PASSPORT PREVIEW</span>
                        <h4 className="text-xl font-extrabold text-white mt-1">{formData.fullName || 'Member Name'}</h4>
                        <p className="text-xs text-gray-400">{formData.role} • {formData.cityDistrict || 'District'}, {formData.state || 'State'}, {formData.country}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-mono px-3 py-1 rounded-full font-bold">
                          PY-2026-XXXXXX
                        </span>
                      </div>
                    </div>
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
                      disabled={loading}
                      className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all"
                    >
                      {loading ? 'Saving to Database...' : 'Generate Civic Passport & Complete Registration'}
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