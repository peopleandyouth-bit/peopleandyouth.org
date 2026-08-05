'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CivicPassportShowcasePage() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <main className="min-h-screen bg-[#030611] text-white font-mono text-xs selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      {/* HEADER BAR */}
      <div className="border-b border-white/10 bg-[#070b19] px-6 py-2 flex justify-between items-center text-[10px] text-gray-400">
        <Link href="/" className="text-amber-400 font-bold hover:underline">← Main Newsroom</Link>
        <span>PEOPLEANDYOUTH.ORG &middot; CIVIC PASSPORT SHOWCASE</span>
      </div>

      <div className="max-w-5xl mx-auto p-6 sm:p-12 space-y-12">
        <header className="text-center space-y-3">
          <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-[10px] uppercase rounded-full tracking-widest">
            DIGITAL PASSPORT IDENTIFICATION
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase font-serif">Sovereign Civic Passport</h1>
          <p className="text-gray-400 text-xs italic font-serif max-w-xl mx-auto">
            Click card below to flip between member identity pass and social connect verification QR codes.
          </p>
        </header>

        {/* 3D FLIPPING CARD CONTAINER */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-md h-72 cursor-pointer perspective-1000 group"
          >
            <div
              className={`relative w-full h-full duration-700 ease-out transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT SIDE */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#0a1024] via-[#0f1733] to-[#1a2754] border-2 border-amber-400/60 rounded-3xl p-6 shadow-2xl flex flex-col justify-between"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-amber-400 font-bold text-[9px] uppercase tracking-widest block">PEOPLE & YOUTH</span>
                    <h3 className="text-lg font-black text-white uppercase font-serif">Civic Passport</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-400 text-black font-extrabold text-[9px] rounded uppercase">₹499 MEMBER</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 uppercase block">Passport Holder</span>
                  <div className="text-base font-bold text-white">Swaraj Shandilya</div>
                  <div className="text-[10px] text-amber-300 font-mono">ID: PY-PASSPORT-2026-8841</div>
                </div>

                <div className="flex justify-between items-end border-t border-white/10 pt-3 text-[9px] text-gray-400">
                  <span>ISSUED BY: INSTITUTION BOARD</span>
                  <span className="text-amber-400 font-bold uppercase">CLICK TO FLIP CARD 🔄</span>
                </div>
              </div>

              {/* BACK SIDE (SOCIAL MEDIA QR CODES) */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#070b19] via-[#0b142d] to-[#040711] border-2 border-amber-400/60 rounded-3xl p-6 shadow-2xl flex flex-col justify-between"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-amber-400 font-bold text-[9px] uppercase">VERIFIED CONNECT CHANNELS</span>
                  <span className="text-[9px] text-gray-400">SCAN OR CLICK</span>
                </div>

                {/* 4 SOCIAL CHANNELS GRID */}
                <div className="grid grid-cols-2 gap-3">
                  <a href="https://instagram.com/peopleandyouth" target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:border-amber-400 transition-colors flex items-center gap-2">
                    <span className="text-base">📷</span>
                    <div><span className="text-white font-bold block text-[10px]">Instagram</span><span className="text-gray-400 text-[8px]">@peopleandyouth</span></div>
                  </a>

                  <a href="https://youtube.com/@peopleandyouth" target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:border-amber-400 transition-colors flex items-center gap-2">
                    <span className="text-base">▶️</span>
                    <div><span className="text-white font-bold block text-[10px]">YouTube</span><span className="text-gray-400 text-[8px]">@peopleandyouth</span></div>
                  </a>

                  <a href="https://linkedin.com/in/swarajshandilya" target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:border-amber-400 transition-colors flex items-center gap-2">
                    <span className="text-base">💼</span>
                    <div><span className="text-white font-bold block text-[10px]">LinkedIn</span><span className="text-gray-400 text-[8px]">Swaraj Shandilya</span></div>
                  </a>

                  <a href="mailto:contact@peopleandyouth.org" className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:border-amber-400 transition-colors flex items-center gap-2">
                    <span className="text-base">✉️</span>
                    <div><span className="text-white font-bold block text-[10px]">Email</span><span className="text-gray-400 text-[8px]">contact@...</span></div>
                  </a>
                </div>

                <div className="text-center text-[9px] text-amber-400 font-bold uppercase pt-1">
                  Click card to return to front identity pass
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-[#040711] py-6 px-6 text-center text-gray-500 text-[10px]">
        &copy; 2026 People & Youth &middot; Civic Passport ID Engine &middot; www.peopleandyouth.org
      </footer>
    </main>
  );
}