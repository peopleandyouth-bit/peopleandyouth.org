'use client';

import { useCallback, useEffect, useState } from 'react';

type OfficeRow = {
  id: string;
  slug: string;
  name: string;
  level: string;
  office_number: string | null;
  mandate: string | null;
  facilities: string[] | null;
  tagline: string | null;
  theme_slug: string;
  status: string;
  display_order: number;
  assignment: {
    title: string;
    subtitle: string | null;
    author: { name: string; photo_url: string | null; designation: string | null } | null;
  } | null;
};

type ContentRow = {
  id: string;
  type: string;
  title: string | null;
  body: string;
  tags: string[] | null;
  visibility: string;
  status: string;
  published_at: string | null;
};

type AppointmentRow = {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_organization: string | null;
  requester_designation: string | null;
  purpose: string;
  message: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  duration_minutes: number;
  scheduled_at: string | null;
  location: string | null;
  meeting_link: string | null;
  status: string;
  response_message: string | null;
  created_at: string;
};

type CorrespondenceRow = {
  id: string;
  sender_name: string;
  sender_email: string;
  sender_organization: string | null;
  sender_designation: string | null;
  subject: string;
  body: string;
  category: string | null;
  tags: string[] | null;
  status: string;
  important: boolean;
  created_at: string;
};

const APPROVED_THEMES = [
  'institutional-ink',
  'founders-gold',
  'civic-emerald',
  'constitutional-navy',
  'archive-parchment',
  'research-slate',
  'editorial-violet',
  'technology-cyan',
  'policy-maroon',
  'heritage-cream',
];

const CONTENT_TYPES = ['NOTE', 'ARTICLE', 'ESSAY', 'PROPOSAL', 'SPEECH', 'LETTER', 'STATEMENT'];

