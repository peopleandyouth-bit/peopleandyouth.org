'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calculateReadingTime } from '@/lib/cms';

// 147 GLOBAL CAREER ROLES
const GLOBAL_CAREER_ROLES = [
  "Founder & Chair", "Chief Executive Officer", "Chief Operating Officer", "Chief Technology Officer", "Chief Editor",
  "General Counsel", "Chief Policy Officer", "Director of Research", "Director of Communications", "Director of Operations",
  "Director of Fellowships", "Director of Strategic Partnerships", "Director of Finance", "Director of Regional Development", "Managing Trustee",
  "Managing Editor", "Senior Editor", "Associate Editor", "Copy Editor", "Journal Editor - Education Renaissance",
  "Journal Editor - Trade Renaissance", "Journal Editor - Policy Renaissance", "Journal Editor - Technology Renaissance",
  "Journal Editor - Economic Renaissance", "Journal Editor - Governance Renaissance", "Journal Editor - Rural Renaissance",
  "Journal Editor - Social Renaissance", "Journal Editor - Environmental Renaissance", "Journal Editor - Health Renaissance",
  "Journal Editor - Agriculture Renaissance", "Journal Editor - Entrepreneurship Renaissance", "Dissent Dias Curator",
  "Opinion Editor", "Columnist", "Lead Fact Checker", "Translation Lead", "Peer Reviewer", "Acquisitions Editor", "Archival Historian", "Editorial Assistant",
  "Senior Policy Fellow", "Research Fellow", "Public Policy Analyst", "Legal Research Scholar", "Governance Analyst",
  "Climate & Environmental Fellow", "Macroeconomic Researcher", "Agrarian Policy Analyst", "Digital Infrastructure Fellow",
  "Legislative Drafter", "Constitutional Law Scholar", "Urban Planning Fellow", "Healthcare Systems Analyst", "Educational Reform Lead",
  "Defense & Foreign Policy Fellow", "Judicial Reform Analyst", "Human Rights Advocate", "Empirical Data Analyst", "Quantitative Policy Researcher",
  "Qualitative Field Analyst", "Gender Policy Fellow", "Labor & Economics Scholar", "Trade Strategy Analyst", "Energy Transition Fellow", "Policy Communications Lead",
  "State Coordinator - Bihar", "Zonal Operations Lead", "District Lead - Patna", "District Lead - Saharsa", "District Lead - Darbhanga",
  "District Lead - Muzaffarpur", "District Lead - Gaya", "District Lead - Bhagalpur", "District Lead - Purnea", "District Lead - Madhubani",
  "District Lead - Begusarai", "District Lead - Nalanda", "District Lead - Munger", "District Lead - Rohtas", "District Lead - Vaishali",
  "District Lead - Samastipur", "District Lead - Sitamarhi", "District Lead - Siwan", "District Lead - West Champaran", "District Lead - East Champaran",
  "District Lead - Katihar", "District Lead - Araria", "District Lead - Kishanganj", "District Lead - Gopalganj", "District Lead - Buxar",
  "District Lead - Bhojpur", "District Lead - Kaimur", "District Lead - Jamui", "District Lead - Khagaria", "District Lead - Lakhisarai",
  "Chief Campus Ambassador", "Campus Lead - Patna University", "Campus Lead - Jawaharlal Nehru University (JNU)",
  "Campus Lead - University of Delhi (DU)", "Campus Lead - Banaras Hindu University (BHU)", "Campus Lead - Aligarh Muslim University (AMU)",
  "Campus Lead - NLSIU Bengaluru", "Campus Lead - NALSAR Hyderabad", "Campus Lead - IIT Delhi", "Campus Lead - IIT Patna",
  "Campus Lead - IIM Ahmedabad", "Campus Lead - IIM Bodh Gaya", "Campus Lead - Chanakya National Law University",
  "Campus Lead - Tata Institute of Social Sciences (TISS)", "Campus Lead - Ashoka University", "Campus Lead - Jamia Millia Islamia",
  "Campus Lead - Hyderabad Central University", "Campus Lead - Panjab University", "Campus Lead - Jadavpur University",
  "Campus Lead - St. Xavier's College", "Campus Coordinator", "Youth Organizer", "Student Representative", "Student Editor", "Campus Outreach Officer",
  "Lead Systems Architect", "Full Stack Engineer", "AI & Data Infrastructure Lead", "UI/UX Designer", "Frontend Engineer",
  "Backend Systems Developer", "Database Administrator", "Cybersecurity Officer", "Media Production Lead", "Video Journalist",
  "Audio/Podcast Producer", "Visual Designer", "Brand Strategist", "SEO & Analytics Lead", "Social Media Director",
  "Executive Secretary", "Administrative Officer", "Legal Advisor", "RTI & Compliance Officer", "Human Resources Lead",
  "Finance & Audit Manager", "Grant Writer", "Event Coordinator", "Field Logistics Lead", "Volunteer Coordinator",
  "Institutional Relations Officer", "Records & Protocol Officer"
];

