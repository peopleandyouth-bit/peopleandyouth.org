"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function InvestorResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo: `${window.location.origin}/investor-login`,
          }
        );

      if (resetError) {
        setError(
          "We could not send the reset email. Please try again, or contact Investor Relations."
        );
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
            href="/investor-login"
            className="text-xs tracking-[0.2em] text-[#f5f0e6]/40 transition hover:text-[#c8a56b]"
          >
            ← BACK TO SIGN IN
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-16">
          <div className="w-full max-w-md">
            <div className="mb-10 text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#c8a56b]">
                Password Recovery
              </p>
              <div className="mx-auto mt-3 h-px w-12 bg-[#c8a56b]/40" />
            </div>

            {sent ? (
              <>
                <h1 className="text-center text-4xl font-light leading-tight tracking-tight text-[#f5f0e6]">
                  Check your inbox.
                </h1>

                <p className="mx-auto mt-5 max-w-sm text-center text-sm leading-6 text-[#f5f0e6]/50">
                  If an account exists for{" "}
                  <span className="text-[#c8a56b]">
                    {email.trim().toLowerCase()}
                  </span>
                  , we have sent a password reset link. Follow the link to
                  set a new password.
                </p>

                <div className="mt-10 text-center">
                  <Link
                    href="/investor-login"
                    className="text-xs tracking-[0.2em] text-[#f5f0e6]/50 underline decoration-[#c8a56b]/40 underline-offset-4 transition hover:text-[#c8a56b]"
                  >
                    Return to sign in
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-center text-4xl font-light leading-tight tracking-tight text-[#f5f0e6]">
                  Reset your password.
                </h1>

                <p className="mx-auto mt-5 max-w-sm text-center text-sm leading-6 text-[#f5f0e6]/50">
                  Enter the email associated with your investor account. We
                  will send a secure link to set a new password.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-12 space-y-6"
                >
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

                  {error && (
                    <div className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs leading-5 text-red-200">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-[#c8a56b] px-6 py-3.5 text-sm font-medium tracking-wide text-[#0a1020] transition hover:bg-[#d8b57b] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              </>
            )}
          </div>
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