import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black">
      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-[#070b19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
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

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
            <Link href="#about" className="hover:text-cyan-400 transition-colors">
              About
            </Link>
            <Link href="#dissent-dias" className="hover:text-cyan-400 transition-colors">
              Dissent Dias
            </Link>
            <Link href="#think-tank" className="hover:text-cyan-400 transition-colors">
              Think Tank
            </Link>
            <Link href="#founder" className="hover:text-cyan-400 transition-colors">
              Founder
            </Link>
            <Link href="#membership" className="hover:text-cyan-400 transition-colors">
              Membership
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/signin"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="#membership"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02]"
            >
              Founding Member <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full ml-1">₹499</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Ambient Lighting / Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          At the Heart of Change — Public Policy, Governance &amp; Youth Leadership
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          Building India’s Sovereign <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
            Digital Youth Institution
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl text-base sm:text-lg text-gray-300 mb-10 leading-relaxed font-normal">
          Bridging policy research, rural development, and youth enterprise through evidence-based debate on{' '}
          <strong className="text-white font-semibold">Dissent Dias</strong> and actionable grassroots strategy.
        </p>

        {/* Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <Link
            href="#membership"
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-cyan-500/25 transition-all text-center"
          >
            Become Founding Member <span className="text-cyan-200 text-xs font-normal ml-1">(₹499)</span>
          </Link>
          <Link
            href="#research"
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-center backdrop-blur-sm"
          >
            Explore Policy Research
          </Link>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-8 border-t border-white/10">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-cyan-400">100%</p>
            <p className="text-xs text-gray-400 mt-1">Verified Policy Protocol</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-cyan-400">Pan-India</p>
            <p className="text-xs text-gray-400 mt-1">Rural Advisory Target</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-cyan-400">Public Audit</p>
            <p className="text-xs text-gray-400 mt-1">Policy Governance</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-cyan-400">₹499</p>
            <p className="text-xs text-gray-400 mt-1">Lifetime Founding ID &amp; Card</p>
          </div>
        </div>
      </section>
    </main>
  );
}