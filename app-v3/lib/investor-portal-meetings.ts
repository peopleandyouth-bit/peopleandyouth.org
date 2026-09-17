// lib/investor-portal-meetings.ts
//
// Phase 15 Layer 2 — Investor-facing meeting and next-step extraction.
//
// The CRM stores activities as rows. Investors see a curated projection:
// upcoming meetings, past meetings, and next steps. This module is the
// single source of that projection logic.

export interface InternalActivity {
  id: string;
  activity_type: string;
  subject: string | null;
  details: string | null;
  occurred_at: string;
  due_at: string | null;
  status: string;
  assigned_admin: string | null;
}

export interface InvestorMeeting {
  id: string;
  title: string;
  description: string | null;
  when: string;
  is_upcoming: boolean;
  duration_minutes: number;
}

export interface InvestorNextStep {
  id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  is_overdue: boolean;
}

/*
 * Extract meetings from CRM activities.
 *
 * Meeting activities carry a `[MEETING]` marker or are of type MEETING.
 * If a `due_at` is set (used by the CRM composer for scheduled
 * discussions), use it as the meeting time. Otherwise fall back to
 * `occurred_at`.
 */
export function extractMeetings(
  activities: InternalActivity[]
): InvestorMeeting[] {
  const meetings: InvestorMeeting[] = [];
  const now = Date.now();

  for (const activity of activities) {
    if (activity.activity_type !== "MEETING") continue;

    const when = activity.due_at ?? activity.occurred_at;
    const whenTime = new Date(when).getTime();

    if (Number.isNaN(whenTime)) continue;

    // Strip the internal "[MEETING]" prefix from details if present.
    let description = activity.details;
    if (description) {
      description = description.replace(/^\[MEETING\]\s*/m, "");
      description = description.replace(/^(Location|Attendees):.*$/gm, "");
      description = description.replace(/\n{2,}/g, "\n").trim();
      if (!description) description = null;
    }

    meetings.push({
      id: activity.id,
      title: activity.subject ?? "People & Youth Discussion",
      description,
      when,
      is_upcoming: whenTime >= now,
      duration_minutes: 45,
    });
  }

  return meetings.sort((a, b) => {
    const at = new Date(a.when).getTime();
    const bt = new Date(b.when).getTime();
    // Upcoming sorted ascending, then past sorted descending.
    if (a.is_upcoming && b.is_upcoming) return at - bt;
    if (!a.is_upcoming && !b.is_upcoming) return bt - at;
    return a.is_upcoming ? -1 : 1;
  });
}

/*
 * Extract investor-facing next steps.
 *
 * Only OPEN FOLLOW_UP activities with a due date are shown. Resolutions
 * and internal notes are never exposed.
 *
 * Tasks with internal markers ("[INTELLIGENCE:", "[TEMPLATE:") are
 * filtered out because they represent operational follow-ups the CRM
 * generates, not investor-facing actions.
 */
export function extractNextSteps(
  activities: InternalActivity[]
): InvestorNextStep[] {
  const now = Date.now();
  const steps: InvestorNextStep[] = [];

  for (const activity of activities) {
    if (activity.activity_type !== "FOLLOW_UP") continue;
    if (activity.status !== "OPEN") continue;
    if (!activity.due_at) continue;

    const details = activity.details ?? "";

    // Skip internal auto-generated follow-ups.
    if (details.includes("[INTELLIGENCE:")) continue;
    if (details.includes("[TEMPLATE:")) continue;

    const dueTime = new Date(activity.due_at).getTime();
    if (Number.isNaN(dueTime)) continue;

    let description = details;
    if (description) {
      description = description.replace(/^\[NEXT_STEP\]\s*/m, "");
      description = description.replace(/^Owner:.*$/gm, "");
      description = description.replace(/\n{2,}/g, "\n").trim();
      if (!description) description = null;
    }

    steps.push({
      id: activity.id,
      title: activity.subject ?? "Next step",
      description,
      due_at: activity.due_at,
      is_overdue: dueTime < now,
    });
  }

  return steps.sort((a, b) => {
    const at = a.due_at ? new Date(a.due_at).getTime() : 0;
    const bt = b.due_at ? new Date(b.due_at).getTime() : 0;
    return at - bt;
  });
}

/*
 * Build an ICS calendar event string for a meeting.
 *
 * Minimal RFC 5545 compliance: single VEVENT, no recurrence, no
 * attendees. Handles line folding at 75 octets.
 */
export function buildIcsEvent(meeting: InvestorMeeting): string {
  const dt = new Date(meeting.when);
  const end = new Date(dt.getTime() + meeting.duration_minutes * 60000);

  const fmt = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  const escape = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//People & Youth//Investor Portal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${meeting.id}@peopleandyouth.org`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(dt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escape(meeting.title)}`,
    meeting.description
      ? `DESCRIPTION:${escape(meeting.description)}`
      : null,
    "ORGANIZER;CN=People & Youth Investor Relations:mailto:contact@peopleandyouth.org",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);

  return lines.join("\r\n");
}