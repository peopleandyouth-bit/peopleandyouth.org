'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';
import { supabase } from '@/lib/supabaseClient';

const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";

// 14 ADVISORY DIVISIONS PARALLEL TO 14 RENAISSANCE JOURNALS
const ADVISORY_DIVISIONS = [
  {
    id: "policy",
    title: "Policy Strategy & Legislative Advisory",
    journalMatch: "Policy Renaissance",
    icon: "🏛️",
    desc: "Assisting government bodies, think tanks, and civic institutions in drafting evidence-based legislation and policy frameworks."
  },
  {
    id: "education",
    title: "Education Reform & Campus Governance Advisory",
    journalMatch: "Education Renaissance",
    icon: "🎓",
    desc: "Guiding higher education institutions, universities, and schools on accreditation compliance, campus readiness, and curriculum modernization."
  },
  {
    id: "trade",
    title: "Trade & Cross-Border Commerce Advisory",
    journalMatch: "Trade Renaissance",
    icon: "💼",
    desc: "Providing strategic insights on international trade policy, export-import compliance, GIFT City regulations, and supply chain resilience."
  },
  {
    id: "governance",
    title: "Governance & Public Administration Advisory",
    journalMatch: "Governance Renaissance",
    icon: "⚖️",
    desc: "Auditing administrative efficiency, civil service reforms, anti-corruption mechanisms, and public transparency drives."
  },
  {
    id: "technology",
    title: "Technology, AI Ethics & DPI Advisory",
    journalMatch: "Technology Renaissance",
    icon: "🤖",
    desc: "Advising public and private sectors on Digital Public Infrastructure (DPI), AI ethics, cybersecurity governance, and data privacy compliance."
  },
  {
    id: "health",
    title: "Public Health & Sanitation Advisory",
    journalMatch: "Health Renaissance",
    icon: "🏥",
    desc: "Evaluating primary healthcare delivery, rural medical supply chains, epidemic preparedness, and municipal sanitation drives."
  },
  {
    id: "climate",
    title: "Climate Action & Ecological Advisory",
    journalMatch: "Climate Renaissance",
    icon: "🌿",
    desc: "Formulating renewable energy roadmaps, carbon credit auditing, disaster risk reduction, and sustainable environmental policies."
  },
  {
    id: "law",
    title: "Constitutional Law & Judicial Advisory",
    journalMatch: "Law Renaissance",
    icon: "📜",
    desc: "Providing legal research, constitutional auditing, court management strategy, and public interest law consultations."
  },
  {
    id: "economics",
    title: "Empirical Economics & Market Advisory",
    journalMatch: "Economics Renaissance",
    icon: "📊",
    desc: "Conducting field-level econometric studies, labor market analysis, inflation impact studies, and informal economy evaluations."
  },
  {
    id: "finance",
    title: "Public Finance & Fiscal Budgeting Advisory",
    journalMatch: "Finance Renaissance",
    icon: "💳",
    desc: "Assisting local Panchayats and municipal corporations with participatory budgeting, CAG audit compliance, and tax revenue optimization."
  },
  {
    id: "innovation",
    title: "Grassroots Innovation & Startups Advisory",
    journalMatch: "Innovation Renaissance",
    icon: "💡",
    desc: "Mentoring youth entrepreneurs, intellectual property protection, incubator management, and technology transfer frameworks."
  },
  {
    id: "agriculture",
    title: "Agriculture & Rural Development Advisory",
    journalMatch: "Agriculture Renaissance",
    icon: "🌾",
    desc: "Empowering Panchayati Raj institutions, farmer-producer organizations (FPOs), agrarian market linkage, and crop insurance audits."
  },
  {
    id: "urban",
    title: "Urban Planning & Smart Municipalities Advisory",
    journalMatch: "Urban Renaissance",
    icon: "🏙️",
    desc: "Consulting tier-2/tier-3 cities on municipal performance audits, traffic management, waste treatment, and affordable housing."
  },
  {
    id: "international",
    title: "International Diplomacy & Global Affairs Advisory",
    journalMatch: "International Relations Renaissance",
    icon: "🌐",
    desc: "Advising international bodies and diplomatic missions on South Asian geopolitics, multilateral treaties, and global youth leadership."
  }
];

