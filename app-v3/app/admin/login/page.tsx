'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
  const router = useRouter();
  
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'MAGIC_LINK' | 'RESET_PASSWORD'>('PASSWORD');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ERROR' | 'SUCCESS'; text: string } | null>(null);

  // 1. Password Login Handler
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMessage({ type: 'ERROR', text: error.message });
    } else if (data.session) {
      router.push('/admin/command-centre');
    }
  }

  // 2. Magic Link Login Handler
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://www.peopleandyouth.org/admin/command-centre',
        shouldCreateUser: true
      }
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'ERROR', text: error.message });
    } else {
      setMessage({ 
        type: 'SUCCESS', 
        text: '✨ A magic login link has been sent to your email inbox. Click it to log in immediately!' 
      });
    }
  }

  // 3. Password Setup / Reset Handler
  async function handlePasswordSetup(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.peopleandyouth.org/admin/reset-password'
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'ERROR', text: error.message });
    } else {
      setMessage({ 
        type: 'SUCCESS', 
        text: '📧 Password setup link sent! Check your email inbox to set or update your account password.' 
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#070b19] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* HEADER BANNER */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
            SOVEREIGN CONTROL CONSOLE
          </span>
          <h1 className="text-2xl font-black text-white tracking-wide uppercase">
            Admin Authentication
          </h1>
          <p className="text-xs text-gray-400">
            Sign in to access the Institution Operating System (IOS)
          </p>
        </div>

        {/* AUTH MODE TOGGLE TABS */}
        <div className="grid grid-cols-3 gap-1 bg-[#030611] p-1 rounded-xl border border-gray-800 text-[10px] font-bold uppercase">
          <button
            type="button"
            onClick={() => { setAuthMode('PASSWORD'); setMessage(null); }}
            className={`py-2 rounded-lg transition ${
              authMode === 'PASSWORD' ? 'bg-amber-500 text-black font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('MAGIC_LINK'); setMessage(null); }}
            className={`py-2 rounded-lg transition ${
              authMode === 'MAGIC_LINK' ? 'bg-amber-500 text-black font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            ✨ Magic Link
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('RESET_PASSWORD'); setMessage(null); }}
            className={`py-2 rounded-lg transition ${
              authMode === 'RESET_PASSWORD' ? 'bg-amber-500 text-black font-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            🔑 Set Password
          </button>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {message && (
          <div className={`p-3.5 rounded-xl text-xs font-medium border ${
            message.type === 'ERROR' 
              ? 'bg-red-950/40 border-red-500/50 text-red-300' 
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* MODE 1: PASSWORD LOGIN */}
        {authMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@peopleandyouth.org"
                className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => { setAuthMode('RESET_PASSWORD'); setMessage(null); }}
                  className="text-[10px] text-amber-400 hover:underline font-bold uppercase"
                >
                  Forgot / Set Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : '🔑 Sign In to Console'}
            </button>
          </form>
        )}

        {/* MODE 2: MAGIC LINK LOGIN */}
        {authMode === 'MAGIC_LINK' && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@peopleandyouth.org"
                className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                We will send a one-click login link directly to your email inbox—no password required.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending Magic Link...' : '✨ Send One-Click Magic Link'}
            </button>
          </form>
        )}

        {/* MODE 3: SET / RESET PASSWORD */}
        {authMode === 'RESET_PASSWORD' && (
          <form onSubmit={handlePasswordSetup} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                REGISTERED EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@peopleandyouth.org"
                className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                New onboarded members or existing users can enter their email here to receive a secure password setup link.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending Setup Link...' : '📧 Send Password Setup Email'}
            </button>
          </form>
        )}

        <div className="border-t border-gray-800 pt-4 text-center">
          <a href="/" className="text-[11px] text-gray-500 hover:text-gray-300">
            ← Return to Public Portal
          </a>
        </div>

      </div>
    </div>
  );
}