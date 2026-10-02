'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppointmentRequestModal from '@/components/AppointmentRequestModal';
import CorrespondenceModal from '@/components/CorrespondenceModal';

// ---------------------------------------------------------------------------
// The 10 approved institutional themes, defined in one place so the public
// page and the Office Desk agree on colour values.
// ---------------------------------------------------------------------------

const THEMES: Record<
  string,
  { bg: string; surface: string; border: string; accent: string; accentSoft: string; text: string; textMuted: string; heading: string }
> = {
  'institutional-ink': {
    bg: '#05070f',
    surface: '#0b0f1c',
    border: 'rgba(255,255,255,0.10)',
    accent: '#f5c542',
    accentSoft: 'rgba(245,197,66,0.10)',
    text: '#e8e9ec',
    textMuted: 'rgba(232,233,236,0.55)',
    heading: '#ffffff',
  },
  'founders-gold': {
    bg: '#0b0805',
    surface: '#14100a',
    border: 'rgba(245,197,66,0.18)',
    accent: '#e0a83a',
    accentSoft: 'rgba(224,168,58,0.12)',
    text: '#f2e9d2',
    textMuted: 'rgba(242,233,210,0.55)',
    heading: '#fdf6e3',
  },
  'civic-emerald': {
    bg: '#030d09',
    surface: '#0a1a13',
    border: 'rgba(52,211,153,0.16)',
    accent: '#34d399',
    accentSoft: 'rgba(52,211,153,0.10)',
    text: '#d7f0e4',
    textMuted: 'rgba(215,240,228,0.55)',
    heading: '#ffffff',
  },
  'constitutional-navy': {
    bg: '#030611',
    surface: '#0a1024',
    border: 'rgba(96,165,250,0.16)',
    accent: '#60a5fa',
    accentSoft: 'rgba(96,165,250,0.10)',
    text: '#dbe6fb',
    textMuted: 'rgba(219,230,251,0.55)',
    heading: '#ffffff',
  },
  'archive-parchment': {
    bg: '#f5efe1',
    surface: '#faf6ec',
    border: 'rgba(120,90,40,0.18)',
    accent: '#8a6a1e',
    accentSoft: 'rgba(138,106,30,0.10)',
    text: '#2b2416',
    textMuted: 'rgba(43,36,22,0.60)',
    heading: '#1a1408',
  },
  'research-slate': {
    bg: '#0c1016',
    surface: '#141a22',
    border: 'rgba(148,163,184,0.18)',
    accent: '#94a3b8',
    accentSoft: 'rgba(148,163,184,0.10)',
    text: '#dbe2ea',
    textMuted: 'rgba(219,226,234,0.55)',
    heading: '#ffffff',
  },
  'editorial-violet': {
    bg: '#0a0714',
    surface: '#140d24',
    border: 'rgba(167,139,250,0.18)',
    accent: '#a78bfa',
    accentSoft: 'rgba(167,139,250,0.10)',
    text: '#e6dffb',
    textMuted: 'rgba(230,223,251,0.55)',
    heading: '#ffffff',
  },
  'technology-cyan': {
    bg: '#031015',
    surface: '#08202a',
    border: 'rgba(34,211,238,0.18)',
    accent: '#22d3ee',
    accentSoft: 'rgba(34,211,238,0.10)',
    text: '#d6f4fb',
    textMuted: 'rgba(214,244,251,0.55)',
    heading: '#ffffff',
  },
  'policy-maroon': {
    bg: '#0e0506',
    surface: '#1a0b0d',
    border: 'rgba(251,113,133,0.16)',
    accent: '#fb7185',
    accentSoft: 'rgba(251,113,133,0.10)',
    text: '#fbdde2',
    textMuted: 'rgba(251,221,226,0.55)',
    heading: '#ffffff',
  },
  'heritage-cream': {
    bg: '#0d0b06',
    surface: '#1a160d',
    border: 'rgba(252,211,77,0.16)',
    accent: '#fcd34d',
    accentSoft: 'rgba(252,211,77,0.10)',
    text: '#f5eccf',
    textMuted: 'rgba(245,236,207,0.55)',
    heading: '#ffffff',
  },
};

