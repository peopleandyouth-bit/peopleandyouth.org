import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const mountains = [
    'Constitutional Literacy', 'Public Policy', 'Education', 'Democratic Participation',
    'Governance', 'Economic Development', 'Trade & Commerce', 'Technology & Artificial Intelligence',
    'Climate & Sustainability', 'Agriculture & Food Security', 'Healthcare & Public Health',
    'Law & Justice', 'International Relations', 'Public Administration',
    'Innovation & Entrepreneurship', 'Leadership & Ethics'
  ];

  const caves = [
    'Constitution Cave', 'Democracy Cave', 'Education Cave', 'Trade Cave', 'Economy Cave',
    'Judiciary Cave', 'Election Cave', 'RTI Cave', 'Technology Cave', 'Artificial Intelligence Cave',
    'Climate Cave', 'Agriculture Cave', 'Rural Development Cave', 'Urban Governance Cave',
    'Public Finance Cave', 'Foreign Policy Cave', 'Social Justice Cave'
  ];

  const researchItems = [
    'Civic Observatory', 'People’s Data Lab', 'Research Repository', 'Policy Laboratories',
    'White Papers', 'Working Papers', 'Issue Briefs', 'Legislative Analysis',
    'Impact Assessment Studies', 'Public Consultation Papers', 'Open Knowledge Archives'
  ];

  const leadershipItems = [
    'Constitutional Academy', 'Leadership Institute', 'Public Policy School',
    'Civic Innovation Labs', 'Research Fellowships', 'Editorial Fellowships',
    'Campus Chapters', 'Mentorship Programmes', 'Global Youth Network',
    'Collaborative Learning Communities'
  ];

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
            Join Ecosystem &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-16">

        {/* HERO HEADER & QUOTE */}
        <section className="text-center space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest">
            Institutional Declaration
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">People &amp; Youth</span>
          </h1>
          <p className="text-xl font-semibold text-cyan-300 tracking-wide">
            Building Institutions. Empowering Humanity.
          </p>

          <blockquote className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-blue-950/40 border border-cyan-500/20 italic text-gray-200 text-base sm:text-lg leading-relaxed shadow-xl">
            &ldquo;The progress of civilization has never been determined solely by the wealth of nations, the power of governments, or the influence of corporations. It has been shaped by informed citizens, courageous ideas, ethical leadership, and institutions that endure beyond generations.&rdquo;
          </blockquote>
        </section>

        {/* FOUNDATIONAL PREAMBLE */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wider text-xs">Equal Resource &amp; Dignity</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              People &amp; Youth is an independent, non-partisan, and globally inclusive civic knowledge institution founded upon the belief that knowledge is humanity&apos;s greatest public resource and that every individual, irrespective of geography, language, culture, nationality, religion, socioeconomic background, or political identity, deserves an equal opportunity to learn, contribute, lead, and participate in shaping a better future.
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              We are not merely a website, a publication, a campaign, or an organization. We aspire to become an enduring institution dedicated to advancing knowledge, strengthening democratic societies, cultivating ethical leadership, promoting constitutional values, encouraging evidence-based public policy, and creating meaningful opportunities for young people to transform ideas into action.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wider text-xs">Wisdom Over Information</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              In an era defined by technological revolutions, artificial intelligence, environmental challenges, geopolitical uncertainty, economic transformation, and an unprecedented flow of information, the world&apos;s greatest need is not simply access to knowledge, but institutions capable of transforming knowledge into wisdom, dialogue into cooperation, research into public policy, and aspirations into lasting social progress.
            </p>
            <p className="text-sm font-semibold text-cyan-300 pt-2 border-t border-white/10">
              People &amp; Youth exists to serve that purpose.
            </p>
          </div>
        </section>

        {/* EQUALITY OF OPPORTUNITY & DIGNITY */}
        <section className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
            <p>
              We envision a world where a first-generation learner in a remote village, a student in a metropolitan university, a researcher in an international laboratory, an entrepreneur building the next generation of technologies, a journalist seeking truth, a policymaker designing institutions, or a citizen committed to public service all find equal dignity within a shared ecosystem of knowledge and civic participation.
            </p>
            <p>
              We reject the notion that opportunity should be determined by privilege or geography. We believe that talent is universally distributed, while access to opportunity is not. Our responsibility is to help narrow that gap by creating an open platform where ideas, evidence, and collaboration become instruments of human progress.
            </p>
            <p>
              Every publication we produce, every research initiative we undertake, every dialogue we facilitate, every fellowship we establish, every campaign we organize, and every partnership we build is guided by one enduring conviction: institutions become stronger when informed citizens participate responsibly in public life.
            </p>
          </div>
        </section>

        {/* DIAGRAMMATIC INSTITUTIONAL ECOSYSTEM */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Our Institutional Ecosystem</h2>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              People &amp; Youth is designed as a living ecosystem where knowledge, dialogue, research, leadership, and public participation continuously reinforce one another. Every initiative exists to strengthen the next, creating an institution capable of serving present and future generations.
            </p>
          </div>

          {/* FLOWCHART TREE CONTAINER */}
          <div className="relative border-l-2 border-cyan-500/40 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">

            {/* NODE 1: PARENT INSTITUTION */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full bg-cyan-500 border-4 border-[#070b19] shadow-lg shadow-cyan-500/50" />
              <div className="bg-gradient-to-r from-blue-950/80 to-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl">
                <span className="text-2xl">🌍</span>
                <h3 className="text-xl font-bold text-white mt-1">People &amp; Youth</h3>
                <p className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-2">The Global Civic Knowledge Institution</p>
                <p className="text-sm text-gray-300">
                  The parent institution dedicated to advancing knowledge, democratic participation, constitutional values, youth leadership, interdisciplinary research, civic innovation, and evidence-based public policy.
                </p>
              </div>
            </div>

            {/* NODE 2: VNJCM */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full bg-blue-500 border-4 border-[#070b19]" />
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <span className="text-2xl">🏛</span>
                <h3 className="text-xl font-bold text-white mt-1">Vidyarthi Nagrik Jan Chetna Manch (VNJCM)</h3>
                <p className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-2">The Civic Action Network</p>
                <p className="text-sm text-gray-300">
                  VNJCM serves as the civic engagement pillar of People &amp; Youth. Through constitutional awareness, grassroots leadership, public accountability, community participation, and civic initiatives, it transforms knowledge into meaningful public action.
                </p>
              </div>
            </div>

            {/* NODE 3: FOREST, MOUNTAINS & KNOWLEDGE CAVES */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full bg-cyan-400 border-4 border-[#070b19]" />
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div>
                  <span className="text-2xl">🌲</span>
                  <h3 className="text-xl font-bold text-white mt-1">The Forest of Civic Renaissance</h3>
                  <p className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-2">Where Every Path Leads to Knowledge</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    The Forest of Civic Renaissance represents the intellectual landscape of the institution—a place where every discipline contributes to a deeper understanding of society and every learner can explore new paths of inquiry.
                    Within this Forest rise Mountains of Knowledge, each dedicated to a major field of human development.
                  </p>
                </div>

                {/* THE MOUNTAINS GRID */}
                <div className="bg-[#070b19]/80 border border-white/10 rounded-xl p-5 space-y-3">
                  <h4 className="text-sm font-extrabold text-cyan-300 flex items-center gap-2">
                    <span>⛰</span> The Mountains
                  </h4>
                  <p className="text-xs text-gray-400">Each Mountain houses specialised Knowledge Caves where research, learning, and collaboration converge.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
                    {mountains.map((m) => (
                      <div key={m} className="bg-white/5 border border-white/5 px-3 py-2 rounded-lg text-xs font-medium text-gray-200">
                        {m}
                      </div>
                    ))}
                  </div>
                </div>

                {/* KNOWLEDGE CAVES GRID */}
                <div className="bg-[#070b19]/80 border border-white/10 rounded-xl p-5 space-y-3">
                  <h4 className="text-sm font-extrabold text-cyan-300 flex items-center gap-2">
                    <span>🏞</span> Knowledge Caves
                  </h4>
                  <p className="text-xs text-gray-400">Within every Mountain are dedicated spaces for deeper exploration, including:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
                    {caves.map((c) => (
                      <div key={c} className="bg-cyan-950/30 border border-cyan-500/20 px-3 py-2 rounded-lg text-xs font-mono text-cyan-300">
                        {c}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 pt-3 border-t border-white/10 leading-relaxed">
                    Every Knowledge Cave functions as a living repository containing research papers, policy briefs, legislative analyses, explainers, multimedia resources, open datasets, case studies, collaborative discussions, and opportunities for public engagement.
                  </p>
                </div>
              </div>
            </div>

            {/* NODE 4: DISSENT DIAS */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full bg-blue-400 border-4 border-[#070b19]" />
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <span className="text-2xl">📰</span>
                <h3 className="text-xl font-bold text-white mt-1">Dissent Dias</h3>
                <p className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-2">Powered by Vidyarthi Nagrik Jan Chetna Manch</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Dissent Dias is our editorial and public discourse platform built upon the conviction that democracy flourishes when disagreement is informed by evidence, expressed with dignity, and guided by constitutional values.
                  It serves as a home for long-form essays, editorials, debates, interviews, public letters, student voices, research reviews, podcasts, multimedia storytelling, and evidence-based public dialogue.
                </p>
              </div>
            </div>

            {/* NODE 5: RENAISSANCE PUBLICATIONS */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full bg-cyan-500 border-4 border-[#070b19]" />
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <span className="text-2xl">📚</span>
                <h3 className="text-xl font-bold text-white mt-1">Renaissance Publications</h3>
                <p className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">Knowledge achieves permanence through publication.</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Policy Renaissance serves as the flagship publication leading our Renaissance Series, which includes specialised journals such as Education Renaissance, Trade Renaissance, Governance Renaissance, Constitutional Renaissance, Technology Renaissance, Healthcare Renaissance, Innovation Renaissance, Climate Renaissance, Youth Renaissance, International Renaissance, and other interdisciplinary publications dedicated to advancing scholarship and public understanding.
                </p>
              </div>
            </div>

            {/* NODE 6: RESEARCH, INNOVATION & PUBLIC KNOWLEDGE */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full bg-blue-500 border-4 border-[#070b19]" />
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <span className="text-2xl">🔬</span>
                <h3 className="text-xl font-bold text-white">Research, Innovation &amp; Public Knowledge</h3>
                <p className="text-xs text-gray-400">The institution advances research through:</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {researchItems.map((item) => (
                    <span key={item} className="bg-white/5 border border-white/10 text-xs px-3 py-1.5 rounded-full text-gray-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* NODE 7: LEADERSHIP & LEARNING */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full bg-cyan-400 border-4 border-[#070b19]" />
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <span className="text-2xl">🎓</span>
                <h3 className="text-xl font-bold text-white">Leadership &amp; Learning</h3>
                <p className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">Knowledge finds its highest purpose when it develops people.</p>
                <p className="text-xs text-gray-400">People &amp; Youth nurtures future leaders through:</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {leadershipItems.map((item) => (
                    <span key={item} className="bg-cyan-950/40 border border-cyan-500/30 text-xs px-3 py-1.5 rounded-full text-cyan-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* NODE 8: GLOBAL PARTICIPATION */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[47px] top-0 w-6 h-6 rounded-full bg-blue-600 border-4 border-[#070b19]" />
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
                <span className="text-2xl">🤝</span>
                <h3 className="text-xl font-bold text-white">Global Participation</h3>
                <p className="text-sm font-semibold text-cyan-300">This institution welcomes every individual who believes that ideas can improve society.</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Whether you are a student, researcher, educator, entrepreneur, policymaker, journalist, artist, technologist, public servant, volunteer, community leader, or simply a curious citizen, there is a meaningful place for you within this ecosystem.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* GUIDING PHILOSOPHY & VASUDHAIVA KUTUMBAKAM */}
        <section className="bg-gradient-to-br from-blue-950/60 via-[#0a122c] to-cyan-950/60 border border-cyan-500/30 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Moral Foundation</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Our Guiding Philosophy</h2>
          </div>

          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
            <p>
              The moral foundation of People &amp; Youth is inspired by the timeless Indian civilizational ideal of <strong className="text-cyan-300">&ldquo;Vasudhaiva Kutumbakam&rdquo;</strong>—<strong className="text-white">&ldquo;The World is One Family.&rdquo;</strong>
            </p>
            <p>
              To us, this is not merely a cultural expression or philosophical quotation. It is a guiding principle for building institutions in an interconnected world.
            </p>
            <p>
              It reminds us that while humanity speaks different languages, lives under different governments, follows different traditions, and belongs to different cultures, our aspirations remain remarkably similar. Every individual seeks dignity, opportunity, knowledge, justice, security, and the freedom to contribute meaningfully to society.
            </p>
            <p>
              We therefore believe that meaningful progress cannot emerge from division, exclusion, or isolation. It is built through dialogue rather than hostility, cooperation rather than conflict, evidence rather than misinformation, and institutions that remain accountable to the people they serve.
            </p>
            <p>
              Our work is equally inspired by the enduring values of truth, integrity, compassion, intellectual humility, constitutional morality, public service, and lifelong learning. These principles guide every publication, every research initiative, every partnership, every campaign, and every decision undertaken by People &amp; Youth.
            </p>
          </div>
        </section>

        {/* MISSION & VISION CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3">
            <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <span className="text-cyan-400">🎯</span> Our Mission
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed pt-2 border-t border-white/10">
              To empower individuals through knowledge, cultivate ethical leadership, advance evidence-based research, strengthen democratic institutions, promote constitutional values, and create opportunities for every young person to participate meaningfully in shaping a more informed, just, peaceful, and prosperous world.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-3">
            <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <span className="text-cyan-400">👁</span> Our Vision
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed pt-2 border-t border-white/10">
              To become one of the world&apos;s most trusted independent civic knowledge institutions—connecting research with policy, education with leadership, dialogue with democracy, and local realities with global perspectives—while remaining intellectually independent, politically non-partisan, financially transparent, ethically accountable, and committed to the public good.
            </p>
          </div>
        </section>

        {/* AN INVITATION TO BUILD */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Shared Endeavour</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">An Invitation to Build</h2>
          </div>

          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
            <p>
              People &amp; Youth is not an institution we ask you to join; it is a shared endeavour we invite you to build.
            </p>
            <p>
              We believe that enduring institutions are not remembered because of those who founded them, but because of the countless individuals who choose to strengthen them with their ideas, integrity, compassion, and commitment to humanity. Every article published, every question asked, every policy examined, every community served, every student mentored, every act of public service, and every young mind inspired becomes part of a legacy that belongs to us all.
            </p>
            <p>
              Inspired by the spirit of Vasudhaiva Kutumbakam, we believe that the future of humanity will not be secured by any one nation, ideology, market, institution, or generation alone. It will be shaped by people who recognise that our shared challenges demand shared wisdom, our collective progress depends upon mutual trust, and our greatest achievements emerge when knowledge is treated as a public good rather than a privilege.
            </p>
            <p>
              Whether you come from a remote village, a growing town, a global financial centre, a leading university, a public institution, a research laboratory, a family business, a startup, or a community striving to create change, your experiences and ideas have the power to enrich our collective understanding. Talent knows no borders, wisdom is not confined by privilege, and meaningful leadership is measured not by authority, but by service.
            </p>
            <p>
              If you believe that knowledge should empower, dialogue should unite, leadership should serve, research should illuminate public policy, institutions should remain accountable, and humanity is strongest when it works together, then this institution already has a place for you.
            </p>
            <p className="font-semibold text-white">
              Together, let us build more than an organization.
            </p>
            <p className="font-semibold text-white">
              Let us build an institution that future generations inherit with pride.
            </p>
            <p className="font-semibold text-white">
              Let us build an ecosystem where curiosity becomes knowledge, knowledge becomes wisdom, wisdom becomes public service, and public service strengthens humanity.
            </p>
            <p className="text-xs text-gray-400 italic">
              Because institutions may begin with founders, but they endure through communities.
            </p>
          </div>

          {/* CLOSING WELCOME BANNER */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-cyan-400">
              Welcome to People &amp; Youth - at the heart of change 💙.
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              Welcome to a world where knowledge belongs to everyone, leadership is an act of service, and humanity is one family.
            </p>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        <p>&copy; 2026 People &amp; Youth Digital Institution. All rights reserved.</p>
      </footer>
    </main>
  );
}