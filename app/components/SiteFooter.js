import { CONTACT_EMAIL } from "@/lib/site";

export default function SiteFooter() {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Peterson Family Hub — question or event"
  )}`;
  return (
    <footer className="site-footer">
      <a className="btn btn-secondary" href={mailto}>
        Ask a question or send in an event
      </a>
      <p className="footer-tagline">BongoJones 2026</p>
    </footer>
  );
}
