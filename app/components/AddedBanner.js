"use client";

import { useEffect, useState } from "react";

// After adding, editing, or deleting an event, people land back on the
// calendar with a query param (?added=, ?updated=, or ?deleted=) carrying the
// event title. This shows a friendly confirmation for a few seconds, then
// quietly clears itself (and the URL) so a refresh won't show it again.
const KINDS = {
  added: { icon: "✓", verb: "was added to", tone: "success" },
  updated: { icon: "✓", verb: "was updated on", tone: "success" },
  deleted: { icon: "🗑", verb: "was deleted from", tone: "deleted" },
};

export default function AddedBanner() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let kind = null;
    let title = null;
    for (const key of Object.keys(KINDS)) {
      const value = params.get(key);
      if (value) {
        kind = key;
        title = value;
        break;
      }
    }
    if (!kind) return;
    setInfo({ kind, title });
    // Clean the URL so refreshing doesn't re-show the banner.
    window.history.replaceState({}, "", "/");
    const t = setTimeout(() => setInfo(null), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!info) return null;
  const { icon, verb, tone } = KINDS[info.kind];

  return (
    <div className={`added-banner added-banner-${tone}`} role="status">
      <span className="added-banner-text">
        {icon} &ldquo;{info.title}&rdquo; {verb} the calendar
      </span>
      <button
        className="added-banner-close"
        onClick={() => setInfo(null)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
