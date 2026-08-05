'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function InstitutionalCRMPage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [entityName, setEntityName] = useState('');
  const [entityType, setEntityType] = useState('Government');
  const [contactEmail, setContactEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [contractValue, setContractValue] = useState('50000');
  const [stage, setStage] = useState('proposal_sent');

  useEffect(() => {
    fetchCRM();
  }, []);

  const fetchCRM = async () => {
    setLoading(true);
    const { data } = await supabase.from('crm_entities').select('*').order('created_at', { ascending: false });
    if (data) setEntities(data);
    setLoading(false);
  };

  const handleCreateCRM = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('crm_entities').insert([{
      entity_name: entityName,
      entity_type: entityType,
      contact_email: contactEmail,
      project_title: projectTitle,
      contract_value: parseFloat(contractValue) || 0,
      stage
    }]);

    if (!error) {
      setEntityName('');
      setProjectTitle('');
      fetchCRM();
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-10 space-y-8">
      <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-6 gap-4 max-w-7xl mx-auto">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            PARTNERSHIPS & CONSULTING ENTERPRISE
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Institutional CRM</h1>
        </div>
        <Link href="/admin/dashboard" className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200">
          ← Dashboard HQ
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleCreateCRM} className="lg:col-span-1 bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase border-b border-white/10 pb-2">
            Register Partner / Client Account
          </h2>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Entity Name</label>
            <input
              type="text"
              required
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Classification</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white"
            >
              <option value="Government">Government Body</option>
              <option value="Corporate">Corporate Client</option>
              <option value="University">University Network</option>
              <option value="Donor">Donor / Grant Foundation</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Project Scope</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Contract Value ($)</label>
            <input
              type="number"
              value={contractValue}
              onChange={(e) => setContractValue(e.target.value)}
              className="w-full bg-[#070b19] border border-white/20 rounded-lg p-2.5 text-amber-400 font-bold"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-amber-400 text-black font-extrabold rounded-xl uppercase">
            Log Account
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase border-b border-white/10 pb-2">
            Partnership & Consulting Accounts ({entities.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading Accounts...</div>
          ) : entities.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-gray-500">
              No accounts registered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {entities.map((ent) => (
                <div key={ent.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="px-2 py-0.5 bg-amber-400/10 text-amber-400 font-bold uppercase text-[9px]">
                      {ent.entity_type}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{ent.entity_name}</h3>
                    <p className="text-gray-400 text-[10px]">{ent.project_title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-emerald-400">${ent.contract_value}</div>
                    <span className="text-[9px] uppercase font-mono text-gray-400">{ent.stage}</span>
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