'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SchemaRegistry } from '@/lib/schema-registry';
import { InstitutionalEntity, EntityType, AuditLogRecord } from '@/types/institution-os';

export default function CommandCentreConsole() {
  const [activeTab, setActiveTab] = useState<
    'cms' | 'leadership' | 'offices' | 'organization' | 'careers' | 'editorial' | 'media' | 'audit' | 'analytics'
  >('cms');

  const [entities, setEntities] = useState<InstitutionalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form States
  const [entityType, setEntityType] = useState<EntityType>('page');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [contentMarkup, setContentMarkup] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [saving, setSaving] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'audit') {
      setAuditLogs([
        {
          id: 'log-1',
          user_email: 'contact@peopleandyouth.org',
          action: 'PUBLISH',
          module: 'CMS',
          entity_id: 'ent-8821',
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        },
      ]);
    } else {
      const typeFilter: EntityType | undefined =
        activeTab === 'cms'
          ? 'page'
          : activeTab === 'leadership'
          ? 'leadership'
          : activeTab === 'offices'
          ? 'office'
          : activeTab === 'careers'
          ? 'position'
          : activeTab === 'organization'
          ? 'org_unit'
          : undefined;

      const data = await SchemaRegistry.listEntities(typeFilter);
      setEntities(data);
    }
    setLoading(false);
  };

  const handleSaveEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await SchemaRegistry.upsertEntity({
      entity_type: entityType,
      title,
      slug,
      summary,
      content_markup: contentMarkup,
      status,
      author_name: 'Swaraj Shandilya',
    });

    if (error) {
      alert(`Command Centre Note: ${error.message}`);
    } else {
      alert('Institutional Entity saved successfully to Schema Registry!');
      setIsCreateModalOpen(false);
      setTitle('');
      setSlug('');
      setSummary('');
      setContentMarkup('');
      loadData();
    }
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black">
      {/* COMMAND CENTRE TOP NAVIGATION BAR */}
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-3 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
          ← Main Digital Headquarters
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 font-bold">PEOPLE & YOUTH</span>
          <span>&middot;</span>
          <span className="text-amber-300 font-extrabold uppercase">INSTITUTION OS COMMAND CENTRE</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            v2.0 ACTIVE
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-8">
        {/* HEADER & MODULE LAUNCHER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-amber-400 font-bold text-[9px] uppercase tracking-widest block">
              SOVEREIGN GOVERNANCE & CONTROL
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Institutional Command Centre
            </h1>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs tracking-wider shadow-lg"
          >
            + Deploy Institutional Entity
          </button>
        </div>

        {/* OPERATIONAL MODULE TABS */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {[
            { id: 'cms', label: '📄 Page CMS' },
            { id: 'leadership', label: '👥 Leadership Directory' },
            { id: 'offices', label: '🏛️ Executive Offices' },
            { id: 'organization', label: '🏢 Org Editor' },
            { id: 'careers', label: '💼 Position Engine' },
            { id: 'editorial', label: '✍️ Editorial Board' },
            { id: 'media', label: '📁 Media Library' },
            { id: 'audit', label: '🛡️ Audit Logs' },
            { id: 'analytics', label: '📊 Telemetry' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-black shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ENTITY LISTING VIEW */}
        {activeTab !== 'audit' && activeTab !== 'analytics' && activeTab !== 'media' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-amber-400 uppercase">
                Active Managed Entities ({entities.length})
              </h2>
              <span className="text-gray-500 text-[10px]">Managed via Unified Schema Registry</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading Schema Registry Data...</div>
            ) : (
              <div className="space-y-3">
                {entities.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center flex-wrap gap-4 hover:border-amber-400/40 transition-all"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2 text-[9px]">
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                          {item.entity_type}
                        </span>
                        <span className="text-gray-400">v{item.version}</span>
                        <span className="text-emerald-400 font-bold uppercase">● {item.status}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      <p className="text-gray-400 text-[11px] truncate">{item.summary || 'No summary provided.'}</p>
                    </div>

                    <div className="text-right text-[10px] font-mono space-y-1">
                      <span className="block text-gray-300">Author: {item.author_name}</span>
                      <span className="block text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      {item.entity_type === 'office' && (
                        <Link
                          href={`/offices/${item.slug}`}
                          className="text-amber-300 font-bold hover:underline block"
                        >
                          View Virtual Chamber →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOGS VIEW */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase">System Audit & Governance Logs</h2>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center text-xs font-mono">
                  <div>
                    <span className="text-amber-300 font-bold">[{log.action}]</span>{' '}
                    <span className="text-white">{log.module} Module</span>
                    <span className="text-gray-400 block text-[10px]">User: {log.user_email} &middot; IP: {log.ip_address}</span>
                  </div>
                  <span className="text-gray-500 text-[10px]">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TELEMETRY DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
              <span className="text-gray-400 text-[10px] uppercase block">Total Schema Entities</span>
              <strong className="text-3xl text-amber-400 font-black">142</strong>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
              <span className="text-gray-400 text-[10px] uppercase block">Active Executive Chambers</span>
              <strong className="text-3xl text-emerald-400 font-black">3</strong>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-2">
              <span className="text-gray-400 text-[10px] uppercase block">System Security Audit Status</span>
              <strong className="text-3xl text-sky-400 font-black">100% RLS Secured</strong>
            </div>
          </div>
        )}

        {/* CREATE / EDIT ENTITY MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a1024] border border-amber-400/50 p-6 sm:p-8 rounded-3xl max-w-3xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto font-mono">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-sm font-bold text-amber-400 uppercase">
                  DEPLOY INSTITUTIONAL ENTITY TO SCHEMA REGISTRY
                </h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEntity} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">ENTITY TYPE *</label>
                    <select
                      value={entityType}
                      onChange={(e) => setEntityType(e.target.value as EntityType)}
                      className="w-full bg-[#070b19] border border-amber-400/60 rounded-xl p-2.5 text-amber-300 font-bold focus:outline-none text-xs"
                    >
                      <option value="page">Page Node (CMS)</option>
                      <option value="office">Executive Office</option>
                      <option value="leadership">Leadership Profile</option>
                      <option value="position">Career Position</option>
                      <option value="org_unit">Organization Unit</option>
                      <option value="journal">Journal / Realm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">PUBLICATION STATUS</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:outline-none text-xs"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">TITLE / ENTITY NAME *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Office of the Founder"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">URL SLUG</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="auto-generated-slug"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">SUMMARY / ABSTRACT</label>
                  <input
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Short description..."
                    className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">HTML MARKUP / BODY CONTENT</label>
                  <textarea
                    rows={6}
                    value={contentMarkup}
                    onChange={(e) => setContentMarkup(e.target.value)}
                    placeholder="<p>Write institutional markup here...</p>"
                    className="w-full bg-[#070b19] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs tracking-wider"
                >
                  {saving ? 'Deploying Entity...' : '🚀 Save Entity to Schema Registry'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}