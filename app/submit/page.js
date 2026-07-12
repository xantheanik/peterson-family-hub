"use client";

import Link from "next/link";
import EventForm from "@/app/components/EventForm";

export default function SubmitPage() {
  async function handleSubmit(payload) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    // A full navigation (not router.push) so the home page's Router Cache
    // can't hand back a stale copy of the calendar/upcoming list.
    window.location.href = `/?added=${encodeURIComponent(payload.title)}`;
  }

  return (
    <main className="wrap">
      <header className="hub-header">
        <p className="hub-eyebrow">Peterson Family Hub</p>
        <h1 className="hub-title">Add an event</h1>
        <p className="hub-tagline">
          Takes about thirty seconds. As soon as you save it, it&rsquo;s on
          everyone&rsquo;s calendar &mdash; in their own time zone.
        </p>
      </header>

      <Link href="/" className="back-link">
        ← Back to the calendar
      </Link>

      <EventForm
        onSubmit={handleSubmit}
        submitLabel="Add to the family calendar"
        savingLabel="Saving…"
      />
    </main>
  );
}
