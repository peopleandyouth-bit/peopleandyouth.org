'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function InstitutionAcademyPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data } = await supabase.from('academy_courses').select('*').order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setCourses(data);
      setSelectedCourse(data[0]);
    } else {
      // Default Seed Course
      const seedCourse = {
        title: 'Masterclass in Right to Information & Statutory Audits',
        slug: 'rti-statutory-audits-masterclass',
        description: 'Comprehensive training on drafting RTI queries, analyzing CAG audit reports, and structuring public interest litigation (PIL) petitions.',
        instructor: 'Swaraj Shandilya',
        duration: '4 Weeks',
        level: 'Executive Policy',
        lessons: [
          { title: 'Module 1: Constitutional Framework of Statutory Right to Information', duration: '45 mins' },
          { title: 'Module 2: Analyzing Comptroller & Auditor General (CAG) Audit Ledgers', duration: '60 mins' },
          { title: 'Module 3: Formulating Grounds for High Court / Supreme Court PIL Petitions', duration: '75 mins' },
          { title: 'Module 4: Case Study - Campus Infrastructure & Public Funds Review', duration: '90 mins' }
        ]
      };
      setCourses([seedCourse]);
      setSelectedCourse(seedCourse);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#070b19] text-white font-mono text-xs p-6 sm:p-12 space-y-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto border-b border-white/10 pb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px] block">
            POLICY SCHOOL & EXECUTIVE ACADEMY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Institution Academy</h1>
          <p className="text-gray-400 text-[11px] mt-1">
            Advanced training modules in legal advocacy, public economics, civic mechanisms, and system design.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/passport" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
            🪪 My Passport ID
          </Link>
          <Link href="/dissent-dias" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
            ← Editorial Portal
          </Link>
        </div>
      </header>

      {/* ACADEMY WORKSPACE */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 max-w-7xl mx-auto">Loading Policy Academy...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COURSE CATALOG */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-2">
              Executive Curriculum
            </h2>
            {courses.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedCourse(c)}
                className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 block ${
                  selectedCourse?.slug === c.slug
                    ? 'bg-amber-400/10 border-amber-400 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                <div className="flex justify-between text-[9px] font-bold text-amber-400 uppercase">
                  <span>{c.level}</span>
                  <span>{c.duration}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{c.title}</h3>
              </button>
            ))}
          </div>

          {/* COURSE SYLLABUS & SYLLABUS CANVAS */}
          {selectedCourse && (
            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
              <div className="border-b border-white/10 pb-4 space-y-2">
                <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 font-bold uppercase text-[9px]">
                  {selectedCourse.level} • {selectedCourse.duration}
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1">{selectedCourse.title}</h2>
                <p className="text-gray-300 text-[11px] leading-relaxed">{selectedCourse.description}</p>
                <div className="text-[10px] text-gray-400 font-mono pt-2">
                  Lead Instructor: <strong className="text-amber-300">{selectedCourse.instructor}</strong>
                </div>
              </div>

              {/* SYLLABUS LESSONS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Course Syllabus & Modules</h3>
                <div className="space-y-2">
                  {selectedCourse.lessons?.map((les: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[#070b19] border border-white/10 rounded-xl flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-[9px] text-amber-400 font-bold uppercase">Lesson {idx + 1}</span>
                        <h4 className="text-xs font-bold text-white">{les.title}</h4>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{les.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => alert('Enrollment request submitted! Your Digital Passport score has been updated.')}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold rounded-xl uppercase tracking-wider shadow-xl hover:from-amber-300"
              >
                🎓 Enroll in Executive Academy Course
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}