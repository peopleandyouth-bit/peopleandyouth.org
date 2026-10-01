'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Office = {
  id: string;
  slug: string;
  name: string;
  level: string;
  office_number: string | null;
  status: string;
  division_id: string | null;
  theme_slug: string;
  display_order: number;
};

type Division = {
  id: string;
  building_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  status: string;
  display_order: number;
  offices: Office[];
};

type Building = {
  id: string;
  zone_id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: string;
  display_order: number;
  divisions: Division[];
};

type Zone = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: string;
  display_order: number;
  buildings: Building[];
};

type CampusResponse = {
  success: boolean;
  zones: Zone[];
  orphan_divisions: Division[];
  unassigned_offices: Office[];
};

export default function CampusPage() {
  const [data, setData] = useState<CampusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeZoneSlug, setActiveZoneSlug] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/campus', { cache: 'no-store' });
        const json = (await res.json()) as CampusResponse;
        if (!res.ok || !json.success) {
          throw new Error((json as { error?: string })?.error ?? 'Unable to load campus.');
        }
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load campus.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const stats = useMemo(() => {
    if (!data) return { zones: 0, buildings: 0, divisions: 0, offices: 0 };
    let buildings = 0;
    let divisions = 0;
    let offices = 0;
    for (const z of data.zones) {
      buildings += z.buildings.length;
      for (const b of z.buildings) {
        divisions += b.divisions.length;
        for (const d of b.divisions) {
          offices += d.offices.length;
        }
      }
    }
    divisions += data.orphan_divisions.length;
    for (const d of data.orphan_divisions) offices += d.offices.length;
    offices += data.unassigned_offices.length;
    return { zones: data.zones.length, buildings, divisions, offices };
  }, [data]);

  const filteredZones = useMemo(() => {
    if (!data) return [];
    if (!activeZoneSlug) return data.zones;
    return data.zones.filter((z) => z.slug === activeZoneSlug);
  }, [data, activeZoneSlug]);

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* HEADER BAR */}
        <div className="border-b border-white/10 bg-[#070b19] px-6 py-2.5 flex flex-wrap justify-between items-center text-[10px] text-gray-400">
          <Link
            href="/"
            className="text-amber-400 font-bold hover:underline flex items-center gap-1"
          >
            ← Return to Digital Headquarters
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 font-bold">PEOPLE &amp; YOUTH</span>
            <span>&middot;</span>
            <span className="text-amber-300">INSTITUTIONAL CAMPUS</span>
          </div>
        </div>

        {/* MASTHEAD */}
        <header className="border-b border-white/10 px-6 py-12 max-w-6xl mx-auto space-y-4 text-center">
          <span className="px-3.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-[10px] uppercase rounded-full tracking-widest">
            BIHAR CAMPUS · MASTER PLAN
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase font-serif tracking-tight text-white">
            The Institutional Campus
          </h1>
          <p className="text-amber-300 text-sm italic font-serif max-w-2xl mx-auto">
            &ldquo;An institution is not a building. It is a place where work, memory, and purpose live.&rdquo;
          </p>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl max-w-3xl mx-auto text-gray-300 text-[11px] font-serif leading-relaxed text-left border-l-2 border-l-amber-400">
            <strong className="text-amber-400 font-mono uppercase text-[9px] block mb-1">
              CAMPUS PRINCIPLE
            </strong>
            Every zone is a physical instantiation of an institutional idea. The campus is designed so that the work of the institution — governance, research, publication, learning, and community — has somewhere to live.
          </div>
        </header>

        {/* METRICS */}
        {!loading && data && (
          <div className="max-w-6xl mx-auto px-6 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="Zones" value={stats.zones} />
            <Metric label="Buildings" value={stats.buildings} />
            <Metric label="Divisions" value={stats.divisions} />
            <Metric label="Offices" value={stats.offices} />
          </div>
        )}

        {/* ZONE FILTER */}
        {!loading && data && data.zones.length > 0 && (
          <div className="max-w-6xl mx-auto px-6 pt-6 pb-6 border-b border-white/10 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveZoneSlug(null)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition ${
                activeZoneSlug === null
                  ? 'bg-amber-400 text-black'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              All Zones
            </button>
            {data.zones.map((z) => (
              <button
                key={z.slug}
                onClick={() =>
                  setActiveZoneSlug(activeZoneSlug === z.slug ? null : z.slug)
                }
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition ${
                  activeZoneSlug === z.slug
                    ? 'bg-amber-400 text-black'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {z.name}
              </button>
            ))}
          </div>
        )}

        {/* BODY */}
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 space-y-12">
          {loading && (
            <div className="py-20 text-center text-gray-400">
              Loading campus…
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300 text-center">
              {error}
            </div>
          )}

          {!loading && data && filteredZones.length === 0 && (
            <div className="py-20 text-center text-gray-500">
              No campus zones are published yet.
            </div>
          )}

          {!loading &&
            data &&
            filteredZones.map((zone) => (
              <ZoneBlock key={zone.id} zone={zone} />
            ))}

          {/* Orphan divisions — divisions not assigned to a building */}
          {!loading && data && data.orphan_divisions.length > 0 && (
            <section className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">
                  Unplaced Divisions
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  Divisions not yet assigned to a building
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.orphan_divisions.map((d) => (
                  <DivisionCard key={d.id} division={d} />
                ))}
              </div>
            </section>
          )}

          {/* Unassigned offices — offices not linked to a division */}
          {!loading && data && data.unassigned_offices.length > 0 && (
            <section className="space-y-4">
              <div className="border-b border-white/10 pb-2">
                <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">
                  Standing Offices
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  Offices not yet assigned to a division
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.unassigned_offices.map((o) => (
                  <OfficeCard key={o.id} office={o} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <footer className="border-t border-white/10 bg-[#040711] py-8 px-6 text-center text-gray-500 text-[10px]">
        &copy; 2026 People &amp; Youth &middot; Institutional Campus &middot; www.peopleandyouth.org
      </footer>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
        {label}
      </span>
      <span className="text-2xl font-black text-white block mt-1">{value}</span>
    </div>
  );
}

function ZoneBlock({ zone }: { zone: Zone }) {
  return (
    <section className="space-y-6">
      <div className="border-b border-white/10 pb-3">
        <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest">
          ZONE
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          {zone.name}
        </h2>
        {zone.description && (
          <p className="text-sm text-gray-300 leading-relaxed font-serif mt-2 max-w-3xl">
            {zone.description}
          </p>
        )}
      </div>

      {zone.buildings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-gray-500">
          No buildings published in this zone yet.
        </div>
      ) : (
        <div className="space-y-6">
          {zone.buildings.map((b) => (
            <BuildingBlock key={b.id} building={b} />
          ))}
        </div>
      )}
    </section>
  );
}

function BuildingBlock({ building }: { building: Building }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
      <div className="border-b border-white/10 pb-3">
        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300">
          Building
        </span>
        <h3 className="text-lg font-bold text-white mt-1">{building.name}</h3>
        {building.description && (
          <p className="text-xs text-gray-400 leading-relaxed font-serif mt-1">
            {building.description}
          </p>
        )}
      </div>

      {building.divisions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-[11px] text-gray-500">
          No divisions in this building yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {building.divisions.map((d) => (
            <DivisionCard key={d.id} division={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function DivisionCard({ division }: { division: Division }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#070b19] p-4 space-y-3">
      <div className="flex items-center gap-2">
        {division.icon && (
          <span className="text-amber-400 text-sm">{division.icon}</span>
        )}
        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
          {division.name}
        </span>
        <span className="ml-auto text-[9px] text-gray-500">
          {division.offices.length} office{division.offices.length === 1 ? '' : 's'}
        </span>
      </div>

      {division.description && (
        <p className="text-[11px] text-gray-400 leading-relaxed">
          {division.description}
        </p>
      )}

      {division.offices.length > 0 ? (
        <div className="space-y-2 pt-1 border-t border-white/5">
          {division.offices.map((o) => (
            <OfficeCard key={o.id} office={o} compact />
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-gray-500 italic">
          No offices assigned yet.
        </p>
      )}
    </div>
  );
}

function OfficeCard({ office, compact = false }: { office: Office; compact?: boolean }) {
  const isVacant = office.status === 'VACANT';

  if (compact) {
    return (
      <Link
        href={`/office/${office.slug}`}
        className="group flex items-center justify-between gap-2 rounded-lg border border-transparent hover:border-amber-500/40 hover:bg-amber-500/[0.06] px-2 py-1.5 transition"
      >
        <div className="min-w-0">
          <span className="text-[11px] text-gray-200 group-hover:text-amber-200 transition truncate block">
            {office.name}
          </span>
          {office.office_number && (
            <span className="text-[9px] text-gray-500 block">
              {office.office_number}
            </span>
          )}
        </div>
        <span
          className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
            isVacant
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {isVacant ? 'Vacant' : 'Active'}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/office/${office.slug}`}
      className="block rounded-xl border border-white/10 hover:border-amber-400/60 bg-[#070b19] hover:bg-white/[0.06] p-4 transition group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[9px] font-mono uppercase tracking-wider text-gray-500 block">
            {office.office_number ?? office.level}
          </span>
          <span className="text-xs font-bold text-white group-hover:text-amber-200 transition block mt-0.5">
            {office.name}
          </span>
        </div>
        <span
          className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
            isVacant
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {isVacant ? 'Vacant' : 'Active'}
        </span>
      </div>
      <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-400 group-hover:text-amber-300 transition flex items-center justify-between">
        Enter Office <span>→</span>
      </span>
    </Link>
  );
}