type Office = {
  id: string;
  slug: string;
  name: string;
  level: string;
  office_number: string | null;
  mandate: string | null;
  responsibilities: string[] | null;
  facilities: string[] | null;
  tagline: string | null;
  hero_quote: string | null;
  hero_image_url: string | null;
  emblem_url: string | null;
  theme_slug: string;
  status: string;
  display_order: number;
};

type Assignment = {
  id: string;
  title: string;
  subtitle: string | null;
  mandate_statement: string | null;
  status: string;
  started_at: string;
};

type Author = {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  bio: string | null;
  short_bio: string | null;
  long_bio: string | null;
  headline: string | null;
  designation: string | null;
  organization: string | null;
  expertise: string[] | null;
  interests: string[] | null;
  languages: string[] | null;
  linkedin_url: string | null;
  website_url: string | null;
  academic_credentials: string | null;
  institutional_affiliation: string | null;
};

type ContentRow = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  body: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
};

type ApiResponse = {
  success: boolean;
  office: Office;
  assignment: Assignment | null;
  author: Author | null;
  content: ContentRow[];
};

export default function OfficePage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCorrespondenceModal, setShowCorrespondenceModal] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/office?slug=${encodeURIComponent(slug)}`,
          { cache: 'no-store' }
        );
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const json = (await res.json()) as ApiResponse;
        if (!res.ok || !json.success) {
          setNotFound(true);
          return;
        }
        setData(json);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070f] text-white flex items-center justify-center p-6">
        <div className="text-xs uppercase tracking-[0.3em] text-amber-400 animate-pulse">
          Entering office…
        </div>
      </main>
    );
  }

  if (notFound || !data?.office) {
    return (
      <main className="min-h-screen bg-[#05070f] text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-black uppercase tracking-wider text-amber-400">
            Office not found
          </h1>
          <p className="text-xs text-white/50">
            The office you&apos;re looking for doesn&apos;t exist or has been archived.
          </p>
          <Link
            href="/leadership-network"
            className="inline-block rounded-lg bg-white/10 border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20"
          >
            ← Back to Leadership Network
          </Link>
        </div>
      </main>
    );
  }

  const theme = THEMES[data.office.theme_slug] ?? THEMES['institutional-ink'];
  const isVacant = data.office.status === 'VACANT' || !data.assignment || !data.author;
  const notes = data.content.filter((c) => c.type === 'NOTE');
  const articles = data.content.filter((c) => c.type === 'ARTICLE');
  const essays = data.content.filter((c) => c.type === 'ESSAY');
  const proposals = data.content.filter((c) => c.type === 'PROPOSAL');
  const speeches = data.content.filter((c) => c.type === 'SPEECH');
  const others = data.content.filter(
    (c) => !['NOTE', 'ARTICLE', 'ESSAY', 'PROPOSAL', 'SPEECH'].includes(c.type)
  );

  return (
    <main
      className="min-h-screen font-sans"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* Top bar */}
      <div
        className="border-b"
        style={{ borderColor: theme.border, backgroundColor: theme.bg }}
      >
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/leadership-network"
            className="text-[10px] font-bold uppercase tracking-[0.28em]"
            style={{ color: theme.accent }}
          >
            ← People &amp; Youth · Leadership Network
          </Link>
          <span
            className="text-[10px] font-mono uppercase tracking-[0.2em]"
            style={{ color: theme.textMuted }}
          >
            {data.office.office_number ?? data.office.level}
          </span>
        </div>
      </div>

      {/* Hero image banner */}
      {data.office.hero_image_url && (
        <div
          className="relative w-full overflow-hidden"
          style={{ height: '260px', backgroundColor: theme.surface }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.office.hero_image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${theme.bg}00, ${theme.bg} 85%)`,
            }}
          />
        </div>
      )}

      {/* Hero */}
      <header
        className="border-b"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 items-center">
            {/* Portrait */}
            <div className="mx-auto md:mx-0">
              <div
                className="relative w-52 h-64 sm:w-60 sm:h-72 overflow-hidden rounded-sm"
                style={{ border: `1px solid ${theme.border}` }}
              >
                {data.author?.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.author.photo_url}
                    alt={data.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: theme.textMuted, backgroundColor: theme.accentSoft }}
                  >
                    Portrait forthcoming
                  </div>
                )}
                <div
                  className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                  style={{
                    background: `linear-gradient(to top, ${theme.bg}, transparent)`,
                  }}
                />
              </div>
            </div>

            {/* Office identity */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                {data.office.emblem_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.office.emblem_url}
                    alt=""
                    className="h-8 w-8 object-contain"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.4))' }}
                  />
                )}
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.32em]"
                  style={{ color: theme.accent }}
                >
                  {data.office.name}
                </p>
              </div>

              {isVacant ? (
                <>
                  <h1
                    className="text-4xl sm:text-5xl font-black tracking-tight"
                    style={{ color: theme.heading }}
                  >
                    Vacant
                  </h1>
                  <p
                    className="mt-3 text-sm"
                    style={{ color: theme.textMuted }}
                  >
                    Awaiting appointment
                  </p>
                </>
              ) : (
                <>
                  <h1
                    className="text-4xl sm:text-5xl font-black tracking-tight"
                    style={{ color: theme.heading }}
                  >
                    {data.author!.name}
                  </h1>
                  {data.assignment?.subtitle && (
                    <p
                      className="mt-2 text-base sm:text-lg font-medium"
                      style={{ color: theme.accent }}
                    >
                      {data.assignment.subtitle}
                    </p>
                  )}
                  {data.author!.headline && (
                    <p
                      className="mt-4 text-sm sm:text-base leading-relaxed max-w-xl"
                      style={{ color: theme.text }}
                    >
                      {data.author!.headline}
                    </p>
                  )}
                </>
              )}

              {data.office.tagline && (
                <p
                  className="mt-6 text-lg sm:text-xl italic font-serif max-w-xl"
                  style={{ color: theme.accent }}
                >
                  &ldquo;{data.office.tagline}&rdquo;
                </p>
              )}

              {data.office.hero_quote && (
                <blockquote
                  className="mt-4 border-l-2 pl-4 text-base sm:text-lg font-serif italic max-w-2xl"
                  style={{
                    borderColor: theme.accent,
                    color: theme.heading,
                  }}
                >
                  &ldquo;{data.office.hero_quote}&rdquo;
                </blockquote>
              )}

              {data.office.mandate && (
                <p
                  className="mt-6 text-sm leading-relaxed max-w-2xl"
                  style={{ color: theme.textMuted }}
                >
                  {data.office.mandate}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowAppointmentModal(true)}
                  className="rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.bg,
                  }}
                >
                  Request Appointment
                </button>
                <button
                  onClick={() => setShowCorrespondenceModal(true)}
                  className="rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wider border"
                  style={{
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                >
                  Contact the Office
                </button>
                <Link
                  href="/leadership-network"
                  className="rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wider border"
                  style={{
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                >
                  All Offices
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-14 space-y-16">

        {/* Mandate statement from assignment */}
        {data.assignment?.mandate_statement && !isVacant && (
          <section
            className="rounded-lg border p-6 sm:p-8"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.accentSoft,
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.28em] mb-3"
              style={{ color: theme.accent }}
            >
              Mandate Statement
            </p>
            <p
              className="text-sm sm:text-base leading-relaxed font-serif italic"
              style={{ color: theme.heading }}
            >
              {data.assignment.mandate_statement}
            </p>
          </section>
        )}

        {/* Facilities */}
        {data.office.facilities && data.office.facilities.length > 0 && (
          <section>
            <SectionHeading theme={theme} eyebrow="Dedicated Facilities">
              The Office
            </SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {data.office.facilities.map((f) => (
                <div
                  key={f}
                  className="rounded-md border p-4 text-xs"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    color: theme.text,
                  }}
                >
                  {f}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About — long bio */}
        {!isVacant && (data.author!.long_bio || data.author!.bio) && (
          <section>
            <SectionHeading theme={theme} eyebrow="About">
              The Officeholder
            </SectionHeading>
            <div
              className="rounded-lg border p-6 sm:p-8 space-y-4 text-sm leading-relaxed"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.text,
              }}
            >
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {data.author!.long_bio || data.author!.bio}
              </p>

              {(data.author!.designation ||
                data.author!.academic_credentials ||
                data.author!.institutional_affiliation) && (
                <div
                  className="pt-4 mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t"
                  style={{ borderColor: theme.border }}
                >
                  {data.author!.designation && (
                    <Detail theme={theme} label="Designation" value={data.author!.designation} />
                  )}
                  {data.author!.academic_credentials && (
                    <Detail theme={theme} label="Credentials" value={data.author!.academic_credentials} />
                  )}
                  {data.author!.institutional_affiliation && (
                    <Detail theme={theme} label="Affiliation" value={data.author!.institutional_affiliation} />
                  )}
                </div>
              )}

              {(data.author!.expertise?.length ||
                data.author!.interests?.length ||
                data.author!.languages?.length) && (
                <div className="pt-4 mt-4 border-t space-y-3" style={{ borderColor: theme.border }}>
                  {data.author!.expertise && data.author!.expertise.length > 0 && (
                    <TagRow theme={theme} label="Expertise" tags={data.author!.expertise} />
                  )}
                  {data.author!.interests && data.author!.interests.length > 0 && (
                    <TagRow theme={theme} label="Interests" tags={data.author!.interests} />
                  )}
                  {data.author!.languages && data.author!.languages.length > 0 && (
                    <TagRow theme={theme} label="Languages" tags={data.author!.languages} />
                  )}
                </div>
              )}

              {(data.author!.linkedin_url || data.author!.website_url) && (
                <div
                  className="pt-4 mt-4 flex flex-wrap gap-3 text-xs border-t"
                  style={{ borderColor: theme.border }}
                >
                  {data.author!.linkedin_url && (
                    <a
                      href={data.author!.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                      style={{ color: theme.accent }}
                    >
                      LinkedIn →
                    </a>
                  )}
                  {data.author!.website_url && (
                    <a
                      href={data.author!.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                      style={{ color: theme.accent }}
                    >
                      Website →
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Founder's Notes */}
        {notes.length > 0 && (
          <section>
            <SectionHeading theme={theme} eyebrow="Founder's Notes">
              Notes
            </SectionHeading>
            <div className="space-y-4">
              {notes.map((n) => (
                <article
                  key={n.id}
                  className="rounded-lg border p-5 sm:p-6"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  }}
                >
                  {n.title && (
                    <h4
                      className="text-sm font-bold mb-2"
                      style={{ color: theme.heading }}
                    >
                      {n.title}
                    </h4>
                  )}
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: theme.text }}
                  >
                    {n.body}
                  </p>
                  <div
                    className="mt-3 text-[10px] font-mono uppercase tracking-wider flex flex-wrap gap-3"
                    style={{ color: theme.textMuted }}
                  >
                    <span>{n.published_at ? new Date(n.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Draft'}</span>
                    {n.tags && n.tags.length > 0 && <span>{n.tags.join(' · ')}</span>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <ContentSection theme={theme} title="Articles" eyebrow="Long-form" items={articles} />
        )}

        {/* Essays */}
        {essays.length > 0 && (
          <ContentSection theme={theme} title="Essays" eyebrow="Reflections" items={essays} />
        )}

        {/* Proposals */}
        {proposals.length > 0 && (
          <ContentSection theme={theme} title="Proposals" eyebrow="Strategic Documents" items={proposals} />
        )}

        {/* Speeches */}
        {speeches.length > 0 && (
          <ContentSection theme={theme} title="Speeches" eyebrow="Public Addresses" items={speeches} />
        )}

        {/* Other content types */}
        {others.length > 0 && (
          <ContentSection theme={theme} title="Letters & Statements" eyebrow="Institutional Correspondence" items={others} />
        )}

        {/* Empty state for a vacant office */}
        {isVacant && (
          <section
            className="rounded-lg border p-8 text-center space-y-3"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
              borderStyle: 'dashed',
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.28em]"
              style={{ color: theme.accent }}
            >
              Vacant Office
            </p>
            <p
              className="text-sm leading-relaxed max-w-xl mx-auto"
              style={{ color: theme.textMuted }}
            >
              This office is presently vacant. Its institutional infrastructure
              and mandate remain in force. The office will be occupied when the
              institution appoints an officeholder.
            </p>
          </section>
        )}

        {/* Footer */}
        <footer
          className="pt-8 border-t text-[10px] uppercase tracking-[0.24em] flex flex-wrap justify-between gap-3"
          style={{ borderColor: theme.border, color: theme.textMuted }}
        >
          <span>People &amp; Youth · {officeFooterLabel(data.office.name)}</span>
          <Link href="/leadership-network" style={{ color: theme.accent }}>
            Return to Network
          </Link>
        </footer>
      </div>

      {showAppointmentModal && (
        <AppointmentRequestModal
          officeSlug={data.office.slug}
          officeName={data.office.name}
          accent={theme.accent}
          accentSoft={theme.accentSoft}
          border={theme.border}
          surface={theme.surface}
          heading={theme.heading}
          text={theme.text}
          textMuted={theme.textMuted}
          bg={theme.bg}
          onClose={() => setShowAppointmentModal(false)}
        />
      )}

      {showCorrespondenceModal && (
        <CorrespondenceModal
          officeSlug={data.office.slug}
          officeName={data.office.name}
          accent={theme.accent}
          accentSoft={theme.accentSoft}
          border={theme.border}
          surface={theme.surface}
          heading={theme.heading}
          text={theme.text}
          textMuted={theme.textMuted}
          bg={theme.bg}
          onClose={() => setShowCorrespondenceModal(false)}
        />
      )}
    </main>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function SectionHeading({
  theme,
  eyebrow,
  children,
}: {
  theme: { accent: string; heading: string; textMuted: string };
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.28em] mb-2"
        style={{ color: theme.accent }}
      >
        {eyebrow}
      </p>
      <h2
        className="text-2xl sm:text-3xl font-black tracking-tight"
        style={{ color: theme.heading }}
      >
        {children}
      </h2>
    </div>
  );
}

function Detail({
  theme,
  label,
  value,
}: {
  theme: { textMuted: string; text: string };
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="text-[9px] font-bold uppercase tracking-[0.24em] mb-1"
        style={{ color: theme.textMuted }}
      >
        {label}
      </p>
      <p style={{ color: theme.text }}>{value}</p>
    </div>
  );
}

function TagRow({
  theme,
  label,
  tags,
}: {
  theme: { textMuted: string; accent: string; accentSoft: string };
  label: string;
  tags: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="text-[9px] font-bold uppercase tracking-[0.24em] mr-2"
        style={{ color: theme.textMuted }}
      >
        {label}
      </span>
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-full px-2.5 py-1 text-[10px]"
          style={{
            backgroundColor: theme.accentSoft,
            color: theme.accent,
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function ContentSection({
  theme,
  title,
  eyebrow,
  items,
}: {
  theme: { accent: string; heading: string; text: string; textMuted: string; border: string; surface: string };
  title: string;
  eyebrow: string;
  items: ContentRow[];
}) {
  return (
    <section>
      <SectionHeading theme={theme} eyebrow={eyebrow}>
        {title}
      </SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((c) => (
          <article
            key={c.id}
            className="rounded-lg border p-5 flex flex-col"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <h3
              className="text-base font-bold mb-2"
              style={{ color: theme.heading }}
            >
              {c.title || 'Untitled'}
            </h3>
            {c.subtitle && (
              <p className="text-xs mb-3" style={{ color: theme.textMuted }}>
                {c.subtitle}
              </p>
            )}
            <p
              className="text-xs leading-relaxed flex-1 whitespace-pre-wrap"
              style={{ color: theme.text }}
            >
              {(c.excerpt || c.body).slice(0, 400)}
              {((c.excerpt || c.body).length > 400) && '…'}
            </p>
            <div
              className="mt-3 pt-3 border-t text-[10px] font-mono uppercase tracking-wider flex justify-between"
              style={{ borderColor: theme.border, color: theme.textMuted }}
            >
              <span>{c.published_at ? new Date(c.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Draft'}</span>
              {c.tags && c.tags.length > 0 && <span>{c.tags.join(' · ')}</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Produces the footer label for an office, avoiding the "Office of the
// Founder's Office" redundancy.
// ---------------------------------------------------------------------------

function officeFooterLabel(name: string): string {
  if (/^office of the /i.test(name)) {
    return name;
  }

  let stripped = name;

  const apostropheOfficeMatch = stripped.match(/^(.+?)'s Office$/i);
  if (apostropheOfficeMatch) {
    stripped = apostropheOfficeMatch[1];
  } else {
    const plainOfficeMatch = stripped.match(/^(.+?) Office$/i);
    if (plainOfficeMatch) {
      stripped = plainOfficeMatch[1];
    }
  }

  return `Office of the ${stripped}`;
}