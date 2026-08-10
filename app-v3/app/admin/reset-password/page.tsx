'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ERROR' | 'SUCCESS'; text: string } | null>(null);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'ERROR', text: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'ERROR', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (error) {
      setMessage({ type: 'ERROR', text: error.message });
    } else {
      setMessage({ type: 'SUCCESS', text: '✅ Password updated successfully! Redirecting to Command Centre...' });
      setTimeout(() => {
        router.push('/admin/command-centre');
      }, 1500);
    }
  }

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#070b19] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
            ACCOUNT SECURITY
          </span>
          <h1 className="text-xl font-black text-white uppercase tracking-wide">
            Set Your Console Password
          </h1>
          <p className="text-xs text-gray-400">
            Enter your new personal password to secure your admin account.
          </p>
        </div>

        {message && (
          <div className={`p-3.5 rounded-xl text-xs font-medium border ${
            message.type === 'ERROR' 
              ? 'bg-red-950/40 border-red-500/50 text-red-300' 
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
              NEW PASSWORD
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
              CONFIRM NEW PASSWORD
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : '🔒 Save Password & Access Console'}
          </button>
        </form>
      </div>
    </div>
  );
}