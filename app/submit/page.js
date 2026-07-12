"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import EventForm from "@/app/components/EventForm";

export default function SubmitPage() {
  const router = useRouter();

  async function handleSubmit(payload) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    router.push(`/?added=${encodeURIComponent(payload.title)}`);
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
