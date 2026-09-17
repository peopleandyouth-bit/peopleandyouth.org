"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

function InvestorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      const { data } = await supabase.auth.getSession();

      if (cancelled) return;

      if (data.session) {
        router.replace("/investor-portal");
        return;
      }

      setChecking(false);
    }

    void checkExistingSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (signInError || !data.session) {
        setError(
          "We could not sign you in with those credentials. Please check your email and password, or reset your password."
        );
        return;
      }

      const redirect = searchParams?.get("redirect");
      router.replace(
        redirect && redirect.startsWith("/")
          ? redirect
          : "/investor-portal"
      );
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="h-6 w-6 animate-pulse rounded-full bg-[#c8a56b]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#c8a56b]">
          Investor Relations
        </p>
        <div className="mx-auto mt-3 h-px w-12 bg-[#c8a56b]/40" />
      </div>

      <h1 className="text-center text-4xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-5xl">
        Welcome back.
      </h1>

      <p className="mx-auto mt-5 max-w-sm text-center text-sm leading-6 text-[#f5f0e6]/50">
        Access your private relationship with People &amp; Youth.
      </p>

      <form onSubmit={handleSubmit} className="mt-12 space-y-6">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-[#f5f0e6]/45"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="your.name@organisation.com"
            className="w-full rounded-lg border border-[#f5f0e6]/10 bg-[#0e1628] px-4 py-3.5 text-sm text-[#f5f0e6] outline-none transition placeholder:text-[#f5f0e6]/20 focus:border-[#c8a56b]/60"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-[10px] font-medium uppercase tracking-[0.22em] text-[#f5f0e6]/45"
            >
              Password
            </label>

            <Link
              href="/investor-login/reset-password"
              className="text-[10px] tracking-wider text-[#f5f0e6]/40 transition hover:text-[#c8a56b]"
            >
              Forgot password?
            </Link>
          </div>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="w-full rounded-lg border border-[#f5f0e6]/10 bg-[#0e1628] px-4 py-3.5 text-sm text-[#f5f0e6] outline-none transition focus:border-[#c8a56b]/60"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs leading-5 text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-lg bg-[#c8a56b] px-6 py-3.5 text-sm font-medium tracking-wide text-[#0a1020] transition hover:bg-[#d8b57b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-10 text-center text-[10px] leading-5 tracking-wider text-[#f5f0e6]/30">
        Secure access for verified People &amp; Youth investors.
        <br />
        Not yet approved?{" "}
        <Link
          href="/investors"
          className="text-[#f5f0e6]/50 underline decoration-[#c8a56b]/40 underline-offset-4 transition hover:text-[#c8a56b]"
        >
          Request access
        </Link>
        .
      </p>
    </div>
  );
}

export default function InvestorLoginPage() {
  return (
    <main className="min-h-screen bg-[#0a1020] text-[#f5f0e6]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#c8a56b]/40 bg-[#c8a56b]/10 text-[11px] font-bold tracking-widest text-[#c8a56b]">
              P&amp;Y
            </span>
            <span className="hidden text-sm font-medium tracking-[0.2em] text-[#f5f0e6]/70 sm:inline">
              PEOPLE &amp; YOUTH
            </span>
          </Link>

          <Link
            href="/investors"
            className="text-xs tracking-[0.2em] text-[#f5f0e6]/40 transition hover:text-[#c8a56b]"
          >
            ← BACK TO PROSPECTUS
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-16">
          <Suspense
            fallback={
              <div className="flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-[#c8a56b]" />
            }
          >
            <InvestorLoginForm />
          </Suspense>
        </div>

        <footer className="flex flex-col items-center gap-2 pt-10 text-center">
          <p className="text-[10px] tracking-[0.28em] text-[#f5f0e6]/25">
            PEOPLE &amp; YOUTH · INSTITUTIONAL
          </p>
        </footer>
      </div>
    </main>
  );
}