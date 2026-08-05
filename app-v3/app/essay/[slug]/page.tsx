import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: article } = await supabase
    .from('institution_content')
    .select('*')
    .eq('slug', slug)
    .single();

  if (article) {
    return {
      title: `${article.title} — Swaraj Shandilya`,
      description: article.subtitle || `Published by ${article.author_name}`,
    };
  }

  const { data: essay } = await supabase
    .from('watermarked_essays')
    .select('*')
    .eq('slug', slug)
    .single();

  if (essay) {
    return {
      title: `${essay.title} — Swaraj Shandilya`,
      description: essay.subtitle || `Official record by ${essay.author_name}`,
    };
  }

  return { title: 'Dialectics of Consciousness — Swaraj Shandilya' };
}

export default async function PublicationReaderPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) notFound();

  // Fetch record from Supabase database
  let record: any = null;

  const { data: cimsData } = await supabase
    .from('institution_content')
    .select('*')
    .eq('slug', slug)
    .single();

  if (cimsData) {
    record = cimsData;
  } else {
    const { data: essayData } = await supabase
      .from('watermarked_essays')
      .select('*')
      .eq('slug', slug)
      .single();

    if (essayData) record = essayData;
  }

  const title = record?.title || "Dialectics of Consciousness";
  const subtitle = record?.subtitle || "A Soliloquy on Ideas, Society, and the Human Mind";
  const authorName = record?.author_name || "Swaraj Shandilya";
  const kicker = record?.domain || record?.category || "Essay • Philosophy & Human Consciousness";
  const rawHtml = record?.raw_html || "";

  return (
    <>
      {/* EXACT CSS STYLES FROM HTML SOURCE FILE */}
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

        /* Masthead */
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

        /* Header */
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

        /* Author box */
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
          letter-spacing: 0;
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

        /* Preface box */
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
        .preface p:last-child { margin-bottom: 0; }

        /* Essay body */
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
          letter-spacing: 0.3px;
        }
        .essay p {
          margin: 0 0 14px 0;
        }
        .essay p.tight {
          margin: 0 0 4px 0;
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
          line-height: 1.6;
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
          font-family: Georgia, serif;
        }

        /* Bottom author card */
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
          margin-bottom: 6px;
        }
        .author-card-bottom .author-bio {
          font-size: 11.5px;
          color: var(--slate);
          max-width: 520px;
          margin: 0 auto 8px auto;
          line-height: 1.6;
        }
        .author-card-bottom .author-platform {
          font-size: 12px;
          color: var(--gold);
          font-weight: bold;
        }
        .essay-credit {
          text-align: center;
          font-size: 11px;
          color: var(--slate);
          font-style: italic;
          margin-top: 14px;
        }

        /* Footer community card */
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
          letter-spacing: 2px;
        }
        .footer-card p {
          font-size: 12px;
          line-height: 1.7;
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
          margin-bottom: 20px;
        }
        .footer-links span {
          color: #ffffff;
        }
        .footer-links b {
          color: var(--gold);
        }
        .footer-tagline {
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #ffffff;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 16px;
        }

        /* Print */
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          .reader-body {
            background: #ffffff;
            padding: 0;
          }
          .page-canvas {
            box-shadow: none;
            margin: 0;
            padding: 0;
            max-width: none;
          }
          .essay h2 {
            break-after: avoid;
          }
          blockquote.pullquote, .preface, .author-box, .footer-card {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="reader-body">
        {/* TOP BAR BACK NAVIGATION */}
        <div style={{ maxWidth: '210mm', margin: '0 auto 12px auto', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'monospace' }}>
          <Link href="/dissent-dias" style={{ color: '#0B192C', textDecoration: 'none', fontWeight: 'bold' }}>
            ← Return to Dissent Dias Portal
          </Link>
          <span style={{ color: '#C59B27', fontWeight: 'bold' }}>peopleandyouth.org</span>
        </div>

        {/* PAPER CANVAS */}
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

          {/* ESSAY BODY CONTENT */}
          {rawHtml ? (
            <div
              className="essay"
              dangerouslySetInnerHTML={{ __html: rawHtml }}
            />
          ) : (
            <div className="essay">
              <h2>I. The Age of False Dichotomies</h2>
              <p className="dropcap-para">Our age is fascinated by binaries. We are encouraged to choose between Left and Right, Capitalism and Socialism, Tradition and Modernity, Desire and Suppression, as though human civilization advances only by choosing one extreme over another.</p>
              <p>Yet history tells a different story.</p>
              <p>Every significant transformation has emerged not from the victory of one absolute over another, but from the dialogue between opposing forces.</p>
              <p>The philosopher Hegel articulated this beautifully through the movement of thesis, antithesis, and synthesis. Every established idea eventually encounters its contradiction. Their conflict is not the end of thought but its beginning, for from that tension emerges a synthesis — an understanding richer than either position alone.</p>
              <p>Perhaps this is not merely the movement of philosophy.<br />Perhaps it is the movement of history itself.</p>
              <p>It is for this reason that I find the statement both provocative and meaningful:</p>

              <blockquote className="pullquote">
                "True capitalism and true socialism are not enemies. Their highest forms meet in synthesis."
              </blockquote>

              <p>The future rarely belongs to ideological purity.<br />It belongs to intellectual evolution.</p>

              <h2>II. Mathematics: The Language of Nature</h2>
              <p className="dropcap-para">Mathematics possesses a remarkable honesty. Every mathematical journey begins with assumptions.</p>
              <p>Those assumptions are questioned through contradictions. Hypotheses are tested. Incorrect equations are abandoned without sentiment. New formulations emerge.</p>
              <p>The previous equation is not hated; it simply becomes insufficient. Mathematics carries no emotional attachment to its past.</p>

              <blockquote className="pullquote">
                "It evolves because it is willing to discard yesterday's certainty in pursuit of today's truth."
              </blockquote>

              <p>Perhaps that is why mathematics has often been described as the language of nature itself.</p>
              <p>Nature does not negotiate with ideology.<br />It responds only to reality.</p>

              <h2>III. Left and Right: Beyond Politics</h2>
              <p className="dropcap-para">Perhaps the words Left and Right existed as metaphors long before they became political identities.</p>
              <p>Across numerous traditions, the right hand has been regarded as auspicious. I do not concern myself here with proving why. Like the opening assumption of a mathematical proof, it merely serves as the premise from which reasoning begins.</p>
              <p>Equally poetic is another observation.</p>
              <p>The human heart lies on the left. Whether this symbolism is culturally assigned or naturally interpreted, it has long associated the left with emotion, compassion, and human sensitivity.</p>
              <p>Yet emotion alone has never been sufficient to guide civilization.<br />Nor has logic alone.</p>
              <p>The evolution of humanity required something greater than both.<br />It required understanding.</p>

              <h2>IV. The Discovery of Soliloquy</h2>
              <p className="dropcap-para">Human beings did not become wise merely because they experienced emotions. They became wise when they began observing those emotions.</p>
              <p>That observation began with solitude.<br />With silence.<br />With the courage to converse with oneself.</p>
              <p>Every civilization that sought inner understanding eventually discovered some form of soliloquy — an inward dialogue through which thought became both the observer and the observed.</p>
              <p>From this profound encounter emerged Dhyan.</p>
              <p>Meditation is often misunderstood as the absence of thought. Perhaps it is precisely the opposite.</p>
              <p>Dhyan is the disciplined practice of understanding thought itself.<br />Not suppressing it.<br />Not escaping it.<br />Understanding it.</p>

              <h2>V. The Centre of Consciousness</h2>
              <p className="dropcap-para">Thoughts are constantly in motion. They arise. They collide. They contradict one another. They disappear. They return in altered forms.</p>
              <p>To observe this movement patiently is to discover that awareness does not belong entirely to emotion or to intellect.</p>
              <p>It resides somewhere between them.<br />At the centre.</p>

              <blockquote className="pullquote">
                "Perhaps consciousness itself is nothing more than the continuous reconciliation of contradictions taking place within the human mind."
              </blockquote>

              <h2>VI. The Tragedy of Inherited Ideas</h2>
              <p className="dropcap-para">Unfortunately, ideas rarely arrive before interpretations. Most individuals inherit opinions long before they inherit the habit of questioning.</p>
              <p>If a child grows within a society marked by prolonged suppression, exploitation, or deprivation, that child may naturally develop an instinctive resentment towards concepts associated with those experiences.</p>
              <p>Such reactions are understandable.<br />Yet understanding should not prevent inquiry.</p>
              <p>Imagine a child who has never eaten a banana. Instead of the fruit, someone hands the child only its peel. The child tastes it. Finds it unpleasant. And concludes that bananas themselves are undesirable.</p>
              <p>The judgment is sincere.<br />But sincerity does not guarantee truth.</p>
              <p>The conclusion is based upon an encounter with the outer layer rather than the essence.</p>
              <p>Ideas often suffer the same fate. We reject many philosophies not because we have examined them ourselves, but because someone else interpreted them before we had the opportunity to experience them directly.</p>
              <p>Sometimes that "someone" is a teacher. Sometimes a preacher. Sometimes a politician. Sometimes the loudest voice in the room.</p>

              <blockquote className="pullquote">
                "Borrowed certainty is among the greatest obstacles to genuine understanding."
              </blockquote>

              <h2>VII. Freedom Begins with Inquiry</h2>
              <p className="dropcap-para">Perhaps intellectual freedom does not begin when we choose an ideology. Perhaps it begins when we acquire the courage to examine every ideology.</p>
              <p>Without fear.<br />Without inherited loyalty.<br />Without inherited hatred.</p>
              <p>Every meaningful discovery begins exactly where unquestioned certainty ends.</p>
              <p>For borrowed beliefs may offer comfort.<br />Only examined beliefs offer wisdom.</p>

              <h2>VIII. Towards Praxis</h2>
              <p className="dropcap-para">Knowledge that remains confined to books becomes information. Knowledge that survives questioning becomes understanding. Understanding that transforms conduct becomes wisdom. And wisdom expressed through action becomes Praxis.</p>
              <p>Perhaps that is the purpose of every meaningful dialogue.</p>
              <p>Not to produce followers.<br />Not to manufacture agreement.</p>
              <p>But to cultivate minds capable of questioning with humility, reasoning with honesty, and acting with responsibility.</p>

              <blockquote className="pullquote">
                "Because civilizations do not advance through the triumph of certainty. They advance through the courage to think again."
              </blockquote>
            </div>
          )}

          {/* BOTTOM AUTHOR CARD */}
          <div className="author-card-bottom">
            <div className="author-name">{authorName}</div>
            <div className="author-bio">
              Founder at peopleandyouth.org | Ex-Coordinator, The Public Policy Club, IIFT | MBA(IB) IIFT (2025–27) | Marketing, Strategy &amp; Analytics | Professional Data Engineer | Social Impact Leadership | Ex-HCL Technologies
            </div>
            <div className="author-platform">peopleandyouth.org</div>
            <div className="essay-credit">A peopleandyouth.org Essay &nbsp;|&nbsp; Leading Youth Towards Praxis</div>
          </div>

          {/* FOOTER COMMUNITY CARD */}
          <div className="footer-card">
            <h3>Peopleandyouth.org — At the Heart of Change</h3>
            <p>
              Join us in building a culture of reasoned dialogue, intellectual curiosity, and responsible action. If this essay resonated with you, we invite you to become part of the conversation by following our work, sharing your perspectives, and engaging with our growing community.
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