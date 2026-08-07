'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'reflection', label: '🖋 Reflection', desc: 'A contemplated thought or response to an essay' },
  { id: 'suggestion', label: '💡 Suggestion', desc: 'An idea to refine our platform or research' },
  { id: 'article_idea', label: '📚 Article Idea', desc: 'A topic or policy area we should investigate' },
  { id: 'question', label: '❓ Core Question', desc: 'An assumption or paradigm we should challenge' },
  { id: 'collaboration', label: '🤝 Collaboration', desc: 'An inquiry regarding joint research or dialogue' },
  { id: 'bug_report', label: '🐞 Technical Note', desc: 'An issue or improvement regarding site architecture' },
  { id: 'general', label: '💬 General Message', desc: 'A general note to the editorial team' },
];

const GUIDED_PROMPTS = [
  'What idea stayed with you after reading?',
  'What did you disagree with?',
  'Which assumption should we question further?',
  'What should we build next?',
  'If you could improve one thing, what would it be?',
];

export default function ReflectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('🖋 Reflection');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [organization, setOrganization] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          prompt_question: selectedPrompt,
          message,
          author_name: authorName,
          author_email: authorEmail,
          organization,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: data.message });
        setMessage('');
        setAuthorName('');
        setAuthorEmail('');
        setOrganization('');
        setSelectedPrompt(null);
      } else {
        setStatus({ type: 'error', msg: data.error || 'Submission failed.' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', msg: 'Network error. Please try again.' });
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#030611] text-white font-sans selection:bg-amber-400 selection:text-black">
      {/* HEADER UTILITY BAR */}
      <header className="border-b border-white/10 bg-[#070b19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-amber-400 font-black tracking-widest text-xs uppercase hover:underline">
            ← PEOPLE & YOUTH HQ
          </Link>
          <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
            <span className="text-amber-300 font-bold uppercase">THE READER'S DESK</span>
            <span>&middot;</span>
            <span className="text-emerald-400 font-bold">● DIALOGUE OPEN</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16 space-y-12">
        
        {/* HERO SECTION */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold uppercase tracking-widest inline-block">
            CONTINUE THE CONVERSATION
          </span>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Reflections
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 font-serif italic leading-relaxed border-l-2 border-amber-400/60 pl-6 text-left sm:text-center sm:border-l-0 sm:pl-0">
            &ldquo;Every institution is shaped not only by the ideas it publishes, but by the questions its readers ask. Leave us a reflection—not to flatter us, but to make us think.&rdquo;
          </p>
        </div>

        {/* GUIDED THOUGHT PROMPTS */}
        <div className="bg-[#070b19]/60 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
          <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider block">
            Guided Prompts (Optional)
          </span>
          <p className="text-gray-400 text-xs font-mono">
            Click a question below to center your reflection around a specific inquiry:
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {GUIDED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPrompt(selectedPrompt === prompt ? null : prompt)}
                className={`px-4 py-2.5 rounded-xl font-serif text-xs transition-all text-left border ${
                  selectedPrompt === prompt
                    ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-lg scale-[1.02]'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:border-amber-400/50 hover:bg-white/10'
                }`}
              >
                {prompt} {selectedPrompt === prompt && '✓'}
              </button>
            ))}
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-[#070b19]/80 border border-amber-500/30 rounded-3xl p-8 sm:p-12 backdrop-blur-xl shadow-2xl space-y-8">
          
          {status && (
            <div
              className={`p-4 rounded-xl font-mono text-xs ${
                status.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 font-mono text-xs">
            
            {/* NATURE OF RESPONSE SELECTION */}
            <div className="space-y-3">
              <label className="block text-amber-400 uppercase font-bold text-[10px] tracking-wider">
                1. SELECT THE NATURE OF YOUR RESPONSE *
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedCategory === cat.label
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold shadow-md'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-bold">{cat.label}</span>
                    <span className="text-[9px] text-gray-500 line-clamp-1 mt-1 font-sans">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ACTIVE PROMPT DISPLAY */}
            {selectedPrompt && (
              <div className="bg-amber-400/10 border border-amber-400/30 p-4 rounded-xl space-y-1">
                <span className="text-amber-300 text-[10px] uppercase font-bold">Selected Prompt Inquiry:</span>
                <p className="text-white font-serif text-sm italic">&ldquo;{selectedPrompt}&rdquo;</p>
              </div>
            )}

            {/* DETAILED MESSAGE */}
            <div className="space-y-2">
              <label className="block text-gray-300 uppercase font-bold text-[10px]">
                2. YOUR REFLECTION OR DISPATCH *
              </label>
              <textarea
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your reflection, critique, or inquiry here..."
                className="w-full bg-[#030611] border border-white/20 rounded-2xl p-4 text-white focus:border-amber-400 focus:outline-none font-serif text-sm sm:text-base leading-relaxed"
              />
            </div>

            {/* CONTACT DETAILS */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="block text-gray-400 uppercase font-bold text-[10px]">
                3. AUTHOR DETAILS & PROTOCOL CONTACT
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-500 text-[9px] uppercase mb-1">YOUR NAME (OR ANONYMOUS)</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Swaraj Shandilya"
                    className="w-full bg-[#030611] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 text-[9px] uppercase mb-1">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="name@institution.org"
                    className="w-full bg-[#030611] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 text-[9px] uppercase mb-1">ORGANIZATION / AFFILIATION</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="University / Enterprise"
                    className="w-full bg-[#030611] border border-white/20 rounded-xl p-3 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-amber-400 text-black font-extrabold uppercase rounded-2xl hover:bg-amber-300 transition-all text-xs tracking-wider shadow-xl"
            >
              {submitting ? 'Transmitting Reflection...' : '🚀 Transmit Reflection to The Reader’s Desk'}
            </button>
          </form>
        </div>

        {/* FOOTER DISPATCH NOTE */}
        <div className="text-center font-mono text-[11px] text-gray-500 space-y-1">
          <p>People & Youth &middot; Sovereign Institution for Empirical Research & Governance</p>
          <p>All reflections are handled with institutional confidentiality by the Editorial Desk.</p>
        </div>

      </div>
    </main>
  );
}