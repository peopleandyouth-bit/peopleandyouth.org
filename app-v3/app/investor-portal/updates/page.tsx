"use client";

import { useCallback, useEffect, useState } from "react";

type PublicationUpdate = {
  id: string;
  title: string | null;
  subtitle: string | null;
  author_name: string | null;
  category: string | null;
  slug: string | null;
  created_at: string | null;
};

function formatUpdateDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function InvestorPortalUpdatesPage() {
  const [updates, setUpdates] = useState<PublicationUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUpdates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/investor-portal/updates",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load updates.");
      }

      setUpdates(data.updates ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load updates."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUpdates();
  }, [loadUpdates]);

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Institutional updates
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          From the institution.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          Research, publications and institutional dispatches from People
          &amp; Youth. A quieter channel than email — a record of what is
          being built.
        </p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-[#f5f0e6]/[0.03]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-6 py-4 text-sm text-red-200">
          {error}
        </div>
      ) : updates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#f5f0e6]/10 px-6 py-16 text-center">
          <p className="text-sm text-[#f5f0e6]/50">
            No updates published yet.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#f5f0e6]/35">
            Institutional updates will appear here as they are published.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#f5f0e6]/6">
          {updates.map((update) => {
            const inner = (
              <>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5f0e6]/35">
                    {update.category ?? "Publication"}
                  </p>
                  <p className="text-[10px] tracking-[0.16em] text-[#f5f0e6]/35">
                    {formatUpdateDate(update.created_at)}
                  </p>
                </div>

                <p className="mt-3 text-lg font-light leading-snug text-[#f5f0e6]">
                  {update.title ?? "Untitled"}
                </p>

                {update.subtitle && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
                    {update.subtitle}
                  </p>
                )}

                {update.author_name && (
                  <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#f5f0e6]/30">
                    By {update.author_name}
                  </p>
                )}
              </>
            );

            const href = update.slug ? `/articles/${update.slug}` : null;

            return (
              <li key={update.id} className="py-6 first:pt-0 last:pb-0">
                {href ? (
                  <a
                    href={href}
                    className="block transition hover:opacity-90"
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}