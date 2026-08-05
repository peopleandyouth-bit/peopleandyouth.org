'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ExecutiveWarRoomPage() {
  const [metrics, setMetrics] = useState<any>({
    essaysCount: 0,
    policyCount: 0,
    crmRevenue: 0,
    activeApplicants: 0,
    erpBudget: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarRoomData();
  }, []);

  const fetchWarRoomData = async () => {
    setLoading(true);
    try {
      const { count: essaysCount } = await supabase.from('watermarked_essays').select('*', { count: 'exact', head: true });
      const { count: policyCount } = await supabase.from('policy_documents').select('*', { count: 'exact', head: true });
      const { data: crmData } = await supabase.from('crm_entities').select('contract_value');
      const { count: activeApplicants } = await supabase.from('career_applications').select('*', { count: 'exact', head: true });
      const { data: erpData } = await supabase.from('erp_records').select('amount');

      const crmRevenue = crmData?.reduce((acc, curr) => acc + (parseFloat(curr.contract_value) || 0), 0) || 0;
      const erpBudget = erpData?.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0) || 0;

      setMetrics({
        essaysCount: essaysCount || 0,
        policyCount: policyCount || 0,
        crmRevenue,
        activeApplicants: activeApplicants || 0,
        erpBudget
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs p-6 sm:p-10 space-y-8">
      {/* WAR ROOM TOP BAR */}
      <div className="flex flex-wrap justify-between items-center border-b border-amber-400/30 pb-6 gap-4 max-w-7xl mx-auto">
        <div>
          <span className="px-3 py-1 bg-amber-400 text-black font-extrabold uppercase text-[9px] rounded-md tracking-widest">
            FOUNDER EXECUTIVE COMMAND
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Executive War Room</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-gray-200">
            ← Master HQ
          </Link>
          <Link href="/admin/cms" className="px-4 py-2 bg-amber-400 text-black font-extrabold rounded-xl">
            Universal CMS
          </Link>
        </div>
      </div>

      {/* SINGLE-SCREEN COMMAND GRID */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 max-w-7xl mx-auto">Syncing War Room Feeds...</div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* FINANCIAL & PARTNERSHIP RUNWAY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#070b19] border border-amber-400/30 p-6 rounded-2xl space-y-2 shadow-2xl">
              <span className="text-gray-400 text-[10px] uppercase">Contract Runway (CRM)</span>
              <div className="text-3xl font-extrabold text-emerald-400">${metrics.crmRevenue.toLocaleString()}</div>
              <span className="text-[9px] text-gray-500">Active Strategic Pipeline</span>
            </div>

            <div className="bg-[#070b19] border border-white/10 p-6 rounded-2xl space-y-2 shadow-2xl">
              <span className="text-gray-400 text-[10px] uppercase">ERP Operational Budget</span>
              <div className="text-3xl font-extrabold text-amber-400">${metrics.erpBudget.toLocaleString()}</div>
              <span className="text-[9px] text-gray-500">Allocated Operational Funds</span>
            </div>

            <div className="bg-[#070b19] border border-white/10 p-6 rounded-2xl space-y-2 shadow-2xl">
              <span className="text-gray-400 text-[10px] uppercase">Published Publications</span>
              <div className="text-3xl font-extrabold text-blue-400">{metrics.essaysCount} Essays</div>
              <span className="text-[9px] text-gray-500">Live Editorial Records</span>
            </div>

            <div className="bg-[#070b19] border border-white/10 p-6 rounded-2xl space-y-2 shadow-2xl">
              <span className="text-gray-400 text-[10px] uppercase">Fellowship Candidates</span>
              <div className="text-3xl font-extrabold text-purple-400">{metrics.activeApplicants} Active</div>
              <span className="text-[9px] text-gray-500">Human Capital Pipeline</span>
            </div>
          </div>

          {/* SYSTEM QUICK-LAUNCH MATRIX */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-white/10 pb-2">
              Institution Command Matrices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/admin/erp" className="p-6 bg-[#0a1024] border border-white/15 rounded-2xl space-y-2 hover:border-amber-400 transition-all block">
                <span className="text-2xl">💼</span>
                <h3 className="text-base font-bold text-white">Institution ERP Suite</h3>
                <p className="text-gray-400 text-[11px]">Control Finance, HR, Payroll, Projects, and Approvals.</p>
              </Link>

              <Link href="/admin/crm" className="p-6 bg-[#0a1024] border border-white/15 rounded-2xl space-y-2 hover:border-amber-400 transition-all block">
                <span className="text-2xl">🤝</span>
                <h3 className="text-base font-bold text-white">Partnerships & CRM</h3>
                <p className="text-gray-400 text-[11px]">Manage Government, Corporate, and University contracts.</p>
              </Link>

              <Link href="/admin/careers" className="p-6 bg-[#0a1024] border border-white/15 rounded-2xl space-y-2 hover:border-amber-400 transition-all block">
                <span className="text-2xl">🎓</span>
                <h3 className="text-base font-bold text-white">Fellowships & Careers</h3>
                <p className="text-gray-400 text-[11px]">Review applicants, conduct assessments, and issue offers.</p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}