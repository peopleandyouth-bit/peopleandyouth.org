"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4">
      <nav className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            P&Y
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              People & Youth
            </span>
            <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
              Digital Institution
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="#about" className="hover:text-cyan-400 transition-colors">
            About
          </Link>
          <Link href="#dissent-dias" className="hover:text-cyan-400 transition-colors">
            Dissent Dias
          </Link>
          <Link href="#think-tank" className="hover:text-cyan-400 transition-colors">
            Think Tank
          </Link>
          <Link href="#consulting" className="hover:text-cyan-400 transition-colors">
            Rural Consulting
          </Link>
          <Link href="#membership" className="hover:text-cyan-400 transition-colors">
            Membership
          </Link>
        </div>

        {/* Call to Action */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="#membership"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <span>Founding Member</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">₹499</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto glass-panel rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
          <Link
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-cyan-400 font-medium py-1"
          >
            About
          </Link>
          <Link
            href="#dissent-dias"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-cyan-400 font-medium py-1"
          >
            Dissent Dias
          </Link>
          <Link
            href="#think-tank"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-cyan-400 font-medium py-1"
          >
            Think Tank
          </Link>
          <Link
            href="#consulting"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-cyan-400 font-medium py-1"
          >
            Rural Consulting
          </Link>
          <Link
            href="#membership"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25"
          >
            Join Founding Member (₹499)
          </Link>
        </div>
      )}
    </header>
  );
}