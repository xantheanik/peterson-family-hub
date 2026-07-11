"use client";

import { useEffect, useState } from "react";

export default function CalendarSubscribeCard() {
  const [feedUrl, setFeedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFeedUrl(`${window.location.origin}/api/calendar.ics`);
  }, []);

  const webcalUrl = feedUrl.replace(/^https?:\/\//, "webcal://");
  const googleAddByUrlUrl = "https://calendar.google.com/calendar/u/0/r/settings/addbyurl";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="subscribe-card">
      <div style={{ flex: "1 1 100%" }}>
        <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--ink-soft)" }}>
          Subscribe once, and new events will appear automatically in your
          calendar app.
        </p>
        <div className="subscribe-actions">
          <a className="btn btn-primary" href={webcalUrl || "#"}>
            Subscribe on Apple Calendar
          </a>
          <a
            className="btn btn-secondary"
            href={googleAddByUrlUrl}
            target="_blank"
            rel="noreferrer"
          >
            Subscribe on Google Calendar
          </a>
          <button type="button" className="btn btn-ghost" onClick={copyLink}>
            {copied ? "Link copied!" : "Copy calendar link"}
          </button>
        </div>
        <div className="feed-url-row">
          <input readOnly value={feedUrl} onFocus={(e) => e.target.select()} />
        </div>
        <p className="field-hint" style={{ marginTop: 10 }}>
          On Google Calendar: click &ldquo;Subscribe on Google Calendar&rdquo;
          above, then paste this link under &ldquo;Add calendar by
          URL.&rdquo; On an iPhone or Mac, the Apple Calendar button opens the
          subscription automatically.
        </p>
      </div>
    </div>
  );
}
