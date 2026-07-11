import { getAllEvents } from "@/lib/db";
import { buildCalendarFeed } from "@/lib/ics";
import { feedExtraEvents } from "@/lib/recurring";

// This URL is what family members paste into Google Calendar ("Other
// calendars" -> "From URL") or Apple Calendar ("File" -> "New Calendar
// Subscription"). Both apps periodically re-fetch this URL, so new events
// show up automatically without anyone re-subscribing.
//
// The feed includes real submitted events plus family birthdays (as yearly
// recurring entries). U.S. federal holidays are left out on purpose, since
// phone calendars already show them.

export async function GET() {
  try {
    const events = await getAllEvents();
    const baseYear = new Date().getFullYear();
    const feed = buildCalendarFeed([...events, ...feedExtraEvents(baseYear)]);
    return new Response(feed, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="peterson-family-hub.ics"',
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Could not build calendar feed.", { status: 500 });
  }
}
