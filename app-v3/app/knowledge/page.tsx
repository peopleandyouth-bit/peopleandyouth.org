'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function KnowledgeEnginePage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    setLoading(true);
    const { data } = await supabase.from('knowledge_graph_nodes').select('*').order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      setNodes(data);
      setSelectedNode(data[0]);
    } else {
      // Default Seed Knowledge Node
      const defaultNode = {
        topic_slug: 'demographic-dividend',
        title: 'Demographic Dividend & Youth Human Capital',
        summary: 'Strategic analysis of workforce demographics, statutory skill policy, education economics, and public health investments in emerging markets.',
        category: 'Public Policy & Economics',
        connected_entities: [
          { type: 'Article', name: 'Youth Capital in 2030', url: '/dissent-dias' },
          { type: 'Policy Audit', name: 'CAG Education Audit Critique', url: '/policy' },
          { type: 'Journal Paper', name: 'Macroeconomic Analysis of Indian Workforce', url: '/journals' },
          { type: 'Government Scheme', name: 'National Skill Development Mission', url: '#' }
        ]
      };
      setNodes([defaultNode]);
      setSelectedNode(defaultNode);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            INSTITUTIONAL KNOWLEDGE GRAPH
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Knowledge Engine</h1>
          <p className="text-gray-400 text-[11px] mt-1">
            Unified Knowledge Objects cross-linking articles, policy filings, datasets, and experts.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dissent-dias" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
            📜 Editorial Portal
          </Link>
          <Link href="/policy" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
            ⚖️ Policy Repository
          </Link>
        </div>
      </header>

      {/* KNOWLEDGE ENGINE WORKSPACE */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 max-w-7xl mx-auto">Mapping Knowledge Nodes...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TOPICS NAVIGATOR */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">
              Strategic Knowledge Nodes
            </h2>
            {nodes.map((n) => (
              <button
                key={n.topic_slug}
                onClick={() => setSelectedNode(n)}
                className={`w-full text-left p-4 rounded-2xl border transition-all space-y-1 block ${
                  selectedNode?.topic_slug === n.topic_slug
                    ? 'bg-amber-400/10 border-amber-400 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                <span className="text-[9px] uppercase font-bold text-amber-400">{n.category}</span>
                <h3 className="text-sm font-bold text-white">{n.title}</h3>
              </button>
            ))}
          </div>

          {/* CONNECTED OBJECT GRAPH DISPLAY */}
          {selectedNode && (
            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-amber-400 font-bold uppercase text-[10px]">{selectedNode.category}</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">{selectedNode.title}</h2>
                <p className="text-gray-300 text-[11px] leading-relaxed mt-2">{selectedNode.summary}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Interconnected Knowledge Graph Objects
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedNode.connected_entities?.map((obj: any, idx: number) => (
                    <Link
                      key={idx}
                      href={obj.url || '#'}
                      className="p-4 rounded-xl bg-[#070b19] border border-white/15 hover:border-amber-400 transition-all space-y-2 block group"
                    >
                      <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 font-bold text-[8px] uppercase">
                        {obj.type}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {obj.name}
                      </h4>
                      <span className="text-[9px] text-gray-500 font-mono">Explore Object →</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}