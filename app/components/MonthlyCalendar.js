"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { displayTimeInZone, enumerateEventDates, formatEventWhen, todayStr } from "@/lib/datetime";
import { googleCalendarLink } from "@/lib/ics";
import { APP_TIMEZONE } from "@/lib/site";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n) {
  return String(n).padStart(2, "0");
}
function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function normalizeEventDate(e) {
  return typeof e.event_date === "string"
    ? e.event_date.slice(0, 10)
    : new Date(e.event_date).toISOString().slice(0, 10);
}

function eventMetaLine(event) {
  return formatEventWhen(event);
}

export default function MonthlyCalendar({ events }) {
  // "Today" in the family's timezone (Mountain), so the calendar's current
  // month and today-highlight don't flip a day early on a UTC server.
  const todayKey = todayStr(APP_TIMEZONE); // e.g. "2026-07-10"
  const [ty, tm] = todayKey.split("-").map(Number);
  const [view, setView] = useState({ y: ty, m: tm - 1 });
  const [selectedDay, setSelectedDay] = useState(null);

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const e of events) {
      for (const ds of enumerateEventDates(e)) {
        (map[ds] = map[ds] || []).push(e);
      }
    }
    for (const k in map) {
      map[k].sort((a, b) => {
        if (a.all_day && !b.all_day) return -1;
        if (!a.all_day && b.all_day) return 1;
        return String(a.event_time || "").localeCompare(String(b.event_time || ""));
      });
    }
    return map;
  }, [events]);

  const weeks = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const startOffset = first.getDay(); // 0 = Sunday
    const gridStart = new Date(view.y, view.m, 1 - startOffset);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
    }
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    // Drop trailing weeks that are entirely in the next month.
    while (rows.length && rows[rows.length - 1].every((d) => d.getMonth() !== view.m)) {
      rows.pop();
    }
    return rows;
  }, [view]);

  function prevMonth() {
    setView((v) => {
      const d = new Date(v.y, v.m - 1, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }
  function nextMonth() {
    setView((v) => {
      const d = new Date(v.y, v.m + 1, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }
  function goToday() {
    setView({ y: ty, m: tm - 1 });
  }

  const selectedEvents = selectedDay ? eventsByDate[selectedDay] || [] : [];
  const selectedLabel = selectedDay
    ? new Date(`${selectedDay}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="cal-card">
      <div className="cal-toolbar">
        <div className="cal-monthnav">
          <button className="cal-navbtn" onClick={prevMonth} aria-label="Previous month">
            ‹
          </button>
          <h3 className="cal-monthlabel">
            {MONTH_NAMES[view.m]} {view.y}
          </h3>
          <button className="cal-navbtn" onClick={nextMonth} aria-label="Next month">
            ›
          </button>
          <button className="cal-todaybtn" onClick={goToday}>
            Today
          </button>
        </div>
        <Link className="btn btn-primary" href="/submit">
          + Add an event
        </Link>
      </div>

      <div className="cal-grid cal-weekdays" aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <div className="cal-weekday" key={w}>
            {w}
          </div>
        ))}
      </div>

      <div className="cal-grid">
        {weeks.flat().map((d) => {
          const ds = toDateStr(d);
          const inMonth = d.getMonth() === view.m;
          const dayEvents = eventsByDate[ds] || [];
          const isToday = ds === todayKey;
          const hasEvents = dayEvents.length > 0;
          return (
            <button
              type="button"
              key={ds}
              className={`cal-cell${inMonth ? "" : " other-month"}${isToday ? " today" : ""}${hasEvents ? " has-events" : ""}`}
              onClick={() => hasEvents && setSelectedDay(ds)}
              aria-label={
                hasEvents
                  ? `${d.getDate()}, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}`
                  : `${d.getDate()}`
              }
            >
              <span className="cal-daynum">{d.getDate()}</span>
              <span className="cal-events">
                {dayEvents.slice(0, 3).map((e) => (
                  <span
                    className={`cal-event${
                      e.category === "holiday"
                        ? " is-holiday"
                        : e.category === "birthday"
                        ? " is-birthday"
                        : e.is_virtual
                        ? " is-virtual"
                        : ""
                    }`}
                    key={e.id}
                    title={e.title}
                  >
                    {e.title}
                  </span>
                ))}
                {dayEvents.length > 3 && (
                  <span className="cal-more">+{dayEvents.length - 3} more</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="cal-modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cal-modal-head">
              <h3 className="cal-modal-title">{selectedLabel}</h3>
              <button
                className="cal-modal-close"
                onClick={() => setSelectedDay(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="cal-modal-body">
              {selectedEvents.map((event) => {
                const dateStr = normalizeEventDate(event);
                return (
                  <div className="cal-modal-event" key={event.id}>
                    <h4 className="event-title">
                      {event.title}
                      {event.is_virtual && <span className="tag-virtual">Virtual</span>}
                    </h4>
                    <p className="event-meta">{eventMetaLine(event)}</p>
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
                    {event.source ? (
                      (event.source === "holiday" || event.source === "birthday") && (
                        <p className="event-submitter">
                          {event.source === "holiday" ? "Federal holiday" : "Birthday"}
                        </p>
                      )
                    ) : (
                      <>
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
                          <Link className="btn btn-ghost" href={`/edit/${event.id}`}>
                            Edit
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