export default function OfficeDesk() {
  const [offices, setOffices] = useState<OfficeRow[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('founder');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [content, setContent] = useState<ContentRow[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState('');

  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [appointmentActionId, setAppointmentActionId] = useState<string | null>(null);

  const [correspondence, setCorrespondence] = useState<CorrespondenceRow[]>([]);
  const [correspondenceLoading, setCorrespondenceLoading] = useState(false);
  const [correspondenceError, setCorrespondenceError] = useState('');
  const [correspondenceActionId, setCorrespondenceActionId] = useState<string | null>(null);

  // Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // Long-form form
  const [articleType, setArticleType] = useState('ARTICLE');
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSubtitle, setArticleSubtitle] = useState('');
  const [articleBody, setArticleBody] = useState('');
  const [articleSubmitting, setArticleSubmitting] = useState(false);
  const [noteVisibility, setNoteVisibility] = useState<'PUBLIC' | 'INTERNAL' | 'RESTRICTED'>('PUBLIC');
  const [articleVisibility, setArticleVisibility] = useState<'PUBLIC' | 'INTERNAL' | 'RESTRICTED'>('PUBLIC');

  type MemberRow = {
    id: string;
    office_id: string;
    author_id: string;
    role: string;
    status: string;
    joined_at: string;
    ended_at: string | null;
    author: { name: string; email: string | null; designation: string | null; photo_url: string | null } | null;
  };

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');
  const [memberActionId, setMemberActionId] = useState<string | null>(null);
  const [newMemberAuthorId, setNewMemberAuthorId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'VIEWER' | 'EDITOR' | 'MANAGER'>('VIEWER');
  const [newMemberSubmitting, setNewMemberSubmitting] = useState(false);

  type PermissionRow = {
    id: string;
    grantee_email: string;
    grantee_name: string | null;
    scope: string;
    reason: string | null;
    expires_at: string | null;
    status: string;
    granted_at: string;
  };

  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState('');
  const [permissionActionId, setPermissionActionId] = useState<string | null>(null);

  const [newGranteeEmail, setNewGranteeEmail] = useState('');
  const [newGranteeName, setNewGranteeName] = useState('');
  const [newGrantScope, setNewGrantScope] = useState<'INTERNAL' | 'RESTRICTED'>('INTERNAL');
  const [newGrantReason, setNewGrantReason] = useState('');
  const [newGrantExpiresAt, setNewGrantExpiresAt] = useState('');
  const [newGrantSubmitting, setNewGrantSubmitting] = useState(false);

  type AuditRow = {
    id: string;
    event_type: string;
    actor_email: string | null;
    actor_role: string | null;
    target_type: string | null;
    target_id: string | null;
    summary: string | null;
    payload: Record<string, unknown> | null;
    ip: string | null;
    occurred_at: string;
  };

  const [auditEvents, setAuditEvents] = useState<AuditRow[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [auditFilter, setAuditFilter] = useState<string>('');

  // Campus
  type CampusZoneRow = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    image_url: string | null;
    status: string;
    display_order: number;
  };

  type CampusBuildingRow = {
    id: string;
    zone_id: string;
    slug: string;
    name: string;
    description: string | null;
    status: string;
    display_order: number;
  };

  type CampusDivisionRow = {
    id: string;
    building_id: string | null;
    slug: string;
    name: string;
    description: string | null;
    icon: string | null;
    status: string;
    display_order: number;
  };

  type CampusOfficeRow = {
    id: string;
    slug: string;
    name: string;
    level: string;
    office_number: string | null;
    status: string;
    division_id: string | null;
    display_order: number;
  };

  const [campusZones, setCampusZones] = useState<CampusZoneRow[]>([]);
  const [campusBuildings, setCampusBuildings] = useState<CampusBuildingRow[]>([]);
  const [campusDivisions, setCampusDivisions] = useState<CampusDivisionRow[]>([]);
  const [campusOffices, setCampusOffices] = useState<CampusOfficeRow[]>([]);
  const [campusLoading, setCampusLoading] = useState(false);
  const [campusError, setCampusError] = useState('');
  const [campusActionId, setCampusActionId] = useState<string | null>(null);
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);

  // Office metadata form
  const [metaName, setMetaName] = useState('');
  const [metaMandate, setMetaMandate] = useState('');
  const [metaTagline, setMetaTagline] = useState('');
  const [metaTheme, setMetaTheme] = useState('institutional-ink');
  const [metaSubmitting, setMetaSubmitting] = useState(false);
  const [metaMessage, setMetaMessage] = useState('');

  const loadOffices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/office', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setOffices(json.offices ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offices.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContent = useCallback(async (slug: string) => {
    setContentLoading(true);
    setContentError('');
    try {
      const res = await fetch(
        `/api/admin/office/content?office_slug=${encodeURIComponent(slug)}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setContent(json.content ?? []);
    } catch (err) {
      setContentError(err instanceof Error ? err.message : 'Failed to load content.');
    } finally {
      setContentLoading(false);
    }
  }, []);

  const loadAppointments = useCallback(async (slug: string) => {
    setAppointmentsLoading(true);
    setAppointmentsError('');
    try {
      const res = await fetch(
        `/api/admin/office/appointments?office_slug=${encodeURIComponent(slug)}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setAppointments(json.appointments ?? []);
    } catch (err) {
      setAppointmentsError(
        err instanceof Error ? err.message : 'Failed to load appointments.'
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const loadCampus = useCallback(async () => {
    setCampusLoading(true);
    setCampusError('');
    try {
      const res = await fetch('/api/admin/campus', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setCampusZones(json.zones ?? []);
      setCampusBuildings(json.buildings ?? []);
      setCampusDivisions(json.divisions ?? []);
      setCampusOffices(json.offices ?? []);
    } catch (err) {
      setCampusError(err instanceof Error ? err.message : 'Failed to load campus.');
    } finally {
      setCampusLoading(false);
    }
  }, []);

  const loadAudit = useCallback(async (slug: string, filter?: string) => {
    setAuditLoading(true);
    setAuditError('');
    try {
      const params = new URLSearchParams({ office_slug: slug, limit: '200' });
      if (filter) params.set('event_type', filter);
      const res = await fetch(`/api/admin/office/audit?${params.toString()}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setAuditEvents(json.events ?? []);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : 'Failed to load audit log.');
    } finally {
      setAuditLoading(false);
    }
  }, []);

  const loadPermissions = useCallback(async (slug: string) => {
    setPermissionsLoading(true);
    setPermissionsError('');
    try {
      const res = await fetch(
        `/api/admin/office/permissions?office_slug=${encodeURIComponent(slug)}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setPermissions(json.permissions ?? []);
    } catch (err) {
      setPermissionsError(
        err instanceof Error ? err.message : 'Failed to load grants.'
      );
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  const loadMembers = useCallback(async (slug: string) => {
    setMembersLoading(true);
    setMembersError('');
    try {
      const res = await fetch(
        `/api/admin/office/members?office_slug=${encodeURIComponent(slug)}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setMembers(json.members ?? []);
    } catch (err) {
      setMembersError(
        err instanceof Error ? err.message : 'Failed to load members.'
      );
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const loadCorrespondence = useCallback(async (slug: string) => {
    setCorrespondenceLoading(true);
    setCorrespondenceError('');
    try {
      const res = await fetch(
        `/api/admin/office/correspondence?office_slug=${encodeURIComponent(slug)}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setCorrespondence(json.correspondence ?? []);
    } catch (err) {
      setCorrespondenceError(
        err instanceof Error ? err.message : 'Failed to load correspondence.'
      );
    } finally {
      setCorrespondenceLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOffices();
    void loadCampus();
  }, [loadOffices, loadCampus]);

  useEffect(() => {
    if (selectedSlug) {
      void loadContent(selectedSlug);
      void loadAppointments(selectedSlug);
      void loadCorrespondence(selectedSlug);
      void loadMembers(selectedSlug);
      void loadPermissions(selectedSlug);
      void loadAudit(selectedSlug, auditFilter || undefined);
    }
  }, [selectedSlug, auditFilter, loadContent, loadAppointments, loadCorrespondence, loadMembers, loadPermissions, loadAudit]);

  const selected = offices.find((o) => o.slug === selectedSlug) ?? null;

  useEffect(() => {
    if (!selected) return;
    setMetaName(selected.name);
    setMetaMandate(selected.mandate ?? '');
    setMetaTagline(selected.tagline ?? '');
    setMetaTheme(selected.theme_slug);
  }, [selected]);

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteBody.trim()) return;
    setNoteSubmitting(true);
    try {
      const res = await fetch('/api/admin/office/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          office_slug: selectedSlug,
          type: 'NOTE',
          title: noteTitle.trim() || null,
          body: noteBody.trim(),
          tags: noteTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          visibility: noteVisibility,
          status: 'PUBLISHED',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setNoteTitle('');
      setNoteBody('');
      setNoteTags('');
      await loadContent(selectedSlug);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setNoteSubmitting(false);
    }
  }

  async function submitArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!articleBody.trim()) return;
    setArticleSubmitting(true);
    try {
      const res = await fetch('/api/admin/office/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          office_slug: selectedSlug,
          type: articleType,
          title: articleTitle.trim() || null,
          subtitle: articleSubtitle.trim() || null,
          body: articleBody.trim(),
          visibility: articleVisibility,
          status: 'PUBLISHED',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setArticleTitle('');
      setArticleSubtitle('');
      setArticleBody('');
      await loadContent(selectedSlug);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setArticleSubmitting(false);
    }
  }

  async function submitMeta(e: React.FormEvent) {
    e.preventDefault();
    setMetaSubmitting(true);
    setMetaMessage('');
    try {
      const res = await fetch('/api/admin/office', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedSlug,
          name: metaName,
          mandate: metaMandate || null,
          tagline: metaTagline || null,
          theme_slug: metaTheme,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setMetaMessage('Office updated.');
      await loadOffices();
    } catch (err) {
      setMetaMessage(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setMetaSubmitting(false);
    }
  }

  async function deleteContent(id: string) {
    if (!confirm('Delete this content?')) return;
    try {
      const res = await fetch(`/api/admin/office/content?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      await loadContent(selectedSlug);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    }
  }

  async function respondToAppointment(
    id: string,
    status: 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED'
  ) {
    setAppointmentActionId(id);
    try {
      const res = await fetch('/api/admin/office/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      await loadAppointments(selectedSlug);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setAppointmentActionId(null);
    }
  }

  async function updateCampusEntity(
    entity: 'zone' | 'building' | 'division',
    id: string,
    patch: Record<string, unknown>
  ) {
    setCampusActionId(id);
    try {
      const res = await fetch('/api/admin/campus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, id, ...patch }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      await loadCampus();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setCampusActionId(null);
    }
  }

  async function assignOfficeToDivision(officeSlug: string, divisionId: string | null) {
    setCampusActionId(officeSlug);
    try {
      const res = await fetch('/api/admin/campus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ office_slug: officeSlug, division_id: divisionId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      await loadCampus();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setCampusActionId(null);
    }
  }

  async function createGrant() {
    if (!newGranteeEmail.trim()) {
      alert('Grantee email is required.');
      return;
    }
    setNewGrantSubmitting(true);
    try {
      const res = await fetch('/api/admin/office/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          office_slug: selectedSlug,
          grantee_email: newGranteeEmail.trim(),
          grantee_name: newGranteeName.trim() || null,
          scope: newGrantScope,
          reason: newGrantReason.trim() || null,
          expires_at: newGrantExpiresAt ? new Date(newGrantExpiresAt).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setNewGranteeEmail('');
      setNewGranteeName('');
      setNewGrantReason('');
      setNewGrantExpiresAt('');
      setNewGrantScope('INTERNAL');
      await loadPermissions(selectedSlug);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setNewGrantSubmitting(false);
    }
  }

  async function revokeGrant(id: string) {
    if (!confirm('Revoke this grant?')) return;
    setPermissionActionId(id);
    try {
      const res = await fetch(`/api/admin/office/permissions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      await loadPermissions(selectedSlug);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setPermissionActionId(null);
    }
  }

  async function addMember() {
    if (!newMemberAuthorId) {
      alert('Select an author.');
      return;
    }
    setNewMemberSubmitting(true);
    try {
      const res = await fetch('/api/admin/office/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          office_slug: selectedSlug,
          author_id: newMemberAuthorId,
          role: newMemberRole,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      setNewMemberAuthorId('');
      setNewMemberRole('VIEWER');
      await loadMembers(selectedSlug);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setNewMemberSubmitting(false);
    }
  }

  async function updateMember(
    id: string,
    patch: { role?: 'VIEWER' | 'EDITOR' | 'MANAGER'; status?: 'ACTIVE' | 'ENDED' | 'SUSPENDED' }
  ) {
    setMemberActionId(id);
    try {
      const res = await fetch('/api/admin/office/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      await loadMembers(selectedSlug);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setMemberActionId(null);
    }
  }

  async function removeMember(id: string) {
    if (!confirm('Remove this member from the office?')) return;
    setMemberActionId(id);
    try {
      const res = await fetch(`/api/admin/office/members?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      await loadMembers(selectedSlug);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setMemberActionId(null);
    }
  }

  async function updateCorrespondence(
    id: string,
    patch: { status?: 'UNREAD' | 'READ' | 'ARCHIVED'; important?: boolean }
  ) {
    setCorrespondenceActionId(id);
    try {
      const res = await fetch('/api/admin/office/correspondence', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? 'Failed.');
      await loadCorrespondence(selectedSlug);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setCorrespondenceActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Office selector */}
      <div className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Office Desk
            </h2>
            <p className="mt-1 text-[11px] text-gray-400">
              Configure office metadata, theme, and content. Select an office below.
            </p>
          </div>
          <button
            onClick={() => void loadOffices()}
            disabled={loading}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 disabled:opacity-40"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white outline-none"
        >
          {offices.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.office_number ? `${o.office_number} · ` : ''}
              {o.name}
              {o.assignment?.author?.name ? ` — ${o.assignment.author.name}` : ' — Vacant'}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          {/* Office metadata */}
          <form
            onSubmit={submitMeta}
            className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-4"
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Office Metadata
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Office Name">
                <input
                  value={metaName}
                  onChange={(e) => setMetaName(e.target.value)}
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </Field>

              <Field label="Theme">
                <select
                  value={metaTheme}
                  onChange={(e) => setMetaTheme(e.target.value)}
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                >
                  {APPROVED_THEMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tagline" full>
                <input
                  value={metaTagline}
                  onChange={(e) => setMetaTagline(e.target.value)}
                  placeholder="e.g. Building Institutions. Building Generations."
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </Field>

              <Field label="Mandate" full>
                <textarea
                  rows={3}
                  value={metaMandate}
                  onChange={(e) => setMetaMandate(e.target.value)}
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </Field>
            </div>

            {metaMessage && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                {metaMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={metaSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider rounded"
            >
              {metaSubmitting ? 'Saving…' : 'Save Office'}
            </button>
          </form>

          {/* Appointments */}
          <div className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                Appointments ({appointments.filter((a) => a.status === 'PENDING').length} pending / {appointments.length} total)
              </h3>
              <button
                onClick={() => void loadAppointments(selectedSlug)}
                disabled={appointmentsLoading}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 disabled:opacity-40"
              >
                {appointmentsLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {appointmentsError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {appointmentsError}
              </div>
            )}

            {appointments.length === 0 ? (
              <p className="text-xs text-gray-500">No appointment requests yet.</p>
            ) : (
              <ul className="space-y-2">
                {appointments.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-gray-800 bg-[#070b19] p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {a.requester_name}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              a.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : a.status === 'ACCEPTED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : a.status === 'DECLINED'
                                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                    : 'bg-gray-500/20 text-gray-300 border-gray-500/40'
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-gray-300">
                          {a.purpose}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-500 truncate">
                          {a.requester_email}
                          {a.requester_organization ? ` · ${a.requester_organization}` : ''}
                          {a.requester_designation ? ` · ${a.requester_designation}` : ''}
                        </p>
                        {(a.preferred_date || a.preferred_time) && (
                          <p className="mt-0.5 text-[10px] text-gray-500">
                            Preferred: {a.preferred_date || '—'} {a.preferred_time || ''} · {a.duration_minutes} min
                          </p>
                        )}
                        {a.message && (
                          <p className="mt-1 text-[11px] text-gray-400 italic">
                            "{a.message}"
                          </p>
                        )}
                      </div>

                      {a.status === 'PENDING' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => void respondToAppointment(a.id, 'ACCEPTED')}
                            disabled={appointmentActionId === a.id}
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold uppercase hover:bg-emerald-500/30 disabled:opacity-40"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => void respondToAppointment(a.id, 'DECLINED')}
                            disabled={appointmentActionId === a.id}
                            className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[10px] font-bold uppercase hover:bg-red-500/30 disabled:opacity-40"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {a.status === 'ACCEPTED' && (
                        <div className="shrink-0">
                          <button
                            onClick={() => void respondToAppointment(a.id, 'COMPLETED')}
                            disabled={appointmentActionId === a.id}
                            className="px-2 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/40 rounded text-[10px] font-bold uppercase hover:bg-gray-500/30 disabled:opacity-40"
                          >
                            Mark Completed
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Delegated Access */}
          <div className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                Delegated Access ({permissions.filter((p) => p.status === 'ACTIVE').length} active)
              </h3>
              <button
                onClick={() => void loadPermissions(selectedSlug)}
                disabled={permissionsLoading}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 disabled:opacity-40"
              >
                {permissionsLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {permissionsError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {permissionsError}
              </div>
            )}

            <div className="rounded-lg border border-gray-800 bg-[#070b19] p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Grant access
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="email"
                  value={newGranteeEmail}
                  onChange={(e) => setNewGranteeEmail(e.target.value)}
                  placeholder="Grantee email *"
                  className="bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
                <input
                  type="text"
                  value={newGranteeName}
                  onChange={(e) => setNewGranteeName(e.target.value)}
                  placeholder="Grantee name (optional)"
                  className="bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
                <select
                  value={newGrantScope}
                  onChange={(e) => setNewGrantScope(e.target.value as 'INTERNAL' | 'RESTRICTED')}
                  className="bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                >
                  <option value="INTERNAL">INTERNAL</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                </select>
                <input
                  type="datetime-local"
                  value={newGrantExpiresAt}
                  onChange={(e) => setNewGrantExpiresAt(e.target.value)}
                  placeholder="Expires at (optional)"
                  className="bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
                <input
                  type="text"
                  value={newGrantReason}
                  onChange={(e) => setNewGrantReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="sm:col-span-2 bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => void createGrant()}
                  disabled={newGrantSubmitting || !newGranteeEmail.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider rounded"
                >
                  {newGrantSubmitting ? 'Granting…' : 'Grant Access'}
                </button>
              </div>
              <p className="text-[9px] text-gray-500">
                Leave Expires At empty for perpetual access.
              </p>
            </div>

            {permissions.length === 0 ? (
              <p className="text-xs text-gray-500">No grants yet.</p>
            ) : (
              <ul className="space-y-2">
                {permissions.map((p) => (
                  <li
                    key={p.id}
                    className={`rounded-lg border p-3 ${
                      p.status === 'ACTIVE'
                        ? 'border-gray-800 bg-[#070b19]'
                        : 'border-gray-900 bg-[#070b19]/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {p.grantee_name || p.grantee_email}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              p.scope === 'RESTRICTED'
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            }`}
                          >
                            {p.scope}
                          </span>
                          {p.status !== 'ACTIVE' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-500/20 text-gray-300 border border-gray-500/40 px-1.5 py-0.5 rounded">
                              {p.status}
                            </span>
                          )}
                        </div>
                        {p.grantee_name && (
                          <p className="mt-0.5 text-[10px] text-gray-500 truncate">
                            {p.grantee_email}
                          </p>
                        )}
                        {p.reason && (
                          <p className="mt-0.5 text-[10px] text-gray-400 italic">
                            {p.reason}
                          </p>
                        )}
                        <p className="mt-0.5 text-[9px] text-gray-500">
                          {p.expires_at
                            ? `Expires ${new Date(p.expires_at).toLocaleString()}`
                            : 'Perpetual'}
                        </p>
                      </div>

                      {p.status === 'ACTIVE' && (
                        <div className="shrink-0">
                          <button
                            onClick={() => void revokeGrant(p.id)}
                            disabled={permissionActionId === p.id}
                            className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[10px] font-bold uppercase hover:bg-red-500/30 disabled:opacity-40"
                          >
                            Revoke
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Audit */}
          <div className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                Audit Log ({auditEvents.length})
              </h3>
              <div className="flex gap-2 items-center">
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="bg-[#070b19] border border-gray-800 p-1.5 text-[10px] rounded text-white"
                >
                  <option value="">All events</option>
                  <option value="CONTENT_CREATED">Content created</option>
                  <option value="CONTENT_DELETED">Content deleted</option>
                  <option value="GRANT_CREATED">Grant created</option>
                  <option value="GRANT_REVOKED">Grant revoked</option>
                  <option value="MEMBER_ADDED">Member added</option>
                  <option value="MEMBER_REMOVED">Member removed</option>
                  <option value="OFFICE_UPDATED">Office updated</option>
                  <option value="THEME_CHANGED">Theme changed</option>
                  <option value="ASSIGNMENT_CHANGED">Assignment changed</option>
                </select>
                <button
                  onClick={() => void loadAudit(selectedSlug, auditFilter || undefined)}
                  disabled={auditLoading}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 disabled:opacity-40"
                >
                  {auditLoading ? 'Loading…' : 'Refresh'}
                </button>
              </div>
            </div>

            {auditError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {auditError}
              </div>
            )}

            {auditEvents.length === 0 ? (
              <p className="text-xs text-gray-500">No audit events yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {auditEvents.map((e) => (
                  <li
                    key={e.id}
                    className="rounded border border-gray-800 bg-[#070b19] p-2.5 text-[11px] flex items-start justify-between gap-3 flex-wrap"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-800 text-gray-300 border border-gray-700 px-1.5 py-0.5 rounded">
                          {e.event_type}
                        </span>
                        {e.actor_role && (
                          <span className="text-[9px] uppercase tracking-wider text-gray-500">
                            by {e.actor_role}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-gray-300 truncate">
                        {e.summary ?? '(no summary)'}
                      </p>
                      {e.actor_email && (
                        <p className="mt-0.5 text-[10px] text-gray-500 truncate">
                          {e.actor_email}
                          {e.ip ? ` · ${e.ip}` : ''}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] font-mono text-gray-500">
                      {new Date(e.occurred_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Members */}
          <div className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                Members ({members.filter((m) => m.status === 'ACTIVE').length} active)
              </h3>
              <button
                onClick={() => void loadMembers(selectedSlug)}
                disabled={membersLoading}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 disabled:opacity-40"
              >
                {membersLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {membersError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {membersError}
              </div>
            )}

            <div className="rounded-lg border border-gray-800 bg-[#070b19] p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Add member
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={newMemberAuthorId}
                  onChange={(e) => setNewMemberAuthorId(e.target.value)}
                  placeholder="Author UUID"
                  className="flex-1 bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white font-mono"
                />
                <select
                  value={newMemberRole}
                  onChange={(e) =>
                    setNewMemberRole(e.target.value as 'VIEWER' | 'EDITOR' | 'MANAGER')
                  }
                  className="bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                >
                  <option value="VIEWER">VIEWER</option>
                  <option value="EDITOR">EDITOR</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
                <button
                  onClick={() => void addMember()}
                  disabled={newMemberSubmitting || !newMemberAuthorId}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider rounded"
                >
                  {newMemberSubmitting ? 'Adding…' : 'Add'}
                </button>
              </div>
              <p className="text-[9px] text-gray-500">
                Copy the author UUID from the Authors tab or from the Command Centre.
              </p>
            </div>

            {members.length === 0 ? (
              <p className="text-xs text-gray-500">No members yet.</p>
            ) : (
              <ul className="space-y-2">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className={`rounded-lg border p-3 ${
                      m.status === 'ACTIVE'
                        ? 'border-gray-800 bg-[#070b19]'
                        : 'border-gray-900 bg-[#070b19]/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {m.author?.name ?? 'Unknown author'}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              m.role === 'MANAGER'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : m.role === 'EDITOR'
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : 'bg-gray-500/20 text-gray-300 border-gray-500/40'
                            }`}
                          >
                            {m.role}
                          </span>
                          {m.status !== 'ACTIVE' && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded">
                              {m.status}
                            </span>
                          )}
                        </div>
                        {m.author?.email && (
                          <p className="mt-0.5 text-[10px] text-gray-500 truncate">
                            {m.author.email}
                            {m.author.designation ? ` · ${m.author.designation}` : ''}
                          </p>
                        )}
                      </div>

                      {m.status === 'ACTIVE' && (
                        <div className="flex gap-1 shrink-0">
                          <select
                            value={m.role}
                            onChange={(e) =>
                              void updateMember(m.id, {
                                role: e.target.value as 'VIEWER' | 'EDITOR' | 'MANAGER',
                              })
                            }
                            disabled={memberActionId === m.id}
                            className="bg-[#030611] border border-gray-800 p-1 text-[10px] rounded text-white"
                          >
                            <option value="VIEWER">VIEWER</option>
                            <option value="EDITOR">EDITOR</option>
                            <option value="MANAGER">MANAGER</option>
                          </select>
                          <button
                            onClick={() => void removeMember(m.id)}
                            disabled={memberActionId === m.id}
                            className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[10px] font-bold uppercase hover:bg-red-500/30 disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Correspondence */}
          <div className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                Correspondence ({correspondence.filter((c) => c.status === 'UNREAD').length} unread / {correspondence.length} total)
              </h3>
              <button
                onClick={() => void loadCorrespondence(selectedSlug)}
                disabled={correspondenceLoading}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 disabled:opacity-40"
              >
                {correspondenceLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {correspondenceError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {correspondenceError}
              </div>
            )}

            {correspondence.length === 0 ? (
              <p className="text-xs text-gray-500">No correspondence yet.</p>
            ) : (
              <ul className="space-y-2">
                {correspondence.map((c) => (
                  <li
                    key={c.id}
                    className={`rounded-lg border p-3 space-y-2 ${
                      c.status === 'UNREAD'
                        ? 'border-amber-500/40 bg-amber-500/[0.04]'
                        : 'border-gray-800 bg-[#070b19]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {c.important && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded">
                              Important
                            </span>
                          )}
                          <span className="text-xs font-bold text-white">{c.subject}</span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              c.status === 'UNREAD'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : c.status === 'READ'
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : 'bg-gray-500/20 text-gray-300 border-gray-500/40'
                            }`}
                          >
                            {c.status}
                          </span>
                          {c.category && (
                            <span className="text-[9px] uppercase tracking-wider text-gray-400">
                              · {c.category}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] text-gray-500 truncate">
                          {c.sender_name} · {c.sender_email}
                          {c.sender_organization ? ` · ${c.sender_organization}` : ''}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400 whitespace-pre-wrap line-clamp-3">
                          {c.body}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 shrink-0">
                        {c.status === 'UNREAD' && (
                          <button
                            onClick={() => void updateCorrespondence(c.id, { status: 'READ' })}
                            disabled={correspondenceActionId === c.id}
                            className="px-2 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-bold uppercase hover:bg-cyan-500/30 disabled:opacity-40"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => void updateCorrespondence(c.id, { important: !c.important })}
                          disabled={correspondenceActionId === c.id}
                          className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[10px] font-bold uppercase hover:bg-red-500/30 disabled:opacity-40"
                        >
                          {c.important ? 'Unmark' : 'Important'}
                        </button>
                        {c.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => void updateCorrespondence(c.id, { status: 'ARCHIVED' })}
                            disabled={correspondenceActionId === c.id}
                            className="px-2 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/40 rounded text-[10px] font-bold uppercase hover:bg-gray-500/30 disabled:opacity-40"
                          >
                            Archive
                          </button>
                        )}
                        <a
                          href={`mailto:${c.sender_email}?subject=${encodeURIComponent(
                            `Re: ${c.subject}`
                          )}`}
                          className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold uppercase hover:bg-amber-500/30 text-center"
                        >
                          Reply
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Campus Hierarchy */}
          <div className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                  Campus Hierarchy
                </h3>
                <p className="mt-1 text-[11px] text-gray-400">
                  Zones, buildings, and divisions for the public /campus page.
                </p>
              </div>
              <button
                onClick={() => void loadCampus()}
                disabled={campusLoading}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 disabled:opacity-40"
              >
                {campusLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {campusError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {campusError}
              </div>
            )}

            {/* Office → Division assignment */}
            <div className="rounded-lg border border-gray-800 bg-[#070b19] p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Assign office to a division
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {campusOffices.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between gap-2 rounded border border-gray-800 bg-[#030611] px-2 py-1.5"
                  >
                    <div className="min-w-0">
                      <span className="text-[11px] text-gray-200 truncate block">
                        {o.name}
                      </span>
                      {o.office_number && (
                        <span className="text-[9px] text-gray-500">{o.office_number}</span>
                      )}
                    </div>
                    <select
                      value={o.division_id ?? ''}
                      onChange={(e) =>
                        void assignOfficeToDivision(o.slug, e.target.value || null)
                      }
                      disabled={campusActionId === o.slug}
                      className="shrink-0 bg-[#070b19] border border-gray-800 p-1 text-[10px] rounded text-white"
                    >
                      <option value="">— None —</option>
                      {campusDivisions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone tree */}
            <div className="space-y-2">
              {campusZones.map((z) => {
                const zBuildings = campusBuildings.filter((b) => b.zone_id === z.id);
                const isExpanded = expandedZoneId === z.id;
                return (
                  <div
                    key={z.id}
                    className="rounded-lg border border-gray-800 bg-[#070b19]"
                  >
                    <button
                      onClick={() => setExpandedZoneId(isExpanded ? null : z.id)}
                      className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-white/[0.02] transition rounded-lg"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{z.name}</span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              z.status === 'PUBLISHED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : z.status === 'DRAFT'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-gray-500/20 text-gray-300 border-gray-500/40'
                            }`}
                          >
                            {z.status}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            {zBuildings.length} building{zBuildings.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        {z.description && (
                          <p className="mt-1 text-[10px] text-gray-400 truncate">
                            {z.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-amber-400 text-lg">
                        {isExpanded ? '▾' : '▸'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-800 p-3 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            defaultValue={z.name}
                            onBlur={(e) => {
                              if (e.target.value !== z.name) {
                                void updateCampusEntity('zone', z.id, { name: e.target.value });
                              }
                            }}
                            className="bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                            placeholder="Zone name"
                          />
                          <select
                            defaultValue={z.status}
                            onChange={(e) =>
                              void updateCampusEntity('zone', z.id, { status: e.target.value })
                            }
                            className="bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                          >
                            <option value="PUBLISHED">PUBLISHED</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                          <textarea
                            defaultValue={z.description ?? ''}
                            onBlur={(e) => {
                              if (e.target.value !== (z.description ?? '')) {
                                void updateCampusEntity('zone', z.id, {
                                  description: e.target.value || null,
                                });
                              }
                            }}
                            rows={2}
                            placeholder="Description"
                            className="sm:col-span-2 bg-[#030611] border border-gray-800 p-2 text-xs rounded text-white"
                          />
                        </div>

                        {zBuildings.length === 0 ? (
                          <p className="text-[10px] text-gray-500 italic">
                            No buildings in this zone yet.
                          </p>
                        ) : (
                          <div className="space-y-2 pl-3 border-l border-gray-800">
                            {zBuildings.map((b) => {
                              const bDivisions = campusDivisions.filter(
                                (d) => d.building_id === b.id
                              );
                              return (
                                <div
                                  key={b.id}
                                  className="rounded border border-gray-800 bg-[#030611] p-2"
                                >
                                  <span className="text-[11px] font-bold text-gray-200 block">
                                    {b.name}
                                  </span>
                                  {bDivisions.length > 0 && (
                                    <div className="mt-1 space-y-1 pl-3 border-l border-gray-800">
                                      {bDivisions.map((d) => (
                                        <div
                                          key={d.id}
                                          className="flex items-center gap-2 text-[10px]"
                                        >
                                          {d.icon && (
                                            <span className="text-amber-400">{d.icon}</span>
                                          )}
                                          <span className="text-gray-300">{d.name}</span>
                                          <span className="text-gray-500 ml-auto">
                                            {campusOffices.filter((o) => o.division_id === d.id).length} office(s)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <form
            onSubmit={submitNote}
            className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-3"
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Add Note (short-form, tweet-like)
            </h3>

            <Field label="Title (optional)">
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
              />
            </Field>

            <Field label="Body">
              <textarea
                rows={3}
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                required
                className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
              />
            </Field>

            <Field label="Tags (comma separated)">
              <input
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
                placeholder="Institution Building, Leadership"
                className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
              />
            </Field>

            <Field label="Visibility">
              <select
                value={noteVisibility}
                onChange={(e) =>
                  setNoteVisibility(e.target.value as 'PUBLIC' | 'INTERNAL' | 'RESTRICTED')
                }
                className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
              >
                <option value="PUBLIC">Public — visible to everyone</option>
                <option value="INTERNAL">Internal — Command Centre admins only</option>
                <option value="RESTRICTED">Restricted — founder only</option>
              </select>
            </Field>

            <button
              type="submit"
              disabled={noteSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider rounded"
            >
              {noteSubmitting ? 'Publishing…' : 'Publish Note'}
            </button>
          </form>

          {/* Long-form */}
          <form
            onSubmit={submitArticle}
            className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-3"
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Add Long-form Content
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Type">
                <select
                  value={articleType}
                  onChange={(e) => setArticleType(e.target.value)}
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                >
                  {CONTENT_TYPES.filter((t) => t !== 'NOTE').map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Title">
                <input
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </Field>

              <Field label="Subtitle" full>
                <input
                  value={articleSubtitle}
                  onChange={(e) => setArticleSubtitle(e.target.value)}
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                />
              </Field>

              <Field label="Visibility" full>
                <select
                  value={articleVisibility}
                  onChange={(e) =>
                    setArticleVisibility(e.target.value as 'PUBLIC' | 'INTERNAL' | 'RESTRICTED')
                  }
                  className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white"
                >
                  <option value="PUBLIC">Public — visible to everyone</option>
                  <option value="INTERNAL">Internal — Command Centre admins only</option>
                  <option value="RESTRICTED">Restricted — founder only</option>
                </select>
              </Field>
            </div>

            <Field label="Body">
              <textarea
                rows={8}
                value={articleBody}
                onChange={(e) => setArticleBody(e.target.value)}
                required
                className="w-full bg-[#070b19] border border-gray-800 p-2 text-xs rounded text-white font-mono"
              />
            </Field>

            <button
              type="submit"
              disabled={articleSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider rounded"
            >
              {articleSubmitting ? 'Publishing…' : 'Publish'}
            </button>
          </form>

          {/* Content list */}
          <div className="rounded-xl border border-white/10 bg-[#030611] p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                Content ({content.length})
              </h3>
              <button
                onClick={() => void loadContent(selectedSlug)}
                disabled={contentLoading}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 disabled:opacity-40"
              >
                {contentLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {contentError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {contentError}
              </div>
            )}

            {content.length === 0 ? (
              <p className="text-xs text-gray-500">No content yet.</p>
            ) : (
              <ul className="space-y-2">
                {content.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-gray-800 bg-[#070b19] p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                          {c.type}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-gray-500">
                          {c.status}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            c.visibility === 'PUBLIC'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : c.visibility === 'INTERNAL'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : 'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}
                        >
                          {c.visibility}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold text-white truncate">
                        {c.title || c.body.slice(0, 60)}
                      </p>
                    </div>
                    <button
                      onClick={() => void deleteContent(c.id)}
                      className="shrink-0 px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[10px] font-bold uppercase hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}