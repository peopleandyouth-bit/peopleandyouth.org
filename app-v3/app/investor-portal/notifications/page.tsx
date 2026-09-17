"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type NotificationCategory = "ACTION" | "RELATIONSHIP" | "INSTITUTION";

type InvestorNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  occurred_at: string;
  href: string | null;
};

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  ACTION: "Action required",
  RELATIONSHIP: "Relationship",
  INSTITUTION: "Institution",
};

const CATEGORY_TONES: Record<
  NotificationCategory,
  { border: string; text: string; dot: string }
> = {
  ACTION: {
    border: "border-[#c8a56b]/40",
    text: "text-[#c8a56b]",
    dot: "bg-[#c8a56b]",
  },
  RELATIONSHIP: {
    border: "border-[#7fb0ff]/40",
    text: "text-[#7fb0ff]",
    dot: "bg-[#7fb0ff]",
  },
  INSTITUTION: {
    border: "border-[#f5f0e6]/20",
    text: "text-[#f5f0e6]/60",
    dot: "bg-[#f5f0e6]/60",
  },
};

function relativeTime(value: string) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";

  const diffSec = Math.floor((Date.now() - then) / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

type Filter = "ALL" | NotificationCategory;

export default function InvestorPortalNotificationsPage() {
  const [notifications, setNotifications] = useState<InvestorNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/investor-portal/notifications",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load notifications.");
      }

      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return notifications;
    return notifications.filter((n) => n.category === filter);
  }, [notifications, filter]);

  const counts = useMemo(() => {
    return {
      ALL: notifications.length,
      ACTION: notifications.filter((n) => n.category === "ACTION").length,
      RELATIONSHIP: notifications.filter(
        (n) => n.category === "RELATIONSHIP"
      ).length,
      INSTITUTION: notifications.filter(
        (n) => n.category === "INSTITUTION"
      ).length,
    };
  }, [notifications]);

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a56b]/70">
          Notifications
        </p>
        <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-[#f5f0e6] sm:text-4xl">
          What has changed.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5f0e6]/50">
          {unreadCount > 0
            ? `${unreadCount} recent item${
                unreadCount === 1 ? "" : "s"
              } require your attention or presence.`
            : "Everything is up to date."}
        </p>
      </header>

      <section className="border-t border-[#f5f0e6]/8 pt-6">
        <div className="flex flex-wrap gap-2">
          {(["ALL", "ACTION", "RELATIONSHIP", "INSTITUTION"] as Filter[]).map(
            (f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.16em] transition ${
                    active
                      ? "border-[#c8a56b]/60 bg-[#c8a56b]/10 text-[#c8a56b]"
                      : "border-[#f5f0e6]/10 text-[#f5f0e6]/50 hover:border-[#f5f0e6]/25 hover:text-[#f5f0e6]"
                  }`}
                >
                  {f === "ALL" ? "All" : CATEGORY_LABELS[f]} ({counts[f]})
                </button>
              );
            }
          )}
        </div>
      </section>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
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
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#f5f0e6]/10 px-6 py-16 text-center">
          <p className="text-sm text-[#f5f0e6]/50">
            Nothing to see here.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#f5f0e6]/35">
            When something requires your attention, or when there is a new
            update from People &amp; Youth, it will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((n) => {
            const tone = CATEGORY_TONES[n.category];
            const inner = (
              <>
                <div className="flex items-center gap-3">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`}
                  />
                  <span
                    className={`text-[10px] uppercase tracking-[0.18em] ${tone.text}`}
                  >
                    {CATEGORY_LABELS[n.category]}
                  </span>
                  <span className="ml-auto text-[10px] tracking-[0.16em] text-[#f5f0e6]/35">
                    {relativeTime(n.occurred_at)}
                  </span>
                </div>

                <p className="mt-3 text-base font-light text-[#f5f0e6]">
                  {n.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#f5f0e6]/50">
                  {n.body}
                </p>
              </>
            );

            return (
              <li key={n.id}>
                {n.href ? (
                  <a
                    href={n.href}
                    className={`block rounded-2xl border border-[#f5f0e6]/8 px-5 py-4 transition hover:border-[#f5f0e6]/20 hover:bg-[#f5f0e6]/[0.02]`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="rounded-2xl border border-[#f5f0e6]/8 px-5 py-4">
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}