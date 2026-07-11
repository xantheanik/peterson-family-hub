// A curated list of time zones for the picker. It's grouped so the family
// can quickly find theirs. If someone's zone isn't listed, the form injects
// their auto-detected zone at the top so it's always selectable.

export const TIMEZONE_GROUPS = [
  {
    label: "United States & Canada",
    zones: [
      ["America/New_York", "Eastern (New York)"],
      ["America/Chicago", "Central (Chicago)"],
      ["America/Denver", "Mountain (Denver)"],
      ["America/Phoenix", "Arizona (no DST)"],
      ["America/Los_Angeles", "Pacific (Los Angeles)"],
      ["America/Anchorage", "Alaska"],
      ["Pacific/Honolulu", "Hawaii"],
      ["America/Toronto", "Eastern (Toronto)"],
      ["America/Vancouver", "Pacific (Vancouver)"],
    ],
  },
  {
    label: "Europe",
    zones: [
      ["Europe/London", "London"],
      ["Europe/Paris", "Paris / Berlin / Madrid"],
      ["Europe/Athens", "Athens / Helsinki"],
    ],
  },
  {
    label: "Asia & Pacific",
    zones: [
      ["Asia/Manila", "Manila"],
      ["Asia/Tokyo", "Tokyo"],
      ["Asia/Shanghai", "Beijing / Shanghai"],
      ["Asia/Kolkata", "India"],
      ["Asia/Dubai", "Dubai"],
      ["Australia/Sydney", "Sydney"],
      ["Pacific/Auckland", "Auckland"],
    ],
  },
];

const KNOWN_LABELS = Object.fromEntries(
  TIMEZONE_GROUPS.flatMap((g) => g.zones)
);

export function labelForZone(tz) {
  return KNOWN_LABELS[tz] || tz.replace(/_/g, " ").replace(/\//g, " / ");
}

// ---- Conversion helpers ----
//
// Events are stored as a wall-clock date + time PLUS the IANA time zone the
// event actually happens in (e.g. "5:00 PM in America/Denver"). We convert
// that to a precise UTC instant only when we need it — for the .ics feed and
// the Google Calendar link — so every subscriber's own calendar app shows
// the event in *their* local time automatically.

function zoneOffsetMs(utcMs, timeZone) {
  // How far ahead/behind UTC the given zone is at this instant.
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  const hour = map.hour === "24" ? 0 : Number(map.hour);
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second)
  );
  return asUTC - utcMs;
}

// Interpret "dateStr + timeStr as wall time in timeZone" -> exact UTC Date.
export function wallTimeToUTC(dateStr, timeStr, timeZone) {
  const [y, mo, d] = String(dateStr).split("-").map(Number);
  const [h = 0, mi = 0, s = 0] = String(timeStr || "00:00:00")
    .split(":")
    .map(Number);
  const naiveUTC = Date.UTC(y, mo - 1, d, h, mi, s);
  // Apply the zone's offset for that instant (handles DST for the date).
  const offset = zoneOffsetMs(naiveUTC, timeZone);
  return new Date(naiveUTC - offset);
}

// "20260814T230000Z" from a Date, in UTC.
export function formatUTCStamp(date) {
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}` +
    `T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`
  );
}

// Human display of a timed event in its own zone, e.g. "5:00 PM MDT".
export function displayTimeInZone(dateStr, timeStr, timeZone) {
  const utc = wallTimeToUTC(dateStr, timeStr, timeZone);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(utc);
}

function normDate(v) {
  return typeof v === "string" ? v.slice(0, 10) : new Date(v).toISOString().slice(0, 10);
}

// Every calendar date an event covers, inclusive: ["2026-08-10", "2026-08-11", ...].
// Timed and single-day events return just their one date.
export function enumerateEventDates(event) {
  const start = normDate(event.event_date);
  const end = event.all_day && event.end_date ? normDate(event.end_date) : start;
  if (end <= start) return [start];
  const dates = [];
  let d = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (d <= last) {
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

// The one-line "when" label shown on cards and in the day popup.
export function formatEventWhen(event) {
  const start = normDate(event.event_date);
  const startDate = new Date(`${start}T00:00:00`);
  const longOpts = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
  const longLabel = startDate.toLocaleDateString("en-US", longOpts);

  if (event.all_day) {
    const end = event.end_date ? normDate(event.end_date) : start;
    if (end > start) {
      const endDate = new Date(`${end}T00:00:00`);
      const shortStart = startDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const shortEnd = endDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${shortStart} – ${shortEnd} · All day`;
    }
    return `${longLabel} · All day`;
  }

  if (!event.event_time) return longLabel;
  return `${longLabel} · ${displayTimeInZone(start, event.event_time, event.timezone || "America/Denver")}`;
}
