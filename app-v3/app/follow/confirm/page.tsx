'use client';

import { Suspense } from 'react';
import FollowConfirmInner from './FollowConfirmInner';

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#05070f] text-white flex items-center justify-center p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-amber-400 animate-pulse">
            Loading…
          </div>
        </main>
      }
    >
      <FollowConfirmInner />
    </Suspense>
  );
}