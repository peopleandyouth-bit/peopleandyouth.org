import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
            Data Governance &amp; Trust
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
          <p className="text-xs text-cyan-400 mb-8 font-mono">Effective Date: 03/08/2026</p>

          <div className="space-y-6 text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-6">
            <p>
              People &amp; Youth values the privacy of its members, contributors, researchers, volunteers and visitors. We believe transparency is essential to maintaining public trust.
            </p>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">1. Information We Collect</h2>
              <p className="mb-2">We may collect:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li>Name, Email address, Username, Encrypted password</li>
                <li>Country, State, City, or District</li>
                <li>Professional or academic affiliation</li>
                <li>Areas of civic and policy interest</li>
                <li>Profile photograph, Social media links (optional)</li>
                <li>Publications, submissions, event registrations, volunteer &amp; fellowship applications</li>
                <li>Device information, Browser type, IP address, Cookies, and analytics data</li>
              </ul>
              <p className="mt-2 text-xs text-gray-400 italic">Sensitive personal information will only be collected where necessary and with appropriate notice or consent.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">2. Why We Collect Information</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li>Create and manage user accounts and Civic Passports.</li>
                <li>Personalize content recommendations and facilitate research collaborations.</li>
                <li>Process event registrations and fellowship applications.</li>
                <li>Publish contributor profiles where authorized.</li>
                <li>Improve accessibility, security, and platform performance.</li>
                <li>Communicate newsletters, institutional updates, and detect fraud.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">3. Cookies</h2>
              <p>Cookies may be used to improve functionality, remember user preferences, analyze website traffic and enhance user experience.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">4. Data Security</h2>
              <p>We employ reasonable administrative, technical, and organizational safeguards to protect personal information from unauthorized access, disclosure, alteration or destruction.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">5. Data Sharing</h2>
              <p className="mb-2"><strong className="text-white">People &amp; Youth does not sell personal information.</strong> Information may be shared only:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li>With trusted service providers necessary to operate the Platform.</li>
                <li>When required by law.</li>
                <li>With the user&apos;s explicit consent.</li>
                <li>During institutional partnerships where users voluntarily participate.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">6. User Rights</h2>
              <p className="mb-2">Subject to applicable law, users may access, correct, or delete their data, request a copy of their personal data, or withdraw consent at any time.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">7. Retention</h2>
              <p>Personal information will be retained only for as long as reasonably necessary to fulfill operational, legal, editorial, research, or archival purposes.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">8. Children&apos;s Privacy</h2>
              <p>The Platform is not intended to knowingly collect personal information from children in violation of applicable law.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">9. International Users</h2>
              <p>Users acknowledge that information may be processed in accordance with the applicable laws governing People &amp; Youth&apos;s operations.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">10. Changes</h2>
              <p>This Privacy Policy may be updated periodically. Material changes will be communicated through the Platform.</p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h2 className="text-lg font-bold text-white mb-1">11. Contact</h2>
              <p className="text-xs text-gray-400">For privacy-related inquiries:</p>
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