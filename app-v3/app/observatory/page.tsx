'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function PolicyObservatoryPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    const { data } = await supabase.from('observatory_metrics').select('*').order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setMetrics(data);
    } else {
      // Default Seed Metrics
      setMetrics([
        { metric_key: 'youth_dev', metric_name: 'Youth Human Capital Index', domain: 'Youth Employment', current_value: '74.2 / 100', trend: 'upward', impact_note: '+3.1% YoY gain driven by technical skill certifications.' },
        { metric_key: 'rti_transparency', metric_name: 'Institutional Compliance Index', domain: 'Governance', current_value: '88.5%', trend: 'upward', impact_note: 'Measured across statutory university & government portals.' },
        { metric_key: 'trade_index', metric_name: 'Strategic Trade & Export Index', domain: 'Economy', current_value: '$412B USD', trend: 'stable', impact_note: 'Quarterly trade balance in emerging market corridors.' },
        { metric_key: 'climate_target', metric_name: 'Renewable Capacity Share', domain: 'Climate', current_value: '42.8%', trend: 'upward', impact_note: 'National clean energy grid penetration target for 2030.' }
      ]);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            REAL-TIME STRATEGIC MONITORING
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Live Policy Observatory</h1>
          <p className="text-gray-400 text-[11px] mt-1">
            Live macroeconomic, civic, climate, and youth employment tracking indicators.
          </p>
        </div>
        <Link href="/policy-lab" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
          🧪 Policy Lab
        </Link>
      </header>

      {/* METRICS DASHBOARD GRID */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 max-w-7xl mx-auto">Syncing Observatory Feeds...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <div key={m.metric_key} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 font-bold uppercase">
                  {m.domain}
                </span>
                <span className="text-emerald-400 font-bold uppercase">📈 {m.trend}</span>
              </div>
              <h3 className="text-xs font-bold text-gray-300 uppercase">{m.metric_name}</h3>
              <div className="text-3xl font-extrabold text-amber-400">{m.current_value}</div>
              <p className="text-[10px] text-gray-400 leading-relaxed pt-2 border-t border-white/10">
                {m.impact_note}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}