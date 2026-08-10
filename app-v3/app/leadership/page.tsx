import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Leadership & Domain Consultants | People & Youth',
  description: 'The executive board, trustees, and distinguished guest consultants guiding People & Youth across public policy, tech, law, and governance.',
};

export default async function LeadershipPage() {
  const { data: authors, error } = await supabase
    .from('authors')
    .select('*')
    .eq('is_leadership', true)
    .order('display_order', { ascending: true });

  const allMembers = authors || [];
  const executiveBoard = allMembers.filter((m) => m.department !== 'Guest Consultants');
  const guestConsultants = allMembers.filter((m) => m.department === 'Guest Consultants');

  return (
    <main className="min-h-screen bg-[#030611] text-gray-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* PAGE HEADER */}
        <div className="text-center space-y-4 border-b border-amber-500/20 pb-8">
          <span className="text-xs font-black text-amber-400 tracking-widest uppercase">
            INSTITUTIONAL GOVERNANCE & EXPERTISE
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Leadership & Domain Consultants
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            The executive directors, domain consultants, and subject-matter experts shaping research, policy, and digital governance at People & Youth.
          </p>
        </div>

        {/* SECTION 1: EXECUTIVE BOARD */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
            <h2 className="text-xl font-black text-amber-400 uppercase tracking-wide">
              Executive Council & Leadership Offices
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {executiveBoard.map((member) => (
              <div
                key={member.id}
                className="bg-[#070b19] border border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-6 transition duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">{member.name}</h3>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block mt-0.5">
                        {member.designation}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        {member.organization || 'People & Youth'}
                      </span>
                    </div>

                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/40"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg flex-shrink-0">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-gray-800/80">
                    {member.bio || 'Executive officer at People & Youth.'}
                  </p>

                  {member.expertise && member.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {member.expertise.map((exp: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-800 text-gray-300 text-[10px] font-mono rounded-md border border-gray-700"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-800/60 pt-3">
                  <span className="text-[10px] text-emerald-400 font-mono">● Executive Council</span>
                  <div className="flex gap-3">
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="hover:text-amber-400 transition">
                        📧 Email
                      </a>
                    )}
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-amber-400 transition"
                      >
                        🔗 LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: GUEST CONSULTANTS & DOMAIN EXPERTS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-400"></span>
            <h2 className="text-xl font-black text-purple-400 uppercase tracking-wide">
              Guest Consultants & Subject Matter Experts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {guestConsultants.length === 0 ? (
              <p className="text-xs text-gray-400 col-span-2">No guest consultants registered yet. Use Command Centre to add consultants.</p>
            ) : (
              guestConsultants.map((consultant) => (
                <div
                  key={consultant.id}
                  className="bg-[#070b19] border border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-6 transition duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-purple-600/20 text-purple-300 text-[9px] font-mono font-bold uppercase px-3 py-1 rounded-bl-lg border-b border-l border-purple-500/30">
                    Guest Consultant
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-white">{consultant.name}</h3>
                        {consultant.academic_credentials && (
                          <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded inline-block mt-1">
                            🎓 {consultant.academic_credentials}
                          </span>
                        )}
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block mt-1">
                          {consultant.designation}
                        </span>
                        {consultant.institutional_affiliation && (
                          <span className="text-[10px] text-gray-400 block font-mono mt-0.5">
                            🏛️ {consultant.institutional_affiliation}
                          </span>
                        )}
                      </div>

                      {consultant.photo_url ? (
                        <img
                          src={consultant.photo_url}
                          alt={consultant.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/40"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-lg flex-shrink-0">
                          {consultant.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-gray-800/80">
                      {consultant.bio || 'Guest consultant providing specialized domain expertise.'}
                    </p>

                    {consultant.expertise && consultant.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {consultant.expertise.map((exp: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-purple-900/30 text-purple-200 text-[10px] font-mono rounded-md border border-purple-700/50"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-800/60 pt-3">
                    <span className="text-[10px] text-purple-400 font-mono">● Domain Advisory Board</span>
                    <div className="flex gap-3">
                      {consultant.email && (
                        <a href={`mailto:${consultant.email}`} className="hover:text-purple-300 transition">
                          📧 Contact
                        </a>
                      )}
                      {consultant.linkedin_url && (
                        <a
                          href={consultant.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-purple-300 transition"
                        >
                          🔗 LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* FOOTER SHIELD */}
        <div className="pt-8 border-t border-amber-500/20 text-center text-xs text-amber-500/60 font-mono tracking-widest uppercase">
          🛡️ OFFICIAL REGISTRY OF LEADERSHIP & GUEST CONSULTANTS • PEOPLE & YOUTH
        </div>
      </div>
    </main>
  );
}