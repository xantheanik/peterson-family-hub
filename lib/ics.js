// Builds .ics (iCalendar) text read by both Google Calendar and Apple
// Calendar — either as a one-time download for a single event, or as a live
// "subscribe by URL" feed that keeps updating automatically.
//
// Timed events are written as precise UTC instants (with a trailing Z), so
// each subscriber's calendar app converts them to that person's own local
// time. A 5:00 PM Mountain dinner shows as 7:00 PM for a cousin in Boston
// and 5:00 PM for Grandma in Utah — same moment, correct everywhere.
//
// All-day events stay date-only (no time zone) on purpose, so a birthday
// lands on the same calendar day no matter where you are.

import { wallTimeToUTC, formatUTCStamp } from "@/lib/datetime";

function escapeText(str = "") {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line) {
  if (line.length <= 74) return line;
  let result = "";
  let rest = line;
  while (rest.length > 74) {
    result += rest.slice(0, 74) + "\r\n ";
    rest = rest.slice(74);
  }
  return result + rest;
}

function formatDateOnly(dateStr) {
  return String(dateStr).replace(/-/g, "").slice(0, 8);
}

function eventDateStr(event) {
  return typeof event.event_date === "string"
    ? event.event_date
    : new Date(event.event_date).toISOString().slice(0, 10);
}

// Combines description + a virtual meeting link into one DESCRIPTION body.
function buildDescription(event) {
  const parts = [];
  if (event.description) parts.push(event.description);
  if (event.meeting_link) parts.push(`Join online: ${event.meeting_link}`);
  return parts.join("\n\n");
}

export function eventToVEvent(event) {
  const uid = `peterson-family-hub-event-${event.id}@family-hub`;
  const summary = escapeText(event.title);
  const description = escapeText(buildDescription(event));
  const location = escapeText(event.location || "");
  const dateStr = eventDateStr(event);
  const tz = event.timezone || "America/Denver";

  let dtstart, dtend;
  if (event.all_day) {
    dtstart = `DTSTART;VALUE=DATE:${formatDateOnly(dateStr)}`;
    // DTEND is exclusive for all-day events, so it's the day AFTER the last
    // day the event covers. Single-day events end the next day; multi-day
    // events end the day after end_date.
    const endBase =
      event.end_date
        ? (typeof event.end_date === "string"
            ? event.end_date.slice(0, 10)
            : new Date(event.end_date).toISOString().slice(0, 10))
        : dateStr;
    const d = new Date(endBase + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    dtend = `DTEND;VALUE=DATE:${formatDateOnly(d.toISOString().slice(0, 10))}`;
  } else {
    const time = event.event_time || "00:00:00";
    const startUTC = wallTimeToUTC(dateStr, time, tz);
    // Default event length: 1 hour.
    const endUTC = new Date(startUTC.getTime() + 60 * 60 * 1000);
    dtstart = `DTSTART:${formatUTCStamp(startUTC)}`;
    dtend = `DTEND:${formatUTCStamp(endUTC)}`;
  }

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SUMMARY:${summary}`,
    dtstart,
    dtend,
    event.rrule ? `RRULE:${event.rrule}` : null,
    description ? `DESCRIPTION:${description}` : null,
    location ? `LOCATION:${location}` : null,
    // URL property lets some clients surface a clickable join link.
    event.meeting_link ? `URL:${escapeText(event.meeting_link)}` : null,
    `ORGANIZER;CN=${escapeText(event.submitted_by || "Family Hub")}:mailto:noreply@example.com`,
    `DTSTAMP:${formatUTCStamp(new Date())}`,
    "END:VEVENT",
  ].filter(Boolean);

  return lines.map(foldLine).join("\r\n");
}

export function buildCalendarFeed(events, calendarName = "Peterson Family Hub") {
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peterson Family Hub//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "METHOD:PUBLISH",
  ];
  const body = events.map(eventToVEvent);
  const footer = ["END:VCALENDAR"];
  return [...header, ...body, ...footer].join("\r\n") + "\r\n";
}

export function buildSingleEventIcs(event) {
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peterson Family Hub//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  const footer = ["END:VCALENDAR"];
  return [...header, eventToVEvent(event), ...footer].join("\r\n") + "\r\n";
}

export function googleCalendarLink(event) {
  const dateStr = eventDateStr(event);
  const tz = event.timezone || "America/Denver";

  let dates;
  if (event.all_day) {
    const endBase =
      event.end_date
        ? (typeof event.end_date === "string"
            ? event.end_date.slice(0, 10)
            : new Date(event.end_date).toISOString().slice(0, 10))
        : dateStr;
    const d = new Date(endBase + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    dates = `${formatDateOnly(dateStr)}/${formatDateOnly(d.toISOString().slice(0, 10))}`;
  } else {
    const time = event.event_time || "00:00:00";
    const startUTC = wallTimeToUTC(dateStr, time, tz);
    const endUTC = new Date(startUTC.getTime() + 60 * 60 * 1000);
    dates = `${formatUTCStamp(startUTC)}/${formatUTCStamp(endUTC)}`;
  }

  const details = buildDescription(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "",
    dates,
    details: details || "",
    location: event.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
