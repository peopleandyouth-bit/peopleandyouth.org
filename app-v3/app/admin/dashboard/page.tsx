'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [essayCount, setEssayCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkSession();
    fetchStats();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
    } else {
      setUser(session.user);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const { count } = await supabase
        .from('watermarked_essays')
        .select('*', { count: 'exact', head: true });
      setEssayCount(count || 0);
    } catch (err) {
      console.error('Failed to fetch metrics');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/dissent-dias');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b19] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Authenticating Admin Session...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-10 space-y-8">
      <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-6 gap-4 max-w-6xl mx-auto">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            SOVEREIGN PLATFORM CONTROL HQ
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Master Dashboard</h1>
          <p className="text-gray-400 text-[11px] mt-0.5">
            Logged in as: <span className="text-amber-300 font-bold">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dissent-dias" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-gray-200">
            🏛️ Public Portal
          </Link>
          <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold hover:bg-red-500/30 transition-all">
            🚪 End Admin Session
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Total Published Essays</span>
          <div className="text-4xl font-extrabold text-amber-400">{essayCount}</div>
          <span className="text-[10px] text-gray-500">Live in Supabase Ledger</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Security Level</span>
          <div className="text-xl font-bold text-emerald-400">RLS Active</div>
          <span className="text-[10px] text-gray-500">Watermark Protection Armed</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider block">System Status</span>
          <div className="text-xl font-bold text-blue-400">Next.js 16 / Dynamic</div>
          <span className="text-[10px] text-gray-500">Real-time Database Routing</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-white/10 pb-2">
          Administration Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/essays" className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-3 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all group block">
            <div className="flex justify-between items-center">
              <span className="text-2xl">📜</span>
              <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">Launch Studio →</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
              Dynamic Essay Publisher
            </h3>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Create, edit, or release essays with real-time split-screen rendering and automatic URL slug generation.
            </p>
          </Link>
          <Link href="/admin/print" className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-3 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all group block">
            <div className="flex justify-between items-center">
              <span className="text-2xl">🖨️</span>
              <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">Open Studio →</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
              Exclusive Print Studio
            </h3>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Bypass public print locks to generate high-resolution physical copies or official PDF records of any document.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
