import { getAllEvents } from "@/lib/db";
import { FAMILY } from "@/lib/family";
import { generatedEvents } from "@/lib/recurring";
import CalendarSubscribeCard from "@/app/components/CalendarSubscribeCard";
import MonthlyCalendar from "@/app/components/MonthlyCalendar";
import UpcomingEvents from "@/app/components/UpcomingEvents";
// Always render fresh on each request so newly added events show up immediately
export const dynamic = "force-dynamic";

const genSlug = {
  "Generation 1": "gen-1",
  "Generation 2": "gen-2",
  "Generation 3": "gen-3",
  "Generation 4": "gen-4",
};

export default async function HomePage() {
  let events = [];
  let loadError = null;
  try {
    events = await getAllEvents();
  } catch (err) {
    loadError =
      "Could not load events right now. If you just deployed this site, make sure the database has been created (see README).";
  }

  // Federal holidays and family birthdays for a rolling window of years, so
  // navigating the calendar forward/back always shows them. These are display
  // only — they never touch the database or the Upcoming list.
  const thisYear = new Date().getFullYear();
  const generated = generatedEvents({ startYear: thisYear - 1, endYear: thisYear + 5 });
  const calendarEvents = [...events, ...generated];

  return (
    <main className="wrap">
      <header className="hub-header">
        <h1 className="hub-title">Peterson Family Hub</h1>
        <p className="hub-tagline">One calendar. Every generation.</p>
      </header>

      {/* 1 — Monthly calendar, first main content block.
          Shows real events PLUS generated holidays & birthdays. */}
      <section className="section">
        {loadError ? (
          <div className="form-message error">{loadError}</div>
        ) : (
          <MonthlyCalendar events={calendarEvents} />
        )}
      </section>

      {/* 2 — Upcoming events (real submitted events only; holidays and
          birthdays are intentionally excluded here) */}
      <section className="section">
        <h2 className="section-title">Upcoming events</h2>
        <p className="section-sub">Upcoming family events and gatherings.</p>
        {!loadError && <UpcomingEvents events={events} />}
      </section>

      {/* 3 — Subscription */}
      <section className="section">
        <h2 className="section-title">Get the calendar on your phone</h2>
        <p className="section-sub">
          Works with both Google Calendar and Apple Calendar. Events show up in your own time zone.
        </p>
        <CalendarSubscribeCard />
      </section>

      {/* 4 — Family directory */}
      <section className="section">
        <h2 className="section-title">Family directory</h2>
        <p className="section-sub">
          Family members who can contribute events to the shared calendar.
        </p>
        <div className="roster">
          {FAMILY.map((group) => (
            <div key={group.generation}>
              <p className="roster-group-label">{group.generation}</p>
              <div className="roster-chips">
                {group.members.map((name) => (
                  <span className={`chip ${genSlug[group.generation]}`} key={name}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
