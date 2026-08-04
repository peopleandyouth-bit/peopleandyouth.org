'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GoogleTranslate from '@/components/GoogleTranslate';
import { supabase } from '@/lib/supabaseClient';

const BRAND_LOGO_URL = "https://i.postimg.cc/rFK0BBXw/Google-Logo-002.png";

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const articleSlug = params.slug || 'constitutional-precedents-dpi';
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Fallback Mock for Immediate Display / Static Render
  const fallbackArticle = {
    title: "Constitutional Morality & Empirical Governance in Digital Infrastructure",
    subtitle: "Evaluating algorithmic accountability, administrative transparency, and citizen rights across district municipal frameworks.",
    content_type: "Policy Brief",
    published_at: "August 2026",
    reading_time_minutes: 8,
    author_name: "Swaraj Shandilya",
    author_role: "Senior Policy Fellow & District Coordinator",
    featured_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    abstract: "This paper evaluates the constitutional imperatives governing Digital Public Infrastructure (DPI) implementation in Indian local bodies. Through empirical field data collected across district municipalities, we demonstrate how algorithmic transparency directly correlates with public trust and Right to Information (RTI) compliance.",
    body_markdown: `
## Executive Summary & Background

Digital Public Infrastructure (DPI) has transformed public service delivery across municipal corporations and Gram Panchayats. However, as automated decision systems become embedded in local governance, preserving constitutional morality and citizen rights requires strict empirical oversight.

### Key Pillars of Digital Governance Audits

1. **Algorithmic Transparency:** Ensuring automated welfare distribution formulas are publicly verifiable.
2. **Procedural Due Process:** Providing citizens with administrative recourse when digital platforms deny statutory benefits.
3. **Institutional Independence:** Shielding local audit bodies from executive overreach.

> *"Constitutional morality is not a natural sentiment. It has to be cultivated. We must realize that our people have yet to learn it."* — Dr. B.R. Ambedkar

## Empirical Findings Across District Frameworks

Our research teams audited municipal service delivery across multiple district jurisdiction hubs over an 18-month period. The findings indicate that districts employing open-access audit logs experienced a **42% reduction** in citizen grievance resolution timelines.

### Strategic Policy Recommendations

* **Mandatory Open Data Schema:** Require all municipal tender and expenditure portals to publish machine-readable datasets.
* **Grassroots Civic Audits:** Empower district youth coordinators to conduct quarterly Right to Information (RTI) field verifications.
* **Sovereign Credential Ledger:** Issue tamper-proof digital passports to civic auditors to ensure field report integrity.

## Conclusion

Building resilient democratic institutions requires more than technology deployment—it demands an unyielding commitment to constitutional morality, academic rigor, and civic empowerment.
    `,
    tags: ["Constitutional Law", "Public Policy", "Digital Infrastructure", "Empirical Audit"]
  };

  useEffect(() => {
    fetchArticle();

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [articleSlug]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('cims_articles')
        .select('*')
        .eq('slug', articleSlug)
        .single();

      if (data) {
        setArticle(data);
      } else {
        setArticle(fallbackArticle);
      }
    } catch (err) {
      setArticle(fallbackArticle);
    } finally {
      setLoading(false);
    }
  };

  const current = article || fallbackArticle;

  return (
    <main className="min-h-screen bg-[#070b19] text-white selection:bg-cyan-500 selection:text-black flex flex-col justify-between relative">
      
      {/* READING PROGRESS BAR */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#070b19]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={BRAND_LOGO_URL} alt="Logo" className="h-10 w-auto rounded-lg object-contain bg-white/10 p-1 border border-white/20" />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">People &amp; Youth</span>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mt-0.5">Policy Research</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-gray-300">
            <Link href="/about" className="hover:text-cyan-400 transition-colors">Mandate</Link>
            <Link href="/constitution" className="hover:text-amber-300 text-amber-400 font-bold transition-colors">📜 Constitution</Link>
            <Link href="/submit-paper" className="hover:text-cyan-400 transition-colors">Policy Journals</Link>
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">🖥️ Dashboard</Link>
          </nav>

          <GoogleTranslate />
        </div>
      </header>

      {/* ARTICLE WRAPPER */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 space-y-10">
        
        {/* CATEGORY & METADATA */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
              {current.content_type || 'Policy Brief'}
            </span>
            <span className="text-xs font-mono text-gray-400">
              • {current.reading_time_minutes || 6} Min Read
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {current.title}
          </h1>

          {current.subtitle && (
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-serif italic">
              {current.subtitle}
            </p>
          )}

          {/* AUTHOR CARD */}
          <div className="pt-4 flex items-center justify-center gap-4 border-t border-b border-white/10 py-4 max-w-md mx-auto">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-300 flex items-center justify-center text-black font-extrabold text-base">
              PY
            </div>
            <div className="text-left font-mono text-xs">
              <p className="font-bold text-white text-sm">{current.author_name || 'People & Youth Scholar'}</p>
              <p className="text-cyan-400">{current.author_role || 'Verified Institutional Author'}</p>
            </div>
          </div>
        </div>

        {/* FEATURED COVER IMAGE */}
        {current.featured_image && (
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img 
              src={current.featured_image} 
              alt={current.title} 
              className="w-full h-80 sm:h-96 object-cover"
            />
          </div>
        )}

        {/* OFFICIAL PDF REPORT ATTACHMENT CARD */}
        {current.pdf_url && (
          <div className="bg-gradient-to-r from-blue-950/60 via-[#0a122c] to-cyan-950/60 border-2 border-cyan-500/40 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">OFFICIAL DOCUMENTATION</span>
              <h3 className="text-sm font-bold text-white">Full Institutional PDF Report Attached</h3>
              <p className="text-xs text-gray-300">Download the complete peer-reviewed paper with appendices and audit logs.</p>
            </div>
            <a
              href={current.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-mono transition-all shrink-0 flex items-center gap-2"
            >
              <span>📄 Download PDF Report</span>
              <span>↘</span>
            </a>
          </div>
        )}

        {/* ABSTRACT HIGHLIGHT BOX */}
        {current.abstract && (
          <div className="bg-white/5 border-l-4 border-amber-400 rounded-r-2xl p-6 sm:p-8 space-y-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest block">EXECUTIVE ABSTRACT</span>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-serif">
              {current.abstract}
            </p>
          </div>
        )}

        {/* ARTICLE EXTENDED LONG-FORM BODY */}
        <div className="prose prose-invert max-w-none text-gray-200 text-sm sm:text-base leading-relaxed space-y-6 font-sans">
          <div dangerouslySetInnerHTML={{ __html: current.body_markdown.replace(/\n/g, '<br/>') }} />
        </div>

        {/* TAGS LEDGER */}
        {current.tags && current.tags.length > 0 && (
          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-2">
            {current.tags.map((tag: string, idx: number) => (
              <span key={idx} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-cyan-300">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* FOOTER AUTHOR BIO CARD */}
        <div className="bg-[#0b1228] border border-white/10 rounded-3xl p-8 space-y-4">
          <span className="text-xs font-mono text-cyan-400 uppercase font-bold">ABOUT THE INSTITUTIONAL PUBLISHER</span>
          <p className="text-xs text-gray-300 leading-relaxed">
            This article is published under the open-access charter of <strong>People &amp; Youth (VNJCM)</strong>. All publications are subject to peer review and preserved within our 17 Knowledge Caves to support constitutional literacy and public administration.
          </p>
          <div className="flex gap-4">
            <Link href="/submit-paper" className="text-xs font-mono text-cyan-400 hover:underline">Submit Your Research →</Link>
            <Link href="/constitution" className="text-xs font-mono text-amber-400 hover:underline">View Governing Constitution →</Link>
          </div>
        </div>

      </article>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050814] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 font-mono">
          <p>&copy; 2026 People &amp; Youth Digital Institution (VNJCM). All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}
