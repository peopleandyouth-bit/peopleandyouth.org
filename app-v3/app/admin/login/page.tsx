'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type AuthMode =
  | 'PASSWORD'
  | 'MAGIC_LINK'
  | 'RESET_PASSWORD';

type Message = {
  type: 'ERROR' | 'SUCCESS';
  text: string;
} | null;

export default function AdminLoginPage() {
  const router = useRouter();

  const [authMode, setAuthMode] =
    useState<AuthMode>('PASSWORD');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] =
    useState<Message>(null);

  function parseErrorMsg(data: any): string {
    if (!data) {
      return 'An error occurred.';
    }

    if (typeof data === 'string') {
      return data;
    }

    if (typeof data.error === 'string') {
      return data.error;
    }

    if (
      data.error &&
      typeof data.error.message === 'string'
    ) {
      return data.error.message;
    }

    return 'Authentication request failed. Please check your credentials or server setup.';
  }

  /*
   * ============================================================
   * PASSWORD LOGIN
   * ============================================================
   */

  async function handlePasswordLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (error) {
      setLoading(false);

      setMessage({
        type: 'ERROR',
        text: parseErrorMsg(error),
      });

      return;
    }

    /*
     * Confirm that the browser client actually has
     * a valid Supabase session.
     */

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || !data.session) {
      setLoading(false);

      setMessage({
        type: 'ERROR',
        text:
          'Authentication succeeded, but the secure session could not be established. Please try again.',
      });

      return;
    }

    /*
     * Allow the browser time to persist the session.
     */

    await new Promise((resolve) =>
      setTimeout(resolve, 150)
    );

    const params = new URLSearchParams(
      window.location.search
    );

    const redirect =
      params.get('redirect') ||
      '/admin/command-centre';

    setLoading(false);

    router.push(redirect);
    router.refresh();
  }

  /*
   * ============================================================
   * MAGIC LINK
   * ============================================================
   */

  async function handleMagicLink(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        '/api/auth/send-link',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: normalizedEmail,
            type: 'MAGIC_LINK',
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({
          type: 'SUCCESS',
          text:
            data.message ||
            'Magic login link sent. Please check your email.',
        });
      } else {
        setMessage({
          type: 'ERROR',
          text: parseErrorMsg(data),
        });
      }
    } catch {
      setMessage({
        type: 'ERROR',
        text:
          'Network connection error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * PASSWORD SETUP / RESET
   * ============================================================
   */

  async function handlePasswordSetup(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        '/api/auth/send-link',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: normalizedEmail,
            type: 'RESET_PASSWORD',
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({
          type: 'SUCCESS',
          text:
            data.message ||
            'Password setup link sent. Please check your email.',
        });
      } else {
        setMessage({
          type: 'ERROR',
          text: parseErrorMsg(data),
        });
      }
    } catch {
      setMessage({
        type: 'ERROR',
        text:
          'Network connection error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-[#030611] text-gray-100 font-sans flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#070b19] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">

        {/* HEADER */}

        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
            SOVEREIGN CONTROL CONSOLE
          </span>

          <h1 className="text-2xl font-black text-white tracking-wide uppercase">
            Admin Authentication
          </h1>

          <p className="text-xs text-gray-400">
            Sign in to access the Institution Operating System (IOS)
          </p>
        </div>

        {/* TABS */}

        <div className="grid grid-cols-3 gap-1 bg-[#030611] p-1 rounded-xl border border-gray-800 text-[10px] font-bold uppercase">

          <button
            type="button"
            onClick={() => {
              setAuthMode('PASSWORD');
              setMessage(null);
            }}
            className={`py-2 rounded-lg transition ${
              authMode === 'PASSWORD'
                ? 'bg-amber-500 text-black font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Password
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('MAGIC_LINK');
              setMessage(null);
            }}
            className={`py-2 rounded-lg transition ${
              authMode === 'MAGIC_LINK'
                ? 'bg-amber-500 text-black font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ✨ Magic Link
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('RESET_PASSWORD');
              setMessage(null);
            }}
            className={`py-2 rounded-lg transition ${
              authMode === 'RESET_PASSWORD'
                ? 'bg-amber-500 text-black font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔑 Set Password
          </button>
        </div>

        {/* ALERT */}

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium border ${
              message.type === 'ERROR'
                ? 'bg-red-950/40 border-red-500/50 text-red-300'
                : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* PASSWORD */}

        {authMode === 'PASSWORD' && (
          <form
            onSubmit={handlePasswordLogin}
            className="space-y-4"
          >
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                EMAIL ADDRESS
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="user@peopleandyouth.org"
                className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">
                  PASSWORD
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('RESET_PASSWORD');
                    setMessage(null);
                  }}
                  className="text-[10px] text-amber-400 hover:underline font-bold uppercase"
                >
                  Forgot / Set Password?
                </button>
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
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
              {loading
                ? 'Authenticating...'
                : '🔑 Sign In to Console'}
            </button>
          </form>
        )}

        {/* MAGIC LINK */}

        {authMode === 'MAGIC_LINK' && (
          <form
            onSubmit={handleMagicLink}
            className="space-y-4"
          >
            <div>
              <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                EMAIL ADDRESS
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="user@peopleandyouth.org"
                className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                required
              />

              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                We will send a one-click login link directly to your inbox via contact@peopleandyouth.org.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading
                ? 'Sending Magic Link...'
                : '✨ Send One-Click Magic Link'}
            </button>
          </form>
        )}

        {/* RESET PASSWORD */}

        {authMode === 'RESET_PASSWORD' && (
          <form
            onSubmit={handlePasswordSetup}
            className="space-y-4"
          >
            <div>
              <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                REGISTERED EMAIL ADDRESS
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="user@peopleandyouth.org"
                className="w-full bg-[#030611] border border-gray-800 p-3 text-xs text-white rounded-xl outline-none focus:border-amber-500 transition"
                required
              />

              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                Enter your registered email address to receive a password configuration link in your inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading
                ? 'Sending Setup Link...'
                : '📧 Send Password Setup Email'}
            </button>
          </form>
        )}

        <div className="border-t border-gray-800 pt-4 text-center">
          <a
            href="/"
            className="text-[11px] text-gray-500 hover:text-gray-300"
          >
            ← Return to People & Youth
          </a>
        </div>

      </div>
    </div>
  );
}