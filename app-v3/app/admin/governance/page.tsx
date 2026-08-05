'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function GovernanceERPPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [regionName, setRegionName] = useState('');
  const [level, setLevel] = useState('District');
  const [country, setCountry] = useState('India');
  const [coordinator, setCoordinator] = useState('Swaraj Shandilya');
  const [volunteers, setVolunteers] = useState('25');

  useEffect(() => {
    fetchGovernance();
  }, []);

  const fetchGovernance = async () => {
    setLoading(true);
    const { data } = await supabase.from('governance_nodes').select('*').order('created_at', { ascending: false });
    if (data) setNodes(data);
    setLoading(false);
  };

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('governance_nodes').insert([{
      level,
      region_name: regionName,
      country,
      coordinator_name: coordinator,
      active_volunteers: parseInt(volunteers) || 0
    }]);

    if (!error) {
      setRegionName('');
      fetchGovernance();
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-10 space-y-8">
      <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-6 gap-4 max-w-7xl mx-auto">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            REGIONAL & COUNTRY INFRASTRUCTURE
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">District & Country ERP</h1>
        </div>
        <Link href="/admin/dashboard" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200">
          ← Dashboard HQ
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleCreateNode} className="lg:col-span-1 bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase border-b border-white/10 pb-2">
            Register Regional Node
          </h2>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Administrative Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white">
              <option value="Country">Country Chapter</option>
              <option value="State">State Chapter</option>
              <option value="District">District Node</option>
              <option value="Block">Block Coordinator</option>
              <option value="Village">Village Unit</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Region / District Name</label>
            <input type="text" required value={regionName} onChange={(e) => setRegionName(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white" />
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Country</label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white" />
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Regional Coordinator</label>
            <input type="text" value={coordinator} onChange={(e) => setCoordinator(e.target.value)} className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white" />
          </div>

          <button type="submit" className="w-full py-3 bg-amber-400 text-black font-extrabold rounded-xl uppercase">
            Deploy Regional Node
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase border-b border-white/10 pb-2">
            Governance Ledger ({nodes.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading Governance ERP...</div>
          ) : (
            <div className="space-y-3">
              {nodes.map((n) => (
                <div key={n.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 bg-amber-400/10 text-amber-400 font-bold uppercase text-[9px]">
                      {n.level} • {n.country}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{n.region_name}</h3>
                    <p className="text-gray-400 text-[10px]">Coordinator: {n.coordinator_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-emerald-400">{n.active_volunteers} Volunteers</div>
                    <span className="text-[9px] font-mono text-gray-400">Impact Score: {n.impact_score}</span>
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