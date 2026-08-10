'use client';

import React, { useState } from 'react';

export default function AcademyEnrollPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [programTrack, setProgramTrack] = useState('General Policy & Research Fellowship');
  const [institution, setInstitution] = useState('');
  const [statement, setStatement] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/academy/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          program_track: programTrack,
          institution_affiliation: institution,
          statement_of_purpose: statement
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || 'Failed to submit application. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-[#070b19] border border-amber-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
        
        {/* HEADER BANNER */}
        <div className="border-b border-gray-800 pb-6 text-center">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block mb-2">
            PEOPLE & YOUTH ACADEMY • ADMISSIONS 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
            Fellowship Enrollment Application
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-lg mx-auto leading-relaxed">
            Submit your application to participate in research fellowships, public policy analysis, and institutional initiatives across the People & Youth network.
          </p>
        </div>

        {submitted ? (
          /* SUCCESS STATE */
          <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-2xl p-8 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
              ✓
            </div>
            <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-wide">
              Application Received
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
              Thank you, <strong>{fullName}</strong>. Your enrollment application for the <strong>{programTrack}</strong> has been logged in our institutional directory.
            </p>
            <div className="p-4 bg-[#030611] border border-gray-800 rounded-xl text-xs text-amber-400 font-mono">
              📬 An official acknowledgement email has been dispatched to <strong>{email}</strong>.
            </div>
          </div>
        ) : (
          /* APPLICATION FORM */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {errorMessage && (
              <div className="p-4 bg-red-950/40 border border-red-500/50 text-red-300 text-xs rounded-xl">
                ⚠️ {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                  FULL OFFICIAL NAME *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                  EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  CONTACT PHONE NUMBER
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                  PROGRAM TRACK *
                </label>
                <select
                  value={programTrack}
                  onChange={(e) => setProgramTrack(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                >
                  <option value="General Policy & Research Fellowship">General Policy & Research Fellowship</option>
                  <option value="Public Policy & Governance Track">Public Policy & Governance Track</option>
                  <option value="Legal & Constitutional Studies">Legal & Constitutional Studies</option>
                  <option value="Technology & AI Renaissance">Technology & AI Renaissance</option>
                  <option value="Macroeconomics & Rural Renaissance">Macroeconomics & Rural Renaissance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                INSTITUTION / UNIVERSITARIAN AFFILIATION
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Jawaharlal Nehru University / IIT Patna / Independent Researcher"
                className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                STATEMENT OF PURPOSE / RESEARCH INTERESTS
              </label>
              <textarea
                rows={4}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Briefly outline your academic background, areas of policy or research focus, and why you wish to join the People & Youth Academy..."
                className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Submit Enrollment Application →'}
            </button>
          </form>
        )}

        <div className="border-t border-gray-800 pt-4 text-center text-[10px] text-gray-500">
          ACADEMIC ADMISSIONS OFFICE • PEOPLE & YOUTH ACADEMY
        </div>
      </div>
    </div>
  );
}