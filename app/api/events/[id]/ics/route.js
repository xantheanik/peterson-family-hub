import { getEventById } from "@/lib/db";
import { buildSingleEventIcs } from "@/lib/ics";

export async function GET(request, { params }) {
  try {
    const event = await getEventById(params.id);
    if (!event) {
      return new Response("Event not found.", { status: 404 });
    }
    const ics = buildSingleEventIcs(event);
    return new Response(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="event-${event.id}.ics"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Could not build event file.", { status: 500 });
  }
}
