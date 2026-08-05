'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const ERP_MODULES = [
  'finance', 'hr', 'projects', 'meetings', 
  'assets', 'payroll', 'approvals', 'reports'
];

export default function InstitutionERPPage() {
  const [activeModule, setActiveModule] = useState('projects');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Institutional Operations');
  const [amount, setAmount] = useState('0');
  const [assignedTo, setAssignedTo] = useState('Swaraj Shandilya');
  const [status, setStatus] = useState('in_progress');

  useEffect(() => {
    fetchRecords();
  }, [activeModule]);

  const fetchRecords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('erp_records')
      .select('*')
      .eq('module_type', activeModule)
      .order('created_at', { ascending: false });

    if (data) setRecords(data);
    setLoading(false);
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('erp_records').insert([{
      module_type: activeModule,
      title,
      category,
      amount: parseFloat(amount) || 0,
      assigned_to: assignedTo,
      status
    }]);

    if (!error) {
      setTitle('');
      fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-6 gap-4 max-w-7xl mx-auto">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            SOVEREIGN ENTERPRISE CONTROL
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Institution ERP</h1>
          <p className="text-gray-400 text-[11px] mt-0.5">Finance, HR, Projects, Governance, Assets, and Approvals Suite.</p>
        </div>
        <Link href="/admin/dashboard" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-gray-200">
          ← Dashboard HQ
        </Link>
      </div>

      {/* MODULE TABS */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {ERP_MODULES.map((mod) => (
          <button
            key={mod}
            onClick={() => setActiveModule(mod)}
            className={`px-4 py-2 rounded-xl border font-bold uppercase transition-all ${
              activeModule === mod
                ? 'bg-amber-400 text-black border-amber-400'
                : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            {mod}
          </button>
        ))}
      </div>

      {/* MODULE WORKSPACE */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD RECORD FORM */}
        <form onSubmit={handleCreateRecord} className="lg:col-span-1 bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-white/10 pb-2">
            Log {activeModule.toUpperCase()} Item
          </h2>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Item Title / Task</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Record Title..."
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Budget / Valuation ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-amber-400 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase text-[10px] mb-1">Assigned Lead</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold uppercase tracking-wider hover:from-amber-300 transition-all shadow-xl"
          >
            ➕ Register ERP Record
          </button>
        </form>

        {/* RECORDS DISPLAY */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">
            Active {activeModule.toUpperCase()} Ledger ({records.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Syncing ERP Database...</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-gray-500">
              No active records in this ERP module. Create one above!
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 font-bold text-[9px] uppercase">
                      {r.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{r.title}</h3>
                    <p className="text-gray-400 text-[10px]">Lead: {r.assigned_to}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-emerald-400">${r.amount}</div>
                    <span className="text-[9px] text-gray-500 uppercase font-mono">{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}