export default function AdvisoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    districtState: '',
    consultingDomain: 'Policy Strategy & Legislative Advisory',
    projectDescription: ''
  });

  const handleSelectDomain = (domainTitle: string) => {
    setForm((prev) => ({ ...prev, consultingDomain: domainTitle }));
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const generatedId = `PY-ADV-${Math.floor(100000 + Math.random() * 900000)}`;

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
        districtState: '', consultingDomain: 'Policy Strategy & Legislative Advisory', projectDescription: ''
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
            <Link href="/constitution" className="hover:text-amber-300 text-amber-400 font-semibold transition-colors">📜 Constitution</Link>
            <Link href="/careers" className="hover:text-cyan-400 transition-colors">Careers &amp; Opportunities</Link>
            <Link href="/submit-paper" className="hover:text-cyan-400 transition-colors">Policy Journals</Link>
            <Link href="/rural-consulting" className="text-emerald-400 font-bold border-b-2 border-emerald-400 py-1">🏛️ Advisory</Link>
          </nav>

          <GoogleTranslate />
        </div>
      </header>

      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-16">
        
        {/* TITLE BANNER */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            INSTITUTIONAL ADVISORY &amp; CONSULTING EYES
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            14 Specialized Advisory Divisions
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            Parallel to our 14 Renaissance Publications, our advisory arms bridge empirical academic research with government bodies, municipal corporations, universities, and international organisations.
          </p>
        </div>

        {/* 14 ADVISORY CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ADVISORY_DIVISIONS.map((item) => (
            <div 
              key={item.id} 
              className="bg-white/5 border border-white/10 hover:border-emerald-400/50 p-6 rounded-3xl space-y-4 flex flex-col justify-between transition-all group backdrop-blur-xl"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
                    Parallel: {item.journalMatch}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* CUSTOM SUBMISSION / PROPOSAL BUTTON FOR EACH SECTION */}
              <button
                onClick={() => handleSelectDomain(item.title)}
                className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>📝 Submit Proposal / Article</span>
                <span>↓</span>
              </button>
            </div>
          ))}
        </div>

        {/* INTAKE FORM */}
        <section 
          ref={formRef} 
          className="bg-gradient-to-br from-[#0c1638] via-[#070b19] to-[#0a1836] border border-emerald-500/40 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl"
        >
          <div className="space-y-2 border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">PROJECT &amp; ARTICLE INTAKE PORTAL</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Initiate an Advisory Engagement or Article Submission</h2>
            <p className="text-xs text-gray-300">Select your advisory domain below to submit proposals, research briefs, or request consulting partnerships.</p>
          </div>

          {submittedId && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-mono">
              ✓ Proposal Registered ({submittedId})! Our Institutional Advisory Team will review your brief within 48 hours.
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Organization / Body / Author Name *</label>
              <input
                type="text"
                value={form.organizationName}
                onChange={e => setForm({...form, organizationName: e.target.value})}
                placeholder="e.g. Gram Panchayat Advisory / University / Independent Scholar"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Contact Person Name *</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={e => setForm({...form, contactPerson: e.target.value})}
                placeholder="e.g. Dr. Rajesh Kumar"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
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
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">District &amp; State / Country *</label>
              <input
                type="text"
                value={form.districtState}
                onChange={e => setForm({...form, districtState: e.target.value})}
                placeholder="e.g. Delhi / Varanasi, UP / GIFT City, Gujarat"
                className="w-full bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-emerald-400 uppercase mb-2 font-bold">
                Target Advisory Division (14 Domains) *
              </label>
              <select
                value={form.consultingDomain}
                onChange={e => setForm({...form, consultingDomain: e.target.value})}
                className="w-full bg-[#070b19] border border-emerald-500/50 rounded-xl px-4 py-3 text-emerald-300 text-sm font-bold font-mono focus:outline-none focus:border-emerald-400"
              >
                {ADVISORY_DIVISIONS.map((div) => (
                  <option key={div.id} value={div.title}>
                    {div.title} (Parallel: {div.journalMatch})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase mb-2">Proposal Brief / Article Executive Summary *</label>
              <textarea
                rows={4}
                value={form.projectDescription}
                onChange={e => setForm({...form, projectDescription: e.target.value})}
                placeholder="Outline the scope of consulting engagement, policy brief abstract, or project objectives..."
                className="w-full bg-[#070b19] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Advisory Proposal →'}
              </button>
            </div>
          </form>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050814] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 font-mono">
          <p>&copy; 2026 People &amp; Youth Digital Institution (VNJCM). All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}
