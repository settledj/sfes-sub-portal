# St. Francis Episcopal School — Substitute Availability Portal

Next.js + TypeScript + Postgres port of the Claude.ai prototype (`sub-portal-prototype.jsx`) described in
`SFES-Sub-Portal-Handoff.md`. Three role-based portals (Teacher, Substitute, Admin) sharing a booking
model, with real magic-link authentication, an admin-managed access allowlist, and real email/SMS
notifications.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Prisma 6** + **PostgreSQL** (intended for **Supabase**) — see `prisma/schema.prisma`
- **Auth.js v5** (`next-auth@beta`) with the Prisma adapter — magic-link (passwordless) sign-in for all
  three roles, database sessions
- **Resend** — magic-link emails and real notification emails
- **Twilio** — real notification SMS
- Plain `fetch` from client components to route handlers under `src/app/api/`

## How access control works

1. **`AllowedUser`** table (email + role) is the approval list — only emails on it can sign in at all, and
   the role they're granted determines which of `/teacher`, `/sub`, `/admin` they land on. Manage it from
   Admin → Access.
2. Being on the allowlist is separate from having a Teacher/Substitute/Admin roster record. Someone needs
   **both**: allowlisted (to sign in) and a matching-by-email roster row (so the app knows who they are —
   name, availability, etc.). The role pages show a clear message if only one of the two exists.
3. Sign-in is magic-link only (no Google SSO in this pass — see "Deviations" below).
4. Every mutating API route checks the caller's role via `src/lib/authz.ts`; routes that touch a specific
   person's own data (sub availability/profile, teacher photo) also check that the signed-in email matches
   that record.

## Local setup

### 1. Supabase (Postgres)

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine). Use email/password or
   GitHub to sign up — either works.
2. **Database password**: if the password Supabase shows you at project creation has special characters
   (`@ : / # ? % &` etc.), either percent-encode them in the connection string or — simpler — go to
   **Connect** → **Direct connection** → **Reset database password** to get a fresh alphanumeric-only one.
   Special characters in an un-encoded password are the #1 cause of `P1000: Authentication failed`.
3. This app needs **two** connection strings, both from the **Connect** dialog:
   - `DATABASE_URL` — the **Transaction pooler** string (port `6543`), used by the app at runtime. Append
     `?pgbouncer=true` to the end — without it, Prisma will intermittently fail with `prepared statement
     "sN" already exists`, since the transaction pooler doesn't support Prisma's prepared-statement caching.
   - `DIRECT_URL` — the **Direct connection** string (port `5432`), used only by `prisma migrate`. The
     pooler can't run migrations at all (the command just hangs) — this is why both are needed.
4. Paste both into `.env`.

### 2. Resend (email)

