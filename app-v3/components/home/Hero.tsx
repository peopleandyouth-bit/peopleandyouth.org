import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-36 pb-20 flex items-center justify-center overflow-hidden">
      {/* Background Animated Oceanic Mesh Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[15%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-cyan-600/20 blur-[120px] animate-ocean" />
        <div className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-blue-700/25 blur-[140px] animate-wave" />
        <div className="absolute -bottom-[15%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-indigo-900/30 blur-[130px] animate-ocean" />
        
        {/* Subtle Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Institutional Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card mb-8 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-medium tracking-wide shadow-inner">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>At the Heart of Change — Public Policy, Governance & Youth Leadership</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          Building India’s Sovereign <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
            Digital Youth Institution
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed mb-10">
          Bridging policy research, rural development, and youth enterprise through evidence-based debate on <strong className="text-white">Dissent Dias</strong> and actionable grassroots strategy.
        </p>

        {/* Primary Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="#membership"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
          >
            <span>Become Founding Member</span>
            <span className="bg-white/20 text-xs px-2.5 py-1 rounded-md">₹499</span>
          </Link>
          <Link
            href="#think-tank"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-slate-200 hover:text-white font-semibold text-base hover:border-cyan-400/40 transition-all"
          >
            Explore Policy Research
          </Link>
        </div>

        {/* Key Statistics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { metric: "100%", label: "Verified Debate Protocol" },
            { metric: "Pan-India", label: "Rural Advisory Target" },
            { metric: "Public Audit", label: "Policy Dashboards" },
            { metric: "₹499", label: "Lifetime Founding ID & Card" },
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-5 rounded-2xl text-center border border-white/5">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mb-1">
                {item.metric}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}