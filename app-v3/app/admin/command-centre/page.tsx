'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SchemaRegistry } from '@/lib/schema-registry';
import { supabase } from '@/lib/supabaseClient';
import { InstitutionalEntity, EntityType, AuditLogRecord } from '@/types/institution-os';

export default function CommandCentreConsole() {
  const [activeTab, setActiveTab] = useState<
    'editorial' | 'reflections' | 'leadership' | 'offices' | 'cms' | 'organization' | 'careers' | 'media' | 'audit' | 'analytics'
  >('reflections');

  const [entities, setEntities] = useState<InstitutionalEntity[]>([]);
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [reflectionsList, setReflectionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLeadershipModalOpen, setIsLeadershipModalOpen] = useState(false);
  const [isEditorialModalOpen, setIsEditorialModalOpen] = useState(false);

  // General Entity Form States
  const [entityType, setEntityType] = useState<EntityType>('page');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [contentMarkup, setContentMarkup] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [saving, setSaving] = useState(false);

  // Specialized Leadership Form States
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [leadName, setLeadName] = useState('');
  const [leadSlug, setLeadSlug] = useState('');
  const [leadPosition, setLeadPosition] = useState('Founder & Chief Executive Officer');
  const [leadOffice, setLeadOffice] = useState('Office of the Founder & Chief Executive Officer');
  const [leadDepartment, setLeadDepartment] = useState('Executive Leadership & Board');
  const [leadPortrait, setLeadPortrait] = useState('/images/swaraj-shandilya-portrait.jpg');
  const [leadVision, setLeadVision] = useState('Building a generation that questions with integrity, reflects with humility, and acts with purpose.');
  const [leadBio, setLeadBio] = useState('Swaraj Shandilya is an institution builder, marketing strategist, GCP Professional Data Engineer, and IIFT MBA Scholar.');
  const [leadLinkedin, setLeadLinkedin] = useState('https://www.linkedin.com/in/swarajshandilya896');
  const [leadEmail, setLeadEmail] = useState('contact@peopleandyouth.org');
  const [leadAppointment, setLeadAppointment] = useState('January 2026');

  // Specialized Editorial Form States
  const [editorialTitle, setEditorialTitle] = useState('');
  const [editorialSlug, setEditorialSlug] = useState('');
  const [editorialSubtitle, setEditorialSubtitle] = useState('');
  const [editorialCategory, setEditorialCategory] = useState('EDITORIAL');
  const [editorialContent, setEditorialContent] = useState('');
  const [editorialBanner, setEditorialBanner] = useState('');
  const [editorialAuthor, setEditorialAuthor] = useState('Swaraj Shandilya');

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
          module: 'REFLECTIONS',
          entity_id: 'ref-101',
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        },
      ]);
    } else if (activeTab === 'reflections') {
      const { data } = await supabase
        .from('reflections')
        .select('*')
        .order('created_at', { ascending: false });
      setReflectionsList(data || []);
    } else if (activeTab === 'editorial') {
      const { data: dbArticles } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      const schemaJournals = await SchemaRegistry.listEntities('journal');
      setArticlesList(dbArticles || []);
      setEntities(schemaJournals);
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

  const updateReflectionStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('reflections')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert(`Error updating reflection: ${error.message}`);
    } else {
      loadData();
    }
  };

  // Direct Editorial Publishing Handler
  const handlePublishEditorial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const generatedSlug =
      editorialSlug.trim() ||
      editorialTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const articlePayload = {
      title: editorialTitle,
      slug: generatedSlug,
      subtitle: editorialSubtitle,
      abstract: editorialSubtitle,
      category: editorialCategory,
      content: editorialContent,
      author: editorialAuthor,
      created_at: new Date().toISOString(),
    };

    const { error: articleError } = await supabase.from('articles').upsert(articlePayload, { onConflict: 'slug' });

    await SchemaRegistry.upsertEntity({
      entity_type: 'journal',
      title: editorialTitle,
      slug: generatedSlug,
      status: 'published',
      summary: editorialSubtitle,
      content_markup: editorialContent,
      featured_image: editorialBanner,
      metadata: {
        category: editorialCategory,
        author: editorialAuthor,
        published_date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      },
      author_name: editorialAuthor,
    });

    if (articleError) {
      alert(`Publish Note: ${articleError.message}. Entity synced to Schema Registry.`);
    } else {
      alert('🚀 Editorial Dispatch published directly to live visitors!');
    }

    setIsEditorialModalOpen(false);
    resetEditorialForm();
    loadData();
    setSaving(false);
  };

  const resetEditorialForm = () => {
    setEditorialTitle('');
    setEditorialSlug('');
    setEditorialSubtitle('');
    setEditorialCategory('EDITORIAL');
    setEditorialContent('');
    setEditorialBanner('');
    setEditorialAuthor('Swaraj Shandilya');
  };

  // Seed Founder Profile Helper
  const seedFounderProfile = async () => {
    setSaving(true);
    const founderPayload = {
      entity_type: 'leadership' as EntityType,
      title: 'Swaraj Shandilya',
      slug: 'swaraj-shandilya',
      status: 'published' as const,
      summary: 'Founder & Chief Executive Officer at People & Youth. IIFT MBA Scholar, GCP Professional Data Engineer.',
      content_markup: '<p>Swaraj Shandilya leads People & Youth as Founder & Chief Executive Officer...</p>',
      metadata: {
        official_portrait: '/images/swaraj-shandilya-portrait.jpg',
        position: 'Founder & Chief Executive Officer',
        office: 'Office of the Founder & Chief Executive Officer',
        department: 'Executive Leadership & Board',
        biography: 'Swaraj Shandilya is an institution builder combining marketing strategy, management consulting, and cloud data engineering.',
        vision_statement: 'Building a generation that questions with integrity, reflects with humility, and acts with purpose.',
        linkedin: 'https://www.linkedin.com/in/swarajshandilya896',
        email: 'contact@peopleandyouth.org',
        appointment_date: 'January 2026',
      },
      author_name: 'Swaraj Shandilya',
    };

    const { error } = await SchemaRegistry.upsertEntity(founderPayload);
    if (error) {
      alert(`Error seeding profile: ${error.message}`);
    } else {
      alert('⚡ Swaraj Shandilya (Founder & CEO) profile successfully seeded!');
      loadData();
    }
    setSaving(false);
  };

  const handleSaveLeadership = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: editingLeadId || undefined,
      entity_type: 'leadership' as EntityType,
      title: leadName,
      slug: leadSlug || leadName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      status: status,
      summary: leadBio,
      content_markup: `<p>${leadBio}</p>`,
      metadata: {
        official_portrait: leadPortrait,
        position: leadPosition,
        office: leadOffice,
        department: leadDepartment,
        biography: leadBio,
        vision_statement: leadVision,
        linkedin: leadLinkedin,
        email: leadEmail,
        appointment_date: leadAppointment,
      },
      author_name: 'Swaraj Shandilya',
    };

    const { error } = await SchemaRegistry.upsertEntity(payload);

    if (error) {
      alert(`Leadership Editor Note: ${error.message}`);
    } else {
      alert('Leadership Profile saved successfully!');
      setIsLeadershipModalOpen(false);
      resetLeadershipForm();
      loadData();
    }
    setSaving(false);
  };

  const openEditLeadership = (item: InstitutionalEntity) => {
    const meta = item.metadata || {};
    setEditingLeadId(item.id);
    setLeadName(item.title);
    setLeadSlug(item.slug);
    setLeadPosition(meta.position || '');
    setLeadOffice(meta.office || '');
    setLeadDepartment(meta.department || '');
    setLeadPortrait(meta.official_portrait || '');
    setLeadVision(meta.vision_statement || '');
    setLeadBio(meta.biography || item.summary || '');
    setLeadLinkedin(meta.linkedin || '');
    setLeadEmail(meta.email || '');
    setLeadAppointment(meta.appointment_date || '');
    setStatus(item.status as any);
    setIsLeadershipModalOpen(true);
  };

  const resetLeadershipForm = () => {
    setEditingLeadId(null);
    setLeadName('');
    setLeadSlug('');
    setLeadPosition('Leadership Officer');
    setLeadOffice('Executive Office');
    setLeadDepartment('Governance');
    setLeadPortrait('/images/swaraj-shandilya-portrait.jpg');
    setLeadVision('');
    setLeadBio('');
    setLeadLinkedin('');
    setLeadEmail('contact@peopleandyouth.org');
    setLeadAppointment('2026');
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

          <div className="flex flex-wrap gap-3">
            {activeTab === 'leadership' && (
              <button
                onClick={seedFounderProfile}
                disabled={saving}
                className="px-4 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold uppercase rounded-xl hover:bg-emerald-500/30 transition-all text-xs"
              >
                ⚡ Seed Founder Profile
              </button>
            )}

            {activeTab === 'editorial' ? (
              <button
                onClick={() => setIsEditorialModalOpen(true)}
                className="px-5 py-2.5 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs tracking-wider shadow-lg"
              >
                + Write & Publish Editorial Dispatch
              </button>
            ) : activeTab === 'reflections' ? (
              <Link
                href="/reflections"
                target="_blank"
                className="px-5 py-2.5 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs tracking-wider shadow-lg"
              >
                View Live Reflections Page ↗
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (activeTab === 'leadership') {
                    resetLeadershipForm();
                    setIsLeadershipModalOpen(true);
                  } else {
                    setIsCreateModalOpen(true);
                  }
                }}
                className="px-5 py-2.5 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs tracking-wider shadow-lg"
              >
                + Deploy {activeTab === 'leadership' ? 'Leadership Profile' : 'Institutional Entity'}
              </button>
            )}
          </div>
        </div>

        {/* OPERATIONAL MODULE TABS */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {[
            { id: 'reflections', label: '📬 Reader\'s Desk' },
            { id: 'editorial', label: '✍️ Editorial Board' },
            { id: 'leadership', label: '👥 Leadership Directory' },
            { id: 'offices', label: '🏛️ Executive Offices' },
            { id: 'cms', label: '📄 Page CMS' },
            { id: 'organization', label: '🏢 Org Editor' },
            { id: 'careers', label: '💼 Position Engine' },
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

        {/* TAB 1: READER'S DESK (REFLECTIONS INBOX) */}
        {activeTab === 'reflections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-amber-400 uppercase">
                  Reader's Desk Inbox ({reflectionsList.length})
                </h2>
                <p className="text-gray-400 text-[11px]">
                  Reflections, questions, ideas, and critical dispatches submitted by visitors via /reflections.
                </p>
              </div>
              <button
                onClick={loadData}
                className="text-amber-300 hover:underline font-bold text-[11px]"
              >
                🔄 Refresh Inbox
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading Reflections Inbox...</div>
            ) : reflectionsList.length === 0 ? (
              <div className="p-12 bg-white/5 border border-white/10 rounded-2xl text-center space-y-2">
                <p className="text-gray-300 font-bold">No reflections submitted yet.</p>
                <p className="text-gray-500 text-[11px]">
                  Submissions via <span className="text-amber-300 font-mono">peopleandyouth.org/reflections</span> will appear here instantly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reflectionsList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#070b19] border border-amber-500/20 p-6 rounded-2xl space-y-4 hover:border-amber-400/50 transition-all"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold text-[10px] uppercase">
                          {item.category || '🖋 Reflection'}
                        </span>
                        <span className="text-gray-500">&bull;</span>
                        <span className="text-white font-bold">{item.author_name || 'Anonymous Reader'}</span>
                        {item.organization && (
                          <span className="text-gray-400 text-[10px]">({item.organization})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={item.status || 'pending'}
                          onChange={(e) => updateReflectionStatus(item.id, e.target.value)}
                          className="bg-[#030611] border border-white/20 rounded-lg px-2.5 py-1 text-emerald-400 font-bold text-[10px] focus:outline-none"
                        >
                          <option value="pending">● Pending</option>
                          <option value="reviewed">✓ Reviewed</option>
                          <option value="featured">⭐ Featured</option>
                          <option value="archived">📁 Archived</option>
                        </select>
                        <span className="text-gray-500 text-[10px]">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {item.prompt_question && (
                      <div className="bg-amber-400/10 border border-amber-400/20 p-3 rounded-xl font-serif italic text-amber-200 text-xs">
                        Inquiry Prompt: &ldquo;{item.prompt_question}&rdquo;
                      </div>
                    )}

                    <p className="text-gray-200 font-serif text-sm leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                      {item.message}
                    </p>

                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 pt-2 border-t border-white/5">
                      <span>Protocol Email: <a href={`mailto:${item.author_email}`} className="text-amber-300 hover:underline">{item.author_email}</a></span>
                      <a href={`mailto:${item.author_email}?subject=Regarding your reflection on People %26 Youth`} className="text-amber-400 font-bold hover:underline">
                        Reply Directly via Email &rarr;
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DEDICATED EDITORIAL BOARD MODULE */}
        {activeTab === 'editorial' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-amber-400 uppercase">
                  Live Editorial Dispatches & Publications ({articlesList.length + entities.length})
                </h2>
                <p className="text-gray-400 text-[11px]">
                  Publish dispatches, Renaissance Series whitepapers, and policy critiques directly to live visitors.
                </p>
              </div>
              <div className="flex gap-4">
                <Link href="/activity" target="_blank" className="text-amber-300 hover:underline font-bold text-[11px]">
                  Activity Portal ↗
                </Link>
                <Link href="/essays" target="_blank" className="text-emerald-400 hover:underline font-bold text-[11px]">
                  Essays Feed ↗
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading Editorial Dispatches...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articlesList.map((art) => (
                  <div
                    key={art.id || art.slug}
                    className="bg-[#070b19] border border-amber-500/20 hover:border-amber-400/50 p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold uppercase">
                          {art.category || 'EDITORIAL'}
                        </span>
                        <span className="text-emerald-400 font-bold uppercase">● LIVE DISPATCH</span>
                      </div>

                      <h3 className="text-base font-bold text-white">{art.title}</h3>
                      <p className="text-gray-300 text-[11px] font-serif line-clamp-2">
                        {art.subtitle || art.abstract || 'No summary provided.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px]">
                      <span className="text-gray-400">
                        Date: {new Date(art.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <Link
                        href={`/articles/${art.slug}`}
                        target="_blank"
                        className="text-amber-400 font-bold hover:underline"
                      >
                        View Live Article ↗
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEADERSHIP DIRECTORY MODULE */}
        {activeTab === 'leadership' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-amber-400 uppercase">
                  Executive Incumbents & Leadership Directory ({entities.length})
                </h2>
                <p className="text-gray-400 text-[11px]">
                  Manage executive profiles, portraits, vision statements, and department assignments.
                </p>
              </div>
              <Link href="/leadership" target="_blank" className="text-amber-300 hover:underline font-bold text-[11px]">
                View Live Directory Portal ↗
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading Leadership Profiles...</div>
            ) : entities.length === 0 ? (
              <div className="p-12 bg-white/5 border border-white/10 rounded-2xl text-center space-y-4">
                <p className="text-gray-400 font-mono">No leadership profiles found in database.</p>
                <button
                  onClick={seedFounderProfile}
                  className="px-6 py-3 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs"
                >
                  ⚡ Click to Seed Swaraj Shandilya (Founder & CEO) Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {entities.map((person) => {
                  const meta = person.metadata || {};
                  return (
                    <div
                      key={person.id}
                      className="bg-[#070b19] border border-amber-500/20 hover:border-amber-400/50 p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center font-bold text-amber-300 text-lg">
                              {person.title.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">{person.title}</h3>
                              <span className="text-amber-400 text-[11px] font-bold block">
                                {meta.position || 'Executive Incumbent'}
                              </span>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase">
                            ● {person.status}
                          </span>
                        </div>

                        <p className="text-gray-300 text-[11px] italic line-clamp-2">
                          &ldquo;{meta.vision_statement || person.summary}&rdquo;
                        </p>

                        <div className="text-[10px] text-gray-400 space-y-0.5 pt-2 border-t border-white/5">
                          <div><strong>Office:</strong> {meta.office || 'Executive Office'}</div>
                          <div><strong>Department:</strong> {meta.department || 'Governance'}</div>
                          <div><strong>Email:</strong> {meta.email || 'contact@peopleandyouth.org'}</div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[11px]">
                        <button
                          onClick={() => openEditLeadership(person)}
                          className="px-3 py-1.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-lg hover:bg-amber-400/20 font-bold uppercase"
                        >
                          ✏️ Edit Profile
                        </button>
                        <Link href="/offices/office-of-the-founder" target="_blank" className="text-gray-300 hover:text-white underline font-bold">
                          View Suite ↗
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4-8: GENERIC ENTITY LISTING VIEW */}
        {activeTab !== 'reflections' && activeTab !== 'editorial' && activeTab !== 'leadership' && activeTab !== 'audit' && activeTab !== 'analytics' && activeTab !== 'media' && (
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
                        <Link href={`/offices/${item.slug}`} className="text-amber-300 font-bold hover:underline block">
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

        {/* TAB 9: AUDIT LOGS VIEW */}
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

        {/* TAB 10: TELEMETRY DASHBOARD */}
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

        {/* MODAL 1: EDITORIAL DISPATCH PUBLISHER */}
        {isEditorialModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a1024] border border-amber-400/50 p-6 sm:p-8 rounded-3xl max-w-3xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto font-mono">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-sm font-bold text-amber-400 uppercase">
                  WRITE & PUBLISH EDITORIAL DISPATCH DIRECTLY TO VISITORS
                </h2>
                <button onClick={() => setIsEditorialModalOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handlePublishEditorial} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">DISPATCH CATEGORY *</label>
                    <select
                      value={editorialCategory}
                      onChange={(e) => setEditorialCategory(e.target.value)}
                      className="w-full bg-[#070b19] border border-amber-400/60 rounded-xl p-2.5 text-amber-300 font-bold focus:outline-none text-xs"
                    >
                      <option value="EDITORIAL">EDITORIAL DISPATCH</option>
                      <option value="DISSENT DIAS">DISSENT DIAS</option>
                      <option value="RENAISSANCE SERIES">RENAISSANCE SERIES</option>
                      <option value="POLICY ROUNDTABLE">POLICY ROUNDTABLE</option>
                      <option value="RESEARCH COLLOQUIUM">RESEARCH COLLOQUIUM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">AUTHOR NAME</label>
                    <input
                      type="text"
                      value={editorialAuthor}
                      onChange={(e) => setEditorialAuthor(e.target.value)}
                      placeholder="Swaraj Shandilya"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">ARTICLE TITLE *</label>
                    <input
                      type="text"
                      required
                      value={editorialTitle}
                      onChange={(e) => setEditorialTitle(e.target.value)}
                      placeholder="e.g. Until the lion learns how to write..."
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">URL SLUG (AUTO-GENERATED IF BLANK)</label>
                    <input
                      type="text"
                      value={editorialSlug}
                      onChange={(e) => setEditorialSlug(e.target.value)}
                      placeholder="until-the-lion-learns-how-to-write"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">SUBTITLE / ABSTRACT *</label>
                  <input
                    type="text"
                    required
                    value={editorialSubtitle}
                    onChange={(e) => setEditorialSubtitle(e.target.value)}
                    placeholder="Brief 1-2 sentence overview displayed on activity cards..."
                    className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">FEATURED BANNER IMAGE URL</label>
                  <input
                    type="text"
                    value={editorialBanner}
                    onChange={(e) => setEditorialBanner(e.target.value)}
                    placeholder="https://... or /images/banner.jpg"
                    className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">FULL ARTICLE BODY (HTML OR MARKUP) *</label>
                  <textarea
                    rows={8}
                    required
                    value={editorialContent}
                    onChange={(e) => setEditorialContent(e.target.value)}
                    placeholder="<p>Write your essay or policy dispatch here...</p>"
                    className="w-full bg-[#070b19] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs tracking-wider"
                >
                  {saving ? 'Publishing Dispatch...' : '🚀 Publish Dispatch Live to Public Visitors'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: SPECIALIZED LEADERSHIP PROFILE EDITOR */}
        {isLeadershipModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a1024] border border-amber-400/50 p-6 sm:p-8 rounded-3xl max-w-3xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto font-mono">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-sm font-bold text-amber-400 uppercase">
                  {editingLeadId ? 'EDIT LEADERSHIP PROFILE' : 'DEPLOY NEW LEADERSHIP PROFILE'}
                </h2>
                <button onClick={() => setIsLeadershipModalOpen(false)} className="text-gray-400 hover:text-white text-lg font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveLeadership} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">INCUMBENT FULL NAME *</label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Swaraj Shandilya"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">URL SLUG</label>
                    <input
                      type="text"
                      value={leadSlug}
                      onChange={(e) => setLeadSlug(e.target.value)}
                      placeholder="swaraj-shandilya"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">POSITION / DESIGNATION *</label>
                    <input
                      type="text"
                      required
                      value={leadPosition}
                      onChange={(e) => setLeadPosition(e.target.value)}
                      placeholder="Founder & Chief Executive Officer"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">EXECUTIVE OFFICE</label>
                    <input
                      type="text"
                      value={leadOffice}
                      onChange={(e) => setLeadOffice(e.target.value)}
                      placeholder="Office of the Founder & Chief Executive Officer"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">DEPARTMENT / DIVISION</label>
                    <input
                      type="text"
                      value={leadDepartment}
                      onChange={(e) => setLeadDepartment(e.target.value)}
                      placeholder="Executive Board"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">OFFICIAL PORTRAIT URL</label>
                    <input
                      type="text"
                      value={leadPortrait}
                      onChange={(e) => setLeadPortrait(e.target.value)}
                      placeholder="/images/swaraj-shandilya-portrait.jpg"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">VISION STATEMENT</label>
                  <input
                    type="text"
                    value={leadVision}
                    onChange={(e) => setLeadVision(e.target.value)}
                    placeholder="Building a generation that questions with integrity..."
                    className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-amber-300 font-bold focus:border-amber-400 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-[9px] uppercase mb-1">EXECUTIVE SUMMARY & BIOGRAPHY</label>
                  <textarea
                    rows={4}
                    value={leadBio}
                    onChange={(e) => setLeadBio(e.target.value)}
                    placeholder="Provide executive background, qualifications, and achievements..."
                    className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">LINKEDIN PROFILE URL</label>
                    <input
                      type="text"
                      value={leadLinkedin}
                      onChange={(e) => setLeadLinkedin(e.target.value)}
                      placeholder="https://www.linkedin.com/in/swarajshandilya896"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[9px] uppercase mb-1">OFFICIAL PROTOCOL EMAIL</label>
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="contact@peopleandyouth.org"
                      className="w-full bg-[#070b19] border border-white/20 rounded-xl p-2.5 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-amber-400 text-black font-extrabold uppercase rounded-xl hover:bg-amber-300 transition-all text-xs tracking-wider"
                >
                  {saving ? 'Saving Profile...' : '🚀 Deploy Profile to Leadership Registry'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: GENERAL ENTITY MODAL */}
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
                      placeholder="e.g. Office of Strategic Consulting"
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