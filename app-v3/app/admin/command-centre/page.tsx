'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calculateReadingTime } from '@/lib/cms';
import AdminPageGuard from '@/components/AdminPageGuard';

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

// ---------------------------------------------------------------------------
// ADMIN LAUNCHER — cross-page directory of every admin surface.
// Collapsed by default; expands on click.
// ---------------------------------------------------------------------------
const ADMIN_LAUNCHER: Array<{
  section: string;
  accent: string;
  items: Array<{ label: string; href: string }>;
}> = [
  {
    section: 'People & Talent',
    accent: 'amber',
    items: [
      { label: 'Applications Board', href: '/admin/candidate-applications' },
      { label: 'Careers', href: '/admin/careers' },
      { label: 'Candidate Information (CIMS)', href: '/admin/cims' },
    ],
  },
  {
    section: 'Investor Relations',
    accent: 'cyan',
    items: [
      { label: 'Investor CRM', href: '/admin/investor-crm' },
      { label: 'Intelligence', href: '/admin/investor-intelligence' },
      { label: 'Operations', href: '/admin/investor-operations' },
      { label: 'Relations', href: '/admin/investor-relations' },
      { label: 'Relationship', href: '/admin/investor-relationship' },
      { label: 'Communications', href: '/admin/investor-communications' },
      { label: 'Communications Actions', href: '/admin/investor-communications/actions' },
      { label: 'Pipeline', href: '/admin/investor-pipeline' },
      { label: 'Access Control', href: '/admin/investor-access' },
      { label: 'Documents', href: '/admin/investor-documents' },
      { label: 'Uploads', href: '/admin/investor-uploads' },
      { label: 'Events', href: '/admin/investor-events' },
      { label: 'Governance', href: '/admin/investor-governance' },
      { label: 'Audit', href: '/admin/investor-audit' },
      { label: 'Analytics', href: '/admin/investor-analytics' },
      { label: 'Automation', href: '/admin/investor-automation' },
      { label: 'Automation Scans', href: '/admin/investor-automation/scans' },
      { label: 'Executive', href: '/admin/investor-executive' },
      { label: 'Reports', href: '/admin/investor-reports' },
      { label: 'Investors', href: '/admin/investors' },
    ],
  },
  {
    section: 'Content & Editorial',
    accent: 'violet',
    items: [
      { label: 'CMS', href: '/admin/cms' },
      { label: 'Essays', href: '/admin/essays' },
      { label: 'Policy', href: '/admin/policy' },
      { label: 'Governance', href: '/admin/governance' },
    ],
  },
  {
    section: 'Operations',
    accent: 'emerald',
    items: [
      { label: 'CRM', href: '/admin/crm' },
      { label: 'ERP', href: '/admin/erp' },
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'War Room', href: '/admin/war-room' },
      { label: 'iOS', href: '/admin/ios' },
      { label: 'Print', href: '/admin/print' },
    ],
  },
];

const PRIVILEGED_ROLES = ['founder', 'chairperson'];

type ActorIdentity = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: 'founder' | 'chairperson' | 'cto' | 'admin';
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE';
};

type AdminIdentityRow = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: 'founder' | 'chairperson' | 'cto' | 'admin';
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE';
};

type Permission = 'VIEW' | 'CREATE' | 'EDIT' | 'REVIEW' | 'APPROVE' | 'PUBLISH' | 'ARCHIVE' | 'DELETE' | 'ADMIN';

type SessionRow = {
  id: string;
  created_at: string;
  updated_at: string;
  user_agent: string | null;
  ip: string | null;
};

function isPrivileged(identity: ActorIdentity | null): boolean {
  if (!identity) return false;
  return PRIVILEGED_ROLES.includes(identity.role);
}

function actorHasPermission(identity: ActorIdentity | null, permission: Permission): boolean {
  if (!identity) return false;
  if (identity.status !== 'ACTIVE') return false;
  if (isPrivileged(identity)) return true;
  return identity.permissions.includes(permission);
}

export default function CommandCentreDashboard() {
  return (
    <AdminPageGuard>
      <CommandCentreInner />
    </AdminPageGuard>
  );
}

