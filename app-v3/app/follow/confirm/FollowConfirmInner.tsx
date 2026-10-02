'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function FollowConfirmInner() {
  const params = useSearchParams();
  const token = params?.get('token') ?? '';

  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ALREADY' | 'ERROR'>('LOADING');
  const [message, setMessage] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    async function confirm() {
      if (!token) {
        setStatus('ERROR');
        setMessage('No confirmation token provided.');
        return;
      }

      try {
        const res = await fetch(
          `/api/office/follow/confirm?token=${encodeURIComponent(token)}`,
          { cache: 'no-store' }
        );
        const json = await res.json();

        if (!res.ok) {
          setStatus('ERROR');
          setMessage(json?.error ?? 'Unable to confirm.');
          return;
        }

        if (json.already_confirmed) {
          setStatus('ALREADY');
          setMessage('Your follow was already confirmed.');
          return;
        }

        setStatus('SUCCESS');
        setFullName(json.full_name ?? '');
        setMessage('Your follow has been confirmed.');
      } catch (err) {
        setStatus('ERROR');
        setMessage(err instanceof Error ? err.message : 'Unable to confirm.');
      }
    }
    void confirm();
  }, [token]);

  return (
    <main className="min-h-screen bg-[#05070f] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#0b0f1c] p-8 text-center space-y-4">
        {status === 'LOADING' && (
          <div className="text-xs uppercase tracking-[0.3em] text-amber-400 animate-pulse">
            Confirming your follow…
          </div>
        )}

        {status === 'SUCCESS' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-2xl text-emerald-300">
              ✓
            </div>
            <h1 className="text-lg font-black uppercase tracking-wider text-emerald-300">
              Follow Confirmed
            </h1>
            <p className="text-sm text-gray-300">
              {fullName ? `Thank you, ${fullName}.` : 'Thank you.'} You are now
              following the office. You will receive a weekly digest of their
              published work.
            </p>
            <Link
              href="/leadership-network"
              className="inline-block mt-4 rounded-lg bg-amber-400 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black"
            >
              Explore Leadership Network
            </Link>
          </>
        )}

        {status === 'ALREADY' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 text-2xl text-cyan-300">
              ✓
            </div>
            <h1 className="text-lg font-black uppercase tracking-wider text-cyan-300">
              Already Confirmed
            </h1>
            <p className="text-sm text-gray-300">{message}</p>
            <Link
              href="/leadership-network"
              className="inline-block mt-4 rounded-lg bg-white/10 border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
            >
              Back to Network
            </Link>
          </>
        )}

        {status === 'ERROR' && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10 text-2xl text-red-300">
              ✕
            </div>
            <h1 className="text-lg font-black uppercase tracking-wider text-red-300">
              Unable to Confirm
            </h1>
            <p className="text-sm text-gray-300">{message}</p>
            <Link
              href="/leadership-network"
              className="inline-block mt-4 rounded-lg bg-white/10 border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
            >
              Back to Network
            </Link>
          </>
        )}
      </div>
    </main>
  );
}