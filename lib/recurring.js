import { federalHolidays } from "@/lib/holidays";

// ---------------------------------------------------------------------------
// FAMILY BIRTHDAYS  (month = 1-12)
// These repeat every year: shown on the calendar AND in the subscribed
// phone-calendar feed, but kept out of the "Upcoming events" list.
// Add a line for anyone new, or fill in a missing date.
// ---------------------------------------------------------------------------
export const BIRTHDAYS = [
  // Generation 1
  // { name: "Linda Peterson", month: 0, day: 0 },  // <-- add Linda's date here

  // Generation 2
  { name: "George Nikopoulos", month: 5, day: 15 },
  { name: "Millie Nikopoulos", month: 6, day: 7 },
  { name: "Ginny Tuite", month: 11, day: 11 },
  { name: "Sean Tuite", month: 6, day: 17 },
  { name: "Angela Jorgensen", month: 6, day: 28 },
  { name: "Will Peterson", month: 8, day: 5 },
  { name: "Deb Peterson", month: 2, day: 17 },
  { name: "Dave Peterson", month: 8, day: 8 },
  { name: "Bobbie Peterson", month: 5, day: 30 },
  { name: "Margaret FiveCrows", month: 2, day: 18 },
  { name: "Jeremy FiveCrows", month: 2, day: 10 },

  // Generation 3
  { name: "Xanthea Nikopoulos", month: 7, day: 5 },
  { name: "Marika Ouzounian", month: 10, day: 14 },
  { name: "Yesaiah Ouzounian", month: 7, day: 16 },
  { name: "Athena Nikopoulos", month: 1, day: 25 },
  { name: "Thomas Tuite", month: 7, day: 1 },
  { name: "Anna Tuite", month: 3, day: 25 },
  { name: "Livi Kay", month: 10, day: 20 },
  { name: "Kaden Murphey", month: 7, day: 9 },
  { name: "Oskar Jorgensen", month: 8, day: 13 },
  { name: "Liz Peterson", month: 10, day: 14 },
  { name: "Mike Peterson", month: 9, day: 25 },
  { name: "Lucy FiveCrows", month: 5, day: 7 },
  { name: "Henry FiveCrows", month: 2, day: 26 },
  { name: "Esther Peterson", month: 2, day: 4 },
  { name: "Everette Peterson", month: 8, day: 16 },
  { name: "Easton Peterson", month: 12, day: 14 },

  // Generation 4
  { name: "Bronx Murphey", month: 7, day: 5 },
  { name: "Zoey Murphey", month: 8, day: 10 },
];

// One-off dated markers (NOT recurring). Add entries here for things like an
// expected arrival or a special anniversary that shouldn't repeat. Format:
//   { id: "unique-id", title: "Some milestone 💕", date: "2026-07-27" },
// These show on the calendar and in the subscription feed, but not in Upcoming.
export const SPECIAL_DATES = [];

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function birthdayTitle(name) {
  return `${name}'s birthday! 🎉`;
}
function pseudo(fields) {
  return {
    end_date: fields.event_date,
    event_time: null,
    all_day: true,
    timezone: "America/Denver",
    is_virtual: false,
    meeting_link: null,
    location: null,
    description: null,
    submitted_by: null,
    ...fields,
  };
}

// For the on-site monthly calendar: concrete dated instances for each year in
// the range (holidays + birthdays + one-off specials).
export function generatedEvents({ startYear, endYear }) {
  const out = [];
  for (let y = startYear; y <= endYear; y++) {
    for (const h of federalHolidays(y)) {
      out.push(
        pseudo({
          id: `holiday-${h.date}`,
          title: h.title,
          event_date: h.date,
          description: "U.S. federal holiday",
          source: "holiday",
          category: "holiday",
        })
      );
    }
    for (const b of BIRTHDAYS) {
      if (!b.month || !b.day) continue;
      const date = `${y}-${String(b.month).padStart(2, "0")}-${String(b.day).padStart(2, "0")}`;
      out.push(
        pseudo({
          id: `bday-${slug(b.name)}-${y}`,
          title: birthdayTitle(b.name),
          event_date: date,
          source: "birthday",
          category: "birthday",
        })
      );
    }
  }
  for (const sp of SPECIAL_DATES) {
    const spYear = Number(sp.date.slice(0, 4));
    if (spYear >= startYear && spYear <= endYear) {
      out.push(
        pseudo({
          id: sp.id,
          title: sp.title,
          event_date: sp.date,
          source: "special",
          category: "birthday",
        })
      );
    }
  }
  return out;
}

// For the subscribed .ics feed: birthdays as yearly-recurring events (RRULE)
// plus one-off specials. Holidays are intentionally excluded — phone calendars
// already display U.S. federal holidays, so we don't duplicate them.
export function feedExtraEvents(baseYear) {
  const out = [];
  for (const b of BIRTHDAYS) {
    if (!b.month || !b.day) continue;
    const date = `${baseYear}-${String(b.month).padStart(2, "0")}-${String(b.day).padStart(2, "0")}`;
    out.push(
      pseudo({
        id: `bday-${slug(b.name)}`,
        title: birthdayTitle(b.name),
        event_date: date,
        rrule: "FREQ=YEARLY",
        source: "birthday",
      })
    );
  }
  for (const sp of SPECIAL_DATES) {
    out.push(pseudo({ id: sp.id, title: sp.title, event_date: sp.date, source: "special" }));
  }
  return out;
}
