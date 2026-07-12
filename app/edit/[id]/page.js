"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import EventForm from "@/app/components/EventForm";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [event, setEvent] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load this event.");
        setEvent(data.event);
      })
      .catch((err) => setLoadError(err.message));
  }, [id]);

  async function handleSubmit(payload) {
    const res = await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    router.push(`/?updated=${encodeURIComponent(payload.title)}`);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete this event.");
      router.push(`/?deleted=${encodeURIComponent(event?.title || "Event")}`);
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <main className="wrap">
      <header className="hub-header">
        <p className="hub-eyebrow">Peterson Family Hub</p>
        <h1 className="hub-title">Edit event</h1>
        <p className="hub-tagline">
          Anyone can update or remove an event. A copy of every change gets
          emailed automatically, so nothing gets lost by accident.
        </p>
      </header>

      <Link href="/" className="back-link">
        ← Back to the calendar
      </Link>

      {loadError && <div className="form-message error">{loadError}</div>}

      {!loadError && !event && <p className="section-sub">Loading event…</p>}

      {event && (
        <>
          <EventForm
            initialEvent={event}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            savingLabel="Saving…"
          />

          <div className="danger-zone">
            {deleteError && <div className="form-message error">{deleteError}</div>}
            {!confirmingDelete ? (
              <button
                type="button"
                className="btn btn-ghost btn-danger"
                onClick={() => setConfirmingDelete(true)}
              >
                Delete this event
              </button>
            ) : (
              <div className="delete-confirm">
                <p className="delete-confirm-text">
                  Delete &ldquo;{event.title}&rdquo;? This can&rsquo;t be undone.
                </p>
                <div className="delete-confirm-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-solid"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Yes, delete it"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
