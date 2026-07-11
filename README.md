# Peterson Family Planning Hub — Setup Guide

This is a real, working website. Nothing here is a demo — once it's deployed,
it's live and your family can use it. This guide assumes you've never done
this before, so it spells out every click.

**What you're building:** a site where anyone in the family (picked from a
name list, no password) can add an event with a title, date, time or
all-day flag, description, and location. The whole family can then
subscribe to one calendar link that keeps itself updated in Google Calendar
or Apple Calendar.

There are 4 steps:
1. Put the code on GitHub
2. Deploy it on Vercel
3. Connect a database (this is where events actually get saved)
4. Point your internet.bs domain at it

---

## 1. Put the code on GitHub

GitHub is just a place to store the project's code so Vercel can pull it
in and deploy it.

1. Go to [github.com](https://github.com) and create a free account if you
   don't have one.
2. Click the **+** in the top right → **New repository**.
3. Name it `peterson-family-hub`. Leave it **Public** or **Private** (either
   is fine). Don't check any of the "initialize with" boxes. Click **Create
   repository**.
4. On the next page, GitHub shows you commands under "…or push an existing
   repository from the command line." You need a terminal to run these. If
   you don't have one set up, the easiest path is:
   - Install [GitHub Desktop](https://desktop.github.com/)
   - Open it, sign in, choose **Add an Existing Repository from your Hard
     Drive**, and point it at this project folder
   - Click **Publish repository**, matching the name `peterson-family-hub`

Either way, the end result is the same: this folder's code is now on
GitHub.

---

## 2. Deploy it on Vercel

Vercel is the hosting service — it takes the code from GitHub and turns it
into a live website.

1. Go to [vercel.com](https://vercel.com) and sign up using your GitHub
   account (there's a "Continue with GitHub" button — use that, it saves a
   step).
2. Click **Add New…** → **Project**.
3. Find `peterson-family-hub` in the list and click **Import**.
4. Leave all the settings as-is (Vercel auto-detects this is a Next.js
   project). Click **Deploy**.
5. Wait about a minute. You'll get a confetti screen and a URL like
   `peterson-family-hub.vercel.app`. Click it — the site will load, but
   event saving won't work yet because there's no database connected.
   That's step 3.

---

## 3. Connect a database

This is what actually stores the events. Without it, the site loads but
nobody can save anything.

1. From your project on Vercel, click the **Storage** tab.
2. Click **Create Database** (or **Connect Database**, wording varies).
3. You'll be taken to the Marketplace — choose **Neon** (a Postgres
   database provider Vercel partners with; the free tier is plenty for a
   family calendar).
4. Click **Install** / **Continue**, pick a name (e.g. `peterson-hub-db`)
   and a region close to Utah, such as `us-west` — click **Create**.
5. When asked to connect it to a project, choose `peterson-family-hub` and
   confirm. Vercel automatically creates the environment variables the code
   needs — you don't need to type or copy any passwords yourself.
6. Now create the actual table that holds events. In the Vercel Storage
   tab, open your new database, look for a **Query** / **SQL Editor**
   option (or click through to the Neon console — there's a link). Paste in
   everything from the file **`db/init.sql`** in this project, and run it.
   This is a one-time step; it just tells the database "here's the shape of
   an event."
7. Back in your Vercel project, go to **Deployments**, click the ⋯ menu on
   the latest deployment, and choose **Redeploy**. This makes sure the site
   picks up the new database connection.
8. Visit your `.vercel.app` URL again, click **+ Add an event**, and submit
   a test event. If it shows up on the home page afterward, the database is
   working.

---

## 4. Connect your internet.bs domain

Once you buy your domain on internet.bs, you point it at Vercel with two
DNS records. This part varies slightly by domain, but the shape is always
the same:

1. In your Vercel project, go to **Settings → Domains**, type in your
   domain (e.g. `petersonfamilyhub.com`), and click **Add**.
2. Vercel will show you DNS records to add — typically:
   - An **A record**: host `@`, value `76.76.21.21`
   - A **CNAME record**: host `www`, value `cname.vercel-dns.com`
   
   (Vercel shows you the exact current values on that screen — use those
   over what's written here if they differ.)
3. Log in to internet.bs, find your domain, and look for **DNS Management**
   or **DNS Zone Editor**.
4. Add the A record and CNAME record exactly as Vercel showed you. Remove
   any conflicting default records internet.bs may have pre-filled for `@`
   or `www`.
5. Save, then go back to Vercel's Domains screen. It'll show "Invalid
   Configuration" until the DNS change spreads across the internet — this
   usually takes anywhere from a few minutes to a few hours. Vercel
   auto-checks and updates the status; you can also click **Refresh**.
6. Once it says **Valid Configuration**, your domain is live, with a free
   SSL certificate (the padlock icon) set up automatically.

---

## Using the site day to day

- **Adding events (the normal way):** anyone visits the site, taps **+ Add an
  event**, picks their name, fills in the form. Events can be timed or
  all-day, and all-day events can span multiple days.
- **Adding events (from a phone, no site visit):** the footer has an **Ask a
  question or send in an event** button. It opens an email addressed to you;
  a family member types the details and sends, and you receive their email
  address plus the details to add on the site. This exists because calendar
  subscriptions are **read-only** — events people create in their own
  Apple/Google calendar cannot flow back into the family feed, so email is the
  simple, universal fallback for anyone who'd rather not use the site form.
- **Subscribing to the calendar:** the "Get the calendar on your phone"
  section has buttons for Apple and Google plus a copyable link. Each person
  does this once and new events then appear on their calendar automatically.
- **Changing the email address:** the footer button points at the address in
  `lib/site.js`. Edit that one file to change it.
- **Editing the family list:** if someone joins the family, open
  `lib/family.js`, add their name under the right generation, then push to
  GitHub. Vercel redeploys automatically.
- **Photos (v2):** not in this version yet — intentionally left out of v1 to
  keep the first launch simple.

### Federal holidays & family birthdays

The calendar automatically shows U.S. federal holidays (handy for spotting
long weekends) and family birthdays. Both repeat every year and stay out of
the Upcoming list.

- **Holidays** need no maintenance; they're calculated for every year in
  `lib/holidays.js`. They appear on the site calendar only (phone calendars
  already show federal holidays, so they're not added to the subscription
  feed).
- **Birthdays** live in `lib/recurring.js`. The whole family is filled in
  except **grandma Linda** — add her line when you have her date. Birthdays
  appear on the site calendar *and* in the subscribed phone feed (as
  yearly-recurring all-day events titled like "Zoey Murphey's birthday! 🎉").
- **One-off dates:** the `SPECIAL_DATES` list handles non-repeating milestones
  (an expected arrival, a special anniversary). It's currently empty; there's a
  format example in the comment.

## Ideas for a future version (v2)

Parked here so they're not forgotten:

- **Birth years on birthdays** — store each person's birth year so a birthday
  can read "Margaret turns 50" instead of just her name.
- **Profile photos** — a picture per family member that shows up on their
  birthday (and maybe in the directory).
- **Photo upload on events** — the originally-planned v1 photo feature.
- **Automated email-to-event** — turn emailed suggestions into one-tap-approve
  pending events (needs an inbound-email service).

### Optional later: fully automated email-to-event

The email button above is manual (you retype the details on the site). If you
later want emails to become events automatically — landing as "pending" for
you to approve with one tap — that needs an inbound-email service (e.g.
Postmark or SendGrid inbound parsing) wired to a new webhook. It's a good v2
upgrade; ask when you're ready and it can be added.

## If something breaks

- **"Could not load events" on the home page:** almost always means the
  database step didn't finish, the table wasn't created, or the site needs
  a redeploy after the database was connected. Revisit step 3.
- **Domain says "Invalid Configuration" for a long time:** double check the
  exact record values in internet.bs match what Vercel's Domains page is
  currently asking for, and that there isn't a leftover default A record
  fighting with the one you added.
