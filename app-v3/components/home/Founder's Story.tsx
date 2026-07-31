"use client";

import { useState } from "react";

interface JourneyStage {
  id: string;
  badge: string;
  title: string;
  institution: string;
  focus: string;
  highlights: string[];
}

export default function FounderStory() {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages: JourneyStage[] = [
    {
      id: "eng",
      badge: "Layer I",
      title: "Systems & Engineering Foundations",
      institution: "Technology & Computational Logic",
      focus: "Deconstructing complex socio-technical systems using computational frameworks, analytical modeling, and structured problem-solving.",
      highlights: [
        "Data-driven systems thinking applied to public governance",
        "Technical architecture design for scalable digital infrastructure",
        "Algorithmic analysis of systemic inefficiencies"
      ]
    },
    {
      id: "iift",
      badge: "Layer II",
      title: "International Business & Trade",
      institution: "Indian Institute of Foreign Trade (IIFT)",
      focus: "Analyzing global supply chains, international trade policy, cross-border economics, and institutional readiness in GIFT City.",
      highlights: [
        "Trade policy frameworks & macroeconomic equilibrium",
        "Institutional due diligence for higher education & infrastructure",
        "Cross-border commercial strategy & regulatory mechanics"
      ]
    },
    {
      id: "policy",
      badge: "Layer III",
      title: "Public Policy & CAG Audit Research",
      institution: "Independent Governance & RTI Analytics",
      focus: "Investigating central scheme implementations (e.g., PMKVY), public expenditure audits, RTI-driven transparency, and institutional accountability.",
      highlights: [
        "In-depth analysis of Comptroller and Auditor General (CAG) reports",
        "Drafting RTI applications targeting central investigative & regulatory bodies",
        "Exposing systemic leakages in skill development initiatives"
      ]
    },
    {
      id: "py",
      badge: "Layer IV",
      title: "Institution Builder & Civic Leader",
      institution: "People & Youth Platform",
      focus: "Synthesizing research, rural consulting, and evidence-based democratic discourse to empower 500M+ Indian youth.",
      highlights: [
        "Architecting Dissent Dias for civilized, fact-based debates",
        "Establishing the 7 Sovereign Policy Journals",
        "Pioneering grassroots rural market strategy & consulting"
      ]
    }
  ];

  return (
    <section id="founder" className="py-24 relative z-10 border-t border-white/5 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase mb-2 block">
            Leadership & Vision
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            The Founder's Journey
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            A multi-layered trajectory bridging engineering rigor, international trade policy, public audits, and civic institution building.
          </p>
        </div>

        {/* Interactive Timeline Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {stages.map((stage, idx) => (
            <button
              key={stage.id}
              onClick={() => setActiveStage(idx)}
              className={`p-4 rounded-xl text-left transition-all border ${
                activeStage === idx
                  ? "glass-panel border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10"
                  : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
              }`}
            >
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">
                {stage.badge}
              </div>
              <div className="text-sm font-bold truncate">{stage.title}</div>
            </button>
          ))}
        </div>

        {/* Selected Stage Detail Display */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/20 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40 mb-4">
              {stages[activeStage].institution}
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              {stages[activeStage].title}
            </h3>
            <p className="text-slate-300 text-base leading-relaxed mb-8">
              {stages[activeStage].focus}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Key Contributions & Institutional Focus
              </h4>
              <ul className="space-y-2">
                {stages[activeStage].highlights.map((item, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm text-slate-200">
                    <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}