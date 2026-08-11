'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'MAGIC_LINK';

  const [status, setStatus] = useState('Verifying authentication token...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or expired authentication link.');
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email, type })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          if (type === 'RESET_PASSWORD') {
            router.push(`/admin/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
          } else {
            setStatus('Authenticated! Redirecting to Command Centre...');
            setTimeout(() => {
              router.push('/admin/command-centre');
            }, 1000);
          }
        } else {
          setError(data.error || 'Authentication token verification failed.');
        }
      } catch (err) {
        setError('Network error verifying token.');
      }
    }

    verifyToken();
  }, [token, email, type, router]);

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#070b19] border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
          SECURITY VERIFICATION
        </span>
        {error ? (
          <div className="p-4 bg-red-950/40 border border-red-500/50 text-red-300 rounded-xl text-xs">
            ⚠️ {error}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-300 font-mono">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030611] text-white flex items-center justify-center">Loading Verification...</div>}>
      <VerifyContent />
    </Suspense>
  );
}