export default function CommandCentreDashboard() {
  const [activeTab, setActiveTab] = useState<
    'ARTICLES' | 'JOURNALS' | 'AUTHORS' | 'COLUMNS' | 'REFLECTIONS' | 'REVISIONS' | 'FOUNDER'
  >('ARTICLES');

  // Database State
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

  // Journal State
  const [jName, setJName] = useState('');
  const [jType, setJType] = useState('RENAISSANCE_SERIES');
  const [jDesc, setJDesc] = useState('');
  const [jIssn, setJIssn] = useState('');
  const [jEditor, setJEditor] = useState('');

  // Author / Consultant Form State
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
  const [aExpertise, setAExpertise] = useState('');
  const [aLinkedin, setALinkedin] = useState('');
  const [aWebsite, setAWebsite] = useState('');

  // Founder's Office Controls
  const [watermarkText, setWatermarkText] = useState('OFFICIAL RECORD | PEOPLE & YOUTH | DO NOT DUPLICATE');
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [publicIntakeOpen, setPublicIntakeOpen] = useState(true);
  const [requireEditorialReview, setRequireEditorialReview] = useState(true);

  // Founder Administrator Registration Form (Full 10 Fields)
  const [admName, setAdmName] = useState('');
  const [admEmail, setAdmEmail] = useState('');
  const [admPhoto, setAdmPhoto] = useState('');
  const [admRole, setAdmRole] = useState(GLOBAL_CAREER_ROLES[0]);
  const [admDesignation, setAdmDesignation] = useState('');
  const [admOrg, setAdmOrg] = useState('People & Youth');
  const [admBio, setAdmBio] = useState('');
  const [admExpertise, setAdmExpertise] = useState('Public Policy, Governance');
  const [admLinkedin, setAdmLinkedin] = useState('');
  const [admWebsite, setAdmWebsite] = useState('');

  const [perms, setPerms] = useState({
    view: true, create: true, edit: true, review: true,
    approve: false, publish: false, archive: false, delete: false, admin: false
  });

  const [teamMembers, setTeamMembers] = useState<any[]>([
    {
      id: '1',
      name: 'Founder & Chair',
      email: 'contact@peopleandyouth.org',
      role: 'Founder & Chair',
      organization: 'People & Youth',
      permissions: ['VIEW', 'CREATE', 'EDIT', 'REVIEW', 'APPROVE', 'PUBLISH', 'ARCHIVE', 'DELETE', 'ADMIN']
    }
  ]);

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

  async function triggerOnboardingEmail(name: string, email: string, designation: string, department?: string) {
    if (!email) return;
    try {
      await fetch('/api/onboard-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, designation, department })
      });
    } catch (err) {
      console.error('Email trigger error:', err);
    }
  }

  function handleNewArticle() {
    setArticleId(null);
    setTitle(''); setSubtitle(''); setSlug(''); setExcerpt(''); setContent('');
    setPublicationType('DISSENT_DIAS'); setCategory('Public Policy');
    setAuthorId(''); setPublicationId(''); setStatus('DRAFT'); setFeatured(false);
    setEditorMode('EDIT');
  }

  function handleEditArticle(art: any) {
    setArticleId(art.id);
    setTitle(art.title); setSubtitle(art.subtitle || ''); setSlug(art.slug);
    setExcerpt(art.excerpt || ''); setContent(art.content || '');
    setPublicationType(art.publication_type); setCategory(art.category);
    setAuthorId(art.author_id || ''); setPublicationId(art.publication_id || '');
    setStatus(art.status); setFeatured(art.featured || false);
    setEditorMode('EDIT');
  }

  function handlePromoteReflection(ref: any) {
    setArticleId(null);
    setTitle(`Dispatch: ${ref.prompt_question || 'Public Reflection'}`);
    setSubtitle(`Submitted by ${ref.author_name || 'Anonymous Reader'} (${ref.organization || 'Civic Participant'})`);
    setSlug(generateSlug(`dispatch-${ref.prompt_question || 'reflection'}-${Date.now().toString().slice(-4)}`));
    setExcerpt(ref.message ? ref.message.slice(0, 150) + '...' : '');
    setContent(`> **Original Dispatch:**\n> "${ref.message}"\n\n# Institutional Review & Commentary\n\nAdd your analytical essay or editorial perspective here...`);
    setPublicationType('DISSENT_DIAS'); setCategory(ref.category || 'Civic Reflections');
    setStatus('DRAFT'); setActiveTab('ARTICLES'); setEditorMode('EDIT');
  }

  async function handleSaveArticle(targetStatus?: typeof status) {
    setSaving(true);
    const finalStatus = targetStatus || status;
    const computedSlug = slug || generateSlug(title);
    const readingTime = calculateReadingTime(content);

    const payload = {
      title, subtitle, slug: computedSlug, excerpt, content,
      publication_type: publicationType, category,
      author_id: authorId || null, publication_id: publicationId || null,
      status: finalStatus, featured, reading_time: readingTime,
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
      name: jName, slug: computedSlug, publication_type: jType,
      description: jDesc, issn: jIssn || null, editor_in_chief: jEditor || 'Founder'
    });
    if (error) {
      alert('Failed to create journal: ' + error.message);
    } else {
      alert(`Journal "${jName}" created successfully!`);
      setJName(''); setJDesc(''); setJIssn(''); setJEditor('');
      fetchAllData();
    }
  }

  // SAVE OR UPDATE AUTHOR PROFILE
  async function handleSaveAuthor(e: React.FormEvent) {
    e.preventDefault();
    if (!aName) return;

    const payload = {
      name: aName,
      slug: generateSlug(aName),
      email: aEmail || null,
      designation: aDesignation || 'Team Member',
      organization: aOrg || 'People & Youth',
      department: aDept,
      bio: aBio || null,
      academic_credentials: aCredentials || null,
      institutional_affiliation: aAffiliation || null,
      photo_url: aPhoto || null,
      is_leadership: true,
      display_order: 10,
      expertise: aExpertise ? aExpertise.split(',').map(s => s.trim()) : [],
      linkedin_url: aLinkedin || null,
      website_url: aWebsite || null
    };

    let error;
    if (editingAuthorId) {
      const res = await supabase.from('authors').update(payload).eq('id', editingAuthorId);
      error = res.error;
    } else {
      const res = await supabase.from('authors').insert(payload);
      error = res.error;
      if (!error && aEmail) {
        await triggerOnboardingEmail(aName, aEmail, aDesignation, aDept);
      }
    }

    if (error) {
      alert('Failed to save profile: ' + error.message);
    } else {
      alert(`Profile for "${aName}" saved live! Welcome email dispatched.`);
      resetAuthorForm();
      fetchAllData();
    }
  }

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
    setAExpertise(author.expertise ? author.expertise.join(', ') : '');
    setALinkedin(author.linkedin_url || '');
    setAWebsite(author.website_url || '');
  }

  async function handleDeleteAuthor(id: string, name: string) {
    if (!confirm(`Are you sure you want to permanently delete the profile for "${name}"?`)) return;

    const { error } = await supabase.from('authors').delete().eq('id', id);
    if (error) {
      alert('Failed to delete author: ' + error.message);
    } else {
      alert(`Profile for "${name}" removed permanently.`);
      fetchAllData();
    }
  }

  function resetAuthorForm() {
    setEditingAuthorId(null);
    setAName(''); setADesignation(''); setAOrg(''); setABio('');
    setAEmail(''); setADept('Executive Board'); setACredentials('');
    setAAffiliation(''); setAPhoto(''); setAExpertise('');
    setALinkedin(''); setAWebsite('');
  }

  // FOUNDER'S OFFICE - REGISTER ADMINISTRATOR WITH FULL 10 METADATA FIELDS
  async function handleAddAdministrator(e: React.FormEvent) {
    e.preventDefault();
    if (!admName || !admEmail) return;

    const activePerms = Object.keys(perms).filter(k => (perms as any)[k]).map(k => k.toUpperCase());
    const newAdmin = {
      id: Date.now().toString(),
      name: admName,
      email: admEmail,
      photo_url: admPhoto,
      role: admRole,
      designation: admDesignation || admRole,
      organization: admOrg,
      bio: admBio,
      expertise: admExpertise ? admExpertise.split(',').map(s => s.trim()) : [],
      linkedin_url: admLinkedin,
      website_url: admWebsite,
      permissions: activePerms,
      status: 'ACTIVE'
    };

    // Synchronize to Supabase Authors table with is_leadership = true
    const { error } = await supabase.from('authors').insert({
      name: admName,
      slug: generateSlug(admName),
      email: admEmail,
      photo_url: admPhoto || null,
      designation: admDesignation || admRole,
      organization: admOrg,
      bio: admBio || null,
      department: 'Executive Board',
      is_leadership: true,
      display_order: 10,
      expertise: admExpertise ? admExpertise.split(',').map(s => s.trim()) : [],
      linkedin_url: admLinkedin || null,
      website_url: admWebsite || null
    });

    if (error) {
      console.warn('Author sync warning:', error.message);
    }

    // Trigger Welcome Email
    await triggerOnboardingEmail(admName, admEmail, admDesignation || admRole, 'Executive Board');

    setTeamMembers([...teamMembers, newAdmin]);
    alert(`Administrator "${admName}" registered as ${admRole}! Welcome email dispatched.`);

    // Reset Form
    setAdmName(''); setAdmEmail(''); setAdmPhoto(''); setAdmDesignation('');
    setAdmBio(''); setAdmLinkedin(''); setAdmWebsite('');
    fetchAllData();
  }

  function handleRemoveMember(id: string) {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
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
            People & Youth • Operating System for Publishing, Leadership & Civic Dispatches
          </p>
        </div>

        <button
          onClick={handleNewArticle}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-lg transition"
        >
          + New Article / Paper
        </button>
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

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-800 overflow-x-auto gap-1 mb-6">
        <button
          onClick={() => { setActiveTab('ARTICLES'); setEditorMode('LIST'); }}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === 'ARTICLES' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          ✍️ Articles & Essays
        </button>
        <button
          onClick={() => setActiveTab('JOURNALS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === 'JOURNALS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          📚 Journals ({journals.length})
        </button>
        <button
          onClick={() => setActiveTab('AUTHORS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === 'AUTHORS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          👤 Authors & Consultants ({authors.length})
        </button>
        <button
          onClick={() => setActiveTab('COLUMNS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === 'COLUMNS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          🏛️ Editorial Columns
        </button>
        <button
          onClick={() => setActiveTab('REFLECTIONS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === 'REFLECTIONS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          💡 Reader's Desk ({reflections.length})
        </button>
        <button
          onClick={() => setActiveTab('REVISIONS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === 'REVISIONS' ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          📜 Revisions Log
        </button>
        <button
          onClick={() => setActiveTab('FOUNDER')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
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
              <button onClick={handleNewArticle} className="px-3 py-1.5 bg-amber-500 text-black text-xs font-bold uppercase rounded">
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
                <h2 className="text-md font-bold text-amber-400 uppercase">{articleId ? 'Edit Publication' : 'Draft New Publication'}</h2>
                <button onClick={() => setEditorMode('LIST')} className="text-xs text-gray-400 hover:text-white">← Back to Registry</button>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">TITLE</label>
                <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if(!articleId) setSlug(generateSlug(e.target.value)); }} className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">SUBTITLE</label>
                <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white outline-none focus:border-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">TYPE</label>
                  <select value={publicationType} onChange={(e) => setPublicationType(e.target.value)} className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white outline-none">
                    <option value="DISSENT_DIAS">Dissent Dias</option>
                    <option value="RENAISSANCE_SERIES">The Renaissance Series</option>
                    <option value="KNOWLEDGE_CAVE">Knowledge Caves</option>
                    <option value="COLUMNS">Editorial Columns</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">JOURNAL / POD</label>
                  <select value={publicationId} onChange={(e) => setPublicationId(e.target.value)} className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white outline-none">
                    <option value="">-- Direct Publication --</option>
                    {journals.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">CONTENT (MARKDOWN / HTML)</label>
                <textarea rows={12} value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-[#030611] border border-gray-800 rounded p-3 text-sm text-white font-mono outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => handleSaveArticle('DRAFT')} disabled={saving} className="flex-1 py-2 bg-gray-800 font-bold text-xs rounded uppercase">Save Draft</button>
                <button onClick={() => handleSaveArticle('UNDER_REVIEW')} disabled={saving} className="flex-1 py-2 bg-blue-600 font-bold text-xs rounded uppercase">Submit Review</button>
                <button onClick={() => handleSaveArticle('PUBLISHED')} disabled={saving} className="flex-1 py-2 bg-emerald-600 font-bold text-xs rounded uppercase">Publish Live</button>
              </div>
            </div>
            <div className="bg-[#070b19] border border-amber-500/20 rounded-xl p-6 space-y-4">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block border-b border-gray-800 pb-2">LIVE PREVIEW</span>
              <h1 className="text-2xl font-black text-white">{title || 'Untitled Article'}</h1>
              {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
              <div className="prose prose-invert max-w-none text-sm text-gray-300 whitespace-pre-wrap font-serif pt-4">{content}</div>
            </div>
          </div>
        )
      )}

      {/* 2. JOURNALS TAB */}
      {activeTab === 'JOURNALS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
            <h2 className="text-md font-bold text-amber-400 uppercase">Create New Journal</h2>
            <form onSubmit={handleCreateJournal} className="space-y-3">
              <input type="text" value={jName} onChange={(e) => setJName(e.target.value)} placeholder="Journal Name" className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded" required />
              <textarea rows={3} value={jDesc} onChange={(e) => setJDesc(e.target.value)} placeholder="Description" className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded" />
              <button type="submit" className="w-full py-2 bg-amber-500 text-black text-xs font-bold uppercase rounded">+ Add Journal</button>
            </form>
          </div>
          <div className="md:col-span-2 bg-[#070b19] border border-amber-500/20 p-6 rounded-xl">
            <h2 className="text-md font-bold text-amber-400 uppercase mb-4">Active Journals ({journals.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {journals.map((j) => (
                <div key={j.id} className="p-3 bg-[#030611] border border-gray-800 rounded">
                  <span className="font-bold text-xs text-amber-400 block">{j.name}</span>
                  <p className="text-[11px] text-gray-400 mt-1">{j.description || 'No description.'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. AUTHORS & CONSULTANTS TAB */}
      {activeTab === 'AUTHORS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h2 className="text-md font-bold text-amber-400 uppercase">{editingAuthorId ? 'Edit Profile' : 'Add Profile'}</h2>
              {editingAuthorId && <button onClick={resetAuthorForm} className="text-xs text-gray-400 hover:text-white">+ Cancel Edit</button>}
            </div>

            <form onSubmit={handleSaveAuthor} className="space-y-3">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">FULL NAME *</label>
                <input type="text" value={aName} onChange={(e) => setAName(e.target.value)} className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded" required />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">EMAIL ADDRESS</label>
                <input type="email" value={aEmail} onChange={(e) => setAEmail(e.target.value)} placeholder="user@peopleandyouth.org" className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">DEPARTMENT / SECTION</label>
                <select value={aDept} onChange={(e) => setADept(e.target.value)} className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded">
                  <option value="Executive Board">Executive Board</option>
                  <option value="Guest Consultants">Guest Consultants</option>
                  <option value="Research Fellows">Research Fellows</option>
                  <option value="Editorial Board">Editorial Board</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">DESIGNATION</label>
                <input type="text" value={aDesignation} onChange={(e) => setADesignation(e.target.value)} placeholder="e.g. Guest Consultant — Public Health" className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">ACADEMIC CREDENTIALS</label>
                <input type="text" value={aCredentials} onChange={(e) => setACredentials(e.target.value)} placeholder="e.g. Ph.D., M.D." className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">INSTITUTIONAL AFFILIATION</label>
                <input type="text" value={aAffiliation} onChange={(e) => setAAffiliation(e.target.value)} placeholder="e.g. Johns Hopkins / IIT Delhi" className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">BIOGRAPHY</label>
                <textarea rows={3} value={aBio} onChange={(e) => setABio(e.target.value)} className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-500 text-black text-xs font-bold uppercase rounded">
                {editingAuthorId ? '💾 Save Changes' : '+ Create Profile & Send Welcome Email'}
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
            <h2 className="text-md font-bold text-amber-400 uppercase">Profiles Registry ({authors.length})</h2>

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

      {/* 4. EDITORIAL COLUMNS TAB */}
      {activeTab === 'COLUMNS' && (
        <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
          <h2 className="text-md font-bold text-amber-400 uppercase">Editorial Columns Registry</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {columns.length === 0 ? (
              <p className="text-xs text-gray-400 col-span-3">No custom columns defined yet.</p>
            ) : (
              columns.map((c) => (
                <div key={c.id} className="p-4 bg-[#030611] border border-gray-800 rounded">
                  <span className="font-bold text-sm text-amber-400">{c.title}</span>
                  <p className="text-xs text-gray-300 mt-1">{c.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. READER'S DESK / REFLECTIONS TAB */}
      {activeTab === 'REFLECTIONS' && (
        <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">
          <h2 className="text-md font-bold text-amber-400 uppercase">Reader's Desk & Dispatches</h2>
          <div className="space-y-3">
            {reflections.map((ref) => (
              <div key={ref.id} className="p-4 bg-[#030611] border border-gray-800 rounded flex justify-between items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 block">{ref.prompt_question || 'General Dispatch'}</span>
                  <p className="text-xs text-gray-200">"{ref.message}"</p>
                  <span className="text-[10px] text-gray-400">— {ref.author_name || 'Anonymous'}</span>
                </div>
                <button onClick={() => handlePromoteReflection(ref)} className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase rounded whitespace-nowrap">
                  ⚡ Promote to Draft
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. REVISIONS LOG TAB */}
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
                <span className="text-amber-400 font-bold">Rev #{rev.revision_number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. FULLY ELABORATIVE FOUNDER'S OFFICE TAB */}
      {activeTab === 'FOUNDER' && (
        <div className="space-y-6">
          {/* WATERMARK SHIELD & GLOBAL TOGGLES */}
          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-6">
            <div className="border-b border-gray-800 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-amber-400 uppercase tracking-wide">Founder's Office & IOS Governance</h2>
                <p className="text-xs text-gray-400 mt-1">Super-Administrator Controls, Watermarking Shields & Platform Overrides</p>
              </div>
              <button onClick={() => alert('Global overrides saved live!')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded transition">
                💾 Save Global Overrides
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 bg-[#030611] border border-gray-800 rounded-xl space-y-4">
                <span className="font-bold text-xs text-amber-400 uppercase block border-b border-gray-800/80 pb-2">🛡️ Institutional Watermark Shield</span>
                <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full bg-[#070b19] border border-gray-800 p-2.5 text-xs text-white rounded font-mono outline-none" />
              </div>

              <div className="p-5 bg-[#030611] border border-gray-800 rounded-xl space-y-4">
                <span className="font-bold text-xs text-amber-400 uppercase block border-b border-gray-800/80 pb-2">⚙️ Global Operational Overrides</span>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span>Reader Dispatches Intake (/reflections)</span>
                    <input type="checkbox" checked={publicIntakeOpen} onChange={(e) => setPublicIntakeOpen(e.target.checked)} className="accent-amber-500 h-4 w-4" />
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-800/50 pt-2">
                    <span>Require Editorial Review</span>
                    <input type="checkbox" checked={requireEditorialReview} onChange={(e) => setRequireEditorialReview(e.target.checked)} className="accent-amber-500 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RICH ADMINISTRATOR REGISTRATION FORM (FULL 10 METADATA FIELDS) */}
          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-6">
            <h2 className="text-md font-bold text-amber-400 uppercase border-b border-gray-800 pb-2">
              👥 Grant Member Access & Configure Administrator Profiles (147 Global Roles)
            </h2>

            <form onSubmit={handleAddAdministrator} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#030611] p-4 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">NAME *</label>
                  <input type="text" value={admName} onChange={(e) => setAdmName(e.target.value)} placeholder="Full Official Name" className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">EMAIL *</label>
                  <input type="email" value={admEmail} onChange={(e) => setAdmEmail(e.target.value)} placeholder="email@peopleandyouth.org" className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">CAREER ROLE (147 AVAILABLE) *</label>
                  <select value={admRole} onChange={(e) => { setAdmRole(e.target.value); if(!admDesignation) setAdmDesignation(e.target.value); }} className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white outline-none">
                    {GLOBAL_CAREER_ROLES.map((r, idx) => <option key={idx} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">PHOTOGRAPH URL</label>
                  <input type="text" value={admPhoto} onChange={(e) => setAdmPhoto(e.target.value)} placeholder="https://peopleandyouth.org/team/photo.jpg" className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">DESIGNATION</label>
                  <input type="text" value={admDesignation} onChange={(e) => setAdmDesignation(e.target.value)} placeholder="e.g. Senior Research Fellow" className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">ORGANIZATION</label>
                  <input type="text" value={admOrg} onChange={(e) => setAdmOrg(e.target.value)} placeholder="e.g. People & Youth" className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white" />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">EXPERTISE (TAGS)</label>
                  <input type="text" value={admExpertise} onChange={(e) => setAdmExpertise(e.target.value)} placeholder="Public Policy, AI, Governance" className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">LINKEDIN URL</label>
                  <input type="text" value={admLinkedin} onChange={(e) => setAdmLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">WEBSITE URL</label>
                  <input type="text" value={admWebsite} onChange={(e) => setAdmWebsite(e.target.value)} placeholder="https://domain.com" className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white" />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">BIOGRAPHY</label>
                  <textarea rows={2} value={admBio} onChange={(e) => setAdmBio(e.target.value)} placeholder="Full academic or professional biography..." className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white" />
                </div>
              </div>

              {/* GRANULAR PERMISSIONS MATRIX */}
              <div className="bg-[#030611] p-4 rounded-xl border border-gray-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase block">
                  🔒 Granular Administrator Permissions Matrix
                </span>

                <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-xs">
                  {Object.keys(perms).map((key) => (
                    <label key={key} className="flex items-center gap-1.5 p-2 bg-[#070b19] border border-gray-800 rounded cursor-pointer hover:border-amber-500/50">
                      <input
                        type="checkbox"
                        checked={(perms as any)[key]}
                        onChange={(e) => setPerms({ ...perms, [key]: e.target.checked })}
                        className="accent-amber-500"
                      />
                      <span className="uppercase text-[10px] font-bold text-gray-200">{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded transition"
              >
                + Register Administrator & Send Welcome Email
              </button>
            </form>

            {/* ACTIVE PERSONNEL REGISTRY TABLE */}
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <span className="text-xs font-bold text-amber-400 uppercase block">Active Personnel & Permissions Registry</span>
              <div className="space-y-2">
                {teamMembers.map((m) => (
                  <div key={m.id} className="p-3 bg-[#030611] border border-gray-800 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div>
                      <span className="font-bold text-white">{m.name}</span>
                      <span className="text-amber-400 text-[11px] block">{m.role} ({m.organization})</span>
                      <span className="text-gray-400 text-[10px] block">{m.email}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {m.permissions?.map((p: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 bg-gray-800 text-gray-300 text-[9px] font-mono rounded">
                          {p}
                        </span>
                      ))}
                      {m.role !== 'Founder & Chair' && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="ml-2 text-red-400 hover:text-red-300 text-[10px] uppercase font-bold"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}