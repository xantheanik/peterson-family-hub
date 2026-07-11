"use client";

import { useMemo, useState } from "react";
import { formatEventWhen } from "@/lib/datetime";
import { googleCalendarLink } from "@/lib/ics";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Default view keeps the page tidy: events in the next ~90 days, and never
// more than this many cards (most people are on a phone). Anything past that
// is still one click away via "Show all upcoming events" — nothing is dropped.
const WINDOW_DAYS = 90;
const COLLAPSED_MAX = 3;

function normDate(v) {
  return typeof v === "string" ? v.slice(0, 10) : new Date(v).toISOString().slice(0, 10);
}

function EventCard({ event }) {
  const dateStr = normDate(event.event_date);
  const d = new Date(`${dateStr}T00:00:00`);
  return (
    <div className="event-card">
      <div className="event-date-badge">
        <span className="month">{MONTHS[d.getMonth()]}</span>
        <span className="day">{d.getDate()}</span>
      </div>
      <div className="event-body">
        <h3 className="event-title">
          {event.title}
          {event.is_virtual && <span className="tag-virtual">Virtual</span>}
        </h3>
        <p className="event-meta">{formatEventWhen(event)}</p>
        {event.location && <p className="event-meta">📍 {event.location}</p>}
        {event.is_virtual && event.meeting_link && (
          <p className="event-meta">
            🔗{" "}
            <a href={event.meeting_link} target="_blank" rel="noreferrer">
              Join link
            </a>
          </p>
        )}
        {event.description && <p className="event-desc">{event.description}</p>}
        <p className="event-submitter">Added by {event.submitted_by}</p>
        <div className="event-actions">
          <a
            className="btn btn-secondary"
            href={googleCalendarLink({ ...event, event_date: dateStr })}
            target="_blank"
            rel="noreferrer"
          >
            Add to Google Calendar
          </a>
          <a className="btn btn-ghost" href={`/api/events/${event.id}/ics`}>
            Add to Apple Calendar
          </a>
        </div>
      </div>
    </div>
  );
}

export default function UpcomingEvents({ events }) {
  const [expanded, setExpanded] = useState(false);

  const { visible, total } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + WINDOW_DAYS);
    const windowEndStr = windowEnd.toISOString().slice(0, 10);

    // An event still counts as upcoming while it's ongoing (multi-day events
    // that started earlier but haven't ended yet).
    const upcoming = events
      .filter((e) => {
        const end = e.all_day && e.end_date ? normDate(e.end_date) : normDate(e.event_date);
        return end >= todayStr;
      })
      .sort((a, b) => {
        const ad = normDate(a.event_date), bd = normDate(b.event_date);
        if (ad !== bd) return ad < bd ? -1 : 1;
        return String(a.event_time || "").localeCompare(String(b.event_time || ""));
      });

    if (expanded) return { visible: upcoming, total: upcoming.length };

    const windowed = upcoming
      .filter((e) => normDate(e.event_date) <= windowEndStr)
      .slice(0, COLLAPSED_MAX);
    return { visible: windowed, total: upcoming.length };
  }, [events, expanded]);

  if (total === 0) {
    return (
      <div className="empty-state">
        Nothing on the calendar yet. Add the first event whenever you&rsquo;re ready.
      </div>
    );
  }

  const hiddenCount = total - visible.length;

  return (
    <>
      <div className="event-list">
        {visible.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      {(hiddenCount > 0 || expanded) && (
        <div className="upcoming-toggle">
          {expanded ? (
            <button className="btn btn-ghost" onClick={() => setExpanded(false)}>
              Show fewer
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setExpanded(true)}>
              Show all upcoming events ({total})
            </button>
          )}
        </div>
      )}
    </>
  );
}
