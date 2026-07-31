import { JournalTopic } from "@/types";
import Link from "next/link";

export default function ThinkTankJournals() {
  const journals: JournalTopic[] = [
    {
      id: "policy",
      title: "Public Policy & CAG Audits",
      category: "Public Policy",
      description: "Evaluating central government schemes, expenditure transparency, RTI filings, and institutional compliance.",
      iconName: "🏛️"
    },
    {
      id: "trade",
      title: "International Trade & Business",
      category: "International Business",
      description: "Macroeconomic analysis, cross-border commerce, supply chain resiliency, and trade corridor policy.",
      iconName: "🌐"
    },
    {
      id: "ai",
      title: "AI & Digital Governance",
      category: "AI & Tech",
      description: "Ethical AI deployment, sovereign data protection frameworks, and digital public infrastructure.",
      iconName: "🤖"
    },
    {
      id: "rural",
      title: "Rural India Development Lab",
      category: "Rural India",
      description: "Grassroots economic strategy, agricultural value chains, and rural enterprise expansion.",
      iconName: "🌾"
    },
    {
      id: "econ",
      title: "Development Economics",
      category: "Economics",
      description: "Income inequality, employment dynamics under PMKVY, financial inclusion, and fiscal policy.",
      iconName: "📈"
    },
    {
      id: "psy",
      title: "Youth Psychology & Leadership",
      category: "Psychology",
      description: "Civic behavior, youth mental resilience, decision-making dynamics, and leadership ethics.",
      iconName: "🧠"
    },
    {
      id: "gov",
      title: "Civic Entrepreneurship",
      category: "Governance",
      description: "Empowering grassroots leaders to solve community infrastructure challenges via policy intervention.",
      iconName: "⚡"
    }
  ];

  return (
    <section id="think-tank" className="py-24 relative z-10 bg-slate-950/60 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div className="text-center md:text-left max-w-2xl">
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase mb-2 block">
              Research Repository
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              7 Sovereign Policy Journals
            </h2>
            <p className="text-slate-400 text-base">
              Peer-reviewed research and evidence-backed papers published by People & Youth scholars.
            </p>
          </div>

          <Link
            href="/submit-paper"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
          >
            <span>Submit Research Paper</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((j) => (
            <div
              key={j.id}
              className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between group hover:border-cyan-500/30"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{j.iconName}</span>
                  <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40 px-2.5 py-1 rounded-full">
                    {j.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {j.title}
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  {j.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <Link href="/submit-paper" className="hover:underline">
                  Submit to Journal
                </Link>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}