1. Create a free account at [resend.com](https://resend.com).
2. Create an API key under **API Keys** → copy it into `.env` as `RESEND_API_KEY`.
3. For real deliverability (not just to your own inbox), verify a sending domain under **Domains**, then
   set `RESEND_FROM_EMAIL` to an address on it (e.g. `no-reply@yourdomain.org`). Until you do that, leave
   `RESEND_FROM_EMAIL` blank — Resend's shared test sender only delivers to the email you signed up with,
   which is fine for solo testing but not for other admins.

### 3. Twilio (SMS) — optional, skip if you don't need SMS yet

1. Create an account at [twilio.com](https://twilio.com).
2. From the [console dashboard](https://console.twilio.com), copy your **Account SID** and **Auth Token**
   into `.env` as `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`.
3. Buy or use a trial phone number under **Phone Numbers** → set `TWILIO_FROM_NUMBER` to it in E.164
   format (e.g. `+18325551234`). Trial accounts can only text verified numbers — verify your own cell to
   test.

Leaving the Twilio vars blank simply skips SMS sending; email and the in-app notification log still work.

### 4. Auth secret

```bash
cp .env.example .env
```
Then set `AUTH_SECRET` in `.env` to the output of:
```bash
openssl rand -base64 32
```
(Don't use `npx auth secret` — that resolves to an unrelated npm package called `auth` and writes the
wrong variable name, `BETTER_AUTH_SECRET`.)

### 5. Roster data (contains real staff PII — see below)

```bash
cp prisma/roster.local.example.ts prisma/roster.local.ts
```
Either fill in real names/phones/emails, or leave the fake sample data for a demo-safe seed. This file is
gitignored on purpose.

### 6. Install, migrate, seed, run

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000 → you'll be redirected to `/signin`. Sign in with an email you've added to the
allowlist (see "Bootstrapping the first admin" below) — you'll get a real email with a sign-in link.

### Bootstrapping the first admin

The Access tab (Admin → Access) is how you grant sign-in access to everyone else, but the very first admin
has to be added directly, since there's no one logged in yet to use that UI:

```bash
npm run db:bootstrap-admin -- you@example.com "Your Name" "(555) 555-5555"
```
This adds you to both the `allowed_users` allowlist (role `admin`) and the `admins` table in one step. Phone
is optional. Safe to re-run any time — it upserts.

### Testing sign-in as a role that isn't yours

**Resend's sandbox mode only delivers to the exact email address you signed up to Resend with** — not other
addresses, and not `+tag` variants of it (Gmail treats `you+teacher@gmail.com` as the same inbox, but
Resend's sandbox check doesn't). You'll hit a `Configuration` error trying to sign in as anyone else until
you verify a sending domain in Resend (**Domains** → add yours → set `RESEND_FROM_EMAIL`).

Until then, to test a role that belongs to a different real email, temporarily point that person's record at
your own deliverable inbox, sign in, then switch it back:

```bash
# Change which role your one deliverable email signs in as:
npm run db:set-role -- you@example.com teacher|substitute|admin

# Specifically for a substitute record (moves both the Substitute row's email
# and its allowlist entry together, so their real booking data comes with it):
npm run db:swap-sub-email -- to    # their-real-email -> your deliverable inbox
npm run db:swap-sub-email -- back  # your deliverable inbox -> their-real-email
```
(`db:swap-sub-email` has the real/test emails hardcoded in `prisma/tempSwapSubEmail.ts` — edit those
constants for a different substitute.)

Also worth knowing: a magic-link callback occasionally lands back on `/signin` instead of the intended
portal — this is a benign redirect quirk with the Resend/Email provider's `redirectTo` handling, not a
failed login. `/signin` now auto-forwards signed-in visitors to their portal, but if you land on Auth.js's
own `/api/auth/error?error=Verification` page (not our `/signin` page), that means the link was already
used — just navigate straight to `/teacher`, `/sub`, or `/admin` to check whether the first attempt actually
succeeded before requesting a new link.

## What's real vs. what's still a stand-in

Compared to Section 4 of the handoff doc's "Known gaps":

1. ✅ **Real auth** — done, but as magic-link for all three roles rather than the doc's suggested
   Google Workspace SSO + magic-link split (see "Deviations" below).
2. ✅ **Real email/SMS delivery** — done via Resend + Twilio, gated behind env vars.
3. ✅ **Real database** — Postgres via Supabase.
4. ❌ **No Microsoft Graph / Outlook sync** yet.
5. ⚠️ **Photos are still base64 data URIs** in the `photo` column. Move to S3/Supabase Storage and store
   URLs instead before this scales up.
6. ⚠️ **Partial admin UI for account management** — the Access tab manages *who can sign in*, but there's
   still no UI for creating/editing Teacher/Substitute roster rows themselves (only via `prisma/roster.local.ts`
   or Prisma Studio).

### Real staff PII

`prisma/roster.local.ts` and `src/lib/photos.local.ts` hold the real names, personal phone numbers,
personal emails, and headshots from the original roster. **Both are gitignored — never commit them.**
`prisma/roster.local.example.ts` is the checked-in template with fake data instead. See Section 5 of the
handoff doc for why.

## Deviations from the handoff doc / prototype worth knowing about

- **Magic link for everyone, not Google SSO for staff.** The doc recommended Google Workspace SSO
  (domain-restricted) for Teachers/Admins since they have `@stfrancishouston.org` accounts, with magic-link
  only for Substitutes (personal emails). This build uses magic-link for all three to avoid standing up a
  Google Cloud OAuth app in this pass. Swapping in Google SSO later means adding a Google provider to
  `src/lib/auth.ts` — the allowlist/session/role logic doesn't need to change.
- **Separate allowlist, not roster membership.** An explicit choice: being in `AllowedUser` is what lets
  someone sign in; being in `Teacher`/`Substitute`/`Admin` is what gives them a profile. The two are
  managed independently, which is more flexible but means an admin must remember to do both when onboarding
  someone.
- **State sync strategy**: most mutations (accepting/declining/cancelling/rescheduling/reassigning a
  booking) touch both a `Request` row and a `Substitute.availability` JSON blob. Rather than hand-patch
  both pieces of client state, the client components just re-fetch `/api/state` after those calls — simpler
  and less bug-prone than duplicating the server's mutation logic, at the cost of one extra round trip.
- **Sub profile text fields** (bio, additional info) save `onBlur` instead of on every keystroke, to avoid
  a network round trip per character.
- **"Reset demo data"** (`POST /api/reset`, admin-only) wipes and re-seeds the actual database from
  `prisma/roster.local.ts` instead of resetting a local storage key.
- **Teacher photo overrides** (the prototype's separate `teacherPhotos` map, needed because `TEACHERS` was
  a hardcoded constant) are gone — `Teacher.photo` in the DB is directly mutable.

## Auth.js v5 note

`next-auth@beta` (Auth.js v5) is still in beta as of this build, though widely used in production. If that's
a concern, the migration path to v4 or to GA-v5 later is contained mostly to `src/lib/auth.ts`,
`src/proxy.ts`, and the `src/types/next-auth.d.ts` module augmentation.
