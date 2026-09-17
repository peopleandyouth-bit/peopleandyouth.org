"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type InvestorNextStep = {
  id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  is_overdue: boolean;
};

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function InvestorPortalNextStepsPage() {
  const [steps, setSteps] = useState<InvestorNextStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSteps = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/investor-portal/next-steps",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load next steps.");
      }

      setSteps(data.next_steps ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load next steps."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSteps();
  }, [loadSteps]);

  const overdue = useMemo(
    () => steps.filter((s) => s.is_overdue),
    [steps]
  );
  const upcoming = useMemo(
    () => steps.filter((s) => !s.is_overdue),
    [steps]
  );

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Next steps
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          What happens next.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          Actions agreed as part of your relationship with People &amp;
          Youth. When Investor Relations completes a step, it will be
          marked complete here.
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-[#f5f0e6]/[0.03]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-6 py-4 text-sm text-red-200">
          {error}
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#f5f0e6]/10 px-6 py-16 text-center">
          <p className="text-sm text-[#f5f0e6]/50">
            Nothing requires your attention right now.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#f5f0e6]/35">
            When there is a next step in your relationship with People
            &amp; Youth, it will appear here.
          </p>
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <section className="border-l-2 border-red-400/60 pl-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-red-300/80">
                Overdue
              </p>

              <ul className="mt-6 space-y-5">
                {overdue.map((step) => (
                  <li key={step.id}>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5f0e6]/40">
                      Due {step.due_at ? formatDueDate(step.due_at) : "—"}
                    </p>
                    <p className="mt-2 text-base font-light text-[#f5f0e6]">
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="mt-2 max-w-2xl whitespace-pre-line text-xs leading-5 text-[#f5f0e6]/50">
                        {step.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {upcoming.length > 0 && (
            <section className="border-t border-[#f5f0e6]/8 pt-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
                Upcoming
              </p>

              <ul className="mt-6 space-y-5">
                {upcoming.map((step) => (
                  <li
                    key={step.id}
                    className="border-b border-[#f5f0e6]/6 pb-5 last:border-0 last:pb-0"
                  >
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5f0e6]/35">
                      Due {step.due_at ? formatDueDate(step.due_at) : "—"}
                    </p>
                    <p className="mt-2 text-base font-light text-[#f5f0e6]/85">
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="mt-2 max-w-2xl whitespace-pre-line text-xs leading-5 text-[#f5f0e6]/45">
                        {step.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}