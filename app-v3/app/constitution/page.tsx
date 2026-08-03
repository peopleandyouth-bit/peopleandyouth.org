'use client';

import React from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';

const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";
const LINKEDIN_URL = "https://www.linkedin.com/company/vidyarthi-nagrik-jan-chetna-manch";
const FACEBOOK_URL = "https://www.facebook.com/share/1ZGB3ZQKqE/";
const YOUTUBE_URL = "https://www.youtube.com/@peopleandyouth";
const INSTAGRAM_URL = "https://www.instagram.com/peopleandyouth";

export default function ConstitutionPage() {
  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src={BRAND_LOGO_URL} 
              alt="People & Youth Logo" 
              className="h-10 w-auto rounded-lg object-contain bg-white/10 p-1 border border-white/20"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                People &amp; Youth
              </span>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mt-0.5">
                Digital Institution
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/about" className="hover:text-cyan-400 transition-colors">About Mandate</Link>
            <Link href="/constitution" className="text-cyan-400 font-bold border-b-2 border-cyan-400 py-1">Constitution</Link>
            <Link href="/careers" className="hover:text-cyan-400 transition-colors">Careers &amp; Opportunities</Link>
            <Link href="/submit-paper" className="hover:text-cyan-400 transition-colors">Policy Journals</Link>
            <Link href="/rural-consulting" className="hover:text-cyan-400 transition-colors">Rural Consulting</Link>
          </nav>

          <GoogleTranslate />
        </div>
      </header>

      {/* CONSTITUTION CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-12">
        
        {/* TITLE BANNER */}
        <div className="text-center space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            SUPREME GOVERNING CHARTER
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            📜 THE CONSTITUTION OF PEOPLE &amp; YOUTH
          </h1>
          <p className="text-amber-400 italic text-base sm:text-lg font-serif">
            The Founding Charter
          </p>
        </div>

        {/* PRELIMINARY NOTE */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-[#0a122c] to-blue-950/40 border-l-4 border-cyan-400 rounded-r-2xl p-6 sm:p-8 space-y-3 shadow-xl">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block font-bold">
            📢 PRELIMINARY NOTE
          </span>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            This Constitution shall serve as the supreme governing charter of <strong>People &amp; Youth</strong> and shall establish the vision, organisational philosophy, governance framework, rights, responsibilities, and principles governing the Organisation.
          </p>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Every regulation, policy, manual, resolution, decision, programme, publication, committee, department, and organisational action shall derive its authority from this Constitution and shall be interpreted in harmony with it.
          </p>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Nothing contained herein shall be interpreted as superseding the Constitution of India or any applicable law. In case of inconsistency, the applicable law shall prevail to the extent of such inconsistency.
          </p>
        </div>

        {/* VOLUME I */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 space-y-12 backdrop-blur-xl">
          
          <div className="border-b border-cyan-500/30 pb-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-wide">
              🏛️ VOLUME I: FOUNDATIONAL PRINCIPLES
            </h2>
          </div>

          {/* CHAPTER I */}
          <section className="space-y-6">
            <h3 className="text-lg font-mono font-bold text-cyan-400 border-b border-white/10 pb-2 uppercase tracking-wider">
              CHAPTER I: PRELIMINARY
            </h3>

            <div className="space-y-4">
              <div className="bg-[#0b1228] p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white font-mono">Article 1 — Name</h4>
                <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1.5 leading-relaxed">
                  <li>The name of the Organisation shall be <strong>People &amp; Youth</strong>, hereinafter referred to as <em>&ldquo;the Organisation.&rdquo;</em></li>
                  <li>The Organisation may operate nationally and internationally through such programmes, chapters, departments, publications, subsidiaries, initiatives, digital platforms, or affiliated bodies as may be established in accordance with this Constitution.</li>
                </ul>
              </div>

              <div className="bg-[#0b1228] p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white font-mono">Article 2 — Nature of the Organisation</h4>
                <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1.5 leading-relaxed">
                  <li><strong>People &amp; Youth</strong> is established as an independent civic knowledge organisation dedicated to education, research, public policy, civic participation, leadership development, innovation, constitutional literacy, publication, dialogue, and public service.</li>
                  <li>The Organisation shall remain <strong>non-partisan</strong> in its organisational functioning and shall not exist for the private benefit of any individual.</li>
                  <li>Nothing contained in this Constitution shall prohibit the Organisation from engaging with governments, universities, civil society organisations, international organisations, corporations, or other lawful entities in furtherance of its objectives, provided that such engagement does not compromise its organisational independence.</li>
                </ul>
              </div>

              <div className="bg-[#0b1228] p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white font-mono">Article 3 — Legal Character</h4>
                <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1.5 leading-relaxed">
                  <li>The Organisation shall function in accordance with the laws of the Republic of India and any other jurisdiction in which it lawfully establishes operations.</li>
                  <li>Upon incorporation, this Constitution shall be read together with the governing documents prescribed by the applicable legal framework.</li>
                </ul>
              </div>

              <div className="bg-[#0b1228] p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white font-mono">Article 4 — Headquarters</h4>
                <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1.5 leading-relaxed">
                  <li>The registered office of the Organisation shall be established by resolution of the Governing Board.</li>
                  <li>The Organisation may establish regional, national, state, district, international, virtual, or thematic offices whenever necessary.</li>
                </ul>
              </div>

              <div className="bg-[#0b1228] p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white font-mono">Article 5 — Official Language</h4>
                <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1.5 leading-relaxed">
                  <li><strong>English</strong> shall be the principal working language of the Organisation.</li>
                  <li>The Organisation shall encourage publications and programmes in <strong>Hindi</strong> and other Indian as well as international languages to promote wider accessibility.</li>
                  <li>No member shall be denied participation solely on the basis of language.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CHAPTER II */}
          <section className="space-y-6">
            <h3 className="text-lg font-mono font-bold text-cyan-400 border-b border-white/10 pb-2 uppercase tracking-wider">
              CHAPTER II: VISION
            </h3>

            <div className="bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-500/40 p-6 rounded-2xl space-y-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">Article 6</span>
                <p className="text-sm sm:text-base font-serif italic text-white mt-1 leading-relaxed">
                  &ldquo;To build one of the world&apos;s most trusted independent civic knowledge organisations that empowers individuals through education, research, innovation, constitutional values, public policy, ethical leadership, and collaborative action for the advancement of humanity.&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">Article 7</span>
                <p className="text-xs text-gray-300">The Organisation envisions a future in which:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-200 font-mono">
                  <li className="bg-white/5 p-2.5 rounded-xl border border-white/10">✓ Knowledge is accessible.</li>
                  <li className="bg-white/5 p-2.5 rounded-xl border border-white/10">✓ Organisations are accountable.</li>
                  <li className="bg-white/5 p-2.5 rounded-xl border border-white/10">✓ Dialogue is constructive.</li>
                  <li className="bg-white/5 p-2.5 rounded-xl border border-white/10">✓ Leadership is ethical.</li>
                  <li className="sm:col-span-2 bg-white/5 p-2.5 rounded-xl border border-white/10">✓ Every individual possesses an equal opportunity to contribute meaningfully to society.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CHAPTER III */}
          <section className="space-y-6">
            <h3 className="text-lg font-mono font-bold text-cyan-400 border-b border-white/10 pb-2 uppercase tracking-wider">
              CHAPTER III: MISSION
            </h3>

            <div className="space-y-4">
              <div className="bg-[#0b1228] p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white font-mono">Article 8</h4>
                <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed">
                  The Mission of <strong>People &amp; Youth</strong> shall be: To promote evidence-based inquiry, strengthen democratic participation, cultivate responsible leadership, advance interdisciplinary research, encourage civic engagement, support innovation, publish independent scholarship, and create opportunities for individuals to transform ideas into meaningful public action.
                </p>
              </div>

              <div className="bg-[#0b1228] p-5 rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white font-mono">Article 9 — Institutional Avenues</h4>
                <p className="text-xs text-gray-400">The Organisation shall pursue its mission through:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs font-mono text-cyan-300">
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">a. Research</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">b. Publications</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">c. Fellowships</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">d. Conferences</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">e. Civic Campaigns</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">f. Public Consultations</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">g. Educational Programmes</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">h. Leadership Development</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">i. Technology Platforms</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">j. Consulting Services</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">k. Int. Collaboration</span>
                  <span className="bg-white/5 p-2 rounded-lg border border-white/10">l. Community Engagement</span>
                  <span className="sm:col-span-2 bg-white/5 p-2 rounded-lg border border-white/10">m. Knowledge Repositories</span>
                </div>
              </div>
            </div>
          </section>

          {/* CHAPTER IV */}
          <section className="space-y-6">
            <h3 className="text-lg font-mono font-bold text-cyan-400 border-b border-white/10 pb-2 uppercase tracking-wider">
              CHAPTER IV: MOTTO &amp; CIVILIZATIONAL PHILOSOPHY
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0b1228] p-6 rounded-2xl border border-amber-500/40 text-center space-y-2">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">Article 10 — Official Motto</span>
                <h4 className="text-xl font-extrabold text-white tracking-tight">
                  &ldquo;Building Organisations. Empowering Humanity.&rdquo;
                </h4>
              </div>

              <div className="bg-[#0b1228] p-6 rounded-2xl border border-cyan-500/40 space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Article 11 — Civilizational Philosophy</span>
                <p className="text-sm font-bold text-cyan-300 font-serif">
                  वसुधैव कुटुम्बकम — The World is One Family.
                </p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  The Organisation shall interpret this principle as an affirmation of the equal dignity of all persons and as a commitment to global cooperation, peaceful dialogue, and shared human progress.
                </p>
              </div>

              <div className="md:col-span-2 bg-[#0b1228] p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white font-mono">Article 12 — Identity &amp; Symbols</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  The official emblem, seal, visual identity, and digital symbols of the Organisation shall be prescribed by regulations adopted by the Governing Board. No individual shall use the official identity of the Organisation without authorization.
                </p>
              </div>
            </div>
          </section>

          {/* CHAPTER V */}
          <section className="space-y-6">
            <h3 className="text-lg font-mono font-bold text-cyan-400 border-b border-white/10 pb-2 uppercase tracking-wider">
              CHAPTER V: CORE VALUES
            </h3>

            <div className="space-y-4">
              <div className="bg-[#0b1228] p-6 rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white font-mono">Article 13 — Guiding Pillars</h4>
                <p className="text-xs text-gray-400">The Organisation shall be guided by the following twenty foundational values:</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">1. Human Dignity</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">2. Constitutional Morality</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">3. Intellectual Integrity</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">4. Academic Freedom</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">5. Rule of Law</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">6. Equality of Opportunity</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">7. Inclusiveness</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">8. Diversity</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">9. Public Service</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">10. Evidence-based Decision</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">11. Organisational Accountable</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">12. Ethical Leadership</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">13. Innovation</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">14. Collaboration</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">15. Sustainability</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">16. Transparency</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">17. Professional Excellence</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">18. Respectful Dialogue</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">19. Lifelong Learning</span>
                  <span className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-300">20. Service Before Self</span>
                </div>
              </div>

              <div className="bg-[#0b1228] p-5 rounded-2xl border border-white/10">
                <h4 className="text-sm font-bold text-white font-mono mb-1">Article 14 — Adherence</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  No department, publication, office-bearer, employee, volunteer, or member shall act in a manner inconsistent with these values.
                </p>
              </div>
            </div>
          </section>

          {/* CHAPTER VI */}
          <section className="space-y-6">
            <h3 className="text-lg font-mono font-bold text-cyan-400 border-b border-white/10 pb-2 uppercase tracking-wider">
              CHAPTER VI: OBJECTIVES
            </h3>

            <div className="space-y-4">
              <div className="bg-[#0b1228] p-6 rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white font-mono">Article 15 — Mandate of the Organisation</h4>
                <p className="text-xs text-gray-400">The objectives of the Organisation include, but are not limited to:</p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 list-disc pl-5">
                  <li><strong>a.</strong> Advancing education.</li>
                  <li><strong>b.</strong> Promoting constitutional literacy.</li>
                  <li><strong>c.</strong> Supporting public policy research.</li>
                  <li><strong>d.</strong> Publishing scholarly work.</li>
                  <li><strong>e.</strong> Encouraging interdisciplinary dialogue.</li>
                  <li><strong>f.</strong> Developing youth leadership.</li>
                  <li><strong>g.</strong> Promoting entrepreneurship and innovation.</li>
                  <li><strong>h.</strong> Conducting consulting and advisory services.</li>
                  <li><strong>i.</strong> Organising conferences, seminars, and public discussions.</li>
                  <li><strong>j.</strong> Building partnerships with educational organisations.</li>
                  <li><strong>k.</strong> Establishing libraries, archives, and digital repositories.</li>
                  <li><strong>l.</strong> Developing technology platforms for knowledge dissemination.</li>
                  <li><strong>m.</strong> Supporting civic participation.</li>
                  <li><strong>n.</strong> Facilitating international collaboration.</li>
                  <li><strong>o.</strong> Advancing ethical governance.</li>
                  <li><strong>p.</strong> Encouraging responsible use of artificial intelligence.</li>
                  <li><strong>q.</strong> Supporting sustainable development.</li>
                  <li><strong>r.</strong> Preserving organisational memory.</li>
                  <li><strong>s.</strong> Creating opportunities for public service.</li>
                  <li><strong>t.</strong> Undertaking any other lawful activity consistent with Vision &amp; Mission.</li>
                </ul>
              </div>

              <div className="bg-[#0b1228] p-5 rounded-2xl border border-white/10">
                <h4 className="text-sm font-bold text-white font-mono mb-1">Article 16 — Commitment to Integrity</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  In pursuing these objectives, the Organisation shall remain committed to the Constitution of India, applicable law, organisational independence, financial integrity, and the public interest.
                </p>
              </div>
            </div>
          </section>

          <div className="text-center border-t border-white/10 pt-6">
            <span className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest block">
              END OF VOLUME I
            </span>
          </div>

        </div>

        {/* INSTITUTIONAL NOTICE */}
        <div className="bg-amber-500/10 border border-amber-400/40 rounded-2xl p-6 text-xs text-gray-300 space-y-2">
          <span className="font-bold text-amber-300 font-mono uppercase tracking-widest block">
            📢 INSTITUTIONAL NOTICE
          </span>
          <p className="leading-relaxed">
            <strong>Note on Future Volumes:</strong> Volume I establishes the foundational framework of People &amp; Youth. Subsequent volumes—covering Detailed Governance, Membership Architecture, Chapters &amp; Wings, Electoral &amp; Appointment Rules, Financial Integrity, and Publications Framework—shall be published progressively as the Organisation scales globally.
          </p>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050814] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={BRAND_LOGO_URL} alt="Brand Logo" className="h-8 w-auto rounded-md" />
                <span className="font-extrabold text-base tracking-tight text-white">People &amp; Youth</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                India&apos;s sovereign digital youth organisation for public policy, empirical research, and institutional accountability.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Organisation</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Mandate</Link></li>
                <li><Link href="/constitution" className="hover:text-white transition-colors">Constitution Charter</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers &amp; Opportunities</Link></li>
                <li><Link href="/submit-paper" className="hover:text-white transition-colors">Submit Research</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Governance &amp; Legal</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/constitution" className="hover:text-white transition-colors">Supreme Constitution</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Social Network</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn ↗</a></li>
                <li><a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook ↗</a></li>
                <li><a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube ↗</a></li>
                <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram ↗</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-500">
            <p>&copy; 2026 People &amp; Youth Digital Institution (VNJCM). All rights reserved.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
