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

  // Author Form State
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [aName, setAName] = useState('');
  const [aDesignation, setADesignation] = useState('');
  const [aOrg, setAOrg] = useState('');
  const [aBio, setABio] = useState('');
  const [aEmail, setAEmail] = useState('');
  const [aDept, setADept] = useState('Executive Board');
  const [aCredentials, setACredentials] = useState('');
  const [aAffiliation, setAAffiliation] = useState('');
  const [aPhoto, setAPhoto] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setLoading(true);
    const [artRes, jourRes, authRes, colRes, refRes, revRes] = await Promise.all([
      supabase.from('articles').select('*, authors(name), publications(name)').order('updated_at', { ascending: false }),
      supabase.from('publications').select('*').order('name', { ascending: true }),
      supabase.from('authors').select('*').order('created_at', { ascending: false }),
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

  // SAVE OR UPDATE AUTHOR
  async function handleSaveAuthor(e: React.FormEvent) {
    e.preventDefault();
    if (!aName) return;

    const payload = {
      name: aName,
      slug: generateSlug(aName),
      email: aEmail || null,
      designation: aDesignation,
      organization: aOrg || 'People & Youth',
      department: aDept,
      bio: aBio || null,
      academic_credentials: aCredentials || null,
      institutional_affiliation: aAffiliation || null,
      photo_url: aPhoto || null,
      is_leadership: true
    };

    let error;
    if (editingAuthorId) {
      const res = await supabase.from('authors').update(payload).eq('id', editingAuthorId);
      error = res.error;
    } else {
      const res = await supabase.from('authors').insert(payload);
      error = res.error;
    }

    if (error) {
      alert('Failed to save profile: ' + error.message);
    } else {
      alert(`Profile for "${aName}" saved successfully!`);
      resetAuthorForm();
      fetchAllData();
    }
  }

  // EDIT AUTHOR PREFILL
  function handleEditAuthor(author: any) {
    setEditingAuthorId(author.id);
    setAName(author.name || '');
    setADesignation(author.designation || '');
    setAOrg(author.organization || '');
    setABio(author.bio || '');
    setAEmail(author.email || '');
    setADept(author.department || 'Executive Board');
    setACredentials(author.academic_credentials || '');
    setAAffiliation(author.institutional_affiliation || '');
    setAPhoto(author.photo_url || '');
  }

  // DELETE AUTHOR
  async function handleDeleteAuthor(id: string, name: string) {
    if (!confirm(`Are you sure you want to permanently delete the profile for "${name}"?`)) return;

    const { error } = await supabase.from('authors').delete().eq('id', id);
    if (error) {
      alert('Failed to delete author: ' + error.message);
    } else {
      alert(`Profile for "${name}" removed from database and public website.`);
      fetchAllData();
    }
  }

  function resetAuthorForm() {
    setEditingAuthorId(null);
    setAName('');
    setADesignation('');
    setAOrg('');
    setABio('');
    setAEmail('');
    setADept('Executive Board');
    setACredentials('');
    setAAffiliation('');
    setAPhoto('');
  }

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center pb-6 border-b border-amber-500/20">
        <div>
          <h1 className="text-2xl font-black uppercase text-amber-400 tracking-wider">
            Institutional Command Centre
          </h1>
          <p className="text-xs text-gray-400">People & Youth • Author & Leadership Management System</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-800 my-6">
        <button
          onClick={() => setActiveTab('AUTHORS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'AUTHORS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400'
          }`}
        >
          👤 Authors & Consultants ({authors.length})
        </button>
      </div>

      {/* AUTHORS & CONSULTANTS TAB */}
      {activeTab === 'AUTHORS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FORM */}
          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h2 className="text-md font-bold text-amber-400 uppercase">
                {editingAuthorId ? 'Edit Profile' : 'Add Profile'}
              </h2>
              {editingAuthorId && (
                <button onClick={resetAuthorForm} className="text-xs text-gray-400 hover:text-white">
                  + Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveAuthor} className="space-y-3">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">FULL NAME *</label>
                <input
                  type="text"
                  value={aName}
                  onChange={(e) => setAName(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">DEPARTMENT / SECTION</label>
                <select
                  value={aDept}
                  onChange={(e) => setADept(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                >
                  <option value="Executive Board">Executive Board</option>
                  <option value="Guest Consultants">Guest Consultants</option>
                  <option value="Research Fellows">Research Fellows</option>
                  <option value="Editorial Board">Editorial Board</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">DESIGNATION</label>
                <input
                  type="text"
                  value={aDesignation}
                  onChange={(e) => setADesignation(e.target.value)}
                  placeholder="e.g. Guest Consultant — Public Health"
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">ACADEMIC CREDENTIALS</label>
                <input
                  type="text"
                  value={aCredentials}
                  onChange={(e) => setACredentials(e.target.value)}
                  placeholder="e.g. Ph.D., M.D., LL.M."
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">INSTITUTIONAL AFFILIATION</label>
                <input
                  type="text"
                  value={aAffiliation}
                  onChange={(e) => setAAffiliation(e.target.value)}
                  placeholder="e.g. Johns Hopkins / IIT Delhi"
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">BIOGRAPHY</label>
                <textarea
                  rows={3}
                  value={aBio}
                  onChange={(e) => setABio(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-amber-500 text-black text-xs font-bold uppercase rounded hover:bg-amber-400">
                {editingAuthorId ? '💾 Save Changes' : '+ Create Profile'}
              </button>
            </form>
          </div>

          {/* REGISTRY LIST */}
          <div className="md:col-span-2 bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
            <h2 className="text-md font-bold text-amber-400 uppercase">Author & Leadership Profiles Registry</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {authors.map((a) => (
                <div key={a.id} className="p-4 bg-[#030611] border border-gray-800 rounded-lg flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-white">{a.name}</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono uppercase">
                        {a.department || 'Executive'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 block">{a.designation}</span>
                    {a.academic_credentials && (
                      <span className="text-[10px] text-purple-300 block font-mono">🎓 {a.academic_credentials}</span>
                    )}
                    <p className="text-[11px] text-gray-400 line-clamp-2 pt-1">{a.bio || 'No biography.'}</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-800/80">
                    <button
                      onClick={() => handleEditAuthor(a)}
                      className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold uppercase hover:bg-amber-500/30"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAuthor(a.id, a.name)}
                      className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[10px] font-bold uppercase hover:bg-red-500/30"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}