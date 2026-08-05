'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function ComprehensiveCareersPage() {
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantPortfolio, setApplicantPortfolio] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const departments = [
    'All',
    'Marketing & Growth',
    'Sales & Partnerships',
    'Finance & Accounting',
    'Policy & Audit',
    'Editorial & Journals',
    'Legal & Governance',
    'Technology & Data',
    'Youth Praxis',
    'Strategy & Analytics',
    'Media & Design'
  ];

  const openings = [
    // MARKETING & GROWTH
    {
      id: 'm1',
      title: 'Growth Marketing Lead',
      dept: 'Marketing & Growth',
      type: 'Full-Time / Hybrid',
      location: 'New Delhi / Remote',
      exp: '2-4 Years',
      desc: 'Drive digital readership acquisition, campaign performance, conversion funnels, and organic brand positioning for People & Youth across platforms.',
      reqs: ['Proven track record in digital growth marketing and performance analytics', 'Deep understanding of SEO, acquisition funnels, and content distribution', 'Experience managing multi-channel campaigns']
    },
    {
      id: 'm2',
      title: 'Social Media & Brand Strategist',
      dept: 'Marketing & Growth',
      type: 'Full-Time / Remote',
      location: 'Remote',
      exp: '1-3 Years',
      desc: 'Craft and execute brand narrative strategies across Instagram, LinkedIn, YouTube, and X, translating complex research into viral civic discourse.',
      reqs: ['Strong graphic copywriting and brand storytelling capability', 'Expertise in social analytics and audience engagement strategies']
    },
    {
      id: 'm3',
      title: 'Digital Campaign Operations Manager',
      dept: 'Marketing & Growth',
      type: 'Part-Time / Remote',
      location: 'Remote',
      exp: '1+ Years',
      desc: 'Manage email marketing automation, newsletter dispatches, and reader re-engagement workflows.',
      reqs: ['Hands-on experience with CRM tools, Mailchimp/Klaviyo, and A/B testing']
    },

    // SALES & PARTNERSHIPS
    {
      id: 's1',
      title: 'Institutional Partnerships Lead',
      dept: 'Sales & Partnerships',
      type: 'Full-Time / On-site',
      location: 'New Delhi',
      exp: '3-5 Years',
      desc: 'Establish strategic alliances with universities, policy think-tanks, international institutions, and civic organizations.',
      reqs: ['Extensive network across academic, policy, or corporate CSR sectors', 'Proven deal-closing capability for institutional partnerships']
    },
    {
      id: 's2',
      title: 'Corporate Sponsorship & Grants Executive',
      dept: 'Sales & Partnerships',
      type: 'Full-Time / Hybrid',
      location: 'New Delhi / Remote',
      exp: '2+ Years',
      desc: 'Secure corporate sponsorships, CSR funding, and institutional grants for research projects and campus summits.',
      reqs: ['Experience in grant writing, CSR pitch decks, and institutional fundraising']
    },
    {
      id: 's3',
      title: 'Civic Passport Membership Growth Manager',
      dept: 'Sales & Partnerships',
      type: 'Full-Time / Remote',
      location: 'Remote',
      exp: '1-3 Years',
      desc: 'Scale subscriber growth and retention for the Civic Passport (₹499) membership tier through direct outreach and referral programs.',
      reqs: ['Background in subscription sales, customer success, or community growth']
    },

    // FINANCE & ACCOUNTING
    {
      id: 'f1',
      title: 'Financial Controller & Chief Accountant',
      dept: 'Finance & Accounting',
      type: 'Full-Time / On-site',
      location: 'New Delhi',
      exp: '4+ Years',
      desc: 'Oversee institutional bookkeeping, tax compliance (GST/TDS), financial reporting, audit preparation, and payroll execution.',
      reqs: ['CA / Inter CA / M.Com with deep knowledge of Indian tax compliance and accounting standards', 'Proficiency in Tally/Zoho Books and financial reporting']
    },
    {
      id: 'f2',
      title: 'Fiscal Governance & Grant Manager',
      dept: 'Finance & Accounting',
      type: 'Full-Time / Hybrid',
      location: 'New Delhi',
      exp: '2-4 Years',
      desc: 'Track grant disbursements, budget allocation across research projects, and ensure statutory financial audits.',
      reqs: ['Experience in non-profit or research institution accounting and grant management']
    },

    // POLICY & AUDIT LAB
    {
      id: 'p1',
      title: 'Senior Policy Research Fellow (CAG Audits)',
      dept: 'Policy & Audit',
      type: 'Full-Time / Hybrid',
      location: 'New Delhi / Remote',
      exp: '3-5 Years',
      desc: 'Lead empirical analysis on Comptroller and Auditor General (CAG) reports, statutory audit critiques, and fiscal accountability frameworks.',
      reqs: ['Master degree in Public Policy, Economics, or MBA', 'Proven track record in analyzing public finance data and audit reports']
    },
    {
      id: 'p2',
      title: 'Statutory Compliance & Fiscal Analyst',
      dept: 'Policy & Audit',
      type: 'Full-Time / Remote',
      location: 'Remote',
      exp: '1-3 Years',
      desc: 'Analyze state and central budget allocations, public sector spending metrics, and statutory compliance documentation.',
      reqs: ['Degree in Economics, Commerce, or Public Finance', 'Proficiency in data visualization']
    },

    // EDITORIAL & JOURNALS
    {
      id: 'e1',
      title: 'Managing Editor (Dissent Dias)',
      dept: 'Editorial & Journals',
      type: 'Full-Time / Hybrid',
      location: 'New Delhi / Remote',
      exp: '3+ Years',
      desc: 'Oversee editorial direction, peer-review pipelines, and publication standards for philosophical essays, soliloquies, and critiques.',
      reqs: ['Background in Philosophy, Political Theory, or Literature', 'Experience in academic publishing']
    },
    {
      id: 'e2',
      title: 'Renaissance Journals Reviewer',
      dept: 'Editorial & Journals',
      type: 'Part-Time / Remote',
      location: 'Remote',
      exp: '2+ Years',
      desc: 'Peer-review submissions across our 14 Renaissance Journals, ensuring academic integrity and dialectical rigor.',
      reqs: ['Postgraduate qualification in relevant social sciences or law']
    },

    // LEGAL & GOVERNANCE
    {
      id: 'l1',
      title: 'Constitutional Law & PIL Associate',
      dept: 'Legal & Governance',
      type: 'Full-Time / Hybrid',
      location: 'New Delhi',
      exp: '2-4 Years',
      desc: 'Draft Public Interest Litigation (PIL) petitions, analyze constitutional mandates, and support public interest advocacy.',
      reqs: ['LL.B / LL.M degree from a recognized university', 'Experience drafting court petitions']
    },
    {
      id: 'l2',
      title: 'RTI & Transparency Specialist',
      dept: 'Legal & Governance',
      type: 'Part-Time / Remote',
      location: 'Remote',
      exp: '1-3 Years',
      desc: 'Formulate and file Right to Information (RTI) applications seeking institutional records and public accountability data.',
      reqs: ['In-depth knowledge of the RTI Act and administrative procedures']
    },

    // TECHNOLOGY & DATA
    {
      id: 't1',
      title: 'Sovereign Data Infrastructure Engineer',
      dept: 'Technology & Data',
      type: 'Full-Time / Remote',
      location: 'Remote',
      exp: '2-5 Years',
      desc: 'Build and maintain sovereign PostgreSQL database schemas, automated PDF watermarking pipelines, and security RLS engines.',
      reqs: ['Expertise in PostgreSQL, Node.js, Supabase, and REST APIs']
    },
    {
      id: 't2',
      title: 'Full-Stack Next.js Architect',
      dept: 'Technology & Data',
      type: 'Contract / Remote',
      location: 'Remote',
      exp: '3+ Years',
      desc: 'Enhance public-facing reader templates, admin CIMS consoles, and real-time search engines using Next.js App Router and Tailwind CSS.',
      reqs: ['Mastery of React, Next.js, TypeScript, and CSS Tailwind']
    },

    // YOUTH PRAXIS & CIVIC
    {
      id: 'y1',
      title: 'University Chapter Lead Coordinator',
      dept: 'Youth Praxis',
      type: 'Leadership / Hybrid',
      location: 'Pan-India',
      exp: 'Students / Graduates',
      desc: 'Establish and coordinate People & Youth chapters across university campuses, organizing forums and civic debates.',
      reqs: ['Demonstrated campus leadership and passion for civic engagement']
    },
    {
      id: 'y2',
      title: 'Institutional Operations Manager',
      dept: 'Youth Praxis',
      type: 'Full-Time / On-site',
      location: 'New Delhi',
      exp: '2+ Years',
      desc: 'Manage daily platform operations, event logistics, member communications, and chapter budgets.',
      reqs: ['Strong administrative and operational skills']
    },

    // STRATEGY & ANALYTICS
    {
      id: 'sa1',
      title: 'Macro-Strategy Analyst',
      dept: 'Strategy & Analytics',
      type: 'Full-Time / Hybrid',
      location: 'New Delhi / Remote',
      exp: '2-4 Years',
      desc: 'Conduct quantitative research on international trade, monetary strategy, and global supply chain dynamics.',
      reqs: ['Background in International Relations, Economics, or Strategic Studies']
    },

    // MEDIA & DESIGN
    {
      id: 'md1',
      title: 'Video Producer & Multimedia Editor',
      dept: 'Media & Design',
      type: 'Full-Time / Hybrid',
      location: 'New Delhi / Remote',
      exp: '2+ Years',
      desc: 'Produce high-quality video essays, YouTube documentaries, and short-form video content for social channels.',
      reqs: ['Proficiency in Premiere Pro, After Effects, and sound design']
    },
    {
      id: 'md2',
      title: 'Creative Lead & UI/UX Designer',
      dept: 'Media & Design',
      type: 'Full-Time / Remote',
      location: 'Remote',
      exp: '2+ Years',
      desc: 'Design editorial layouts, website components, social graphics, and publication covers maintaining brand typography.',
      reqs: ['Mastery of Figma, Adobe Creative Cloud, and typography standards']
    }
  ];

  const filteredOpenings = useMemo(() => {
    if (selectedDept === 'All') return openings;
    return openings.filter((o) => o.dept === selectedDept);
  }, [selectedDept]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSelectedJob(null);
      setSubmitted(false);
      setApplicantName('');
      setApplicantEmail('');
      setApplicantPhone('');
      setApplicantPortfolio('');
      setCoverNote('');
    }, 3500);
  };

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      {/* TOP NAVIGATION BAR */}
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
          ← Return to Main Newsroom
        </Link>
        <span>PEOPLEANDYOUTH.ORG &middot; CAREERS & TALENT PORTAL</span>
      </div>

      {/* HEADER SECTION */}
      <header className="border-b border-white/10 px-6 py-12 max-w-6xl mx-auto space-y-4 text-center">
        <span className="text-amber-400 font-bold uppercase tracking-[0.2em] text-[10px] bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
          BUILD THE FUTURE OF CIVIC PRAXIS
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white uppercase font-serif tracking-tight pt-2">
          Careers & Opportunities
        </h1>
        <p className="text-gray-300 text-sm italic font-serif max-w-2xl mx-auto leading-relaxed">
          Join a sovereign knowledge platform across Policy, Research, Marketing, Sales, Finance, Engineering, Legal, and Creative Media.
        </p>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto p-6 sm:p-12 space-y-8">
        {/* DEPARTMENT FILTER TABS */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-white/10 pb-6">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                selectedDept === dept
                  ? 'bg-amber-400 text-black shadow-lg scale-105'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {dept} {dept === 'All' ? `(${openings.length})` : ''}
            </button>
          ))}
        </div>

        {/* OPENINGS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpenings.map((job) => (
            <div
              key={job.id}
              className="bg-white/5 border border-white/10 hover:border-amber-400/50 p-6 rounded-3xl space-y-4 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                  <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {job.dept}
                  </span>
                  <span className="text-gray-400">{job.type}</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {job.title}
                </h3>

                <p className="text-gray-300 text-[11px] leading-relaxed font-serif">
                  {job.desc}
                </p>

                <div className="pt-2 text-[10px] text-gray-400 flex flex-wrap gap-4 border-t border-white/5">
                  <span>📍 {job.location}</span>
                  <span>⏳ Experience: {job.exp}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedJob(job)}
                className="w-full py-3 bg-amber-400 text-black font-extrabold uppercase rounded-2xl hover:bg-amber-300 transition-all text-xs tracking-wider shadow-md mt-4"
              >
                View Role & Apply →
              </button>
            </div>
          ))}
        </div>

        {/* APPLICATION MODAL */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a1024] border border-amber-400/40 p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <span className="text-amber-400 font-bold uppercase text-[9px]">{selectedJob.dept}</span>
                  <h2 className="text-lg font-extrabold text-white mt-0.5">{selectedJob.title}</h2>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-white text-base font-bold">
                  ✕
                </button>
              </div>

              {submitted ? (
                <div className="py-12 text-center bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl space-y-2">
                  <div className="text-2xl">✅</div>
                  <h3 className="text-base font-bold">Application Submitted Successfully!</h3>
                  <p className="text-xs text-gray-300 max-w-md mx-auto">
                    Thank you, {applicantName}. Our selection board will review your credentials for "{selectedJob.title}" and contact you at {applicantEmail}.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* ROLE DETAILS */}
                  <div className="space-y-3 bg-[#070b19] p-4 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-bold text-amber-400 uppercase">Role Key Requirements:</h4>
                    <ul className="space-y-1.5 text-gray-300 text-[11px] list-disc list-inside">
                      {selectedJob.reqs.map((req: string, i: number) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* APPLICATION FORM */}
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase border-b border-white/10 pb-2">
                      Submit Your Candidate Profile
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-[9px] uppercase mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="Swaraj Shandilya"
                          className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-[9px] uppercase mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          placeholder="contact@peopleandyouth.org"
                          className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-[9px] uppercase mb-1">Phone / WhatsApp</label>
                        <input
                          type="tel"
                          value={applicantPhone}
                          onChange={(e) => setApplicantPhone(e.target.value)}
                          placeholder="+91..."
                          className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-[9px] uppercase mb-1">LinkedIn / CV / Portfolio Link *</label>
                        <input
                          type="url"
                          required
                          value={applicantPortfolio}
                          onChange={(e) => setApplicantPortfolio(e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-[9px] uppercase mb-1">Brief Statement of Purpose</label>
                      <textarea
                        rows={3}
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                        placeholder="Why do you wish to join People & Youth in this capacity?"
                        className="w-full bg-[#070b19] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none text-[11px]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs tracking-wider shadow-lg"
                    >
                      🚀 Submit Official Application
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}