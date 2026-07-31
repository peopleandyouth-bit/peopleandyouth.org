"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import AuthModal from "@/components/auth/AuthModal";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4">
        <nav className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl">
          {/* Brand */}
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
            <Link href="#about" className="hover:text-cyan-400 transition-colors">About</Link>
            <Link href="#dissent-dias" className="hover:text-cyan-400 transition-colors">Dissent Dias</Link>
            <Link href="#think-tank" className="hover:text-cyan-400 transition-colors">Think Tank</Link>
            <Link href="#founder" className="hover:text-cyan-400 transition-colors">Founder</Link>
            <Link href="#membership" className="hover:text-cyan-400 transition-colors">Membership</Link>
          </div>

          {/* Auth / CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-800">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2"
              >
                Sign In
              </button>
            )}

            <Link
              href="#membership"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2"
            >
              <span>Founding Member</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">₹499</span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </nav>
      </header>

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}