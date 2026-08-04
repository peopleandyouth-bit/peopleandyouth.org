'use client';

import React, { useState } from 'react';

type Props = { language?: 'en' | 'hi'; };

export default function WritingQuoteBanner({ language: initialLang = 'en' }: Props) {
  const [lang, setLang] = useState<'en' | 'hi'>(initialLang);

  return (
    <div className="w-full max-w-[900px] mx-auto my-6 px-4 font-sans select-none">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Noto+Serif+Devanagari:wght@400;600;700&display=swap');
        .font-literary-en { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-literary-hi { font-family: 'Noto Serif Devanagari', serif; }
        @keyframes pyBannerFadeIn { 0% { opacity: 0; transform: translateY(16px); filter: blur(8px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes pyHeartFloatRed { 0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); } 50% { transform: translateY(-5px) rotate(-4deg) scale(1.08); } }
        @keyframes pyHeartFloatBlue { 0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); } 50% { transform: translateY(-5px) rotate(4deg) scale(1.08); } }
        .animate-banner-entry { animation: pyBannerFadeIn 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-heart-red { animation: pyHeartFloatRed 3.2s ease-in-out infinite; }
        .animate-heart-blue { animation: pyHeartFloatBlue 3.6s ease-in-out infinite 400ms; }
        .paper-texture-light { background-color: #faf7f2; background-image: radial-gradient(#e4dcd3 0.65px, transparent 0.65px); background-size: 18px 16px; }
        .paper-texture-dark { background-color: #0F172A; background-image: radial-gradient(#1e293b 0.75px, transparent 0.75px); background-size: 18px 16px; }
      `}</style>

      <div className="animate-banner-entry relative rounded-3xl p-8 sm:p-10 border border-[#e8dfd8] dark:border-[#1e293b] shadow-sm paper-texture-light dark:paper-texture-dark overflow-hidden group cursor-default">
        <div className="absolute top-4 right-6 z-10 flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full px-2.5 py-1 text-[10px] font-mono">
          <button onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-amber-800 dark:text-cyan-300 font-bold' : 'text-gray-400'}`}>EN</button>
          <span className="text-gray-300">|</span>
          <button onClick={() => setLang('hi')} className={`${lang === 'hi' ? 'text-amber-800 dark:text-cyan-300 font-bold' : 'text-gray-400'}`}>हिन्दी</button>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto py-2">
          <span className="inline-block animate-heart-red text-lg select-none">❤️</span>
          {lang === 'en' ? (
            <p className="font-literary-en text-xl sm:text-2xl italic leading-relaxed text-[#2c221e] dark:text-[#f1f5f9]">
              “The most beautiful thoughts never arrive complete;<br className="hidden sm:inline" />
              They fall, like first love, upon the quiet pages of the rough.”
            </p>
          ) : (
            <p className="font-literary-hi text-lg sm:text-xl leading-loose text-[#2c221e] dark:text-[#f1f5f9]">
              “सबसे सुंदर विचार कभी पूर्ण होकर नहीं आते;<br className="hidden sm:inline" />
              वे प्रथम प्रेम की भाँति, रफ़ के शांत पन्नों पर धीरे-धीरे उतरते हैं।”
            </p>
          )}
          <span className="inline-block animate-heart-blue text-lg select-none">💙</span>
        </div>
      </div>
    </div>
  );
}
