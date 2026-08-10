'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ConsentFormContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const nameParam = searchParams.get('name') || '';

  const [email, setEmail] = useState(emailParam);
  const [name, setName] = useState(nameParam);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (nameParam) setName(nameParam);
  }, [emailParam, nameParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted || !email) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/consent/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, acceptedTerms: accepted })
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit consent. Please try again.');
      }
    } catch (err) {
      alert('An error occurred submitting your consent.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-[#070b19] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* HEADER */}
        <div className="border-b border-gray-800 pb-4 text-center">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block mb-1">
            PEOPLE & YOUTH • INSTITUTIONAL GOVERNANCE
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
            Institutional Consent & Mandate Acceptance
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Formal confirmation of appointment, code of conduct, and institutional terms.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-xl p-6 text-center space-y-3">
            <span className="text-3xl">✅</span>
            <h2 className="text-lg font-bold text-emerald-400 uppercase">Consent Formally Recorded</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Thank you, <strong>{name || email}</strong>. Your formal acceptance has been permanently logged in the People & Youth institutional directory and an alert has been dispatched to the Founder's Office.
            </p>
            <p className="text-xs text-amber-400 pt-2 font-mono">
              You may now proceed to log into your workspace at <a href="/admin" className="underline font-bold">peopleandyouth.org/admin</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* MEMBER DETAILS */}
            <div className="bg-[#030611] border border-gray-800 rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">FULL NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs text-white rounded outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">REGISTERED EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs text-white rounded outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* CODE OF CONDUCT & TERMS SUMMARY */}
            <div className="bg-[#030611] border border-gray-800 rounded-xl p-4 space-y-2 text-xs text-gray-300 max-h-48 overflow-y-auto font-sans leading-relaxed">
              <span className="font-bold text-amber-400 uppercase text-[10px] block">Institutional Code of Conduct Summary</span>
              <p>1. <strong>Intellectual Honesty:</strong> Members commit to rigorous, evidence-informed research, transparent discourse, and high standards of integrity.</p>
              <p>2. <strong>Institutional Trust:</strong> Members shall safeguard internal communications, member datasets, and institutional assets.</p>
              <p>3. <strong>Representation:</strong> Members represent People & Youth with professionalism and adhere to the mandates associated with their appointed role.</p>
            </div>

            {/* ACCEPTANCE CHECKBOX */}
            <label className="flex items-start gap-3 p-3 bg-[#030611] border border-amber-500/30 rounded-xl cursor-pointer hover:border-amber-500/60 transition">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="accent-amber-500 h-5 w-5 mt-0.5"
                required
              />
              <span className="text-xs text-gray-200 leading-snug">
                I formally confirm my appointment at <strong>People & Youth</strong>, accept the responsibilities associated with my designation, and agree to uphold the Institutional Code of Conduct.
              </span>
            </label>

            <button
              type="submit"
              disabled={!accepted || submitting}
              className={`w-full py-3 rounded text-xs font-black uppercase tracking-wider transition ${
                accepted && !submitting
                  ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Recording Consent...' : 'Submit Formal Consent & Accept Appointment'}
            </button>
          </form>
        )}

        <div className="border-t border-gray-800 pt-4 text-center text-[10px] text-gray-500">
          OFFICE OF THE FOUNDER & CHIEF EXECUTIVE OFFICER • People & Youth
        </div>
      </div>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030611] text-white flex items-center justify-center">Loading Consent Form...</div>}>
      <ConsentFormContent />
    </Suspense>
  );
}