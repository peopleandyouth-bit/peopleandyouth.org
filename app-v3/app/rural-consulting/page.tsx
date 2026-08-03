'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';
import { supabase } from '@/lib/supabaseClient';

const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";

export default function RuralConsultingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    districtState: '',
    consultingDomain: 'Municipal Governance Audit',
    projectDescription: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const generatedId = `PY-RURAL-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const { error } = await supabase.from('rural_consulting_inquiries').insert([
        {
          inquiry_id: generatedId,
          organization_name: form.organizationName,
          contact_person: form.contactPerson,
          email: form.email,
          district_state: form.districtState,
          consulting_domain: form.consultingDomain,
          project_description: form.projectDescription,
          status: 'New Inquiry'
        }
      ]);

      if (error) console.error(error);
      setSubmittedId(generatedId);
      setForm({
        organizationName: '', contactPerson: '', email: '',
        districtState: '', consultingDomain: 'Municipal Governance Audit', projectDescription: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={BRAND_LOGO_URL} alt="Logo" className="h-10 w-auto rounded-lg object-contain bg-white/10 p-1 border border-white/20" />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">People &amp; Youth</span>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mt-0.5">Digital Institution</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/about" className="hover:text-cyan-400 transition-colors">About Mandate</Link>
            <Link href="/careers" className="hover:text-cyan-400 transition-colors">Careers &amp; Opportunities</Link>
            <Link href="/submit-paper" className="hover:text-cyan-400 transition-colors">Policy Journals</Link>
            <Link href="/rural-consulting" className="text-cyan-400 font-bold border-b-2 border-cyan-400 py-1">Rural Consulting</Link>
          </nav>

          <GoogleTranslate />
        </div>
      </header>

      {/* CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 py-12 w-full flex-1 space-y-16">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            GRASSROOTS GOVERNANCE INITIATIVE
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white">Rural Governance &amp; Advisory</h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Bridging academic public policy scholars with Panchayati Raj institutions, rural district administrations, and local development programs across India.
          </p>
        </div>

        {/* 3 PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
            <span className="text-2xl">🌾</span>
            <h3 className="text-lg font-bold text-white">Panchayati Raj Technical Assistance</h3>
            <p className="text-xs text-gray-300 leading-relaxed">Assisting Gram Panchayats with participatory budgeting, local scheme audits, and digital record keeping.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-bold text-white">Municipal Performance Audits</h3>
            <p className="text-xs text-gray-300 leading-relaxed">Empirical field evaluations measuring government scheme outcomes across tier-2, tier-3, and rural blocks.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
            <span className="text-2xl">🏛</span>
            <h3 className="text-lg font-bold text-white">District Leadership Labs</h3>
            <p className="text-xs text-gray-300 leading-relaxed">Training youth and local stakeholders in Right to Information (RTI) filing and public accountability frameworks.</p>
          </div>
        </div>

        {/* CONSULTING INQUIRY FORM */}
        <section className="bg-gradient-to-br from-[#0c1638] via-[#070b19] to-[#0a1836] border border-cyan-500/40 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">PROJECT INTAKE PORTAL</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Initiate a Rural Governance Partnership</h2>
            <p className="text-xs text-gray-300">District administrations, educational institutions, and NGOs can request consulting engagement below.</p>
          </div>

          {submittedId && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-mono">
              ✓ Consulting Inquiry Registered ({submittedId})! Our Rural Governance Advisory Team will review your project brief.
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Organization / Body Name *</label>
              <input
                type="text"
                value={form.organizationName}
                onChange={e => setForm({...form, organizationName: e.target.value})}
                placeholder="e.g. Gram Panchayat Advisory Board / Youth NGO"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Contact Person Name *</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={e => setForm({...form, contactPerson: e.target.value})}
                placeholder="e.g. Rajesh Kumar"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="contact@org.in"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">District &amp; State *</label>
              <input
                type="text"
                value={form.districtState}
                onChange={e => setForm({...form, districtState: e.target.value})}
                placeholder="e.g. Gaya, Bihar / Varanasi, UP"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Consulting Domain *</label>
              <select
                value={form.consultingDomain}
                onChange={e => setForm({...form, consultingDomain: e.target.value})}
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="Municipal Governance Audit">Municipal Governance Audit</option>
                <option value="Panchayati Raj Technical Assistance">Panchayati Raj Technical Assistance</option>
                <option value="RTI & Public Finance Transparency Drive">RTI &amp; Public Finance Transparency Drive</option>
                <option value="District Youth Leadership Workshop">District Youth Leadership Workshop</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Project Description &amp; Scope *</label>
              <textarea
                rows={4}
                value={form.projectDescription}
                onChange={e => setForm({...form, projectDescription: e.target.value})}
                placeholder="Outline the local challenges, target panchayats/districts, and expected consulting outcomes..."
                className="w-full bg-[#070b19] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Advisory Request →'}
              </button>
            </div>
          </form>
        </section>

      </div>

    </main>
  );
}
