import { NextResponse } from "next/server";
import { getAllEvents, createEvent } from "@/lib/db";
import { ALL_NAMES } from "@/lib/family";

export async function GET() {
  try {
    const events = await getAllEvents();
    return NextResponse.json({ events });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load events." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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
    if (!all_day && !timezone) {
      return NextResponse.json(
        { error: "Pick the time zone the event happens in." },
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

    const event = await createEvent({
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

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save the event." }, { status: 500 });
  }
}
