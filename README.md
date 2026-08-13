# St. Francis Episcopal School — Substitute Availability Portal

Next.js + TypeScript + Postgres port of the Claude.ai prototype (`sub-portal-prototype.jsx`) described in
`SFES-Sub-Portal-Handoff.md`. Three role-based portals (Teacher, Substitute, Admin) sharing a booking
model, with real Google/password authentication, an admin-managed access allowlist, and real email/SMS
notifications.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Prisma 6** + **PostgreSQL** (intended for **Supabase**) — see `prisma/schema.prisma`
- **Auth.js v5** (`next-auth@beta`) with the Prisma adapter — Google sign-in as the primary method,
  username/password (Credentials provider) as a fallback for anyone without a Google account. JWT sessions
  (required for the Credentials provider to work alongside Google).
- **Resend** — real notification emails (not sign-in)
- **Twilio** — real notification SMS
- Plain `fetch` from client components to route handlers under `src/app/api/`

## How access control works

1. **`AllowedUser`** table (email + role, plus an optional `passwordHash`) is the approval list — only
   emails on it can sign in at all, and the role they're granted determines which of `/teacher`, `/sub`,
   `/admin` they land on. Manage it from Admin → Access.
2. Being on the allowlist is separate from having a Teacher/Substitute/Admin roster record. Someone needs
   **both**: allowlisted (to sign in) and a matching-by-email roster row (so the app knows who they are —
   name, availability, etc.). The role pages show a clear message if only one of the two exists.
3. **Sign-in**: "Sign in with Google" works for anyone whose email is a Google account (Google Workspace
   staff *and* any substitute using a personal Gmail) — no password needed, and it's gated by the same
   allowlist check. For people without a Google account, there are two ways to get them a password:
   - **Self-service (default)**: once an admin adds their email to the allowlist, they visit `/signin` →
     "Create a password" → enter their email and choose a password themselves. Works once per email — see
     `src/lib/passwordSetup.ts` for the security tradeoff this makes (no email verification step, a
     deliberate choice for this prototype stage) and why it's still safe against account takeover
     afterward (can't overwrite a password that's already set).
   - **Admin-set**: an admin can also set/reset someone's password directly from Admin → Access → the key
     icon next to their row — useful for resetting a forgotten password, since there's no self-service
     "forgot password" flow yet.
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

### 2. Google OAuth (sign-in)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a project (or use an
   existing one) → **APIs & Services** → **Credentials**.
2. **Configure consent screen** if prompted — "External" user type is fine for testing; you don't need to
   submit it for verification to use it with a small list of testers/your own org.
3. **Create Credentials** → **OAuth client ID** → Application type **Web application**.
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:3001/api/auth/callback/google` (for local dev — adjust the port if different)
   - `https://your-production-domain.com/api/auth/callback/google` (once deployed)
5. Copy the **Client ID** and **Client secret** into `.env` as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

No domain restriction is applied — any Google account can attempt sign-in, but the `AllowedUser` allowlist
check still gates actual access, so this is safe.

### 3. Resend (real notification emails — not sign-in)

1. Create a free account at [resend.com](https://resend.com).
2. Create an API key under **API Keys** → copy it into `.env` as `RESEND_API_KEY`.
3. For real deliverability (not just to your own inbox), verify a sending domain under **Domains**, then
   set `RESEND_FROM_EMAIL` to an address on it (e.g. `no-reply@yourdomain.org`). Until you do that, leave
   `RESEND_FROM_EMAIL` blank — Resend's shared test sender only delivers to the email you signed up with.
   This only affects the "You've been booked" / request notification emails now, not sign-in.

### 4. Twilio (SMS) — optional, skip if you don't need SMS yet

1. Create an account at [twilio.com](https://twilio.com).
2. From the [console dashboard](https://console.twilio.com), copy your **Account SID** and **Auth Token**
   into `.env` as `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`.
3. Buy or use a trial phone number under **Phone Numbers** → set `TWILIO_FROM_NUMBER` to it in E.164
   format (e.g. `+18325551234`). Trial accounts can only text verified numbers — verify your own cell to
   test.

Leaving the Twilio vars blank simply skips SMS sending; email and the in-app notification log still work.

### 5. Auth secret

```bash
cp .env.example .env
```
Then set `AUTH_SECRET` in `.env` to the output of:
```bash
openssl rand -base64 32
```
(Don't use `npx auth secret` — that resolves to an unrelated npm package called `auth` and writes the
wrong variable name, `BETTER_AUTH_SECRET`.)

### 6. Roster data (contains real staff PII — see below)

```bash
cp prisma/roster.local.example.ts prisma/roster.local.ts
```
Either fill in real names/phones/emails, or leave the fake sample data for a demo-safe seed. This file is
gitignored on purpose.

### 7. Install, migrate, seed, run

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000 → you'll be redirected to `/signin`. Sign in with Google (if your email is on the
allowlist — see "Bootstrapping the first admin" below), or email + password if an admin set one for you.

### Bootstrapping the first admin

The Access tab (Admin → Access) is how you grant sign-in access to everyone else, but the very first admin
has to be added directly, since there's no one logged in yet to use that UI:

```bash
npm run db:bootstrap-admin -- you@example.com "Your Name" "(555) 555-5555"
```
This adds you to both the `allowed_users` allowlist (role `admin`) and the `admins` table in one step. Phone
is optional. Safe to re-run any time — it upserts. Then just sign in with Google using that same email (or
set yourself a password via `npm run db:set-role` / Prisma Studio if you'd rather use a password).

### Testing sign-in as a role that isn't yours

If everyone testing has their own Google account, just add each real email to Admin → Access with the right
role — no special handling needed. The workaround below is only for the password-fallback path, and only
matters once you're also sending **real notification emails** via Resend:

**Resend's sandbox mode only delivers to the exact email address you signed up to Resend with** — not other
addresses, and not `+tag` variants of it (Gmail treats `you+teacher@gmail.com` as the same inbox, but
Resend's sandbox check doesn't). This affects notification emails (booking confirmations, etc.), not sign-in
anymore — but if you want to see what a notification email to a different test identity looks like before
verifying a domain in Resend, the same workaround applies:

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

## What's real vs. what's still a stand-in

Compared to Section 4 of the handoff doc's "Known gaps":

1. ✅ **Real auth** — done: Google sign-in as primary (covers Workspace staff and any sub with a personal
   Gmail account, matching the doc's intent more directly than originally planned — see "Deviations" below),
   password fallback for everyone else.
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

- **Undifferentiated Google sign-in, not a Workspace-vs-personal split.** The doc recommended Google
  Workspace SSO (domain-restricted) for Teachers/Admins and magic-link only for Substitutes. This build
  uses the same "Sign in with Google" flow for everyone instead — it isn't restricted to the
  `@stfrancishouston.org` domain, since plenty of subs use personal Gmail too, and unrestricted Google
  sign-in is still fully gated by the `AllowedUser` allowlist. People without any Google account (the
  doc's original reason for a separate sub-facing flow) use email + password instead, set by an admin.
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
