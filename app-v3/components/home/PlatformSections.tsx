export default function PlatformSections() {
  const pillars = [
    {
      id: "dissent-dias",
      badge: "Debate & Discourse",
      title: "Dissent Dias",
      description: "A structured, civilized arena for opposing viewpoints based on facts, policy references, and verifiable data.",
      tag: "Verification Protected",
    },
    {
      id: "think-tank",
      badge: "Policy Research",
      title: "People & Youth Think Tank",
      description: "Publish independent policy papers, public audit reviews, and legislative research.",
      tag: "Open Access",
    },
    {
      id: "consulting",
      badge: "Grassroots Strategy",
      title: "Rural Advisory & Consulting",
      description: "Connecting enterprises with real-world market entry strategies across rural India.",
      tag: "Actionable Intelligence",
    },
  ];

  return (
    <section className="py-24 relative z-10 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="glass-card p-8 rounded-3xl border border-white/5">
              <span className="text-xs font-mono text-cyan-400 uppercase">{pillar.badge}</span>
              <h3 className="text-2xl font-bold text-white my-3">{pillar.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
