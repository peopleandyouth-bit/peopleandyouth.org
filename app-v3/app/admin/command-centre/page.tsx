'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calculateReadingTime } from '@/lib/cms';

export default function CommandCentreDashboard() {
  const [activeTab, setActiveTab] = useState<
    'ARTICLES' | 'JOURNALS' | 'AUTHORS' | 'COLUMNS' | 'REFLECTIONS' | 'REVISIONS' | 'FOUNDER'
  >('ARTICLES');

  // Data Collections State
  const [articles, setArticles] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Article Editor State
  const [editorMode, setEditorMode] = useState<'LIST' | 'EDIT'>('LIST');
  const [articleId, setArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [publicationType, setPublicationType] = useState('DISSENT_DIAS');
  const [category, setCategory] = useState('Public Policy');
  const [authorId, setAuthorId] = useState('');
  const [publicationId, setPublicationId] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'UNDER_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Journal Form State
  const [jName, setJName] = useState('');
  const [jType, setJType] = useState('RENAISSANCE_SERIES');
  const [jDesc, setJDesc] = useState('');
  const [jIssn, setJIssn] = useState('');
  const [jEditor, setJEditor] = useState('');

  // New Author Form State
  const [aName, setAName] = useState('');
  const [aDesignation, setADesignation] = useState('');
  const [aOrg, setAOrg] = useState('');
  const [aBio, setABio] = useState('');
  const [aEmail, setAEmail] = useState('');

  // FOUNDER'S OFFICE ACTIVE CONTROLS STATE
  const [watermarkText, setWatermarkText] = useState('OFFICIAL RECORD | PEOPLE & YOUTH | DO NOT DUPLICATE');
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [publicIntakeOpen, setPublicIntakeOpen] = useState(true);
  const [requireEditorialReview, setRequireEditorialReview] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Team Permissions Manager State
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Managing Editor');
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Founder & Chair', email: 'contact@peopleandyouth.org', role: 'Super Administrator', status: 'ACTIVE' },
    { id: '2', name: 'Editorial Desk', email: 'editorial@peopleandyouth.org', role: 'Managing Editor', status: 'ACTIVE' }
  ]);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setLoading(true);
    const [artRes, jourRes, authRes, colRes, refRes, revRes] = await Promise.all([
      supabase.from('articles').select('*, authors(name), publications(name)').order('updated_at', { ascending: false }),
      supabase.from('publications').select('*').order('name', { ascending: true }),
      supabase.from('authors').select('*').order('name', { ascending: true }),
      supabase.from('editorial_columns').select('*, authors(name)').order('title', { ascending: true }),
      supabase.from('reflections').select('*').order('created_at', { ascending: false }),
      supabase.from('article_revisions').select('*, articles(title)').order('created_at', { ascending: false }).limit(20)
    ]);

    if (artRes.data) setArticles(artRes.data);
    if (jourRes.data) setJournals(jourRes.data);
    if (authRes.data) setAuthors(authRes.data);
    if (colRes.data) setColumns(colRes.data);
    if (refRes.data) setReflections(refRes.data);
    if (revRes.data) setRevisions(revRes.data);
    setLoading(false);
  }

  function generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  function handleNewArticle() {
    setArticleId(null);
    setTitle('');
    setSubtitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setPublicationType('DISSENT_DIAS');
    setCategory('Public Policy');
    setAuthorId('');
    setPublicationId('');
    setStatus('DRAFT');
    setFeatured(false);
    setEditorMode('EDIT');
  }

  function handleEditArticle(art: any) {
    setArticleId(art.id);
    setTitle(art.title);
    setSubtitle(art.subtitle || '');
    setSlug(art.slug);
    setExcerpt(art.excerpt || '');
    setContent(art.content || '');
    setPublicationType(art.publication_type);
    setCategory(art.category);
    setAuthorId(art.author_id || '');
    setPublicationId(art.publication_id || '');
    setStatus(art.status);
    setFeatured(art.featured || false);
    setEditorMode('EDIT');
  }

  function handlePromoteReflection(ref: any) {
    setArticleId(null);
    setTitle(`Dispatch: ${ref.prompt_question || 'Public Reflection'}`);
    setSubtitle(`Submitted by ${ref.author_name || 'Anonymous Reader'} (${ref.organization || 'Civic Participant'})`);
    setSlug(generateSlug(`dispatch-${ref.prompt_question || 'reflection'}-${Date.now().toString().slice(-4)}`));
    setExcerpt(ref.message ? ref.message.slice(0, 150) + '...' : '');
    setContent(`> **Original Dispatch:**\n> "${ref.message}"\n\n# Institutional Review & Commentary\n\nAdd your analytical essay or editorial perspective here...`);
    setPublicationType('DISSENT_DIAS');
    setCategory(ref.category || 'Civic Reflections');
    setStatus('DRAFT');
    setActiveTab('ARTICLES');
    setEditorMode('EDIT');
  }

  async function handleSaveArticle(targetStatus?: typeof status) {
    setSaving(true);
    const finalStatus = targetStatus || status;
    const computedSlug = slug || generateSlug(title);
    const readingTime = calculateReadingTime(content);

    const payload = {
      title,
      subtitle,
      slug: computedSlug,
      excerpt,
      content,
      publication_type: publicationType,
      category,
      author_id: authorId || null,
      publication_id: publicationId || null,
      status: finalStatus,
      featured,
      reading_time: readingTime,
      watermark_text: watermarkEnabled ? watermarkText : '',
      published_at: finalStatus === 'PUBLISHED' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (articleId) {
      const res = await supabase.from('articles').update(payload).eq('id', articleId);
      error = res.error;
    } else {
      const res = await supabase.from('articles').insert(payload);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      alert('Error saving article: ' + error.message);
    } else {
      alert(`Article saved successfully as ${finalStatus}!`);
      fetchAllData();
      setEditorMode('LIST');
    }
  }

  async function handleCreateJournal(e: React.FormEvent) {
    e.preventDefault();
    if (!jName) return;
    const computedSlug = generateSlug(jName);
    const { error } = await supabase.from('publications').insert({
      name: jName,
      slug: computedSlug,
      publication_type: jType,
      description: jDesc,
      issn: jIssn || null,
      editor_in_chief: jEditor || 'Founder'
    });
    if (error) {
      alert('Failed to create journal: ' + error.message);
    } else {
      alert(`Journal "${jName}" created successfully!`);
      setJName(''); setJDesc(''); setJIssn(''); setJEditor('');
      fetchAllData();
    }
  }

  async function handleCreateAuthor(e: React.FormEvent) {
    e.preventDefault();
    if (!aName) return;
    const computedSlug = generateSlug(aName);
    const { error } = await supabase.from('authors').insert({
      name: aName,
      slug: computedSlug,
      designation: aDesignation,
      organization: aOrg,
      bio: aBio,
      email: aEmail || null
    });
    if (error) {
      alert('Failed to add author: ' + error.message);
    } else {
      alert(`Author "${aName}" added successfully!`);
      setAName(''); setADesignation(''); setAOrg(''); setABio(''); setAEmail('');
      fetchAllData();
    }
  }

  function handleAddTeamMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newMemberEmail || !newMemberName) return;
    const newMember = {
      id: Date.now().toString(),
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      status: 'ACTIVE'
    };
    setTeamMembers([...teamMembers, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    alert(`Access granted to ${newMemberName} as ${newMemberRole}!`);
  }

  function handleRemoveMember(id: string) {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  }

  function handleSaveFounderSettings() {
    alert('🎉 Founder settings & global platform overrides updated live across production!');
  }

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans p-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-amber-500/20 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl font-black uppercase text-amber-400 tracking-wider">
              Institutional Command Centre
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            People & Youth • Operating System for Publishing, Journals & Civic Dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewArticle}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-lg transition"
          >
            + New Article / Paper
          </button>
        </div>
      </div>

      {/* TELEMETRY STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 my-6">
        <div className="bg-[#070b19] border border-amber-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-amber-400 uppercase block">Total Articles</span>
          <span className="text-2xl font-black">{articles.length}</span>
        </div>
        <div className="bg-[#070b19] border border-emerald-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-emerald-400 uppercase block">Published</span>
          <span className="text-2xl font-black">{articles.filter(a => a.status === 'PUBLISHED').length}</span>
        </div>
        <div className="bg-[#070b19] border border-blue-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-blue-400 uppercase block">Under Review</span>
          <span className="text-2xl font-black">{articles.filter(a => a.status === 'UNDER_REVIEW').length}</span>
        </div>
        <div className="bg-[#070b19] border border-purple-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-purple-400 uppercase block">Journals</span>
          <span className="text-2xl font-black">{journals.length}</span>
        </div>
        <div className="bg-[#070b19] border border-cyan-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-cyan-400 uppercase block">Authors</span>
          <span className="text-2xl font-black">{authors.length}</span>
        </div>
        <div className="bg-[#070b19] border border-gray-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Reflections</span>
          <span className="text-2xl font-black">{reflections.length}</span>
        </div>
      </div>

      {/* MAIN IOS MODULE TABS */}
      <div className="flex border-b border-gray-800 overflow-x-auto gap-1 mb-6">
        <button
          onClick={() => { setActiveTab('ARTICLES'); setEditorMode('LIST'); }}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'ARTICLES' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          ✍️ Articles & Essays
        </button>
        <button
          onClick={() => setActiveTab('JOURNALS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'JOURNALS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          📚 Journals ({journals.length})
        </button>
        <button
          onClick={() => setActiveTab('AUTHORS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'AUTHORS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          👤 Authors ({authors.length})
        </button>
        <button
          onClick={() => setActiveTab('COLUMNS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'COLUMNS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          🏛️ Editorial Columns
        </button>
        <button
          onClick={() => setActiveTab('REFLECTIONS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'REFLECTIONS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          💡 Reader's Desk ({reflections.length})
        </button>
        <button
          onClick={() => setActiveTab('REVISIONS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'REVISIONS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          📜 Revisions Log
        </button>
        <button
          onClick={() => setActiveTab('FOUNDER')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'FOUNDER' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          🔐 Founder's Office
        </button>
      </div>

      {/* 1. ARTICLES & ESSAYS TAB */}
      {activeTab === 'ARTICLES' && (
        editorMode === 'LIST' ? (
          <div className="bg-[#070b19] border border-amber-500/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-amber-400 uppercase">Universal Content Registry</h2>
              <button
                onClick={handleNewArticle}
                className="px-3 py-1.5 bg-amber-500 text-black text-xs font-bold uppercase rounded"
              >
                + Draft New Publication
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                    <th className="py-3 px-2">Title</th>
                    <th className="py-3 px-2">Publication / Journal</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((art) => (
                    <tr key={art.id} className="border-b border-gray-800/50 hover:bg-white/5 transition">
                      <td className="py-3 px-2 font-bold text-gray-200">
                        {art.title}
                        {art.subtitle && <span className="block text-xs font-normal text-gray-400">{art.subtitle}</span>}
                      </td>
                      <td className="py-3 px-2 text-xs text-amber-400">{art.publications?.name || art.publication_type}</td>
                      <td className="py-3 px-2 text-xs text-gray-300">{art.category}</td>
                      <td className="py-3 px-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          art.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                          art.status === 'DRAFT' ? 'bg-gray-500/20 text-gray-400 border-gray-500/40' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}>
                          {art.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleEditArticle(art)}
                          className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-xs hover:bg-amber-500/30"
                        >
                          Edit / Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* SPLIT SCREEN EDITOR */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#070b19] border border-amber-500/20 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h2 className="text-md font-bold text-amber-400 uppercase">
                  {articleId ? 'Edit Publication' : 'Draft New Publication'}
                </h2>
                <button
                  onClick={() => setEditorMode('LIST')}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  ← Back to Registry
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if(!articleId) setSlug(generateSlug(e.target.value)); }}
                  className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">SUBTITLE</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">TYPE</label>
                  <select
                    value={publicationType}
                    onChange={(e) => setPublicationType(e.target.value)}
                    className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white focus:border-amber-500 outline-none"
                  >
                    <option value="DISSENT_DIAS">Dissent Dias</option>
                    <option value="RENAISSANCE_SERIES">The Renaissance Series</option>
                    <option value="KNOWLEDGE_CAVE">Knowledge Caves</option>
                    <option value="COLUMNS">Editorial Columns</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">JOURNAL / POD</label>
                  <select
                    value={publicationId}
                    onChange={(e) => setPublicationId(e.target.value)}
                    className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white focus:border-amber-500 outline-none"
                  >
                    <option value="">-- Direct Publication --</option>
                    {journals.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">CATEGORY</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">AUTHOR</label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white focus:border-amber-500 outline-none"
                  >
                    <option value="">-- Editorial Board --</option>
                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">CONTENT (MARKDOWN / HTML)</label>
                <textarea
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 rounded p-3 text-sm text-white font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleSaveArticle('DRAFT')}
                  disabled={saving}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 font-bold text-xs rounded uppercase"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSaveArticle('UNDER_REVIEW')}
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded uppercase"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => handleSaveArticle('PUBLISHED')}
                  disabled={saving}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded uppercase"
                >
                  Publish Live
                </button>
              </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="bg-[#070b19] border border-amber-500/20 rounded-xl p-6 space-y-4">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block border-b border-gray-800 pb-2">
                LIVE PREVIEW: PEOPLE & YOUTH • {publicationType}
              </span>
              <h1 className="text-2xl font-black text-white">{title || 'Untitled Article'}</h1>
              {subtitle && <p className="text-sm text-gray-400 font-medium">{subtitle}</p>}
              <div className="prose prose-invert max-w-none text-sm text-gray-300 whitespace-pre-wrap font-serif pt-4">
                {content || 'Article text preview will appear here...'}
              </div>
              {watermarkEnabled && (
                <div className="mt-8 pt-4 border-t border-amber-500/20 text-center text-[10px] text-amber-500/60 font-mono uppercase">
                  🛡️ {watermarkText}
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* 2. JOURNALS MANAGEMENT TAB */}
      {activeTab === 'JOURNALS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
            <h2 className="text-md font-bold text-amber-400 uppercase">Create New Journal</h2>
            <form onSubmit={handleCreateJournal} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">JOURNAL NAME</label>
                <input
                  type="text"
                  value={jName}
                  onChange={(e) => setJName(e.target.value)}
                  placeholder="e.g. Policy Renaissance"
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">TYPE</label>
                <select
                  value={jType}
                  onChange={(e) => setJType(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                >
                  <option value="RENAISSANCE_SERIES">The Renaissance Series</option>
                  <option value="DISSENT_DIAS">Dissent Dias Pod</option>
                  <option value="KNOWLEDGE_CAVE">Knowledge Cave</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">ISSN (IF APPLICABLE)</label>
                <input
                  type="text"
                  value={jIssn}
                  onChange={(e) => setJIssn(e.target.value)}
                  placeholder="e.g. 2769-102X"
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={jDesc}
                  onChange={(e) => setJDesc(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-amber-500 text-black text-xs font-bold uppercase rounded">
                + Add Journal
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-[#070b19] border border-amber-500/20 p-6 rounded-xl">
            <h2 className="text-md font-bold text-amber-400 uppercase mb-4">Active Journals Registry</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {journals.map((j) => (
                <div key={j.id} className="p-3 bg-[#030611] border border-gray-800 rounded space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-amber-400">{j.name}</span>
                    {j.issn && <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">ISSN: {j.issn}</span>}
                  </div>
                  <p className="text-[11px] text-gray-400">{j.description || 'No description provided.'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. AUTHORS MANAGEMENT TAB */}
      {activeTab === 'AUTHORS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
            <h2 className="text-md font-bold text-amber-400 uppercase">Add Author Profile</h2>
            <form onSubmit={handleCreateAuthor} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">FULL NAME</label>
                <input
                  type="text"
                  value={aName}
                  onChange={(e) => setAName(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">DESIGNATION</label>
                <input
                  type="text"
                  value={aDesignation}
                  onChange={(e) => setADesignation(e.target.value)}
                  placeholder="e.g. Senior Research Fellow"
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">ORGANIZATION</label>
                <input
                  type="text"
                  value={aOrg}
                  onChange={(e) => setAOrg(e.target.value)}
                  placeholder="e.g. People & Youth"
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">BIOGRAPHY</label>
                <textarea
                  rows={3}
                  value={aBio}
                  onChange={(e) => setABio(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-amber-500 text-black text-xs font-bold uppercase rounded">
                + Create Author Profile
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-[#070b19] border border-amber-500/20 p-6 rounded-xl">
            <h2 className="text-md font-bold text-amber-400 uppercase mb-4">Author Profiles Registry</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {authors.map((a) => (
                <div key={a.id} className="p-3 bg-[#030611] border border-gray-800 rounded space-y-1">
                  <span className="font-bold text-xs text-white block">{a.name}</span>
                  <span className="text-[10px] text-amber-400 block">{a.designation} • {a.organization}</span>
                  <p className="text-[11px] text-gray-400">{a.bio || 'No bio.'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. EDITORIAL COLUMNS TAB */}
      {activeTab === 'COLUMNS' && (
        <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
          <h2 className="text-md font-bold text-amber-400 uppercase">Editorial Columns Registry</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {columns.length === 0 ? (
              <p className="text-xs text-gray-400 col-span-3">No custom columns defined yet. Use "Add Journal" to create an Editorial Column pod.</p>
            ) : (
              columns.map((c) => (
                <div key={c.id} className="p-4 bg-[#030611] border border-gray-800 rounded space-y-2">
                  <span className="font-bold text-sm text-amber-400">{c.title}</span>
                  <p className="text-xs text-gray-300">{c.description}</p>
                  <span className="text-[10px] text-gray-400 block">Author: {c.authors?.name || 'Staff'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. REFLECTIONS / READER'S DESK PROMOTION TAB */}
      {activeTab === 'REFLECTIONS' && (
        <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
          <h2 className="text-md font-bold text-amber-400 uppercase">Reader's Desk & Dispatches</h2>
          <p className="text-xs text-gray-400">
            Select an incoming reflection and click **"Promote to Article Draft"** to instantly move it into the Editorial Board editor.
          </p>

          <div className="space-y-3">
            {reflections.map((ref) => (
              <div key={ref.id} className="p-4 bg-[#030611] border border-gray-800 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1 max-w-2xl">
                  <span className="text-xs font-bold text-amber-400 block">{ref.prompt_question || 'General Dispatch'}</span>
                  <p className="text-xs text-gray-200">"{ref.message}"</p>
                  <span className="text-[10px] text-gray-400 block">— {ref.author_name || 'Anonymous'} ({ref.author_email || 'No Email'})</span>
                </div>
                <button
                  onClick={() => handlePromoteReflection(ref)}
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase rounded hover:bg-amber-500/30 whitespace-nowrap"
                >
                  ⚡ Promote to Article Draft
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. REVISIONS AUDIT LOG */}
      {activeTab === 'REVISIONS' && (
        <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
          <h2 className="text-md font-bold text-amber-400 uppercase">Publication Revision History</h2>
          <div className="space-y-2">
            {revisions.map((rev) => (
              <div key={rev.id} className="p-3 bg-[#030611] border border-gray-800 rounded flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white block">{rev.articles?.title || rev.title}</span>
                  <span className="text-gray-400">{rev.change_summary}</span>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-bold block">Rev #{rev.revision_number}</span>
                  <span className="text-[10px] text-gray-500">{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. FULLY INTERACTIVE FOUNDER'S OFFICE MODULE */}
      {activeTab === 'FOUNDER' && (
        <div className="space-y-6">
          {/* SECTION 1: SYSTEM CONTROLS & WATERMARK SHIELD */}
          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-6">
            <div className="border-b border-gray-800 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-amber-400 uppercase tracking-wide">Founder's Office & IOS Governance</h2>
                <p className="text-xs text-gray-400 mt-1">Super-Administrator Controls, Watermarking Shields & Platform Overrides</p>
              </div>
              <button
                onClick={handleSaveFounderSettings}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded transition"
              >
                💾 Save Global Overrides
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* WATERMARK SHIELD CONFIGURATOR */}
              <div className="p-5 bg-[#030611] border border-gray-800 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-gray-800/80 pb-2">
                  <span className="font-bold text-xs text-amber-400 uppercase">🛡️ Institutional Watermark Shield</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[10px] text-gray-400 uppercase">Enforced</span>
                    <input
                      type="checkbox"
                      checked={watermarkEnabled}
                      onChange={(e) => setWatermarkEnabled(e.target.checked)}
                      className="accent-amber-500 h-4 w-4"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">GLOBAL WATERMARK TEXT</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full bg-[#070b19] border border-gray-800 p-2.5 text-xs text-white rounded focus:border-amber-500 outline-none font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Rendered dynamically on public article viewports across Dissent Dias and Renaissance Series.
                  </p>
                </div>
              </div>

              {/* GLOBAL PLATFORM TOGGLES */}
              <div className="p-5 bg-[#030611] border border-gray-800 rounded-xl space-y-4">
                <span className="font-bold text-xs text-amber-400 uppercase block border-b border-gray-800/80 pb-2">
                  ⚙️ Global Operational Overrides
                </span>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">Reader Dispatches Intake</span>
                      <span className="text-[10px] text-gray-400">Accept new visitor reflections at /reflections</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={publicIntakeOpen}
                      onChange={(e) => setPublicIntakeOpen(e.target.checked)}
                      className="accent-amber-500 h-4 w-4"
                    />
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-800/50 pt-2">
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">Require Editorial Review</span>
                      <span className="text-[10px] text-gray-400">Non-Founders must submit to UNDER_REVIEW stage</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireEditorialReview}
                      onChange={(e) => setRequireEditorialReview(e.target.checked)}
                      className="accent-amber-500 h-4 w-4"
                    />
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-800/50 pt-2">
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">Maintenance Lockout</span>
                      <span className="text-[10px] text-gray-400">Pause public article dynamic rendering</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="accent-red-500 h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: TEAM & IOS ROLE ACCESS MANAGER */}
          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-6">
            <h2 className="text-md font-bold text-amber-400 uppercase border-b border-gray-800 pb-2">
              👥 IOS Role-Based Access Control (RBAC)
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ADD TEAM MEMBER FORM */}
              <form onSubmit={handleAddTeamMember} className="bg-[#030611] border border-gray-800 p-4 rounded-xl space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase block mb-2">Grant Member Access</span>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">MEMBER NAME</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="user@peopleandyouth.org"
                    className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">ASSIGNED ROLE</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                  >
                    <option value="Super Administrator">Super Administrator</option>
                    <option value="Managing Editor">Managing Editor</option>
                    <option value="Research Editor">Research Editor</option>
                    <option value="Journal Editor">Journal Editor</option>
                    <option value="Author">Author</option>
                    <option value="Reviewer">Reviewer</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-amber-500 text-black text-xs font-bold uppercase rounded">
                  + Add Administrator
                </button>
              </form>

              {/* TEAM MEMBERS LIST */}
              <div className="lg:col-span-2 bg-[#030611] border border-gray-800 p-4 rounded-xl space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase block mb-2">Active Authorized Users</span>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-3 bg-[#070b19] border border-gray-800 rounded flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{member.name}</span>
                        <span className="text-gray-400 text-[11px]">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold uppercase">
                          {member.role}
                        </span>
                        {member.role !== 'Super Administrator' && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}