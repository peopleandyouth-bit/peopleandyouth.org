'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Aggregated Metrics
  const [stats, setStats] = useState({
    essayCount: 0,
    policyCount: 0,
    totalViews: 0,
    topEssay: 'None',
  });

  useEffect(() => {
    checkSession();
    fetchSystemMetrics();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
    } else {
      setUser(session.user);
    }
  };

  const fetchSystemMetrics = async () => {
    setLoading(true);
    try {
      // 1. Fetch Essays Count & Views
      const { data: essays } = await supabase
        .from('watermarked_essays')
        .select('title, views');

      // 2. Fetch Policy Documents Count
      const { count: policyCount } = await supabase
        .from('policy_documents')
        .select('*', { count: 'exact', head: true });

      if (essays) {
        const totalViews = essays.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const top = [...essays].sort((a, b) => (b.views || 0) - (a.views || 0))[0];

        setStats({
          essayCount: essays.length,
          policyCount: policyCount || 0,
          totalViews,
          topEssay: top ? top.title : 'None',
        });
      }
    } catch (err) {
      console.error('Failed to fetch system telemetry:', err);
    } finally {
      setLoading(false);
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
          <span>Aggregating Platform Telemetry...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-6 gap-4 max-w-6xl mx-auto">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            SOVEREIGN PLATFORM CONTROL HQ
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Master Dashboard</h1>
          <p className="text-gray-400 text-[11px] mt-0.5">
            Logged in as: <span className="text-amber-300 font-bold">{user?.email || 'Admin User'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dissent-dias"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-gray-200"
          >
            🏛️ Editorial Portal
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold hover:bg-red-500/30 transition-all"
          >
            🚪 End Session
          </button>
        </div>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Total Essay Reads</span>
          <div className="text-3xl font-extrabold text-amber-400">👁️ {stats.totalViews}</div>
          <span className="text-[10px] text-gray-500">Live Telemetry Count</span>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Published Essays</span>
          <div className="text-3xl font-extrabold text-emerald-400">📜 {stats.essayCount}</div>
          <span className="text-[10px] text-gray-500">In Supabase Database</span>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Policy & Legal Records</span>
          <div className="text-3xl font-extrabold text-blue-400">⚖️ {stats.policyCount}</div>
          <span className="text-[10px] text-gray-500">RTI, CAG & PIL Filings</span>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Top Read Publication</span>
          <div className="text-xs font-bold text-amber-300 truncate mt-1" title={stats.topEssay}>
            {stats.topEssay}
          </div>
          <span className="text-[10px] text-gray-500">Highest Reader Impact</span>
        </div>
      </div>

      {/* ADMIN MODULE NAVIGATION */}
      <div className="max-w-6xl mx-auto space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-white/10 pb-2">
          Administration Control Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/essays"
            className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all group block"
          >
            <div className="flex justify-between items-center">
              <span className="text-2xl">✍️</span>
              <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">Launch →</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              Split-Screen Publisher
            </h3>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Create and publish essays with live watermarked preview and direct image media uploading.
            </p>
          </Link>

          <Link
            href="/admin/policy"
            className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all group block"
          >
            <div className="flex justify-between items-center">
              <span className="text-2xl">⚖️</span>
              <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">Launch →</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              Legal & Policy Repository
            </h3>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Log RTI filings, CAG critiques, PIL petition drafts, and attach public PDF evidence.
            </p>
          </Link>

          <Link
            href="/admin/print"
            className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all group block"
          >
            <div className="flex justify-between items-center">
              <span className="text-2xl">🖨️</span>
              <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">Launch →</span>
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
              Unblocked Print Studio
            </h3>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Export clean hardcopies or official high-resolution PDF archives of any published document.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}