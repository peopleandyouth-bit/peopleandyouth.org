'use client';

import { useEffect, useState, type ReactNode } from 'react';

type Identity = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: 'founder' | 'chairperson' | 'cto' | 'admin';
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE';
};

type GuardState =
  | { kind: 'loading' }
  | { kind: 'unauthenticated' }
  | { kind: 'forbidden'; reason: string }
  | { kind: 'authorized'; identity: Identity };

interface AdminPageGuardProps {
  children: ReactNode;
  requirePermission?: string;
  requireRole?: 'founder' | 'chairperson' | 'cto' | 'admin';
}

export default function AdminPageGuard({
  children,
  requirePermission,
  requireRole,
}: AdminPageGuardProps) {
  const [state, setState] = useState<GuardState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        const response = await fetch('/api/admin/iam', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.status === 401) {
          if (!cancelled) setState({ kind: 'unauthenticated' });
          return;
        }

        if (response.status === 403) {
          if (!cancelled)
            setState({
              kind: 'forbidden',
              reason: 'Institutional access is inactive.',
            });
          return;
        }

        if (!response.ok) {
          if (!cancelled)
            setState({
              kind: 'forbidden',
              reason: 'Unable to verify institutional access.',
            });
          return;
        }

        const data = (await response.json()) as {
          authenticated: boolean;
          identity: Identity | null;
        };

        if (!data.authenticated || !data.identity) {
          if (!cancelled) setState({ kind: 'unauthenticated' });
          return;
        }

        const identity = data.identity;

        if (identity.status !== 'ACTIVE') {
          if (!cancelled)
            setState({
              kind: 'forbidden',
              reason: 'Institutional access is inactive.',
            });
          return;
        }

        const privileged =
          identity.role === 'founder' || identity.role === 'chairperson';

        if (requireRole && identity.role !== requireRole) {
          if (!cancelled)
            setState({
              kind: 'forbidden',
              reason: `This surface requires the "${requireRole}" role.`,
            });
          return;
        }

        if (
          requirePermission &&
          !privileged &&
          !identity.permissions.includes(requirePermission)
        ) {
          if (!cancelled)
            setState({
              kind: 'forbidden',
              reason: `Permission required: ${requirePermission}.`,
            });
          return;
        }

        if (!cancelled) setState({ kind: 'authorized', identity });
      } catch {
        if (!cancelled)
          setState({
            kind: 'forbidden',
            reason: 'Unable to verify institutional access.',
          });
      }
    }

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [requirePermission, requireRole]);

  if (state.kind === 'loading') {
    return (
      <main className="min-h-screen bg-[#030611] text-gray-100 flex items-center justify-center p-6">
        <div className="text-xs uppercase tracking-[0.3em] text-amber-400 animate-pulse">
          Verifying institutional access…
        </div>
      </main>
    );
  }

  if (state.kind === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-[#030611] text-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-amber-500/20 bg-[#070b19] p-8 text-center space-y-4">
          <h1 className="text-lg font-black uppercase tracking-wider text-amber-400">
            Sign in required
          </h1>
          <p className="text-xs text-gray-400">
            This surface is restricted to authenticated Command Centre users.
          </p>
          <a
            href="/admin/login"
            className="inline-block px-5 py-2.5 bg-amber-500 text-black text-xs font-bold uppercase rounded-lg"
          >
            Go to Admin Login
          </a>
        </div>
      </main>
    );
  }

  if (state.kind === 'forbidden') {
    return (
      <main className="min-h-screen bg-[#030611] text-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-[#070b19] p-8 text-center space-y-4">
          <h1 className="text-lg font-black uppercase tracking-wider text-red-400">
            Access denied
          </h1>
          <p className="text-xs text-gray-400">{state.reason}</p>
          <a
            href="/admin/command-centre"
            className="inline-block px-5 py-2.5 bg-white/[0.06] border border-white/10 text-white text-xs font-bold uppercase rounded-lg"
          >
            Back to Command Centre
          </a>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}