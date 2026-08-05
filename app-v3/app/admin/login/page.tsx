'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        router.push('/admin/essays');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6">
        
        <div className="text-center space-y-2 border-b border-white/10 pb-4">
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            SOVEREIGN ACCESS CONTROL
          </span>
          <h1 className="text-2xl font-extrabold text-white">Admin Authentication</h1>
          <p className="text-gray-400 text-[10px]">peopleandyouth.org Control Console</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/40 text-red-300 rounded-lg text-center font-bold">
            ❌ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-400 uppercase mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@peopleandyouth.org"
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-3 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold uppercase tracking-wider hover:from-amber-300 transition-all shadow-xl mt-2"
          >
            {loading ? 'Authenticating Session...' : '🔓 Sign In to Admin Console'}
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link href="/dissent-dias" className="text-gray-400 hover:text-amber-400 transition-colors">
            ← Return to Public Editorial Portal
          </Link>
        </div>

      </div>
    </main>
  );
}