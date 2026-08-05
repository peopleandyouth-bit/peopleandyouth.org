'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        syncCookies(session);
        router.push('/admin/dashboard');
      }
    });
  }, [router]);

  const syncCookies = (session: any) => {
    if (!session) return;
    const maxAge = 60 * 60 * 24 * 7; // 7 Days
    document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
    document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        syncCookies(data.session);

        supabase.auth.onAuthStateChange((_event, session) => {
          if (session) syncCookies(session);
        });

        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs flex items-center justify-center p-6">
      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px]">
            SOVEREIGN CONTROL CONSOLE
          </span>
          <h1 className="text-2xl font-extrabold text-white">Admin Authentication</h1>
          <p className="text-gray-400 text-[11px]">Sign in to access the Institution Operating System (IOS)</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-center font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@peopleandyouth.org"
              className="w-full bg-[#070b19] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#070b19] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold uppercase tracking-wider hover:from-amber-300 transition-all shadow-xl"
          >
            {loading ? 'Authenticating...' : '🔐 Sign In to Console'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/10">
          <a href="/dissent-dias" className="text-gray-500 hover:text-amber-400 transition-colors text-[10px]">
            ← Return to Public Portal
          </a>
        </div>
      </div>
    </main>
  );
}