'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';

const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";

export default function CourseDetailPage({ params }: { params: { courseSlug: string } }) {
  const courseSlug = params.courseSlug || 'constitutional-literacy-public-policy';
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([0]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [issuedCertCode, setIssuedCertCode] = useState<string | null>(null);

  const courseData = {
    title: courseSlug.replace(/-/g, ' ').toUpperCase(),
    instructor: "Swaraj Shandilya",
    role: "Senior Policy Fellow & Lead Auditor",
    modules: [
      {
        title: "Module 1: Constitutional Morality & Institutional Authority",
        duration: "45 mins",
        content: `
# Constitutional Morality in Public Administration

Constitutional morality is not merely adherence to legal statutes; it represents an institutional commitment to procedural due process, accountability, and citizen dignity.

### Core Audit Principles
1. **Rule of Law vs Rule by Law:** Administrative actions must derive authority from statutory frameworks.
2. **Empirical Verification:** Public policy claims must be corroborated by field audits and open data logs.
3. **Citizen Empowerment:** Ensuring Right to Information (RTI) access across all municipal levels.
        `
      },
      {
        title: "Module 2: Mechanics of Grassroots RTI Audits",
        duration: "60 mins",
        content: `
# Conducting District Right to Information (RTI) Audits

A step-by-step guide for Youth Coordinators drafting offline and online RTI requests directed at public authorities.

### Drafting Framework
* **Section 6(1) Precision:** Formulate explicit, non-speculative questions.
* **Inspecting Public Records:** Exercising rights under Section 2(j)(i) for physical infrastructure verification.
* **Appellate Escalation:** Structuring First Appeals under Section 19(1) for non-compliance.
        `
      },
      {
        title: "Module 3: Digital Public Infrastructure & Municipal Performance",
        duration: "50 mins",
        content: `
# Digital Public Infrastructure (DPI) & Algorithmic Oversight

Analyzing the deployment of automated decision models in local governance and welfare distribution.

### Audit Protocols
* Verifying open data compliance on municipal tender portals.
* Assessing algorithmic bias in citizen grievance resolution systems.
* Enforcing cryptographic data protection standards for local registries.
        `
      }
    ]
  };

  const currentModule = courseData.modules[activeModuleIndex];
  const progressPercent = Math.round((completedModules.length / courseData.modules.length) * 100);

  const handleMarkComplete = () => {
    if (!completedModules.includes(activeModuleIndex)) {
      setCompletedModules(prev => [...prev, activeModuleIndex]);
    }
    if (activeModuleIndex < courseData.modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
    }
  };

  const handleClaimCertificate = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch('/api/academy/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: 'Swaraj Shandilya',
          courseTitle: courseData.title
        })
      });
      const data = await res.json();
      if (data.certificate) {
        setIssuedCertCode(data.certificate.certificate_code);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/academy" className="flex items-center gap-3">
            <img src={BRAND_LOGO_URL} alt="Logo" className="h-10 w-auto rounded-lg object-contain bg-white/10 p-1 border border-white/20" />
            <span className="font-extrabold text-lg text-white">P&amp;Y Academy Workspace</span>
          </Link>
          <GoogleTranslate />
        </div>
      </header>

      {/* COURSE WORKSPACE GRID */}
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MODULE NAVIGATION SIDEBAR */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-widest block">COURSE PROGRESS</span>
            <h2 className="text-base font-extrabold text-white">{courseData.title}</h2>
            
            {/* PROGRESS BAR */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Completion</span>
                <span className="text-cyan-300 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-xs font-mono text-gray-400">
              Instructor: <span className="text-white font-bold">{courseData.instructor}</span>
            </div>
          </div>

          {/* MODULE LESSON LIST */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-2 font-mono text-xs">
            <span className="text-[10px] text-gray-400 uppercase font-bold px-2 block mb-2">Modules List</span>
            {courseData.modules.map((mod, idx) => (
              <button
                key={idx}
                onClick={() => setActiveModuleIndex(idx)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center justify-between border ${
                  activeModuleIndex === idx
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                    : 'border-transparent text-gray-300 hover:bg-white/5'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate">{mod.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{mod.duration}</p>
                </div>
                {completedModules.includes(idx) && (
                  <span className="text-emerald-400 font-bold text-sm shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* CLAIM CERTIFICATE BUTTON */}
          {progressPercent === 100 && (
            <div className="bg-gradient-to-br from-emerald-950 to-cyan-950 border-2 border-emerald-400 rounded-3xl p-6 space-y-3 text-center">
              <span className="text-2xl">🎓</span>
              <h3 className="text-sm font-bold text-white">Course Requirements Satisfied!</h3>
              <p className="text-xs text-gray-300">Generate your cryptographically signed P&amp;Y Academy Certificate.</p>
              
              {issuedCertCode ? (
                <div className="p-3 bg-black/50 border border-emerald-400/40 rounded-xl text-xs font-mono text-emerald-300 font-bold">
                  ✓ Certificate Issued: {issuedCertCode}
                </div>
              ) : (
                <button
                  onClick={handleClaimCertificate}
                  disabled={isClaiming}
                  className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs font-mono transition-all shadow-lg shadow-emerald-400/20"
                >
                  {isClaiming ? 'Signing Certificate...' : 'Claim Digital Certificate →'}
                </button>
              )}
            </div>
          )}
        </aside>

        {/* ACTIVE MODULE READER */}
        <main className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4 flex justify-between items-center">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">ACTIVE MODULE {activeModuleIndex + 1} OF {courseData.modules.length}</span>
              <span className="text-xs font-mono text-gray-400">{currentModule.duration}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{currentModule.title}</h1>

            <div className="prose prose-invert max-w-none text-gray-200 text-sm leading-relaxed font-sans space-y-4">
              <div dangerouslySetInnerHTML={{ __html: currentModule.content.replace(/\n/g, '<br/>') }} />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-between items-center">
            <button
              disabled={activeModuleIndex === 0}
              onClick={() => setActiveModuleIndex(activeModuleIndex - 1)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-mono font-bold"
            >
              ← Previous Module
            </button>

            <button
              onClick={handleMarkComplete}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs font-mono shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
            >
              {completedModules.includes(activeModuleIndex) ? 'Completed (Next Module →)' : 'Mark Completed & Continue →'}
            </button>
          </div>
        </main>

      </div>

    </main>
  );
}
