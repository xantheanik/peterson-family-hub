import { sql } from "@vercel/postgres";

// The Vercel↔Neon integration injects POSTGRES_URL (plus DATABASE_URL). The
// @vercel/postgres client reads POSTGRES_URL. This fallback makes sure things
// still connect if only DATABASE_URL happens to be present. Runs before the
// first query (the client connects lazily), so it takes effect in time.
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

export async function getAllEvents() {
  const { rows } = await sql`
    SELECT id, title, event_date, end_date, event_time, all_day, timezone,
           is_virtual, meeting_link, description, location, submitted_by, created_at
    FROM events
    ORDER BY event_date ASC, event_time ASC NULLS FIRST;
  `;
  return rows;
}

export async function getEventById(id) {
  const { rows } = await sql`
    SELECT id, title, event_date, end_date, event_time, all_day, timezone,
           is_virtual, meeting_link, description, location, submitted_by, created_at
    FROM events
    WHERE id = ${id};
  `;
  return rows[0] || null;
}

export async function updateEvent(id, {
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
}) {
  const resolvedEnd = all_day ? end_date || event_date : event_date;
  const { rows } = await sql`
    UPDATE events SET
      title = ${title},
      event_date = ${event_date},
      end_date = ${resolvedEnd},
      event_time = ${all_day ? null : event_time},
      all_day = ${all_day},
      timezone = ${timezone},
      is_virtual = ${is_virtual},
      meeting_link = ${is_virtual ? meeting_link || null : null},
      description = ${description || null},
      location = ${location || null},
      submitted_by = ${submitted_by}
    WHERE id = ${id}
    RETURNING id, title, event_date, end_date, event_time, all_day, timezone,
              is_virtual, meeting_link, description, location, submitted_by, created_at;
  `;
  return rows[0] || null;
}

export async function deleteEvent(id) {
  const { rows } = await sql`
    DELETE FROM events WHERE id = ${id}
    RETURNING id, title, event_date, end_date, event_time, all_day, timezone,
              is_virtual, meeting_link, description, location, submitted_by, created_at;
  `;
  return rows[0] || null;
}
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
}) {
  // End date only applies to all-day events; timed events are single-day.
  const resolvedEnd = all_day ? end_date || event_date : event_date;
  const { rows } = await sql`
    INSERT INTO events (
      title, event_date, end_date, event_time, all_day, timezone,
      is_virtual, meeting_link, description, location, submitted_by
    )
    VALUES (
      ${title},
      ${event_date},
      ${resolvedEnd},
      ${all_day ? null : event_time},
      ${all_day},
      ${timezone},
      ${is_virtual},
      ${is_virtual ? meeting_link || null : null},
      ${description || null},
      ${location || null},
      ${submitted_by}
    )
    RETURNING id, title, event_date, end_date, event_time, all_day, timezone,
              is_virtual, meeting_link, description, location, submitted_by, created_at;
  `;
  return rows[0];
}
