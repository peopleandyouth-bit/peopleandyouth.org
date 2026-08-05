'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function PublicationReaderWithAuthModal() {
  const params = useParams();
  const slug = params?.slug as string;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auth & Download Modal States (PRD #2)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('India');
  const [profession, setProfession] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  useEffect(() => {
    if (slug) fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);

    const { data: cimsData } = await supabase
      .from('institution_content')
      .select('*')
      .eq('slug', slug)
      .single();

    if (cimsData) {
      setRecord(cimsData);
    } else {
      const { data: essayData } = await supabase
        .from('watermarked_essays')
        .select('*')
        .eq('slug', slug)
        .single();

      if (essayData) setRecord(essayData);
    }
    setLoading(false);
  };

  const handleTriggerDownload = () => {
    // Check local session
    const savedUser = localStorage.getItem('py_user_session');
    if (savedUser) {
      executeWatermarkedDownload(JSON.parse(savedUser));
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleSignupAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAuth(true);

    const userPayload = { fullName, email, country, profession };
    localStorage.setItem('py_user_session', JSON.stringify(userPayload));

    await executeWatermarkedDownload(userPayload);
    setSubmittingAuth(false);
    setIsAuthModalOpen(false);
  };

  const executeWatermarkedDownload = async (userInfo: any) => {
    setDownloadMsg('Generating password-protected watermarked PDF...');
    try {
      const response = await fetch('/api/pdf/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicationId: slug,
          userEmail: userInfo.email,
          userName: userInfo.fullName,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        window.print(); // Trigger high-resolution print/PDF pipeline
        setDownloadMsg(resData.passwordHint);
      }
    } catch (err) {
      setDownloadMsg('Download failed. Triggering browser print...');
      window.print();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EAEAEA] flex items-center justify-center font-mono text-xs">
        <span>Loading Sovereign Publication...</span>
      </main>
    );
  }

  const title = record?.title || "Dialectics of Consciousness";
  const subtitle = record?.subtitle || "A Soliloquy on Ideas, Society, and the Human Mind";
  const authorName = record?.author_name || "Swaraj Shandilya";
  const kicker = record?.domain || record?.category || "Essay • Philosophy & Human Consciousness";
  const rawHtml = record?.raw_html || "";

  return (
    <>
      <style>{`
        :root {
          --charcoal: #222222;
          --navy: #0B192C;
          --gold: #C59B27;
          --slate: #5B6470;
          --lightgrey: #F4F6F9;
          --rule: #E3E6EA;
        }

        .reader-body {
          margin: 0;
          background: #EAEAEA;
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--charcoal);
          min-height: 100vh;
          padding: 24px 12px;
        }

        .page-canvas {
          max-width: 210mm;
          margin: 0 auto;
          background: #ffffff;
          padding: 22mm 20mm;
          box-shadow: 0 0 24px rgba(0,0,0,0.15);
        }

        .masthead {
          text-align: center;
          padding-bottom: 18px;
          margin-bottom: 30px;
          border-bottom: 1px solid var(--rule);
        }
        .masthead .brand {
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--navy);
          font-weight: bold;
        }
        .masthead .tagline {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--slate);
          margin-top: 4px;
        }

        .kicker {
          text-align: center;
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: 2.5px;
          font-size: 11.5px;
          font-weight: bold;
          margin-bottom: 14px;
        }
        h1.title {
          text-align: center;
          color: var(--navy);
          font-size: 28pt;
          font-weight: bold;
          margin: 0 0 10px 0;
          line-height: 1.25;
        }
        .subtitle {
          text-align: center;
          font-style: italic;
          font-size: 14pt;
          color: var(--slate);
          margin: 0 0 8px 0;
          font-weight: normal;
        }
        .meta-line {
          text-align: center;
          font-size: 11px;
          color: var(--slate);
          letter-spacing: 1px;
          margin-top: 6px;
          text-transform: uppercase;
        }

        hr.divider {
          border: none;
          border-top: 2px solid var(--gold);
          width: 60px;
          margin: 22px auto 26px auto;
        }

        .author-box {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          background: var(--lightgrey);
          border-radius: 4px;
          padding: 16px 20px;
          margin: 24px 0 34px 0;
        }
        .author-avatar {
          flex: 0 0 auto;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: var(--navy);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Georgia, serif;
          font-weight: bold;
          font-size: 18px;
        }
        .author-info .author-name {
          font-weight: bold;
          color: var(--navy);
          font-size: 14px;
          margin-bottom: 3px;
        }
        .author-info .author-bio {
          font-size: 11.5px;
          color: var(--slate);
          line-height: 1.5;
        }
        .author-info .author-platform {
          font-size: 11.5px;
          color: var(--gold);
          margin-top: 4px;
          font-weight: bold;
        }

        .preface {
          background: var(--lightgrey);
          border-left: 4px solid var(--gold);
          padding: 18px 22px;
          margin: 0 0 36px 0;
          font-style: italic;
          color: #3a3f47;
          font-size: 13.5px;
          line-height: 1.85;
        }
        .preface p { margin: 0 0 10px 0; }

        .essay {
          font-size: 12.5pt;
          line-height: 1.85;
          color: var(--charcoal);
        }
        .essay h2 {
          color: var(--navy);
          font-size: 16.5pt;
          margin: 40px 0 16px 0;
          border-bottom: 1px solid var(--rule);
          padding-bottom: 8px;
        }
        .essay blockquote, blockquote.pullquote {
          background: var(--lightgrey);
          border-left: 4px solid var(--gold);
          margin: 28px 0;
          padding: 18px 24px;
          font-style: italic;
          font-weight: bold;
          color: var(--navy);
          font-size: 13.5pt;
        }

        .essay p:first-of-type::first-letter,
        .dropcap-para::first-letter {
          font-size: 46px;
          font-weight: bold;
          float: left;
          line-height: 0.8;
          padding-right: 8px;
          padding-top: 4px;
          color: var(--navy);
        }

        .author-card-bottom {
          margin-top: 50px;
          padding-top: 26px;
          border-top: 1px solid var(--rule);
          text-align: center;
        }
        .author-card-bottom .author-name {
          font-weight: bold;
          color: var(--navy);
          font-size: 15px;
        }
        .author-card-bottom .author-bio {
          font-size: 11.5px;
          color: var(--slate);
          max-width: 520px;
          margin: 4px auto 8px auto;
        }
        .author-card-bottom .author-platform {
          font-size: 12px;
          color: var(--gold);
          font-weight: bold;
        }

        .footer-card {
          margin-top: 40px;
          background: var(--navy);
          color: #ffffff;
          border-radius: 6px;
          padding: 30px 28px;
          text-align: center;
        }
        .footer-card h3 {
          margin: 0 0 6px 0;
          font-size: 15px;
          color: var(--gold);
          text-transform: uppercase;
        }
        .footer-card p {
          font-size: 12px;
          color: #D7DCE3;
          max-width: 480px;
          margin: 0 auto 18px auto;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px 22px;
          font-size: 11.5px;
        }
        .footer-links b { color: var(--gold); }
        .footer-tagline {
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          color: #ffffff;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 16px;
          margin-top: 16px;
        }

        @media print {
          @page { size: A4; margin: 20mm; }
          .reader-body { background: #ffffff; padding: 0; }
          .page-canvas { box-shadow: none; margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="reader-body">
        {/* TOP BAR WITH DOWNLOAD PDF BUTTON */}
        <div className="no-print" style={{ maxWidth: '210mm', margin: '0 auto 12px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'monospace' }}>
          <Link href="/dissent-dias" style={{ color: '#0B192C', textDecoration: 'none', fontWeight: 'bold' }}>
            ← Return to Dissent Dias Portal
          </Link>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleTriggerDownload}
              style={{ background: '#C59B27', color: '#000000', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', fontSize: '10px' }}
            >
              📥 Download PDF (Watermarked)
            </button>
            <span style={{ color: '#C59B27', fontWeight: 'bold' }}>peopleandyouth.org</span>
          </div>
        </div>

        {downloadMsg && (
          <div className="no-print" style={{ maxWidth: '210mm', margin: '0 auto 12px auto', padding: '8px', background: '#0B192C', color: '#C59B27', borderRadius: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
            {downloadMsg}
          </div>
        )}

        {/* AUTHENTICATION / SIGNUP MODAL FOR DOWNLOAD (PRD #2) */}
        {isAuthModalOpen && (
          <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', itemsCenter: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
            <form onSubmit={handleSignupAndDownload} style={{ background: '#0B192C', border: '1px solid #C59B27', padding: '24px', borderRadius: '12px', maxWidth: '420px', width: '100%', color: '#ffffff', fontFamily: 'monospace', fontSize: '12px' }}>
              <h3 style={{ color: '#C59B27', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
                Create Free Account to Download
              </h3>
              <p style={{ color: '#999', fontSize: '10px', margin: '0 0 16px 0' }}>
                Join People & Youth to unlock watermarked publication PDFs. No payment required.
              </p>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '9px', color: '#aaa', marginBottom: '4px' }}>Full Name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '8px', background: '#070b19', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '9px', color: '#aaa', marginBottom: '4px' }}>Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', background: '#070b19', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '9px', color: '#aaa', marginBottom: '4px' }}>Country</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} style={{ width: '100%', padding: '8px', background: '#070b19', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '9px', color: '#aaa', marginBottom: '4px' }}>Profession (Optional)</label>
                <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Student / Researcher" style={{ width: '100%', padding: '8px', background: '#070b19', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setIsAuthModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submittingAuth} style={{ flex: 2, padding: '10px', background: '#C59B27', border: 'none', color: '#000', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', textTransform: 'uppercase' }}>
                  {submittingAuth ? 'Unlocking...' : 'Unlock & Download PDF'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 210MM CANVAS */}
        <div className="page-canvas">
          <div className="masthead">
            <div className="brand">Dissent Dias — by peopleandyouth.org</div>
            <div className="tagline">Peopleandyouth · At the Heart of Change · Question | Reflect | Act</div>
          </div>

          <div className="kicker">{kicker}</div>
          <h1 className="title">{title}</h1>
          <p className="subtitle">{subtitle}</p>
          <div className="meta-line">{authorName} &nbsp;·&nbsp; ~6 min read</div>

          <hr className="divider" />

          <div className="author-box">
            <div className="author-avatar">SS</div>
            <div className="author-info">
              <div className="author-name">{authorName}</div>
              <div className="author-bio">
                Founder at peopleandyouth.org | Ex-Coordinator, The Public Policy Club, IIFT | MBA(IB) IIFT (2025–27) | Marketing, Strategy &amp; Analytics | Professional Data Engineer | Social Impact Leadership | Ex-HCL Technologies
              </div>
              <div className="author-platform">peopleandyouth.org</div>
            </div>
          </div>

          <div className="preface">
            <p>This is neither a political manifesto nor an attempt to persuade.</p>
            <p>It is a soliloquy — a conversation with oneself, written in the hope that others may find reflections of their own questions within it.</p>
            <p>Ideas are not conclusions to be accepted; they are invitations to think.</p>
          </div>

          {rawHtml ? (
            <div className="essay" dangerouslySetInnerHTML={{ __html: rawHtml }} />
          ) : (
            <div className="essay">
              <h2>I. The Age of False Dichotomies</h2>
              <p className="dropcap-para">Our age is fascinated by binaries. We are encouraged to choose between Left and Right, Capitalism and Socialism, Tradition and Modernity, Desire and Suppression, as though human civilization advances only by choosing one extreme over another.</p>
              <p>Yet history tells a different story.</p>
              <p>Every significant transformation has emerged not from the victory of one absolute over another, but from the dialogue between opposing forces.</p>
              <blockquote className="pullquote">
                "True capitalism and true socialism are not enemies. Their highest forms meet in synthesis."
              </blockquote>
            </div>
          )}

          <div className="author-card-bottom">
            <div className="author-name">{authorName}</div>
            <div className="author-bio">
              Founder at peopleandyouth.org | Ex-Coordinator, The Public Policy Club, IIFT | MBA(IB) IIFT (2025–27) | Marketing, Strategy &amp; Analytics | Professional Data Engineer | Social Impact Leadership | Ex-HCL Technologies
            </div>
            <div className="author-platform">peopleandyouth.org</div>
          </div>

          <div className="footer-card">
            <h3>Peopleandyouth.org — At the Heart of Change</h3>
            <p>
              Join us in building a culture of reasoned dialogue, intellectual curiosity, and responsible action.
            </p>
            <div className="footer-links">
              <span><b>Instagram:</b> instagram.com/peopleandyouth</span>
              <span><b>YouTube:</b> youtube.com/@peopleandyouth</span>
              <span><b>LinkedIn:</b> Swaraj Shandilya</span>
              <span><b>Email:</b> peopleandyouth@gmail.com</span>
            </div>
            <div className="footer-tagline">Question. Reflect. Act.</div>
          </div>
        </div>
      </div>
    </>
  );
}