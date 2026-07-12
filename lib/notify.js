import { CONTACT_EMAIL } from "@/lib/site";

// >>> After you sign up for Resend and verify petersonplanning.com, set the
// RESEND_API_KEY environment variable in Vercel. Until that's set, this
// silently no-ops (logs a note) instead of breaking event editing/deleting —
// so the site keeps working even before email is wired up. <<<
const FROM_ADDRESS = "Peterson Family Hub <notify@petersonplanning.com>";

function fmt(v) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

function normDate(v) {
  if (!v) return null;
  return typeof v === "string" ? v.slice(0, 10) : new Date(v).toISOString().slice(0, 10);
}

const FIELD_LABELS = {
  title: "Event",
  event_date: "Start date",
  end_date: "End date",
  event_time: "Time",
  all_day: "All-day",
  timezone: "Time zone",
  is_virtual: "Virtual",
  meeting_link: "Meeting link",
  location: "Location",
  description: "Description",
  submitted_by: "Added by",
};

function diffRows(before, after) {
  const keys = Object.keys(FIELD_LABELS);
  const rows = [];
  for (const key of keys) {
    let a = before ? before[key] : undefined;
    let b = after ? after[key] : undefined;
    if (key === "event_date" || key === "end_date") {
      a = normDate(a);
      b = normDate(b);
    }
    if (a === b) continue;
    // Skip end_date noise on non-all-day events.
    if (key === "end_date" && !(before?.all_day || after?.all_day)) continue;
    if (key === "meeting_link" && !(before?.is_virtual || after?.is_virtual)) continue;
    rows.push({ label: FIELD_LABELS[key], before: fmt(a), after: fmt(b) });
  }
  return rows;
}

function renderTable(rows) {
  if (!rows.length) return "<p>No field-level changes detected.</p>";
  const body = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #e3dcc9;font-weight:600;color:#23262b;">${r.label}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e3dcc9;color:#a85a62;text-decoration:line-through;">${r.before}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e3dcc9;color:#5f7758;">${r.after}</td>
      </tr>`
    )
    .join("");
  return `
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;margin-top:8px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 12px;color:#5a5d63;font-size:12px;">Field</th>
          <th style="text-align:left;padding:6px 12px;color:#5a5d63;font-size:12px;">Before</th>
          <th style="text-align:left;padding:6px 12px;color:#5a5d63;font-size:12px;">After</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;
}

function renderFullDetails(event, heading) {
  if (!event) return "";
  const rows = Object.keys(FIELD_LABELS)
    .filter((k) => {
      if (k === "end_date" && !event.all_day) return false;
      if (k === "meeting_link" && !event.is_virtual) return false;
      return true;
    })
    .map(
      (k) => `
      <tr>
        <td style="padding:4px 12px;color:#5a5d63;">${FIELD_LABELS[k]}</td>
        <td style="padding:4px 12px;color:#23262b;">${fmt(k.includes("date") ? normDate(event[k]) : event[k])}</td>
      </tr>`
    )
    .join("");
  return `
    <p style="font-weight:600;margin:16px 0 4px;">${heading}</p>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">${rows}</table>`;
}

async function send({ subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[email] RESEND_API_KEY not set — skipping send:", subject);
    return { skipped: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [CONTACT_EMAIL],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend error", res.status, await res.text());
    }
    return { skipped: false };
  } catch (err) {
    console.error("[email] send failed", err);
    return { skipped: false, error: true };
  }
}

export async function notifyEventUpdated(before, after) {
  const rows = diffRows(before, after);
  const html = `
    <div style="font-family:sans-serif;color:#23262b;">
      <h2 style="color:#202a41;">Event edited: ${fmt(after.title)}</h2>
      <p>Changed on the Peterson Family Hub calendar.</p>
      ${renderTable(rows)}
    </div>`;
  return send({ subject: `Edited: ${after.title}`, html });
}

export async function notifyEventDeleted(deleted) {
  const html = `
    <div style="font-family:sans-serif;color:#23262b;">
      <h2 style="color:#a85a62;">Event deleted: ${fmt(deleted.title)}</h2>
      <p>This event was removed from the Peterson Family Hub calendar.</p>
      ${renderFullDetails(deleted, "Details at time of deletion")}
    </div>`;
  return send({ subject: `Deleted: ${deleted.title}`, html });
}
