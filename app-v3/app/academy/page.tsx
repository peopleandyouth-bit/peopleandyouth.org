'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';
import { supabase } from '@/lib/supabaseClient';
import { Course } from '@/lib/types/academy';

const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";

const FALLBACK_COURSES: Course[] = [
  {
    id: "course-1",
    slug: "constitutional-literacy-public-policy",
    title: "Constitutional Literacy & Public Policy Auditing",
    subtitle: "Master the principles of constitutional morality, empirical governance, and grassroots RTI filing.",
    category: "Governance & Law",
    level: "intermediate",
    duration_hours: 12,
    instructor_name: "Swaraj Shandilya",
    instructor_title: "Senior Policy Fellow & Lead Auditor",
    featured_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    description: "An intensive executive course covering the legal mechanics of Right to Information audits, municipal transparency, and public policy formulation.",
    modules_count: 6,
    created_at: "2026-08-01"
  },
  {
    id: "course-2",
    slug: "digital-public-infrastructure-ai-ethics",
    title: "Digital Public Infrastructure & AI Ethics",
    subtitle: "Understanding DPI frameworks, algorithmic transparency, and citizen data rights.",
    category: "Technology & Society",
    level: "advanced",
    duration_hours: 16,
    instructor_name: "Dr. Ananya Sharma",
    instructor_title: "Director, AI Governance Lab",
    featured_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    description: "Examines automated welfare distribution systems, data privacy compliance, and procedural due process in technology governance.",
    modules_count: 8,
    created_at: "2026-08-02"
  },
  {
    id: "course-3",
    slug: "panchayati-raj-rural-governance",
    title: "Panchayati Raj & Local Self-Governance Labs",
    subtitle: "Field technical assistance, participatory budgeting, and CAG municipal auditing.",
    category: "Rural & Municipal Advisory",
    level: "beginner",
    duration_hours: 10,
    instructor_name: "Rajesh Kumar",
    instructor_title: "Head of Grassroots Advisory",
    featured_image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop",
    description: "Practical guide to empowering local Panchayats, optimizing revenue collection, and executing district-level leadership drives.",
    modules_count: 5,
    created_at: "2026-08-03"
  }
];

export default function AcademyPage() {
  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const [certSearch, setCertSearch] = useState('');
  const [certResult, setCertResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('academy_courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setCourses(data);
      }
    } catch (err) {
      console.error('Using fallback courses catalog.');
    }
  };

  const handleVerifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certSearch.trim()) return;

    setIsVerifying(true);
    setCertResult(null);

    try {
      const res = await fetch(`/api/academy/certificate?code=${encodeURIComponent(certSearch.trim())}`);
      const data = await res.json();
      if (res.ok && data.certificate) {
        setCertResult(data.certificate);
      } else {
        setCertResult({ error: data.error || 'Invalid Certificate ID.' });
      }
    } catch (err) {
      setCertResult({ error: 'Verification service offline.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between">
      
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={BRAND_LOGO_URL} alt="Logo" className="h-10 w-auto rounded-lg object-contain bg-white/10 p-1 border border-white/20" />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">People &amp; Youth</span>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mt-0.5">Academy Portal</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-gray-300">
            <Link href="/about" className="hover:text-cyan-400 transition-colors">Mandate</Link>
            <Link href="/constitution" className="hover:text-amber-300 text-amber-400 font-bold transition-colors">📜 Constitution</Link>
            <Link href="/submit-paper" className="hover:text-cyan-400 transition-colors">Journals</Link>
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">🖥️ OS Dashboard</Link>
          </nav>

          <GoogleTranslate />
        </div>
      </header>

      {/* MAIN ACADEMY CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-16">
        
        {/* HERO TITLE */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            OPEN SCHOLARSHIP &amp; ACADEMIC CERTIFICATION
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            People &amp; Youth Academy
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            Structured civic learning modules, empirical governance masterclasses, and tamper-proof digital certificates linked directly to your Civic Passport identity.
          </p>
        </div>

        {/* VERIFICATION ENGINE BANNER */}
        <div className="bg-gradient-to-r from-blue-950/80 via-[#0a122c] to-cyan-950/80 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">PUBLIC CERTIFICATE VERIFIER</span>
              <h2 className="text-xl font-bold text-white">Cryptographic Certificate Verification</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-bold">
              ✓ Tamper-Proof Registry
            </span>
          </div>

          <form onSubmit={handleVerifyCertificate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={certSearch}
              onChange={e => setCertSearch(e.target.value)}
              placeholder="Enter Certificate Code (e.g. PY-CERT-2026-612030)..."
              className="flex-1 bg-[#070b19] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shrink-0 transition-all"
            >
              {isVerifying ? 'Verifying...' : 'Verify Signature →'}
            </button>
          </form>

          {certResult && (
            <div className="p-4 rounded-xl bg-[#0b1228] border border-cyan-400/40 text-xs font-mono text-gray-200 space-y-1">
              {certResult.error ? (
                <p className="text-red-400 font-bold">✖ {certResult.error}</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-emerald-400 font-bold">✓ VALID CERTIFICATE DETECTED</p>
                  <p>Recipient: <strong className="text-white">{certResult.user_name}</strong></p>
                  <p>Course: <strong className="text-cyan-300">{certResult.course_title}</strong></p>
                  <p>Issued On: {certResult.issued_at}</p>
                  <p className="text-gray-400 text-[10px] break-all">Digital Signature: {certResult.digital_signature}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* COURSES CATALOG GRID */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="text-2xl font-extrabold text-white">Available Courses &amp; Modules</h2>
            <span className="text-xs font-mono text-cyan-400">{courses.length} Certified Courses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white/5 border border-white/10 hover:border-cyan-500/50 rounded-3xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl"
              >
                <div>
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={course.featured_image} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-cyan-300 text-[10px] font-mono font-bold uppercase border border-white/20">
                      {course.category}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase">
                      <span>⏱️ {course.duration_hours} Hours</span>
                      <span>•</span>
                      <span>📚 {course.modules_count} Modules</span>
                      <span>•</span>
                      <span className="text-amber-300 font-bold">{course.level}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {course.subtitle}
                    </p>

                    <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400">
                      Instructor: <span className="text-white font-bold">{course.instructor_name}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/academy/courses/${course.slug}`}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <span>Enter Course Workspace</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050814] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 font-mono">
          <p>&copy; 2026 People &amp; Youth Digital Institution (peopleandyouth.org). All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}
