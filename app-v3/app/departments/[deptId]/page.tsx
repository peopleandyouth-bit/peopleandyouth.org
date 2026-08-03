'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DepartmentWorkspacePage({ params }: { params: { deptId: string } }) {
  const deptId = params.deptId || 'research';

  const [tasks] = useState([
    { id: '1', title: 'Audit Campus Infrastructure Brief', assignee: 'Swaraj S.', priority: 'Urgent', status: 'In Review' },
    { id: '2', title: 'Compile PMKVY CAG Field Report', assignee: 'Ananya S.', priority: 'High', status: 'In Progress' },
    { id: '3', title: 'Draft Renaissance Journal Peer Guidelines', assignee: 'Editorial Team', priority: 'Medium', status: 'To Do' },
  ]);

  return (
    <main className="min-h-screen bg-[#070b19] text-white p-6 sm:p-10 space-y-8">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">DEPARTMENT WORKSPACE</span>
          <h1 className="text-3xl font-extrabold text-white uppercase mt-1">{deptId} Division</h1>
        </div>
        <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-white/10 text-xs font-mono text-white">
          ← Return to OS Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="font-mono text-xs font-bold text-gray-400 uppercase border-b border-white/10 pb-2">📋 To Do</h3>
          {tasks.filter(t => t.status === 'To Do').map(t => (
            <div key={t.id} className="bg-[#0b1228] p-4 rounded-xl border border-white/10 space-y-2">
              <p className="text-xs font-bold text-white">{t.title}</p>
              <p className="text-[10px] text-gray-400 font-mono">Assignee: {t.assignee}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase border-b border-white/10 pb-2">⚙️ In Progress</h3>
          {tasks.filter(t => t.status === 'In Progress').map(t => (
            <div key={t.id} className="bg-[#0b1228] p-4 rounded-xl border border-cyan-500/30 space-y-2">
              <p className="text-xs font-bold text-white">{t.title}</p>
              <p className="text-[10px] text-gray-400 font-mono">Assignee: {t.assignee}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="font-mono text-xs font-bold text-emerald-400 uppercase border-b border-white/10 pb-2">✓ In Review / Done</h3>
          {tasks.filter(t => t.status === 'In Review').map(t => (
            <div key={t.id} className="bg-[#0b1228] p-4 rounded-xl border border-emerald-500/30 space-y-2">
              <p className="text-xs font-bold text-white">{t.title}</p>
              <p className="text-[10px] text-gray-400 font-mono">Assignee: {t.assignee}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
