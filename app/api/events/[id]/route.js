import { NextResponse } from "next/server";
import { getEventById, updateEvent, deleteEvent } from "@/lib/db";
import { notifyEventUpdated, notifyEventDeleted } from "@/lib/notify";
import { ALL_NAMES } from "@/lib/family";

export async function GET(request, { params }) {
  try {
    const event = await getEventById(params.id);
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    return NextResponse.json({ event });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load event." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const before = await getEventById(params.id);
    if (!before) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    const body = await request.json();
    const {
      title,
      event_date,
      end_date,
      event_time,
      all_day,
      timezone,
      is_virtual,
      meeting_link,
      description,
      location,
      submitted_by,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Event needs a title." }, { status: 400 });
    }
    if (!event_date) {
      return NextResponse.json({ error: "Event needs a date." }, { status: 400 });
    }
    if (!submitted_by || !ALL_NAMES.includes(submitted_by)) {
      return NextResponse.json(
        { error: "Please pick your name from the family list." },
        { status: 400 }
      );
    }
    if (!all_day && !event_time) {
      return NextResponse.json(
        { error: "Add a time, or mark this as an all-day event." },
        { status: 400 }
      );
    }
    if (is_virtual && (!meeting_link || !meeting_link.trim())) {
      return NextResponse.json(
        { error: "Add the virtual meeting link, or switch the event to in person." },
        { status: 400 }
      );
    }
    if (all_day && end_date && end_date < event_date) {
      return NextResponse.json(
        { error: "The end date can't be before the start date." },
        { status: 400 }
      );
    }

    const after = await updateEvent(params.id, {
      title: title.trim(),
      event_date,
      end_date: all_day ? end_date || event_date : event_date,
      event_time,
      all_day: !!all_day,
      timezone: timezone || "America/Denver",
      is_virtual: !!is_virtual,
      meeting_link: is_virtual ? (meeting_link || "").trim() : null,
      description,
      location,
      submitted_by,
    });

    // Awaited on purpose: on serverless, the function can be frozen the
    // instant a response is returned, so a fire-and-forget send here would
    // often never actually complete. A slow email service will delay the
    // response slightly, but that's preferable to silently losing emails.
    try {
      await notifyEventUpdated(before, after);
    } catch (e) {
      console.error("notify failed", e);
    }

    return NextResponse.json({ event: after });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save changes." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const deleted = await deleteEvent(params.id);
    if (!deleted) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    try {
      await notifyEventDeleted(deleted);
    } catch (e) {
      console.error("notify failed", e);
    }

    return NextResponse.json({ event: deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not delete event." }, { status: 500 });
  }
}
