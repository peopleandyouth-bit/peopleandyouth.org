'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function MasterSovereignHomepage() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('public_publications_feed')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setPublications(data);
    } else {
      setPublications([
        {
          id: '1',
          title: 'Dialectics of Consciousness',
          subtitle: 'A Soliloquy on Ideas, Society, and the Human Mind',
          author_name: 'Swaraj Shandilya',
          category: 'PHILOSOPHY & PUBLIC POLICY',
          slug: 'dialectics-of-consciousness',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Institutional Statutory Audit Review',
          subtitle: 'Empirical critique of Comptroller & Auditor General (CAG) findings',
          author_name: 'Swaraj Shandilya',
          category: 'POLICY LAB',
          slug: 'statutory-audit-review',
          created_at: new Date().toISOString()
        }
      ]);
    }
    setLoading(false);
  };

  const featuredSlides = useMemo(() => publications.slice(0, 5), [publications]);

  useEffect(() => {
    if (featuredSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredSlides.length]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return publications.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.subtitle?.toLowerCase().includes(q) ||
        p.author_name?.toLowerCase().includes(q)
    );
  }, [searchQuery, publications]);

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* TOP UTILITY BAR */}
        <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex flex-wrap justify-between items-center gap-2 text-[10px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold tracking-wider">PEOPLEANDYOUTH.ORG</span>
            <span>•</span>
            <span className="hidden sm:inline">SOVEREIGN CIVIC KNOWLEDGE PLATFORM</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 border-r border-white/10 pr-4">
              <a href="https://instagram.com/peopleandyouth" target="_blank" rel="noreferrer" className="hover:text-amber-400">📷 Instagram</a>
              <a href="https://youtube.com/@peopleandyouth" target="_blank" rel="noreferrer" className="hover:text-amber-400">▶️ YouTube</a>
              <a href="https://linkedin.com/in/swarajshandilya" target="_blank" rel="noreferrer" className="hover:text-amber-400">💼 LinkedIn</a>
              <a href="mailto:contact@peopleandyouth.org" className="hover:text-amber-400">✉️ Email</a>
            </div>

            <Link href="/careers" className="text-amber-300 font-bold hover:underline">💼 Careers</Link>
            <Link href="/passport" className="text-amber-300 font-bold hover:underline">🪪 Civic Passport</Link>
            <Link href="/admin/login" className="hover:text-amber-400">🔐 Admin Console</Link>
          </div>
        </div>

        {/* HEADER & SEARCH BAR */}
        <header className="border-b border-white/10 px-6 py-6 max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <Link href="/">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase hover:text-amber-400 transition-colors">
                  People & Youth <span className="text-amber-400">.</span>
                </h1>
              </Link>
              <p className="text-gray-400 text-[10px] tracking-widest uppercase mt-1">
                At the Heart of Change &middot; Question | Reflect | Act &middot; Leading Youth Towards Praxis
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search publications, authors..."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none text-[11px]"
              />

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a1024] border border-amber-400/40 rounded-xl p-3 z-50 space-y-2 shadow-2xl max-h-64 overflow-y-auto">
                  {searchResults.map((res) => (
                    <Link key={res.id} href={`/articles/${res.slug}`} className="block p-2 rounded hover:bg-white/10 border-b border-white/5">
                      <div className="font-bold text-white text-[11px] truncate">{res.title}</div>
                      <div className="text-[9px] text-gray-400">{res.category} &middot; By {res.author_name}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MASTER NAVIGATION MENU */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold uppercase border-t border-white/10 pt-3 text-gray-300">
            <Link href="/" className="text-amber-400 hover:underline">Home</Link>
            <Link href="/dissent-dias" className="hover:text-amber-400">Dissent Dias</Link>
            <Link href="/about" className="hover:text-amber-400">About Us</Link>
            <Link href="/constitution" className="hover:text-amber-400 text-amber-300">Constitution Charter</Link>
            <Link href="/constitution" className="hover:text-amber-400 text-amber-300">Advisory Board</Link>
            <Link href="/policy-lab" className="hover:text-amber-400">Policy Lab</Link>
            <Link href="/mountains" className="hover:text-amber-400 text-amber-300">Mountains</Link>
            <Link href="/caves" className="hover:text-amber-400 text-amber-300">Caves</Link>
            <Link href="/journals" className="hover:text-amber-400">Renaissance Journals</Link>
            <Link href="/library" className="hover:text-amber-400">Digital Library</Link>
            <Link href="/observatory" className="hover:text-amber-400">Observatory</Link>
            <Link href="/careers" className="hover:text-amber-400 text-amber-300">Careers</Link>
            <Link href="/passport" className="hover:text-amber-400">Civic Passport</Link>
          </nav>
        </header>

        {/* AMAZON / FLIPKART STYLE DYNAMIC CAROUSEL */}
        {featuredSlides.length > 0 && (
          <section className="max-w-7xl mx-auto p-6 border-b border-white/10">
            <div className="relative bg-gradient-to-r from-[#0a1024] via-[#0f1733] to-[#141f45] border border-amber-400/30 p-8 sm:p-12 rounded-3xl space-y-4 overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-black font-extrabold uppercase text-[9px] tracking-widest">
                  FEATURED PUBLICATION
                </span>

                <div className="flex items-center gap-1.5">
                  {featuredSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="min-h-[160px] flex flex-col justify-between space-y-3 pt-2">
                <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-white leading-tight">
                  {featuredSlides[currentSlide]?.title}
                </h2>

                <p className="text-base font-serif italic text-gray-300 max-w-3xl leading-relaxed">
                  {featuredSlides[currentSlide]?.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] text-gray-400 pt-4 border-t border-white/10 font-mono">
                <div className="flex items-center gap-3">
                  <span>By <strong className="text-white">{featuredSlides[currentSlide]?.author_name}</strong></span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold uppercase">{featuredSlides[currentSlide]?.category}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredSlides.length)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold"
                  >
                    ›
                  </button>

                  <Link
                    href={`/articles/${featuredSlides[currentSlide]?.slug}`}
                    className="px-6 py-2.5 bg-amber-400 text-black font-extrabold rounded-xl uppercase hover:bg-amber-300 transition-all text-xs"
                  >
                    Read Full Paper →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* MOUNTAINS SECTION */}
        <section className="max-w-7xl mx-auto p-6 space-y-4 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest block">PROJECT HIMALAYA</span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">Mountains</h3>
            </div>
            <Link href="/mountains" className="text-amber-400 hover:underline font-bold text-[10px]">Explore Mountains →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/caves" className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-amber-400/60 transition-all space-y-2 block">
              <span className="text-amber-400 font-bold text-[9px] uppercase">RANGE I</span>
              <h4 className="text-base font-bold text-white">Dialectics & Consciousness</h4>
              <p className="text-gray-400 text-[11px]">Philosophical soliloquies and mind theory.</p>
            </Link>

            <Link href="/policy-lab" className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-amber-400/60 transition-all space-y-2 block">
              <span className="text-amber-400 font-bold text-[9px] uppercase">RANGE II</span>
              <h4 className="text-base font-bold text-white">Civic Mechanisms & Law</h4>
              <p className="text-gray-400 text-[11px]">CAG audit reviews, RTI and PIL briefs.</p>
            </Link>

            <Link href="/observatory" className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-amber-400/60 transition-all space-y-2 block">
              <span className="text-amber-400 font-bold text-[9px] uppercase">RANGE III</span>
              <h4 className="text-base font-bold text-white">Macro-Strategy & Analytics</h4>
              <p className="text-gray-400 text-[11px]">Trade dynamics and international affairs.</p>
            </Link>

            <Link href="/academy" className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-amber-400/60 transition-all space-y-2 block">
              <span className="text-amber-400 font-bold text-[9px] uppercase">RANGE IV</span>
              <h4 className="text-base font-bold text-white">Praxis & Youth Leadership</h4>
              <p className="text-gray-400 text-[11px]">Civic action and institutional governance.</p>
            </Link>
          </div>
        </section>

        {/* CAVES SECTION */}
        <section className="max-w-7xl mx-auto p-6 space-y-4 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-amber-400 font-bold uppercase text-[9px] tracking-widest block">TAXONOMY ARCHIVE</span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">Caves</h3>
            </div>
            <Link href="/caves" className="text-amber-400 hover:underline font-bold text-[10px]">View Caves Directory →</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {['Dialectics', 'Consciousness', 'Epistemology', 'Moral Philosophy', 'Statutory Law', 'CAG Audits', 'RTI Repository', 'Constitutional PILs', 'Trade & Strategy', 'Data Engineering', 'Global Economy', 'Public Policy'].map((c, i) => (
              <Link key={i} href="/caves" className="p-3 bg-white/5 border border-white/10 rounded-xl text-center hover:border-amber-400/40 transition-colors block">
                <span className="text-gray-300 font-bold text-[10px] block truncate">{c}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#040711] mt-12 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-3">
            <h4 className="text-lg font-extrabold text-white uppercase">People & Youth <span className="text-amber-400">.</span></h4>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              At the Heart of Change. Building a culture of reasoned dialogue, intellectual curiosity, and responsible civic action.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Directory</h5>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li><Link href="/dissent-dias" className="hover:text-white">Dissent Dias Reader</Link></li>
              <li><Link href="/mountains" className="hover:text-white">Mountains</Link></li>
              <li><Link href="/caves" className="hover:text-white">Caves</Link></li>
              <li><Link href="/policy-lab" className="hover:text-white">Policy Lab</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers & Opportunities</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Governance</h5>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li><Link href="/about" className="hover:text-white">About Us & Vision</Link></li>
              <li><Link href="/constitution" className="hover:text-white">Constitution Charter</Link></li>
              <li><Link href="/constitution" className="hover:text-white">Advisory Board</Link></li>
              <li><Link href="/admin/login" className="hover:text-white">Admin Console</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Connect</h5>
            <div className="space-y-2 text-gray-300 text-[11px]">
              <p>📷 Instagram: <a href="https://instagram.com/peopleandyouth" target="_blank" rel="noreferrer" className="text-amber-300 font-bold">@peopleandyouth</a></p>
              <p>▶️ YouTube: <a href="https://youtube.com/@peopleandyouth" target="_blank" rel="noreferrer" className="text-amber-300 font-bold">@peopleandyouth</a></p>
              <p>💼 LinkedIn: <a href="https://linkedin.com/in/swarajshandilya" target="_blank" rel="noreferrer" className="text-amber-300 font-bold">Swaraj Shandilya</a></p>
              <p>✉️ Email: <a href="mailto:contact@peopleandyouth.org" className="text-amber-300 font-bold">contact@peopleandyouth.org</a></p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-wrap justify-between items-center text-[10px] text-gray-500 font-mono gap-4">
          <span>&copy; 2026 People & Youth &middot; www.peopleandyouth.org &middot; All Rights Reserved.</span>
        </div>
      </footer>
    </main>
  );
}