function CommandCentreInner() {
  const [actor, setActor] = useState<ActorIdentity | null>(null);

  const [activeTab, setActiveTab] = useState<
    | 'ARTICLES'
    | '📜 JOURNALS'
    | '👥 AUTHORS'
    | 'COLUMNS'
    | 'REFLECTIONS'
    | '📌 REVISIONS'
    | 'MY SESSION'
    | '🏛️ FOUNDER'
    | '💼 INVESTORS'
  >('ARTICLES');

  const [articles, setArticles] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [investorConfig, setInvestorConfig] = useState<any>(null);
  const [investorProfiles, setInvestorProfiles] = useState<any[]>([]);
  const [investorDocs, setInvestorDocs] = useState<any[]>([]);
  const [investorLogs, setInvestorLogs] = useState<any[]>([]);

  const [institutionalSettings, setInstitutionalSettings] = useState<any>(null);

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

  const [jName, setJName] = useState('');
  const [jType, setJType] = useState('RENAISSANCE_SERIES');
  const [jDesc, setJDesc] = useState('');
  const [jIssn, setJIssn] = useState('');
  const [jEditor, setJEditor] = useState('');

  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [aName, setAName] = useState('');
  const [aDesignation, setADesignation] = useState('');
  const [aOrg, setAOrg] = useState('');
  const [aBio, setABio] = useState('');
  const [aEmail, setAEmail] = useState('');
  const [aDept, setADept] = useState('Executive Board');
  const [aOffice, setAOffice] = useState('Global Secretariat & Executive Offices');
  const [aCredentials, setACredentials] = useState('');
  const [aAffiliation, setAAffiliation] = useState('');
  const [aPhoto, setAPhoto] = useState('');
  const [aExpertise, setAExpertise] = useState('');
  const [aLinkedin, setALinkedin] = useState('');
  const [aWebsite, setAWebsite] = useState('');

  const [watermarkText, setWatermarkText] = useState('OFFICIAL RECORD | PEOPLE & YOUTH | DO NOT DUPLICATE');
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [publicIntakeOpen, setPublicIntakeOpen] = useState(true);
  const [requireEditorialReview, setRequireEditorialReview] = useState(true);

  const [admName, setAdmName] = useState('');
  const [admEmail, setAdmEmail] = useState('');
  const [admUserId, setAdmUserId] = useState('');
  const [admRole, setAdmRole] = useState<'cto' | 'admin'>('admin');
  const [admCareerRole, setAdmCareerRole] = useState(GLOBAL_CAREER_ROLES[0]);
  const [admPhoto, setAdmPhoto] = useState('');
  const [admDesignation, setAdmDesignation] = useState('');
  const [admOrg, setAdmOrg] = useState('People & Youth');
  const [admOffice, setAdmOffice] = useState('Global Secretariat & Executive Offices');
  const [admBio, setAdmBio] = useState('');
  const [admExpertise, setAdmExpertise] = useState('Public Policy, Governance');
  const [admLinkedin, setAdmLinkedin] = useState('');
  const [admWebsite, setAdmWebsite] = useState('');

  const [admPermissions, setAdmPermissions] = useState<Record<Permission, boolean>>({
    VIEW: true, CREATE: true, EDIT: true, REVIEW: true,
    APPROVE: false, PUBLISH: false, ARCHIVE: false, DELETE: false, ADMIN: false,
  });

  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState('');

  // -------------------------------------------------------------------------
  // ADMIN LAUNCHER — collapsed by default, expands on click
  // -------------------------------------------------------------------------
  const [launcherExpanded, setLauncherExpanded] = useState(false);

  // -------------------------------------------------------------------------
  // PHASE 18 — My Session state
  // -------------------------------------------------------------------------
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState('');
  const [sessionActionMessage, setSessionActionMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // -------------------------------------------------------------------------
  // PHASE 19 — Admin registry (real list from API) + revoke
  // -------------------------------------------------------------------------
  const [adminRegistry, setAdminRegistry] = useState<AdminIdentityRow[]>([]);
  const [adminRegistryLoading, setAdminRegistryLoading] = useState(false);
  const [adminRegistryError, setAdminRegistryError] = useState('');

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError('');
    try {
      const response = await fetch('/api/admin/iam/session', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Unable to load sessions.');
      }
      setSessions(data.sessions ?? []);
      setCurrentSessionId(data.current_session_id ?? null);
    } catch (err) {
      setSessionsError(
        err instanceof Error ? err.message : 'Unable to load sessions.'
      );
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const fetchAdminRegistry = useCallback(async () => {
    setAdminRegistryLoading(true);
    setAdminRegistryError('');
    try {
      const response = await fetch('/api/admin/iam/list', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Unable to load admin registry.');
      }
      setAdminRegistry(data.identities ?? []);
    } catch (err) {
      setAdminRegistryError(
        err instanceof Error ? err.message : 'Unable to load admin registry.'
      );
    } finally {
      setAdminRegistryLoading(false);
    }
  }, []);

  async function terminateSession(sessionId: string) {
    if (!confirm('Terminate this session? The device will be signed out.')) return;
    setSessionActionMessage('');
    try {
      const response = await fetch(
        `/api/admin/iam/session?session_id=${encodeURIComponent(sessionId)}`,
        { method: 'DELETE', credentials: 'include' }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Unable to terminate session.');
      }
      setSessionActionMessage('Session terminated.');
      await fetchSessions();
    } catch (err) {
      setSessionActionMessage(
        err instanceof Error ? err.message : 'Unable to terminate session.'
      );
    }
  }

  async function terminateAllOtherSessions() {
    if (
      !confirm(
        'Terminate all other sessions? Every other device will be signed out.'
      )
    ) {
      return;
    }
    setSessionActionMessage('');
    try {
      const response = await fetch('/api/admin/iam/session?all=true', {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Unable to terminate sessions.');
      }
      setSessionActionMessage(
        data.terminated > 0
          ? `${data.terminated} session(s) terminated.`
          : 'No other sessions to terminate.'
      );
      await fetchSessions();
    } catch (err) {
      setSessionActionMessage(
        err instanceof Error ? err.message : 'Unable to terminate sessions.'
      );
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must differ from the current one.');
      return;
    }

    setPasswordChanging(true);

    try {
      const response = await fetch('/api/admin/iam/password', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Unable to change password.');
      }
      setPasswordSuccess(
        'Password changed. All other sessions have been terminated.'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Unable to change password.'
      );
    } finally {
      setPasswordChanging(false);
    }
  }

  async function revokeAdmin(identityId: string, adminEmail: string) {
    if (
      !confirm(
        `Revoke access for ${adminEmail}? Their account will be deactivated.`
      )
    ) {
      return;
    }
    try {
      const response = await fetch(
        `/api/admin/iam?id=${encodeURIComponent(identityId)}`,
        { method: 'DELETE', credentials: 'include' }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Unable to revoke access.');
      }
      alert(`Access revoked for ${adminEmail}.`);
      await fetchAdminRegistry();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Unable to revoke access.'
      );
    }
  }

  const fetchActor = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/iam', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) return;

      const data = (await response.json()) as { identity: ActorIdentity | null };
      if (data.identity) setActor(data.identity);
    } catch {
      // Guard already handles the failure state
    }
  }, []);

  useEffect(() => {
    void fetchActor();
  }, [fetchActor]);

  useEffect(() => {
    if (activeTab === 'MY SESSION') {
      void fetchSessions();
    }
  }, [activeTab, fetchSessions]);

  useEffect(() => {
    if (activeTab === '🏛️ FOUNDER') {
      void fetchAdminRegistry();
    }
  }, [activeTab, fetchAdminRegistry]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!institutionalSettings) return;

    setWatermarkEnabled(institutionalSettings.watermark_enabled ?? true);
    setWatermarkText(
      institutionalSettings.watermark_text ||
        'OFFICIAL RECORD | PEOPLE & YOUTH | DO NOT DUPLICATE'
    );
    setPublicIntakeOpen(institutionalSettings.public_intake_open ?? true);
    setRequireEditorialReview(institutionalSettings.require_editorial_review ?? true);
  }, [institutionalSettings]);

  async function fetchAllData() {
    setLoading(true);

    const [
      artRes,
      jourRes,
      authRes,
      colRes,
      refRes,
      revRes,
      invCfgRes,
      invProfRes,
      invDocRes,
      invCrmRes,
      institutionalSettingsRes,
    ] = await Promise.all([
      supabase.from('articles').select('*, authors(name), publications(name)').order('updated_at', { ascending: false }),
      supabase.from('publications').select('*').order('name', { ascending: true }),
      supabase.from('authors').select('*').order('created_at', { ascending: false }),
      supabase.from('editorial_columns').select('*, authors(name)').order('title', { ascending: true }),
      supabase.from('reflections').select('*').order('created_at', { ascending: false }),
      supabase.from('article_revisions').select('*, articles(title)').order('created_at', { ascending: false }).limit(20),
      supabase.from('investor_cms_config').select('*').eq('is_active', true).maybeSingle(),
      supabase.from('investor_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('investor_documents').select('*').order('display_order', { ascending: true }),
      supabase.from('investor_crm_logs').select('*').order('updated_at', { ascending: false }),
      supabase.from('institutional_settings').select('*').maybeSingle(),
    ]);

    if (artRes.data) setArticles(artRes.data);
    if (jourRes.data) setJournals(jourRes.data);
    if (authRes.data) setAuthors(authRes.data);
    if (colRes.data) setColumns(colRes.data);
    if (refRes.data) setReflections(refRes.data);
    if (revRes.data) setRevisions(revRes.data);
    if (invCfgRes.data) setInvestorConfig(invCfgRes.data);
    if (invProfRes.data) setInvestorProfiles(invProfRes.data);
    if (invDocRes.data) setInvestorDocs(invDocRes.data);
    if (invCrmRes.data) setInvestorLogs(invCrmRes.data);
    if (institutionalSettingsRes.data) setInstitutionalSettings(institutionalSettingsRes.data);

    setLoading(false);
  }

  function generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  async function triggerOnboardingEmail(
    name: string,
    email: string,
    designation: string,
    department?: string,
    office?: string
  ) {
    if (!email) return;

    try {
      await fetch('/api/onboard-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          designation,
          department,
          office: office || 'Global Secretariat & Executive Offices',
          profile_url: 'https://www.peopleandyouth.org/leadership',
        }),
      });
    } catch (err) {
      console.error('Email trigger error:', err);
    }
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
      editor_in_chief: jEditor || 'Founder',
    });

    if (error) {
      alert('Failed to create journal: ' + error.message);
    } else {
      alert(`Journal "${jName}" created successfully!`);
      setJName('');
      setJDesc('');
      setJIssn('');
      setJEditor('');
      fetchAllData();
    }
  }

  async function handleSaveAuthor(e: React.FormEvent) {
    e.preventDefault();
    if (!aName) return;

    const computedSlug = generateSlug(aName);

    const payload = {
      name: aName,
      slug: computedSlug,
      email: aEmail || null,
      designation: aDesignation || 'Team Member',
      organization: aOrg || 'People & Youth',
      department: aDept,
      office: aOffice,
      bio: aBio || null,
      academic_credentials: aCredentials || null,
      institutional_affiliation: aAffiliation || null,
      photo_url: aPhoto || null,
      is_leadership: true,
      display_order: 10,
      expertise: aExpertise ? aExpertise.split(',').map((s) => s.trim()) : [],
      linkedin_url: aLinkedin || null,
      website_url: aWebsite || null,
    };

    let error;

    if (editingAuthorId) {
      const res = await supabase.from('authors').update(payload).eq('id', editingAuthorId);
      error = res.error;
    } else {
      const res = await supabase.from('authors').insert(payload);
      error = res.error;

      if (!error && aEmail) {
        await triggerOnboardingEmail(aName, aEmail, aDesignation, aDept, aOffice);
      }
    }

    if (error) {
      alert('Failed to save profile: ' + error.message);
    } else {
      alert(`Profile for "${aName}" saved live! Appointment letter dispatched.`);
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
    setAOffice(author.office || 'Global Secretariat & Executive Offices');
    setACredentials(author.academic_credentials || '');
    setAAffiliation(author.institutional_affiliation || '');
    setAPhoto(author.photo_url || '');
    setAExpertise(author.expertise ? author.expertise.join(', ') : '');
    setALinkedin(author.linkedin_url || '');
    setAWebsite(author.website_url || '');
  }

  async function handleDeleteAuthor(id: string, name: string, email?: string) {
    if (!confirm(`Are you sure you want to permanently delete the profile for "${name}"?`)) return;

    const { error } = await supabase.from('authors').delete().eq('id', id);

    if (error) {
      alert('Failed to delete author: ' + error.message);
    } else {
      if (email) {
        try {
          await fetch('/api/offboard-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email }),
          });
        } catch (e) {
          console.error('Failed to dispatch offboarding email:', e);
        }
      }

      alert(`Profile for "${name}" removed permanently and offboarding email dispatched.`);
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
    setAOffice('Global Secretariat & Executive Offices');
    setACredentials('');
    setAAffiliation('');
    setAPhoto('');
    setAExpertise('');
    setALinkedin('');
    setAWebsite('');
  }

  async function handleAddAdministrator(e: React.FormEvent) {
    e.preventDefault();
    if (!admName || !admEmail || !admUserId) {
      setProvisionError('Name, email, and Supabase user ID are required.');
      return;
    }

    setProvisioning(true);
    setProvisionError('');

    try {
      const activePermissions = (
        Object.keys(admPermissions) as Permission[]
      ).filter((key) => admPermissions[key]);

      const response = await fetch('/api/admin/iam', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: admUserId.trim(),
          name: admName.trim(),
          email: admEmail.trim(),
          role: admRole,
          designation: admDesignation || admCareerRole,
          organization: admOrg,
          department: 'Executive Board',
          office: admOffice,
          permissions: activePermissions,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Failed to provision administrator.');
      }

      await triggerOnboardingEmail(
        admName,
        admEmail,
        admDesignation || admCareerRole,
        'Executive Board',
        admOffice
      );

      alert(`Administrator "${admName}" registered as ${admRole}. Appointment letter dispatched.`);

      setAdmName('');
      setAdmEmail('');
      setAdmUserId('');
      setAdmPhoto('');
      setAdmDesignation('');
      setAdmBio('');
      setAdmLinkedin('');
      setAdmWebsite('');
      setAdmPermissions({
        VIEW: true, CREATE: true, EDIT: true, REVIEW: true,
        APPROVE: false, PUBLISH: false, ARCHIVE: false, DELETE: false, ADMIN: false,
      });

      await fetchAdminRegistry();
    } catch (err) {
      setProvisionError(
        err instanceof Error ? err.message : 'Failed to provision administrator.'
      );
    } finally {
      setProvisioning(false);
    }
  }

  async function handleSaveInvestorConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!investorConfig) return;

    const funds = investorConfig.use_of_funds || {};

    const totalPct: number = Object.values(funds as Record<string, unknown>).reduce<number>(
      (sum: number, value: unknown) => sum + Number(value ?? 0),
      0
    );

    if (Math.abs(totalPct - 100) > 0.01) {
      if (!confirm(`⚠️ Warning: The current Use of Funds allocation totals ${totalPct.toFixed(1)}%, not 100%. Save anyway?`)) {
        return;
      }
    }

    const { error } = await supabase
      .from('investor_cms_config')
      .update({
        target_raise_inr: investorConfig.target_raise_inr,
        min_ticket_inr: investorConfig.min_ticket_inr,
        max_ticket_inr: investorConfig.max_ticket_inr,
        founder_capital_inr: investorConfig.founder_capital_inr,
        existing_debt_inr: investorConfig.existing_debt_inr,
        round_status: investorConfig.round_status,
        valuation_status: investorConfig.valuation_status,
        desired_dilution_percent: investorConfig.desired_dilution_percent,
        closing_date: investorConfig.closing_date,
        use_of_funds: investorConfig.use_of_funds,
        platform_metrics: investorConfig.platform_metrics,
        updated_by: 'Superadmin',
        updated_at: new Date().toISOString(),
      })
      .eq('id', investorConfig.id);

    if (error) {
      alert('Failed to update investor configuration: ' + error.message);
    } else {
      alert('Investor Relations CMS parameters saved live!');
      fetchAllData();
    }
  }

  async function handleSaveGlobalSettings() {
    if (!institutionalSettings?.id) {
      alert('Institutional settings record not found.');
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('institutional_settings')
      .update({
        watermark_enabled: watermarkEnabled,
        watermark_text: watermarkText,
        public_intake_open: publicIntakeOpen,
        require_editorial_review: requireEditorialReview,
        updated_at: new Date().toISOString(),
      })
      .eq('id', institutionalSettings.id);

    setSaving(false);

    if (error) {
      alert(`Failed to save global settings: ${error.message}`);
      return;
    }

    setInstitutionalSettings({
      ...institutionalSettings,
      watermark_enabled: watermarkEnabled,
      watermark_text: watermarkText,
      public_intake_open: publicIntakeOpen,
      require_editorial_review: requireEditorialReview,
      updated_at: new Date().toISOString(),
    });

    alert('Global institutional controls saved successfully.');
  }

  async function handleUpdateInvestorStatus(
    profileId: string,
    status: string,
    accessLevel: string
  ) {
    const { error } = await supabase
      .from('investor_profiles')
      .update({
        verification_status: status,
        access_level: accessLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId);

    if (error) {
      alert('Failed to update investor status: ' + error.message);
    } else {
      alert(`Investor status updated to ${status} (${accessLevel})!`);
      fetchAllData();
    }
  }

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans p-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-amber-500/20 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>

            <h1 className="text-2xl font-black uppercase text-amber-400 tracking-wider">
              INSTITUTIONAL COMMAND CENTRE
            </h1>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            People & Youth • Operating System for Publishing, Leadership & Civic Dispatches
          </p>

          {actor && (
            <p className="text-[10px] text-gray-500 mt-2 font-mono">
              Signed in as <span className="text-amber-400">{actor.email}</span> · role{' '}
              <span className="text-amber-400 uppercase">{actor.role}</span>
            </p>
          )}
        </div>

        <button
          onClick={handleNewArticle}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-lg transition"
        >
          + NEW ARTICLE / PAPER
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 my-6">

        <div className="bg-[#070b19] border border-amber-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-amber-400 uppercase block">
            TOTAL ARTICLES
          </span>
          <span className="text-2xl font-black">
            {articles.length}
          </span>
        </div>

        <div className="bg-[#070b19] border border-emerald-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-emerald-400 uppercase block">
            PUBLISHED
          </span>
          <span className="text-2xl font-black">
            {articles.filter(a => a.status === 'PUBLISHED').length}
          </span>
        </div>

        <div className="bg-[#070b19] border border-blue-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-blue-400 uppercase block">
            UNDER REVIEW
          </span>
          <span className="text-2xl font-black">
            {articles.filter(a => a.status === 'UNDER_REVIEW').length}
          </span>
        </div>

        <div className="bg-[#070b19] border border-purple-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-purple-400 uppercase block">
            📜 JOURNALS
          </span>
          <span className="text-2xl font-black">
            {journals.length}
          </span>
        </div>

        <div className="bg-[#070b19] border border-cyan-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-cyan-400 uppercase block">
            👥 AUTHORS
          </span>
          <span className="text-2xl font-black">
            {authors.length}
          </span>
        </div>

        <div className="bg-[#070b19] border border-gray-500/20 p-3 rounded-lg">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">
            INVESTOR REQS
          </span>
          <span className="text-2xl font-black">
            {investorProfiles.length}
          </span>
        </div>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ADMIN LAUNCHER — collapsed by default, expands on click.           */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-6 rounded-xl border border-white/10 bg-[#070b19]">
        <button
          onClick={() => setLauncherExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-white/[0.02] transition rounded-xl"
          aria-expanded={launcherExpanded}
        >
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Admin Launcher — All Surfaces
            </h2>
            <p className="mt-1 text-[11px] text-gray-400">
              {launcherExpanded
                ? 'Click any entry to jump to that admin surface.'
                : 'Click to expand the cross-page directory of every admin surface.'}
            </p>
          </div>
          <span
            className={`shrink-0 text-amber-400 text-lg transition-transform ${
              launcherExpanded ? 'rotate-180' : 'rotate-0'
            }`}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>

        {launcherExpanded && (
          <div className="px-5 pb-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ADMIN_LAUNCHER.map((group) => (
                <div
                  key={group.section}
                  className="rounded-lg border border-white/[0.08] bg-[#030611] p-4"
                >
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">
                    {group.section}
                  </h3>

                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className="group flex items-center justify-between gap-2 rounded-md border border-transparent px-2 py-1.5 text-[11px] text-gray-300 transition hover:border-amber-500/40 hover:bg-amber-500/[0.08] hover:text-amber-200"
                        >
                          <span className="truncate">{item.label}</span>
                          <span className="shrink-0 text-gray-600 transition group-hover:text-amber-400">
                            →
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex border-b border-gray-800 overflow-x-auto gap-1 mb-6">

        <button
          onClick={() => {
            setActiveTab('ARTICLES');
            setEditorMode('LIST');
          }}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === 'ARTICLES'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          ✍️ ARTICLES & ESSAYS
        </button>

        <button
          onClick={() => setActiveTab('📜 JOURNALS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === '📜 JOURNALS'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          📜 JOURNALS ({journals.length})
        </button>

        <button
          onClick={() => setActiveTab('👥 AUTHORS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === '👥 AUTHORS'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          👥 AUTHORS & CONSULTANTS ({authors.length})
        </button>

        <button
          onClick={() => setActiveTab('COLUMNS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === 'COLUMNS'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          EDITORIAL COLUMNS
        </button>

        <button
          onClick={() => setActiveTab('REFLECTIONS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === 'REFLECTIONS'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          💡 READER'S DESK ({reflections.length})
        </button>

        <button
          onClick={() => setActiveTab('📌 REVISIONS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === '📌 REVISIONS'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          📌 REVISIONS LOG
        </button>

        <button
          onClick={() => setActiveTab('MY SESSION')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === 'MY SESSION'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          🔐 MY SESSION
        </button>

        <button
          onClick={() => setActiveTab('💼 INVESTORS')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
            activeTab === '💼 INVESTORS'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          💼 INVESTORS ({investorProfiles.length})
        </button>

        {isPrivileged(actor) && (
          <button
            onClick={() => setActiveTab('🏛️ FOUNDER')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === '🏛️ FOUNDER'
                ? 'border-b-2 border-amber-400 text-amber-400 bg-amber-500/10'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🏛️ FOUNDER'S OFFICE
          </button>
        )}

      </div>

      {activeTab === 'ARTICLES' && (
        editorMode === 'LIST' ? (
          <div className="bg-[#070b19] border border-amber-500/20 rounded-xl p-6">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-amber-400 uppercase">
                Universal Content Registry
              </h2>

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
                    <tr
                      key={art.id}
                      className="border-b border-gray-800/50 hover:bg-white/5 transition"
                    >

                      <td className="py-3 px-2 font-bold text-gray-200">
                        {art.title}

                        {art.subtitle && (
                          <span className="block text-xs font-normal text-gray-400">
                            {art.subtitle}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-2 text-xs text-amber-400">
                        {art.publications?.name || art.publication_type}
                      </td>

                      <td className="py-3 px-2 text-xs text-gray-300">
                        {art.category}
                      </td>

                      <td className="py-3 px-2">

                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                            art.status === 'PUBLISHED'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : art.status === 'DRAFT'
                                ? 'bg-gray-500/20 text-gray-400 border-gray-500/40'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          }`}
                        >
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

                <label className="block text-xs font-bold text-gray-400 mb-1">
                  TITLE
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);

                    if (!articleId) {
                      setSlug(generateSlug(e.target.value));
                    }
                  }}
                  className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white outline-none focus:border-amber-500"
                />

              </div>

              <div>

                <label className="block text-xs font-bold text-gray-400 mb-1">
                  SUBTITLE
                </label>

                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white outline-none focus:border-amber-500"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    TYPE
                  </label>

                  <select
                    value={publicationType}
                    onChange={(e) => setPublicationType(e.target.value)}
                    className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white outline-none"
                  >
                    <option value="DISSENT_DIAS">Dissent Dias</option>
                    <option value="RENAISSANCE_SERIES">The Renaissance Series</option>
                    <option value="KNOWLEDGE_CAVE">Knowledge Caves</option>
                    <option value="COLUMNS">Editorial Columns</option>
                  </select>

                </div>

                <div>

                  <label className="block text-xs font-bold text-gray-400 mb-1">
                    JOURNAL / POD
                  </label>

                  <select
                    value={publicationId}
                    onChange={(e) => setPublicationId(e.target.value)}
                    className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-sm text-white outline-none"
                  >
                    <option value="">-- Direct Publication --</option>

                    {journals.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.name}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              <div>

                <label className="block text-xs font-bold text-gray-400 mb-1">
                  CONTENT (MARKDOWN / HTML)
                </label>

                <textarea
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 rounded p-3 text-sm text-white font-mono outline-none"
                />

              </div>

              <div className="flex gap-2 pt-2">

                <button
                  onClick={() => handleSaveArticle('DRAFT')}
                  disabled={saving}
                  className="flex-1 py-2 bg-gray-800 font-bold text-xs rounded uppercase"
                >
                  Save Draft
                </button>

                <button
                  onClick={() => handleSaveArticle('UNDER_REVIEW')}
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-600 font-bold text-xs rounded uppercase"
                >
                  Submit Review
                </button>

                <button
                  onClick={() => handleSaveArticle('PUBLISHED')}
                  disabled={saving}
                  className="flex-1 py-2 bg-emerald-600 font-bold text-xs rounded uppercase"
                >
                  Publish Live
                </button>

              </div>

            </div>

            <div className="bg-[#070b19] border border-amber-500/20 rounded-xl p-6 space-y-4">

              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block border-b border-gray-800 pb-2">
                LIVE PREVIEW
              </span>

              <h1 className="text-2xl font-black text-white">
                {title || 'Untitled Article'}
              </h1>

              {subtitle && (
                <p className="text-sm text-gray-400">
                  {subtitle}
                </p>
              )}

              <div className="prose prose-invert max-w-none text-sm text-gray-300 whitespace-pre-wrap font-serif pt-4">
                {content}
              </div>

            </div>

          </div>
        )
      )}

      {activeTab === '📜 JOURNALS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">

            <h2 className="text-md font-bold text-amber-400 uppercase">
              Create New Journal
            </h2>

            <form
              onSubmit={handleCreateJournal}
              className="space-y-3"
            >

              <input
                type="text"
                value={jName}
                onChange={(e) => setJName(e.target.value)}
                placeholder="Journal Name"
                className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded"
                required
              />

              <textarea
                rows={3}
                value={jDesc}
                onChange={(e) => setJDesc(e.target.value)}
                placeholder="Description"
                className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded"
              />

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 text-black text-xs font-bold uppercase rounded"
              >
                + Add Journal
              </button>

            </form>

          </div>

          <div className="md:col-span-2 bg-[#070b19] border border-amber-500/20 p-6 rounded-xl">

            <h2 className="text-md font-bold text-amber-400 uppercase mb-4">
              Active Journals ({journals.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {journals.map((j) => (
                <div
                  key={j.id}
                  className="p-3 bg-[#030611] border border-gray-800 rounded"
                >

                  <span className="font-bold text-xs text-amber-400 block">
                    {j.name}
                  </span>

                  <p className="text-[11px] text-gray-400 mt-1">
                    {j.description || 'No description.'}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </div>
      )}

      {activeTab === '👥 AUTHORS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">

            <div className="flex justify-between items-center border-b border-gray-800 pb-2">

              <h2 className="text-md font-bold text-amber-400 uppercase">
                {editingAuthorId ? 'Edit Profile' : 'Add Profile'}
              </h2>

              {editingAuthorId && (
                <button
                  onClick={resetAuthorForm}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  + Cancel Edit
                </button>
              )}

            </div>

            <form
              onSubmit={handleSaveAuthor}
              className="space-y-3"
            >

              <div>

                <label className="block text-[10px] text-gray-400 uppercase mb-1">
                  FULL NAME *
                </label>

                <input
                  type="text"
                  value={aName}
                  onChange={(e) => setAName(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded"
                  required
                />

              </div>

              <div>

                <label className="block text-[10px] text-gray-400 uppercase mb-1">
                  EMAIL ADDRESS
                </label>

                <input
                  type="email"
                  value={aEmail}
                  onChange={(e) => setAEmail(e.target.value)}
                  placeholder="user@peopleandyouth.org"
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded"
                />

              </div>

              <div>

                <label className="block text-[10px] text-gray-400 uppercase mb-1">
                  DEPARTMENT / SECTION
                </label>

                <select
                  value={aDept}
                  onChange={(e) => setADept(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded"
                >
                  <option value="Executive Board">Executive Board</option>
                  <option value="Guest Consultants">Guest Consultants</option>
                  <option value="Research Fellows">Research Fellows</option>
                  <option value="Editorial Board">Editorial Board</option>
                </select>

              </div>

              <div>

                <label className="block text-[10px] text-gray-400 uppercase mb-1">
                  OFFICE / DIVISION
                </label>

                <input
                  type="text"
                  value={aOffice}
                  onChange={(e) => setAOffice(e.target.value)}
                  placeholder="e.g. Global Secretariat & Executive Offices"
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded"
                />

              </div>

              <div>

                <label className="block text-[10px] text-gray-400 uppercase mb-1">
                  DESIGNATION
                </label>

                <input
                  type="text"
                  value={aDesignation}
                  onChange={(e) => setADesignation(e.target.value)}
                  placeholder="e.g. Guest Consultant — Public Health"
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded"
                />

              </div>

              <div>

                <label className="block text-[10px] text-gray-400 uppercase mb-1">
                  ACADEMIC CREDENTIALS
                </label>

                <input
                  type="text"
                  value={aCredentials}
                  onChange={(e) => setACredentials(e.target.value)}
                  placeholder="e.g. Ph.D., M.D."
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded"
                />

              </div>

              <div>

                <label className="block text-[10px] text-gray-400 uppercase mb-1">
                  INSTITUTIONAL AFFILIATION
                </label>

                <input
                  type="text"
                  value={aAffiliation}
                  onChange={(e) => setAAffiliation(e.target.value)}
                  placeholder="e.g. Johns Hopkins / IIT Delhi"
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded"
                />

              </div>

              <div>

                <label className="block text-[10px] text-gray-400 uppercase mb-1">
                  BIOGRAPHY
                </label>

                <textarea
                  rows={3}
                  value={aBio}
                  onChange={(e) => setABio(e.target.value)}
                  className="w-full bg-[#030611] border border-gray-800 p-2 text-xs text-white rounded"
                />

              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 text-black text-xs font-bold uppercase rounded"
              >
                {editingAuthorId
                  ? '💾 Save Changes'
                  : '+ Create Profile & Dispatch Appointment Letter'}
              </button>

            </form>

          </div>

          <div className="md:col-span-2 bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">

            <h2 className="text-md font-bold text-amber-400 uppercase">
              PROFILES REGISTRY ({authors.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {authors.map((a) => (
                <div
                  key={a.id}
                  className="p-4 bg-[#030611] border border-gray-800 rounded-lg flex flex-col justify-between space-y-3"
                >

                  <div className="space-y-1">

                    <div className="flex justify-between items-start gap-2">

                      <span className="font-bold text-sm text-white">
                        {a.name}
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">

                        {a.consent_status === 'ACCEPTED' ? (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                            CONSENTED
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                            CONSENT PENDING
                          </span>
                        )}

                        <span className="text-[9px] bg-gray-800 text-gray-300 border border-gray-700 px-1.5 py-0.5 rounded font-mono uppercase">
                          {a.department || 'Executive'}
                        </span>

                      </div>

                    </div>

                    <span className="text-xs font-semibold text-amber-400 block">
                      {a.designation}
                    </span>

                    {a.office && (
                      <span className="text-[10px] text-gray-400 block font-mono">
                        🏛️ {a.office}
                      </span>
                    )}

                    {a.academic_credentials && (
                      <span className="text-[10px] text-purple-300 block font-mono">
                        🎓 {a.academic_credentials}
                      </span>
                    )}

                    <p className="text-[11px] text-gray-400 line-clamp-2 pt-1">
                      {a.bio || 'No biography.'}
                    </p>

                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-800/80">

                    <button
                      onClick={() => handleEditAuthor(a)}
                      className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold uppercase hover:bg-amber-500/30"
                    >
                      EDIT
                    </button>

                    <button
                      onClick={() => handleDeleteAuthor(a.id, a.name, a.email)}
                      className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[10px] font-bold uppercase hover:bg-red-500/30"
                    >
                      DELETE
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>
      )}

      {activeTab === 'COLUMNS' && (
        <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">

          <h2 className="text-md font-bold text-amber-400 uppercase">
            Editorial Columns Registry
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {columns.length === 0 ? (
              <p className="text-xs text-gray-400 col-span-3">
                No custom columns defined yet.
              </p>
            ) : (
              columns.map((c) => (
                <div
                  key={c.id}
                  className="p-4 bg-[#030611] border border-gray-800 rounded"
                >
                  <span className="font-bold text-sm text-amber-400">
                    {c.title}
                  </span>

                  <p className="text-xs text-gray-300 mt-1">
                    {c.description}
                  </p>
                </div>
              ))
            )}

          </div>

        </div>
      )}

      {activeTab === 'REFLECTIONS' && (
        <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">

          <h2 className="text-md font-bold text-amber-400 uppercase">
            Reader's Desk & Dispatches
          </h2>

          <div className="space-y-3">

            {reflections.map((ref) => (
              <div
                key={ref.id}
                className="p-4 bg-[#030611] border border-gray-800 rounded flex justify-between items-center gap-4"
              >

                <div>

                  <span className="text-xs font-bold text-amber-400 block">
                    {ref.prompt_question || 'General Dispatch'}
                  </span>

                  <p className="text-xs text-gray-200">
                    "{ref.message}"
                  </p>

                  <span className="text-[10px] text-gray-400">
                    — {ref.author_name || 'Anonymous'}
                  </span>

                </div>

                <button
                  onClick={() => handlePromoteReflection(ref)}
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase rounded whitespace-nowrap"
                >
                  ⚡ Promote to Draft
                </button>

              </div>
            ))}

          </div>

        </div>
      )}

      {activeTab === '📌 REVISIONS' && (
        <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">

          <h2 className="text-md font-bold text-amber-400 uppercase">
            Publication Revision History
          </h2>

          <div className="space-y-2">

            {revisions.map((rev) => (
              <div
                key={rev.id}
                className="p-3 bg-[#030611] border border-gray-800 rounded flex justify-between items-center text-xs"
              >

                <div>

                  <span className="font-bold text-white block">
                    {rev.articles?.title || rev.title}
                  </span>

                  <span className="text-gray-400">
                    {rev.change_summary}
                  </span>

                </div>

                <span className="text-amber-400 font-bold">
                  Rev #{rev.revision_number}
                </span>

              </div>
            ))}

          </div>

        </div>
      )}

      {activeTab === 'MY SESSION' && (
        <div className="space-y-6">

          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-6">

            <div className="border-b border-gray-800 pb-3 flex justify-between items-center gap-3 flex-wrap">

              <div>
                <h2 className="text-md font-bold text-amber-400 uppercase">
                  MY ACTIVE SESSIONS
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Sessions currently signed in to your account. Terminate any you do not recognise.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => void fetchSessions()}
                  disabled={sessionsLoading}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 disabled:opacity-40"
                >
                  {sessionsLoading ? 'Refreshing…' : 'Refresh'}
                </button>

                <button
                  onClick={() => void terminateAllOtherSessions()}
                  disabled={sessionsLoading || sessions.length <= 1}
                  className="px-3 py-2 bg-red-500/20 border border-red-500/40 rounded text-[10px] font-bold uppercase tracking-wider text-red-300 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Terminate All Others
                </button>
              </div>

            </div>

            {sessionsError && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                {sessionsError}
              </div>
            )}

            {sessionActionMessage && (
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs">
                {sessionActionMessage}
              </div>
            )}

            {sessionsLoading && sessions.length === 0 ? (
              <p className="text-xs text-gray-400">Loading sessions…</p>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-gray-400">No active sessions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                      <th className="py-2 px-2">Device</th>
                      <th className="py-2 px-2">IP</th>
                      <th className="py-2 px-2">Signed In</th>
                      <th className="py-2 px-2">Last Active</th>
                      <th className="py-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => {
                      const isCurrent = s.id === currentSessionId;
                      return (
                        <tr
                          key={s.id}
                          className={`border-b border-gray-800/50 hover:bg-white/5 transition ${
                            isCurrent ? 'bg-amber-500/[0.06]' : ''
                          }`}
                        >
                          <td className="py-2 px-2 text-gray-200">
                            <span className="block truncate max-w-[420px]">
                              {s.user_agent || 'Unknown device'}
                            </span>
                            {isCurrent && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-bold uppercase text-amber-300">
                                Current
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 font-mono text-[10px] text-cyan-400">
                            {s.ip || '—'}
                          </td>
                          <td className="py-2 px-2 text-gray-400 font-mono text-[10px]">
                            {new Date(s.created_at).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-gray-400 font-mono text-[10px]">
                            {new Date(s.updated_at).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              onClick={() => void terminateSession(s.id)}
                              disabled={isCurrent}
                              className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[10px] font-bold uppercase hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                              title={
                                isCurrent
                                  ? 'Cannot terminate the current session from here. Use sign out.'
                                  : 'Terminate this session'
                              }
                            >
                              Terminate
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-6">

            <div className="border-b border-gray-800 pb-3">
              <h2 className="text-md font-bold text-amber-400 uppercase">
                CHANGE PASSWORD
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Changing your password will terminate all other sessions.
              </p>
            </div>

            <form onSubmit={changePassword} className="space-y-4 max-w-lg">

              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white outline-none focus:border-amber-500"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white outline-none focus:border-amber-500"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white outline-none focus:border-amber-500"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
                  {passwordSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordChanging}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider rounded transition"
              >
                {passwordChanging ? 'Updating…' : 'Change Password'}
              </button>

            </form>

          </div>

        </div>
      )}

      {activeTab === '💼 INVESTORS' && (
        <div className="space-y-6">

          {investorConfig && (
            <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-6">

              <div className="border-b border-gray-800 pb-3 flex justify-between items-center">

                <div>

                  <h2 className="text-md font-bold text-amber-400 uppercase">
                    INVESTOR RELATIONS PROSPECTUS PARAMETERS
                  </h2>

                  <p className="text-xs text-gray-400">
                    Dynamic Capital Ask, Dilution Targets, and Use of Funds Allocation Matrix
                  </p>

                </div>

                <button
                  onClick={handleSaveInvestorConfig}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase rounded"
                >
                  💾 Save Investor CMS Parameters
                </button>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">

                <div>

                  <label className="block text-gray-400 font-bold uppercase mb-1">
                    Target Raise (₹ INR)
                  </label>

                  <input
                    type="number"
                    value={investorConfig.target_raise_inr || ''}
                    onChange={(e) =>
                      setInvestorConfig({
                        ...investorConfig,
                        target_raise_inr: Number(e.target.value)
                      })
                    }
                    className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-white font-mono outline-none focus:border-amber-500"
                  />

                </div>

                <div>

                  <label className="block text-gray-400 font-bold uppercase mb-1">
                    Min Ticket (₹ INR)
                  </label>

                  <input
                    type="number"
                    value={investorConfig.min_ticket_inr || ''}
                    onChange={(e) =>
                      setInvestorConfig({
                        ...investorConfig,
                        min_ticket_inr: Number(e.target.value)
                      })
                    }
                    className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-white font-mono outline-none focus:border-amber-500"
                  />

                </div>

                <div>

                  <label className="block text-gray-400 font-bold uppercase mb-1">
                    Max Ticket (₹ INR)
                  </label>

                  <input
                    type="number"
                    value={investorConfig.max_ticket_inr || ''}
                    onChange={(e) =>
                      setInvestorConfig({
                        ...investorConfig,
                        max_ticket_inr: Number(e.target.value)
                      })
                    }
                    className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-white font-mono outline-none focus:border-amber-500"
                  />

                </div>

                <div>

                  <label className="block text-gray-400 font-bold uppercase mb-1">
                    Round Status
                  </label>

                  <select
                    value={investorConfig.round_status || 'Exploring'}
                    onChange={(e) =>
                      setInvestorConfig({
                        ...investorConfig,
                        round_status: e.target.value
                      })
                    }
                    className="w-full bg-[#030611] border border-gray-800 rounded p-2 text-white outline-none focus:border-amber-500"
                  >
                    <option value="Exploring">Exploring</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Paused">Paused</option>
                  </select>

                </div>

              </div>

            </div>
          )}

          <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">

            <h2 className="text-md font-bold text-amber-400 uppercase">
              INVESTOR ACCESS REQUESTS ({investorProfiles.length})
            </h2>

            {investorProfiles.length === 0 ? (
              <p className="text-xs text-gray-400">
                No investor verification requests submitted yet.
              </p>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-left text-xs border-collapse">

                  <thead>

                    <tr className="border-b border-gray-800 text-gray-400 uppercase">

                      <th className="py-2 px-2">
                        Investor / Entity
                      </th>

                      <th className="py-2 px-2">
                        Type
                      </th>

                      <th className="py-2 px-2">
                        Proposed Ticket
                      </th>

                      <th className="py-2 px-2">
                        Status
                      </th>

                      <th className="py-2 px-2">
                        Access Level
                      </th>

                      <th className="py-2 px-2 text-right">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {investorProfiles.map((ip) => (
                      <tr
                        key={ip.id}
                        className="border-b border-gray-800/50 hover:bg-white/5 transition"
                      >

                        <td className="py-2 px-2 font-bold text-white">

                          {ip.full_name}

                          <span className="block text-[10px] font-normal text-gray-400">
                            {ip.email}
                            {ip.organization
                              ? ` • ${ip.organization}`
                              : ''}
                          </span>

                        </td>

                        <td className="py-2 px-2 text-amber-400">
                          {ip.investor_type || 'Angel'}
                        </td>

                        <td className="py-2 px-2 font-mono">
                          {ip.proposed_ticket_inr
                            ? `₹${Number(ip.proposed_ticket_inr).toLocaleString()}`
                            : 'Not specified'}
                        </td>

                        <td className="py-2 px-2">

                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                              ip.verification_status === 'VERIFIED'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : ip.verification_status === 'REJECTED'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            }`}
                          >
                            {ip.verification_status}
                          </span>

                        </td>

                        <td className="py-2 px-2 font-mono text-[10px] text-cyan-400">
                          {ip.access_level}
                        </td>

                        <td className="py-2 px-2 text-right space-x-1">

                          <button
                            onClick={() =>
                              handleUpdateInvestorStatus(
                                ip.id,
                                'VERIFIED',
                                'APPROVED'
                              )
                            }
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold uppercase hover:bg-emerald-500/30"
                          >
                            Approve Access
                          </button>

                          <button
                            onClick={() =>
                              handleUpdateInvestorStatus(
                                ip.id,
                                'REJECTED',
                                'PUBLIC'
                              )
                            }
                            className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[10px] font-bold uppercase hover:bg-red-500/30"
                          >
                            Reject
                          </button>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>
      )}

      {activeTab === '🏛️ FOUNDER' && (
        isPrivileged(actor) ? (
          <div className="space-y-6">

            <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-6">

              <div className="border-b border-gray-800 pb-4 flex justify-between items-center">

                <div>

                  <h2 className="text-lg font-black text-amber-400 uppercase tracking-wide">
                    🏛️ FOUNDER'S OFFICE & IOS GOVERNANCE
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Super-Administrator Controls, Watermarking Shields & Platform Overrides
                  </p>

                </div>

                <button
                  onClick={handleSaveGlobalSettings}
                  disabled={saving || !institutionalSettings?.id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase rounded transition"
                >
                  {saving ? 'SAVING...' : '💾 SAVE GLOBAL OVERRIDES'}
                </button>

              </div>

              {!institutionalSettings && (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs">
                  Institutional settings are not currently available from Supabase.
                  The Founder Office controls are using their local defaults until an
                  institutional settings record is available.
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="p-5 bg-[#030611] border border-gray-800 rounded-xl space-y-4">

                  <span className="font-bold text-xs text-amber-400 uppercase block border-b border-gray-800/80 pb-2">
                    🛡️ INSTITUTIONAL WATERMARK SHIELD
                  </span>

                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full bg-[#070b19] border border-gray-800 p-2.5 text-xs text-white rounded font-mono outline-none"
                  />

                </div>

                <div className="p-5 bg-[#030611] border border-gray-800 rounded-xl space-y-4">

                  <span className="font-bold text-xs text-amber-400 uppercase block border-b border-gray-800/80 pb-2">
                    ⚙️ GLOBAL OPERATIONAL OVERRIDES
                  </span>

                  <div className="space-y-3 text-xs">

                    <div className="flex justify-between items-center">

                      <span>
                        Reader Dispatches Intake (/reflections)
                      </span>

                      <input
                        type="checkbox"
                        checked={publicIntakeOpen}
                        onChange={(e) =>
                          setPublicIntakeOpen(e.target.checked)
                        }
                        className="accent-amber-500 h-4 w-4"
                      />

                    </div>

                    <div className="flex justify-between items-center border-t border-gray-800/50 pt-2">

                      <span>
                        Require Editorial Review
                      </span>

                      <input
                        type="checkbox"
                        checked={requireEditorialReview}
                        onChange={(e) =>
                          setRequireEditorialReview(e.target.checked)
                        }
                        className="accent-amber-500 h-4 w-4"
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-6">

              <h2 className="text-md font-bold text-amber-400 uppercase border-b border-gray-800 pb-2">
                👥 PROVISION ADMINISTRATOR IDENTITY
              </h2>

              <form
                onSubmit={handleAddAdministrator}
                className="space-y-6"
              >

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#030611] p-4 rounded-xl border border-gray-800">

                  <div>

                    <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                      NAME *
                    </label>

                    <input
                      type="text"
                      value={admName}
                      onChange={(e) => setAdmName(e.target.value)}
                      placeholder="Full Official Name"
                      className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                      required
                    />

                  </div>

                  <div>

                    <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                      EMAIL *
                    </label>

                    <input
                      type="email"
                      value={admEmail}
                      onChange={(e) => setAdmEmail(e.target.value)}
                      placeholder="email@peopleandyouth.org"
                      className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                      required
                    />

                  </div>

                  <div>

                    <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                      SUPABASE USER ID *
                    </label>

                    <input
                      type="text"
                      value={admUserId}
                      onChange={(e) => setAdmUserId(e.target.value)}
                      placeholder="UUID from auth.users"
                      className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white font-mono"
                      required
                    />

                    <p className="mt-1 text-[9px] text-gray-500">
                      Must exist in auth.users. Copy from Supabase Auth.
                    </p>

                  </div>

                  <div>

                    <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                      ACCESS ROLE *
                    </label>

                    <select
                      value={admRole}
                      onChange={(e) =>
                        setAdmRole(e.target.value as 'cto' | 'admin')
                      }
                      className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white outline-none"
                    >
                      <option value="admin">admin</option>
                      <option value="cto">cto</option>
                    </select>

                    <p className="mt-1 text-[9px] text-gray-500">
                      Only founder and chairperson may grant these. Founder
                      role is not grantable through this form.
                    </p>

                  </div>

                  <div>

                    <label className="block text-[10px] text-gray-400 uppercase mb-1">
                      CAREER TITLE (DISPLAY ONLY)
                    </label>

                    <select
                      value={admCareerRole}
                      onChange={(e) => {
                        setAdmCareerRole(e.target.value);
                        if (!admDesignation) {
                          setAdmDesignation(e.target.value);
                        }
                      }}
                      className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white outline-none"
                    >
                      {GLOBAL_CAREER_ROLES.map((r, idx) => (
                        <option key={idx} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div>

                    <label className="block text-[10px] text-gray-400 uppercase mb-1">
                      DESIGNATION
                    </label>

                    <input
                      type="text"
                      value={admDesignation}
                      onChange={(e) => setAdmDesignation(e.target.value)}
                      placeholder="e.g. Chief Technology Officer"
                      className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                    />

                  </div>

                  <div>

                    <label className="block text-[10px] text-gray-400 uppercase mb-1">
                      ORGANIZATION
                    </label>

                    <input
                      type="text"
                      value={admOrg}
                      onChange={(e) => setAdmOrg(e.target.value)}
                      className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                    />

                  </div>

                  <div>

                    <label className="block text-[10px] text-gray-400 uppercase mb-1">
                      OFFICE / DIVISION
                    </label>

                    <input
                      type="text"
                      value={admOffice}
                      onChange={(e) => setAdmOffice(e.target.value)}
                      className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                    />

                  </div>

                  <div className="md:col-span-3">

                    <label className="block text-[10px] text-gray-400 uppercase mb-1">
                      BIOGRAPHY
                    </label>

                    <textarea
                      rows={2}
                      value={admBio}
                      onChange={(e) => setAdmBio(e.target.value)}
                      className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                    />

                  </div>

                </div>

                <div className="bg-[#030611] p-4 rounded-xl border border-gray-800 space-y-3">

                  <span className="text-xs font-bold text-amber-400 uppercase block">
                    🔒 PERMISSIONS MATRIX
                  </span>

                  <p className="text-[10px] text-gray-500">
                    Only permissions you yourself hold may be granted. Privileged
                    roles hold all permissions implicitly.
                  </p>

                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-xs">

                    {(Object.keys(admPermissions) as Permission[]).map((key) => {
                      const allowed =
                        isPrivileged(actor) || actorHasPermission(actor, key);

                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-1.5 p-2 rounded border ${
                            allowed
                              ? 'bg-[#070b19] border-gray-800 cursor-pointer hover:border-amber-500/50'
                              : 'bg-[#070b19]/40 border-gray-900 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={!allowed}
                            checked={admPermissions[key] && allowed}
                            onChange={(e) =>
                              setAdmPermissions({
                                ...admPermissions,
                                [key]: e.target.checked,
                              })
                            }
                            className="accent-amber-500"
                          />

                          <span className="uppercase text-[10px] font-bold text-gray-200">
                            {key}
                          </span>
                        </label>
                      );
                    })}

                  </div>

                </div>

                {provisionError && (
                  <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                    {provisionError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={provisioning}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-wider rounded transition"
                >
                  {provisioning
                    ? 'PROVISIONING…'
                    : '+ REGISTER ADMINISTRATOR & DISPATCH INSTITUTIONAL LETTER'}
                </button>

              </form>

            </div>

            <div className="bg-[#070b19] border border-amber-500/20 p-6 rounded-xl space-y-4">

              <div className="border-b border-gray-800 pb-2 flex justify-between items-center gap-3 flex-wrap">
                <h2 className="text-md font-bold text-amber-400 uppercase">
                  ACTIVE PERSONNEL & PERMISSIONS REGISTRY
                </h2>
                <button
                  onClick={() => void fetchAdminRegistry()}
                  disabled={adminRegistryLoading}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 disabled:opacity-40"
                >
                  {adminRegistryLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>

              {adminRegistryError && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                  {adminRegistryError}
                </div>
              )}

              {adminRegistryLoading && adminRegistry.length === 0 ? (
                <p className="text-xs text-gray-400">Loading registry…</p>
              ) : adminRegistry.length === 0 ? (
                <p className="text-xs text-gray-400">No identities found.</p>
              ) : (
                <div className="space-y-2">
                  {adminRegistry.map((m) => {
                    const isFounderRow = m.role === 'founder';
                    const isSelfRow = actor?.id === m.id;
                    const canRevoke =
                      !isFounderRow && !isSelfRow && m.status === 'ACTIVE';

                    return (
                      <div
                        key={m.id}
                        className="p-3 bg-[#030611] border border-gray-800 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white">
                              {m.name}
                            </span>
                            <span className="text-[9px] bg-gray-800 text-gray-300 border border-gray-700 px-1.5 py-0.5 rounded font-mono uppercase">
                              {m.role}
                            </span>
                            {m.status !== 'ACTIVE' && (
                              <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                                {m.status}
                              </span>
                            )}
                            {isSelfRow && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 text-[10px] block mt-0.5 truncate">
                            {m.email}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 items-center">
                          {m.permissions?.map((p: string, i: number) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 bg-gray-800 text-gray-300 text-[9px] font-mono rounded"
                            >
                              {p}
                            </span>
                          ))}

                          {canRevoke && (
                            <button
                              onClick={() => void revokeAdmin(m.id, m.email)}
                              className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[10px] font-bold uppercase hover:bg-red-500/30"
                            >
                              Revoke Access
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="bg-[#070b19] border border-red-500/30 rounded-xl p-8 text-center space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wider text-red-400">
              Access denied
            </h2>
            <p className="text-xs text-gray-400">
              The Founder's Office is restricted to founder and chairperson
              roles. Your role ({actor?.role ?? 'unknown'}) cannot view this
              surface.
            </p>
          </div>
        )
      )}

    </div>
  );
}