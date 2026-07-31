"use client";

import { useState } from "react";
import CheckoutModal from "@/components/membership/CheckoutModal";

export default function MembershipPreview() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section id="membership" className="py-24 relative z-10 bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Dissent Card Preview */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md aspect-[1.586/1] rounded-2xl glass-panel p-6 border border-cyan-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between hover:scale-105 transition-all duration-300">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      P&Y
                    </div>
                    <span className="font-bold text-xs tracking-wider text-white">FOUNDING MEMBER</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 border border-cyan-500/30 bg-cyan-950/60 px-2 py-0.5 rounded">
                    VERIFIED ID
                  </span>
                </div>

                <div className="relative z-10 my-4">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">MEMBER NAME</div>
                  <div className="text-xl font-bold text-white tracking-wide">SWARAJ SHANDILYA</div>
                  <div className="text-[11px] text-cyan-300 font-mono mt-1">ID: PY-2026-FOUNDER-001</div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 relative z-10 text-[10px] font-mono text-slate-400">
                  <div>
                    <span>ISSUED: </span>
                    <span className="text-white">AUG 2026</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 font-bold">DISSENT DIAS VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Offer & Checkout Trigger */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase block">
                Exclusive Founding Access
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Join as a Founding Member
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Get your lifetime digital Dissent Card, voting rights on policy motions, paper submission credentials, and access to rural advisory roundtables.
              </p>

              <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-4">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-extrabold text-white">?499</span>
                  <span className="text-sm text-slate-400 line-through">?1,000</span>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    50% OFF LAUNCH OFFER
                  </span>
                </div>

                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center space-x-2">
                    <span className="text-cyan-400">?</span>
                    <span>Digital Membership Card with QR Verification</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-cyan-400">?</span>
                    <span>Voting access on Dissent Dias policy debates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-cyan-400">?</span>
                    <span>Direct submission to 7 Sovereign Think Tank Journals</span>
                  </li>
                </ul>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-cyan-500/25 transition-all"
                >
                  Proceed to Secure Checkout (Razorpay)
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Razorpay Modal */}
      <CheckoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
