import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Leadership & Executive Offices | People & Youth',
  description: 'The executive leadership, trustees, fellows, and technology officers of People & Youth.',
};

export default async function LeadershipPage() {
  const { data: leaders, error } = await supabase
    .from('authors')
    .select('*')
    .eq('is_leadership', true)
    .order('display_order', { ascending: true });

  const team = leaders || [];

  return (
    <main className="min-h-screen bg-[#030611] text-gray-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 border-b border-amber-500/20 pb-8">
          <span className="text-xs font-black text-amber-400 tracking-widest uppercase">
            INSTITUTIONAL GOVERNANCE
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Leadership & Executive Offices
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            The executive directors, officers, research fellows, and technology architects guiding People & Youth.
          </p>
        </div>

        {/* Leadership Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {team.map((member) => (
            <div
              key={member.id}
              className="bg-[#070b19] border border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-6 transition duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{member.name}</h2>
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
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
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

              {/* Social & Contact */}
              <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-800/60 pt-3">
                <span className="text-[10px] text-emerald-400 font-mono">● Active Leadership</span>
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

        {/* Footer Shield */}
        <div className="pt-8 border-t border-amber-500/20 text-center text-xs text-amber-500/60 font-mono tracking-widest uppercase">
          🛡️ OFFICIAL EXECUTIVE REGISTRY • PEOPLE & YOUTH
        </div>
      </div>
    </main>
  );
}