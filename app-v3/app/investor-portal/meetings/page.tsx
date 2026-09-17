"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type InvestorMeeting = {
  id: string;
  title: string;
  description: string | null;
  when: string;
  is_upcoming: boolean;
  duration_minutes: number;
};

function formatMeetingDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatMeetingTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

export default function InvestorPortalMeetingsPage() {
  const [meetings, setMeetings] = useState<InvestorMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/investor-portal/meetings",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load meetings.");
      }

      setMeetings(data.meetings ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load meetings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const upcoming = useMemo(
    () => meetings.filter((m) => m.is_upcoming),
    [meetings]
  );
  const past = useMemo(
    () => meetings.filter((m) => !m.is_upcoming),
    [meetings]
  );

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Meetings
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          Your conversations with People &amp; Youth.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          Upcoming discussions and past meetings. Every meeting can be
          added to your calendar.
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
      ) : (
        <>
          {/* Upcoming */}
          <section className="border-t border-[#f5f0e6]/8 pt-8">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
                Upcoming
              </p>
              {upcoming.length > 0 && (
                <span className="text-[10px] tracking-[0.16em] text-[#f5f0e6]/35">
                  {upcoming.length} scheduled
                </span>
              )}
            </div>

            {upcoming.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#f5f0e6]/10 px-6 py-12 text-center">
                <p className="text-sm text-[#f5f0e6]/50">
                  No meetings scheduled yet.
                </p>
                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#f5f0e6]/35">
                  Investor Relations will notify you when your next
                  conversation is arranged.
                </p>
              </div>
            ) : (
              <ul className="mt-6 space-y-6">
                {upcoming.map((meeting) => (
                  <li
                    key={meeting.id}
                    className="border-l-2 border-[#c8a56b] pl-6"
                  >
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5f0e6]/40">
                      {formatMeetingDate(meeting.when)}
                    </p>
                    <p className="mt-2 text-xl font-light text-[#f5f0e6]">
                      {meeting.title}
                    </p>
                    <p className="mt-1 text-sm text-[#f5f0e6]/50">
                      {formatMeetingTime(meeting.when)} ·{" "}
                      {meeting.duration_minutes} minutes
                    </p>

                    {meeting.description && (
                      <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-[#f5f0e6]/50">
                        {meeting.description}
                      </p>
                    )}

                    <div className="mt-4">
                      <a
                        href={`/api/investor-portal/meetings/${encodeURIComponent(
                          meeting.id
                        )}/ics`}
                        className="inline-block rounded-lg border border-[#c8a56b]/40 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#c8a56b] transition hover:bg-[#c8a56b]/10"
                      >
                        Add to calendar
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Past */}
          {past.length > 0 && (
            <section className="border-t border-[#f5f0e6]/8 pt-8">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5f0e6]/40">
                Past meetings
              </p>

              <ul className="mt-6 space-y-4">
                {past.map((meeting) => (
                  <li
                    key={meeting.id}
                    className="flex flex-col gap-2 border-b border-[#f5f0e6]/6 pb-4 last:border-0"
                  >
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5f0e6]/35">
                      {formatMeetingDate(meeting.when)}
                    </p>
                    <p className="text-base font-light text-[#f5f0e6]/80">
                      {meeting.title}
                    </p>
                    {meeting.description && (
                      <p className="max-w-2xl whitespace-pre-line text-xs leading-5 text-[#f5f0e6]/40">
                        {meeting.description}
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