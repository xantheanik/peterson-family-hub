"use client";

import { useState, useEffect } from "react";
import { FAMILY } from "@/lib/family";
import { TIMEZONE_GROUPS, labelForZone } from "@/lib/datetime";

// initialEvent: null for "add new", or an existing event object for "edit".
// onSubmit(payload): called with the built payload on valid submit.
// submitLabel / savingLabel: button text.
export default function EventForm({ initialEvent, onSubmit, submitLabel, savingLabel }) {
  const isEdit = !!initialEvent;

  const [title, setTitle] = useState(initialEvent?.title || "");
  const [date, setDate] = useState(initialEvent?.event_date?.slice(0, 10) || "");
  const [endDate, setEndDate] = useState(
    initialEvent?.end_date?.slice(0, 10) || initialEvent?.event_date?.slice(0, 10) || ""
  );
  const [time, setTime] = useState(initialEvent?.event_time?.slice(0, 5) || "");
  const [allDay, setAllDay] = useState(initialEvent?.all_day || false);
  const [timezone, setTimezone] = useState(initialEvent?.timezone || "America/Denver");
  const [detectedZone, setDetectedZone] = useState(null);
  const [mode, setMode] = useState(initialEvent?.is_virtual ? "virtual" : "in_person");
  const [meetingLink, setMeetingLink] = useState(initialEvent?.meeting_link || "");
  const [description, setDescription] = useState(initialEvent?.description || "");
  const [location, setLocation] = useState(initialEvent?.location || "");
  const [submittedBy, setSubmittedBy] = useState(initialEvent?.submitted_by || "");
  const [status, setStatus] = useState({ type: null, message: "" });
  const [submitting, setSubmitting] = useState(false);

  // Default the time zone to wherever the person filling the form actually
  // is — but only when adding new. Editing keeps the event's saved zone.
  useEffect(() => {
    if (isEdit) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        setDetectedZone(tz);
        setTimezone(tz);
      }
    } catch {
      /* keep the default */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVirtual = mode === "virtual";

  // End date defaults to the start date. If the user hasn't set an end date
  // (or it's still equal to a previous start), keep it tracking the start.
  useEffect(() => {
    setEndDate((prev) => (!prev || prev < date ? date : prev));
  }, [date]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    setSubmitting(true);

    const payload = {
      title,
      event_date: date,
      end_date: allDay ? endDate || date : date,
      event_time: allDay ? null : time,
      all_day: allDay,
      timezone,
      is_virtual: isVirtual,
      meeting_link: isVirtual ? meetingLink : null,
      description,
      location,
      submitted_by: submittedBy,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Something went wrong." });
      setSubmitting(false);
    }
  }

  // If the detected zone isn't one of our listed ones, offer it at the top
  // so it's always selectable.
  const listedZones = TIMEZONE_GROUPS.flatMap((g) => g.zones.map((z) => z[0]));
  const showDetectedExtra = detectedZone && !listedZones.includes(detectedZone);

  return (
    <div className="form-card">
      {status.type && <div className={`form-message ${status.type}`}>{status.message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="submittedBy">Your name</label>
          <select
            id="submittedBy"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            required
          >
            <option value="" disabled>
              Pick your name…
            </option>
            {FAMILY.map((group) => (
              <optgroup key={group.generation} label={group.generation}>
                {group.members.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {isEdit && (
            <p className="field-hint">
              Anyone can edit this event — pick your own name so the change log
              makes sense later.
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="title">Event</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sunday dinner at Grandma Linda's"
            required
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="date">{allDay ? "Start date" : "Date"}</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          {allDay ? (
            <div className="field">
              <label htmlFor="endDate">End date</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={date || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="field">
              <label htmlFor="time">Time</label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required={!allDay}
              />
            </div>
          )}
        </div>

        <div className="checkbox-row">
          <input
            id="allDay"
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
          />
          <label htmlFor="allDay">All-day</label>
        </div>

        {!allDay && (
          <div className="field">
            <label htmlFor="timezone">Time zone the event happens in</label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              required
            >
              {showDetectedExtra && (
                <optgroup label="Detected">
                  <option value={detectedZone}>
                    {labelForZone(detectedZone)} (your device)
                  </option>
                </optgroup>
              )}
              {TIMEZONE_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.zones.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="field-hint">
              Everyone sees the event in their own time zone automatically.
              This just tells us where it&rsquo;s actually taking place.
            </p>
          </div>
        )}

        <div className="field">
          <label>Where is it?</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="mode"
                value="in_person"
                checked={mode === "in_person"}
                onChange={() => setMode("in_person")}
              />
              <span>In person</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="mode"
                value="virtual"
                checked={mode === "virtual"}
                onChange={() => setMode("virtual")}
              />
              <span>Virtual</span>
            </label>
          </div>
        </div>

        {isVirtual && (
          <div className="field">
            <label htmlFor="meetingLink">Virtual meeting link</label>
            <input
              id="meetingLink"
              type="text"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://zoom.us/j/… or a FaceTime / Meet link"
              required={isVirtual}
            />
            <p className="field-hint">
              Paste the Zoom, Google Meet, FaceTime, or other link. It shows up
              on the event and in everyone&rsquo;s calendar entry.
            </p>
          </div>
        )}

        <div className="field">
          <label htmlFor="location">Location{isVirtual ? " (optional)" : ""}</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={isVirtual ? "e.g. also gathering at Grandma's" : "Grandma Linda's house"}
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Anything people should know — what to bring, who's cooking, dress code…"
          />
          <p className="field-hint">Optional, but helpful.</p>
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? savingLabel : submitLabel}
        </button>
      </form>
    </div>
  );
}
