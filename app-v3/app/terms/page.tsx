import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      {/* Navigation Header */}
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
            Institutional Governance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Terms of Use</h1>
          <p className="text-xs text-cyan-400 mb-8 font-mono">Effective Date: 03/08/2026</p>

          <div className="space-y-6 text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-6">
            <p>
              Welcome to <strong className="text-white">People &amp; Youth</strong> (&quot;Platform&quot;), operated by <strong className="text-white">Vidyarthi Nagrik Jan Chetna Manch (VNJCM)</strong>. By accessing or using our website, publications, research repositories, forums, campaigns, newsletters, events, or digital services, you agree to these Terms of Use.
            </p>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">1. Our Mission</h2>
              <p>People &amp; Youth exists to foster civic participation, constitutional literacy, public policy dialogue, youth leadership and evidence-based research. The Platform encourages informed engagement while respecting democratic values, academic integrity and the rule of law.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">2. Eligibility</h2>
              <p>Users must comply with applicable laws in their jurisdiction. Individuals under the age of 18 should access the Platform under appropriate parental or guardian supervision where required by law.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">3. User Accounts</h2>
              <p>Users are responsible for maintaining the confidentiality of their credentials and for all activities conducted through their accounts. Users must provide accurate information during registration and update it when necessary.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">4. Acceptable Use</h2>
              <p className="mb-2">Users agree to use the Platform responsibly and shall not:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li>Publish unlawful, defamatory or fraudulent content.</li>
                <li>Engage in harassment, hate speech, discrimination or incitement to violence.</li>
                <li>Violate intellectual property rights.</li>
                <li>Upload malware or interfere with the Platform&apos;s security.</li>
                <li>Misrepresent affiliations, credentials or identity.</li>
                <li>Manipulate civic discussions through coordinated misinformation or spam.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">5. User Contributions</h2>
              <p>Authors retain ownership of their original work unless otherwise agreed. By submitting content, users grant People &amp; Youth a non-exclusive, worldwide, royalty-free license to publish, archive, translate and promote such content with appropriate attribution.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">6. Intellectual Property</h2>
              <p>All original branding, logos, website design, editorial compilations, graphics and institutional publications remain the intellectual property of People &amp; Youth or their respective owners unless stated otherwise.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">7. Editorial Independence</h2>
              <p>Publication on the Platform does not imply endorsement of every opinion expressed by contributors. Editorial decisions are based upon quality, evidence, relevance and adherence to editorial standards.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">8. Disclaimer</h2>
              <p>The Platform provides educational and informational resources. Nothing published should be interpreted as legal, financial, medical, or professional advice unless expressly stated.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">9. Limitation of Liability</h2>
              <p>People &amp; Youth shall not be liable for indirect, incidental or consequential damages arising from the use of the Platform to the extent permitted by applicable law.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">10. Amendments</h2>
              <p>These Terms may be revised periodically. Continued use of the Platform constitutes acceptance of the updated Terms.</p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h2 className="text-lg font-bold text-white mb-1">11. Contact</h2>
              <p className="text-xs text-gray-400">Questions regarding these Terms may be addressed to:</p>
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