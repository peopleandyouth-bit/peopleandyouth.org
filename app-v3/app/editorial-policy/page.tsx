import React from 'react';
import Link from 'next/link';

export default function EditorialPolicyPage() {
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
          <Link
            href="/signin"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 transition-all"
          >
            &larr; Back to Portal
          </Link>
        </div>
      </header>

      {/* Policy Content */}
      <article className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-1">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Research &amp; Publishing Integrity
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Editorial Guidelines</h1>
          <p className="text-xs text-cyan-400 mb-8 font-mono">Effective Date: 03/08/2026</p>

          <div className="space-y-6 text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-6">
            <section>
              <h2 className="text-lg font-bold text-white mb-2">Editorial Philosophy</h2>
              <p>People &amp; Youth is committed to advancing informed public discourse through rigorous research, intellectual honesty, constitutional values, and evidence-based dialogue. We believe meaningful disagreement strengthens democratic institutions when conducted with civility, integrity and respect.</p>
            </section>

            <section className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-5">
              <h2 className="text-base font-bold text-cyan-300 mb-3 uppercase tracking-wider text-xs">Core Editorial Principles</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-gray-200">
                <li>• Evidence before opinion</li>
                <li>• Accuracy before speed</li>
                <li>• Dialogue before polarization</li>
                <li>• Integrity before popularity</li>
                <li>• Public interest before institutional interest</li>
                <li>• Constitutional values before partisan considerations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Publication Standards</h2>
              <p className="mb-2">Submissions should present verifiable facts, distinguish clearly between fact and opinion, respect academic integrity, maintain professional language, and avoid plagiarism or fabricated information.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Citation &amp; Verification</h2>
              <p>Authors are encouraged to cite primary sources wherever possible, including legislation, government reports, judicial decisions, peer-reviewed research and official statistics.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Conflicts of Interest</h2>
              <p>Authors should disclose financial, institutional, political or personal relationships that could reasonably influence their work.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Artificial Intelligence</h2>
              <p>Authors may use AI-assisted tools for research support, language improvement or formatting, provided human authors retain full responsibility for accuracy, AI content is independently verified, and sources are not fabricated.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Corrections &amp; Prohibited Content</h2>
              <p>Material factual errors will be corrected promptly. We strictly prohibit defamatory material, hate speech, incitement to violence, deliberate misinformation, and plagiarized work.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">Editorial Independence</h2>
              <p>Editorial decisions are made independently of donors, advertisers, institutional partners, political organizations, or external influence.</p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h2 className="text-lg font-bold text-white mb-1">Contact</h2>
              <p className="text-xs text-gray-400">Editorial inquiries, submissions, and corrections may be sent to:</p>
              <a href="mailto:contact@peopleandyouth.org" className="text-cyan-400 font-mono text-xs hover:underline">contact@peopleandyouth.org</a>
            </section>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        <p>&copy; 2026 People &amp; Youth Digital Institution. All rights reserved.</p>
      </footer>
    </main>
  );
}