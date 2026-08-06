'use client';

import React from 'react';
import Link from 'next/link';

export default function CompleteAboutUsPage() {
  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* TOP UTILITY HEADER */}
        <div className="border-b border-white/10 bg-[#070b19] px-6 py-2.5 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
          <Link href="/" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
            ← Return to Main Digital Headquarters
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 font-bold">PEOPLE & YOUTH</span>
            <span>&middot;</span>
            <span className="text-amber-300">ABOUT THE INSTITUTION</span>
          </div>
        </div>

        {/* INSTITUTIONAL BRAND MASTHEAD */}
        <header className="border-b border-white/10 px-6 py-12 max-w-5xl mx-auto space-y-4 text-center">
          <span className="px-3.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-[10px] uppercase rounded-full tracking-[0.2em]">
            INSTITUTIONAL CHARTER & PURPOSE
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight text-white">
            About People & Youth
          </h1>
          <p className="text-amber-300 text-sm sm:text-base italic font-serif max-w-2xl mx-auto">
            Building Institutions. Empowering Generations.
          </p>
        </header>

        {/* MAIN BODY CONTENT */}
        <div className="max-w-5xl mx-auto p-6 sm:p-12 space-y-12">
          
          {/* NARRATIVE INTRODUCTION */}
          <section className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4 font-serif text-sm sm:text-base leading-relaxed text-gray-200">
            <p>
              <strong className="text-amber-400 font-mono text-xs font-bold block mb-1 uppercase tracking-widest">FOUNDATIONAL MANIFESTO</strong>
              People & Youth is an independent institution dedicated to advancing knowledge, leadership, research, civic engagement, and institution building. We believe that the greatest societies are shaped not merely by governments, markets, or technologies, but by enduring institutions that cultivate informed citizens, ethical leadership, and evidence-based solutions for public good.
            </p>
            <p className="text-gray-300 text-xs sm:text-sm">
              Founded on the conviction that every individual possesses the potential to contribute meaningfully to society, People & Youth seeks to create an ecosystem where ideas are transformed into action, research informs policy, dialogue strengthens democracy, and leadership emerges through service.
            </p>
            <p className="text-gray-300 text-xs sm:text-sm border-l-2 border-l-amber-400 pl-4 py-1 italic bg-[#070b19]/60 rounded-r-xl">
              "From a student in a remote village of Shahpur in Sonbarsa Raj Block, Saharsa, Bihar, to a researcher in New Delhi, an entrepreneur in Bengaluru, a policymaker in Nairobi, a scholar in London, or an innovator in New York, our institution welcomes every individual committed to learning, collaboration, and responsible leadership. Geography does not define participation; curiosity, integrity, and purpose do."
            </p>
          </section>

          {/* OUR PURPOSE & 5 ENDURING PILLARS */}
          <section className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">OUR PURPOSE</span>
              <h2 className="text-2xl font-extrabold text-white font-serif">The Five Enduring Pillars</h2>
            </div>

            <p className="text-gray-300 font-serif text-xs leading-relaxed">
              The challenges of the twenty-first century demand institutions that are interdisciplinary, globally connected, technologically enabled, and deeply rooted in public service. People & Youth exists to strengthen that institutional capacity by bringing together students, researchers, professionals, entrepreneurs, educators, policymakers, civil society organizations, and communities on a common platform for constructive engagement.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:border-amber-400/50 transition-all">
                <span className="text-amber-400 font-bold text-[10px] uppercase block">PILLAR 01 &middot; KNOWLEDGE</span>
                <p className="text-gray-300 text-[11px] leading-relaxed">Creating, preserving, and disseminating credible research and intellectual resources.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:border-amber-400/50 transition-all">
                <span className="text-amber-400 font-bold text-[10px] uppercase block">PILLAR 02 &middot; LEADERSHIP</span>
                <p className="text-gray-300 text-[11px] leading-relaxed">Developing ethical leaders capable of serving institutions and society.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:border-amber-400/50 transition-all">
                <span className="text-amber-400 font-bold text-[10px] uppercase block">PILLAR 03 &middot; RESEARCH</span>
                <p className="text-gray-300 text-[11px] leading-relaxed">Producing evidence that informs public discourse and decision-making.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:border-amber-400/50 transition-all">
                <span className="text-amber-400 font-bold text-[10px] uppercase block">PILLAR 04 &middot; INNOVATION</span>
                <p className="text-gray-300 text-[11px] leading-relaxed">Applying technology, data, and artificial intelligence to address societal challenges.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:border-amber-400/50 transition-all md:col-span-2 lg:col-span-1">
                <span className="text-amber-400 font-bold text-[10px] uppercase block">PILLAR 05 &middot; INSTITUTION BUILDING</span>
                <p className="text-gray-300 text-[11px] leading-relaxed">Helping communities and organizations build sustainable systems, governance structures, and long-term capacity.</p>
              </div>
            </div>
          </section>

          {/* OUR VISION */}
          <section className="space-y-4 bg-white/5 border border-white/10 p-8 rounded-3xl">
            <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest font-mono">OUR VISION</span>
            <h2 className="text-2xl font-extrabold text-white font-serif">Vasudhaiva Kutumbakam — The World is One Family</h2>
            <div className="space-y-3 font-serif text-xs sm:text-sm text-gray-300 leading-relaxed">
              <p>
                We envision a world where every young person has access to knowledge, opportunity, and institutions that empower rather than exclude. We aspire to become one of the world's most trusted independent platforms for research, leadership development, civic engagement, and institutional innovation—connecting local realities with global perspectives.
              </p>
              <p>
                Our vision is inspired by the timeless Indian philosophy of <strong>"Vasudhaiva Kutumbakam"</strong>—the world is one family. We believe that meaningful progress arises when diverse perspectives engage in respectful dialogue, evidence guides decisions, and institutions remain accountable to the communities they serve.
              </p>
            </div>
          </section>

          {/* OUR MISSION */}
          <section className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">OUR MISSION</span>
              <h2 className="text-2xl font-extrabold text-white font-serif">Creating a Sustainable Civic Ecosystem</h2>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-3">
              <p className="text-gray-400 text-xs font-serif mb-4">Our mission is to create an ecosystem where:</p>
              <ul className="space-y-2.5 text-xs font-mono text-gray-200">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">1.</span>
                  <span>Knowledge is accessible and responsibly produced;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">2.</span>
                  <span>Research contributes to public understanding and policy;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">3.</span>
                  <span>Dialogue encourages critical thinking and respectful exchange;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">4.</span>
                  <span>Leadership is defined by service, integrity, and accountability;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">5.</span>
                  <span>Technology strengthens institutions without replacing human judgment;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">6.</span>
                  <span>Youth participate meaningfully in civic, academic, and professional life; and</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">7.</span>
                  <span>Organizations are equipped with the governance, tools, and capacity needed for long-term impact.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* OUR INSTITUTIONAL ECOSYSTEM */}
          <section className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">INSTITUTIONAL ECOSYSTEM</span>
              <h2 className="text-2xl font-extrabold text-white font-serif">Principal Components</h2>
            </div>

            <p className="text-gray-300 font-serif text-xs leading-relaxed">
              People & Youth is designed as an integrated institutional ecosystem rather than a single publication or programme. Its principal components include:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">People & Youth Research Institute</span>
                <p className="text-gray-300 text-[11px]">Advancing interdisciplinary research and evidence-based inquiry.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">People & Youth Academy</span>
                <p className="text-gray-300 text-[11px]">Leadership development, executive education, and professional learning.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">People & Youth Advisory</span>
                <p className="text-gray-300 text-[11px]">Consulting and institutional development services for public, private, and social sector organizations.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">Dissent Dias</span>
                <p className="text-gray-300 text-[11px]">A platform for thoughtful essays, commentary, interviews, and public dialogue.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">The Renaissance Series</span>
                <p className="text-gray-300 text-[11px]">Sector-focused journals dedicated to advancing scholarship across public policy, trade, governance, AI, law, health, and climate.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">The Grand Library</span>
                <p className="text-gray-300 text-[11px]">Growing digital repository organized into Knowledge Realms and Knowledge Caves containing papers, datasets, and reports.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">Institution Lab</span>
                <p className="text-gray-300 text-[11px]">Supporting organizations in designing governance systems, constitutions, strategies, and digital operating models.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
                <span className="text-amber-400 font-bold text-[10px] block uppercase">Leadership Network</span>
                <p className="text-gray-300 text-[11px]">Connecting global, national, state, district, campus, and community chapters through collaborative leadership.</p>
              </div>
            </div>
          </section>

          {/* OUR PRINCIPLES */}
          <section className="space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">OUR PRINCIPLES</span>
              <h2 className="text-2xl font-extrabold text-white font-serif">Inviolable Guiding Tenets</h2>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
              <p className="text-gray-300 text-xs font-serif mb-4">
                People & Youth is guided by principles that transcend political, commercial, and ideological divisions. We are committed to:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold">1. Intellectual integrity</div>
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold">2. Academic freedom</div>
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold">3. Editorial independence</div>
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold">4. Evidence-based inquiry</div>
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold">5. Constitutional values & rule of law</div>
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold">6. Institutional neutrality</div>
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold">7. Ethical leadership</div>
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold">8. Transparency & accountability</div>
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold">9. Diversity of perspectives</div>
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold">10. Respect for human dignity</div>
                <div className="p-3 bg-[#070b19] border border-white/10 rounded-xl text-amber-300 font-bold sm:col-span-2 lg:col-span-1">11. Continuous learning</div>
              </div>
            </div>
          </section>

          {/* LOOKING BEYOND PROJECTS & AN INVITATION */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-3 font-serif">
              <span className="text-amber-400 font-mono text-[9px] font-bold uppercase tracking-widest">PERSPECTIVE</span>
              <h3 className="text-xl font-extrabold text-white">Looking Beyond Projects</h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                Our ambition is not merely to launch programmes or host events. We seek to build institutions that outlast individuals. We believe that societies progress when knowledge is preserved, leadership is cultivated, governance is strengthened, and institutions continuously evolve to meet new challenges.
              </p>
              <p className="text-gray-400 text-[11px] pt-2">
                For this reason, every initiative undertaken by People & Youth is intended to contribute to a broader institutional architecture capable of serving future generations.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#0a1024] to-[#141f45] border border-amber-400/30 p-8 rounded-3xl space-y-3 font-serif">
              <span className="text-amber-400 font-mono text-[9px] font-bold uppercase tracking-widest">CALL TO ACTION</span>
              <h3 className="text-xl font-extrabold text-white">An Invitation</h3>
              <p className="text-gray-200 text-xs leading-relaxed">
                People & Youth is not something we ask you to join. It is something we invite you to build.
              </p>
              <p className="text-gray-300 text-xs leading-relaxed">
                Institutions endure not because of those who found them, but because of those who strengthen them. If you believe knowledge should empower, dialogue should unite, leadership should serve, and institutions should remain accountable to the people they exist to benefit, then this institution already has a place for you.
              </p>
              <div className="pt-2 font-mono text-[10px] text-amber-300">
                Together, let us advance knowledge, strengthen institutions, and empower generations.
              </div>
            </div>
          </section>

          {/* UPDATED OFFICIAL CONNECT CARD WITH EXACT LINKEDIN ADDRESS */}
          <section className="p-8 bg-[#0B192C] border border-[#C59B27]/40 rounded-3xl text-center space-y-4 font-mono">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">OFFICIAL CONNECT CHANNELS</h3>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-300">
              <a href="https://instagram.com/peopleandyouth" target="_blank" rel="noreferrer" className="hover:text-amber-400">📷 Instagram</a>
              <a href="https://youtube.com/@peopleandyouth" target="_blank" rel="noreferrer" className="hover:text-amber-400">▶️ YouTube</a>
              <a href="https://www.linkedin.com/company/https-www.peopleandyouth.org-/" target="_blank" rel="noreferrer" className="hover:text-amber-400 text-amber-300 font-bold underline">
                💼 LinkedIn Page
              </a>
              <a href="mailto:contact@peopleandyouth.org" className="hover:text-amber-400">✉️ Email</a>
            </div>
          </section>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#040711] py-8 px-6 text-center text-gray-500 text-[10px] font-mono">
        &copy; 2026 People & Youth &middot; www.peopleandyouth.org &middot; All Rights Reserved.
      </footer>
    </main>
  );
}