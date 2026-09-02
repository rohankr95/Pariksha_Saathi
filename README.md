# परीक्षा साथी | Pariksha Saathi

**हर विद्यार्थी का साथी — तैयारी से सफलता तक**

The official exam-preparation portal for the District Education Department,
Surajpur, Chhattisgarh. A fully dynamic, database-driven platform — every
lecture, note, book, story, exam date, roadmap and quiz question is managed
from an admin panel by teachers, with no coding required.

This repo is being built **phase by phase** (see [Build Order](#build-order)
below). This README reflects **Phases 1–4**: project setup, database schema,
authentication, role-based routing, the design system, the full home page;
Lectures, Notes, Books and Motivational Stories with real public
browsing/filtering and full teacher admin CRUD (including file uploads);
Exam Dates (with email reminders), Career Roadmap (with an interest quiz),
and Olympiad — each with real public pages, subscriptions/interest
registration, and admin CRUD; and a full Quiz engine (server-scored,
shuffled, timed, autosaved) with results and a live Leaderboard.

---

## Tech stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend:** Next.js API routes / Server Actions
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Auth.js (NextAuth v5) — email/password credentials, hashed with
  bcrypt, JWT sessions. Server-side role checks on every protected route
  (never relies on hiding UI alone).
- **UI:** shadcn/ui-style primitives, Lucide icons, Framer Motion, next-themes
  (dark mode), Poppins/Inter + Noto Sans Devanagari fonts
- **i18n:** one JSON dictionary per locale (Hindi default, English toggle) —
  see `src/lib/i18n/dictionaries/`

Everything that touches infrastructure (DB URL, file storage, email) is
configured via environment variables so the app is portable between a
private VPS, Supabase/Neon, and — later — NIC/SDC infrastructure.

---

## Getting started (local development)

### 1. Prerequisites

- Node.js 20+
- A PostgreSQL database (local, Docker, Supabase, or Neon)

### 2. Install

```bash
npm install
cp .env.example .env
# edit .env — at minimum set DATABASE_URL and AUTH_SECRET
# generate a secret with: openssl rand -base64 32
```

### 3. Database

```bash
npm run db:migrate   # creates tables from prisma/schema.prisma
npm run db:seed      # loads realistic Surajpur sample data
```

### 4. Run

```bash
npm run dev
```

Visit http://localhost:3000

### Demo logins (created by the seed script)

| Role | Email | Password |
|---|---|---|
| Super Admin (Nodal Officer) | `nodal.officer@surajpur.gov.in` | `Pariksha@123` |
| Teacher | `anjali.sharma@surajpur.gov.in` | `Pariksha@123` |
| Teacher | `ramesh.sahu@surajpur.gov.in` | `Pariksha@123` |
| Teacher | `priya.patel@surajpur.gov.in` | `Pariksha@123` |
| Student | `student1@example.com` … `student10@example.com` | `Pariksha@123` |

Super Admin and Teachers land in `/admin`. Students land on the home page
and can visit `/dashboard`.

**Change every demo password before any public/production deployment.**

---

## Project structure

```
prisma/
  schema.prisma        full data model (see spec §6 — every module)
  seed.ts               Surajpur sample data
src/
  app/                  Next.js App Router pages
    admin/               teacher/super-admin panel (role-protected)
    api/auth, api/health
    login, register, dashboard, and one route per public module
  components/
    ui/                  shared primitives (Button, Card, Badge, Input…)
    layout/              header, footer, bottom nav, theme/language toggles
    home/                home page sections
    admin/                admin shell (sidebar, topbar)
  lib/
    auth.ts, auth.config.ts   Auth.js config (edge-safe config split out)
    prisma.ts
    i18n/                dictionaries + locale provider
    sections.ts          the 12 public module definitions (icon, colour, href)
    admin-nav.ts         admin sidebar module definitions
    queries/             typed Prisma query helpers used by pages
  middleware / proxy.ts  route protection (redirects to /login, enforces role)
  types/next-auth.d.ts   session/JWT type augmentation
```

## Design system

Design tokens (colours, radii, shadows, fonts) live as CSS custom properties
in `src/app/globals.css` under `@theme inline`, with a dark-mode override via
`[data-theme="dark"]`. Each of the 12 public modules has its own accent
colour (`--color-section-*`), defined once in `src/lib/sections.ts` and
`src/lib/admin-nav.ts` and reused everywhere (home grid, admin sidebar,
personalised strip) so the mapping never drifts.

## Content modules (Phase 2)

Each of the four modules follows the same shape:

- `src/lib/queries/<module>.ts` — public, published-only queries (filters + pagination)
- `src/lib/queries/admin-<module>.ts` — admin queries (includes drafts)
- `src/app/admin/<module>/actions.ts` — server actions: create, update, soft-delete
  (`deletedAt`, with the record kept for a restore window), publish/unpublish, reorder
- `src/app/admin/<module>/{page,new/page,[id]/edit/page}.tsx` — list + forms
- `src/app/<module>/page.tsx` (+ `[id]/page.tsx` for Lectures/Stories) — public pages
- `src/components/admin/<module>-form.tsx` — the shared create/edit form

Notable pieces:

- **Lectures** — YouTube ID parsing/thumbnailing (`src/lib/youtube.ts`), a
  `youtube-nocookie.com` embed with an "Open in YouTube" fallback, watch-progress
  tracking per student, view counting, and a broken-link report queue surfaced on
  the admin list.
- **Notes** — PDF upload, a `GET /notes/[id]/download` route that increments the
  download counter server-side then redirects to the file (works with no client
  JS), and a `NoteVersion` history record written whenever a file is replaced.
- **Books** — supports either an uploaded PDF *or* a linked external `sourceUrl`
  (at least one required), with a mandatory copyright/source-cleared checkbox
  before a book can be saved.
- **Stories** — logged-in students can submit their own story at `/stories/submit`
  (guarded server-side, not just hidden in the UI); submissions land as
  unpublished + `isSubmission: true` and show up highlighted at the top of the
  admin list for moderation.

## Email & scheduled reminders (Phase 3)

`src/lib/email.ts` abstracts sending behind `EMAIL_DRIVER` (`smtp` |
`resend`), each rendered through a shared Hindi-first HTML template
(`renderNotification`). If the selected driver's credentials aren't
configured, it **falls back to logging the email to the console** instead of
failing — so the reminder pipeline runs and is testable locally without any
real SMTP/API setup.

`GET /api/cron/exam-reminders` finds every `ExamSubscription` whose exam's
`applyEnd` is ≤7 or ≤1 days away and the matching flag
(`reminderSent7d`/`reminderSent1d`) hasn't been sent yet, emails the student,
and marks the flag so it's never sent twice. It's a plain HTTP route — wire
it to any scheduler that can do a daily `curl`:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/cron/exam-reminders
```

(Linux cron, a GitHub Actions scheduled workflow, or your host's own cron
feature all work identically.) Set `CRON_SECRET` in production — the route
runs unauthenticated only when it's unset, which is fine for local dev but
not for a public deployment.

`GET /api/cron/doubt-reminders` (added Phase 5) works the same way for
`DoubtBooking` rows — 24h and 1h before `slotStart`, gated by
`reminderSent24h`/`reminderSent1h` — but should run every ~15 minutes rather
than daily, since a 1-hour-out reminder window is much narrower than a
7-day one:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/cron/doubt-reminders
```

## Career interest quiz (Phase 3)

`/career/quiz` is a 10-question, entirely client-side quiz
(`src/lib/career-quiz.ts` + `src/components/career/interest-quiz.tsx`) that
scores answers against career categories, then redirects to
`/career?suggested=<top 3 categories>`. The `/career` page matches those
against published `CareerRoadmap.title`s (case-insensitive `contains`) and
shows them in a "सुझाए गए" section — so it degrades gracefully to "no exact
match yet" rather than breaking when the admin hasn't published every
category the quiz can suggest.

## Auth & role-based access

- `src/lib/auth.config.ts` — edge-safe config (used by `src/proxy.ts`,
  Next.js's middleware convention) — only checks the JWT, never touches
  Prisma/bcrypt so it can run on the Edge runtime.
- `src/lib/auth.ts` — full config with the Credentials provider (bcrypt +
  Prisma), used by the `/api/auth/[...nextauth]` route and server code.
- `src/proxy.ts` blocks unauthenticated/unauthorised requests to
  `/admin/**` (TEACHER/SUPER_ADMIN only) and `/dashboard/**`, `/me/**`
  (any logged-in user).
- `requireRole()` / `requireUser()` in `src/lib/require-role.ts` re-check on
  the server inside every protected page/server action — middleware alone
  is never trusted as the only gate.

## File storage

`src/lib/storage.ts` abstracts uploads behind `STORAGE_DRIVER` (`local` |
`s3`) so the app is portable without code changes:

- **local** (default): writes under `LOCAL_UPLOAD_DIR` (outside `public/`,
  since it needs to persist across deploys/restarts on a VPS) and serves
  files through `GET /api/files/[...path]` (path-traversal guarded,
  cache-control headers set).
- **s3**: uses `@aws-sdk/client-s3` against any S3-compatible endpoint
  (Supabase Storage, Cloudflare R2, AWS S3) — set `S3_*` env vars.

Uploads go through the role-gated `POST /api/admin/upload` route (teacher/
super-admin only), which validates mime type and a per-kind size limit
before handing back a stored `{ path, url, sizeBytes }`.

## Quiz engine & anti-cheating (Phase 4)

- `src/lib/quiz-scoring.ts` — pure, side-effect-free scoring for all five
  question types (MCQ single/multiple, true/false, assertion-reason,
  numeric), plus a Fisher–Yates `shuffle()`.
- **Server-side scoring only.** The correct answer never reaches the client
  before submission: `startAttempt` shuffles each question's option order
  once and stores it on the `QuizAttempt` row; the take page
  (`src/lib/build-client-questions.ts`) strips `correctAnswer` and reorders
  option *text* per that shuffle before sending anything to the browser. A
  student's click is mapped back from the shuffled position to the original
  option index client-side, and only that index is ever persisted — so the
  server always scores in the original numbering without needing to expose it.
- **Autosave & resume.** Every answer/mark-for-review is written to
  `QuizAttempt.answersJson` via a server action on selection. Reloading or
  reconnecting mid-attempt just re-fetches that same row — there's no
  separate "resume" code path to keep in sync.
- **Anti-cheat basics:** per-question option shuffle, a tab-switch counter
  (`visibilitychange` → `recordTabSwitch`), and a countdown computed from the
  server-stored `startedAt` (client tampering with the displayed clock can't
  move the real deadline — submission time is still checked server-side).
- **Leaderboard** (`src/lib/queries/leaderboard.ts`) is computed live via
  `groupBy` over `QuizAttempt` rather than a materialized/cron-refreshed
  table — simpler to keep correct, and fast enough at this scale. Ranking:
  total score → accuracy → average time (documented on the page itself).
  Only `displayName`/school/class are ever shown; students can opt out
  (`onLeaderboard`) from `/leaderboard` itself.

## Class Request, Doubt Class Scheduler & Answer Copy Checking (Phase 5)

- **Class Request** (`/class-request`, `src/app/class-request/`) — a student
  submits a subject/chapter/preferred-teacher request; `submitClassRequest`
  first checks `findSimilarOpenRequest` (case-insensitive chapter match) and,
  if a matching open request already exists, upvotes it instead of creating a
  duplicate — the feed (`getOpenClassRequestFeed`) is ordered by upvotes so
  popular asks surface naturally. Admin (`/admin/class-requests`) triages by
  status with a "ट्रेंडिंग" badge at ≥5 upvotes and emails the student on any
  status change.
- **Doubt Class Scheduler** (`/doubt-class`, `src/app/doubt-class/`) — the
  concurrency-sensitive piece:
  - Teachers publish weekly availability rules (weekday/time/slot
    length/capacity/mode) plus one-off blackout dates from
    `/admin/doubt-classes/availability`.
  - `src/lib/doubt-slots.ts` computes real bookable slots 21 days out from
    those rules, minus blackout dates, minus a 30-minute minimum-notice
    window, minus already-booked counts per exact slot — never trusting
    anything the client sends about what's "open".
  - **Booking is transaction-safe.** `bookSlot` (`src/app/doubt-class/actions.ts`)
    re-derives the slot server-side, then re-checks capacity and inserts
    inside a `Prisma.TransactionIsolationLevel.Serializable` transaction,
    backed by a `@@unique([teacherId, slotStart, studentId])` constraint —
    so one student can't double-book a slot, but multiple students *can*
    share a group-capacity slot, and a race on the last seat fails cleanly
    with "यह स्लॉट अभी-अभी बुक हो गया" rather than double-booking anyone.
  - A shared `.ics` calendar file (`src/lib/ics.ts`, hand-written VEVENT
    generation, no dependency) is emailed to both student and teacher on
    booking; `GET /api/cron/doubt-reminders` sends 24h/1h reminder emails
    (wire it to a scheduler — see Deployment).
  - Cancellation enforces a 2-hour cutoff for students (teachers can cancel
    any time but must give a reason); teachers mark ATTENDED/NO_SHOW with
    notes from `/admin/doubt-classes`; students rate ATTENDED sessions from
    `/doubt-class/my-bookings`.
- **Answer Copy Checking** (`/answer-copies`, `src/app/answer-copies/`) — a
  student uploads a PDF/JPG/PNG (≤15MB, validated server-side in
  `/api/answer-copies/upload`) against a subject + teacher, capped at
  `ANSWER_COPY_WEEKLY_LIMIT` (3) submissions per rolling 7 days
  (`countRecentSubmissions`). The teacher's queue
  (`/admin/answer-copies`) moves a copy SUBMITTED → UNDER_EVALUATION →
  CHECKED, optionally attaching an annotated file and marks/remarks; the
  student is emailed once CHECKED. Super Admin sees a cross-teacher overview
  (pending-per-teacher counts, average turnaround time, recent activity).

## What's stubbed vs. built

Phases 1–5 deliver the schema, auth, design system, home page, and all
twelve public modules (Lectures, Notes, Books, Stories, Exam Dates, Career
Roadmap, Olympiad, Quiz, Leaderboard, Class Request, Doubt Class Scheduler,
Answer Copy Checking) — public browsing with real filters/pagination,
subscriptions/interest registration/bookings, and full teacher admin CRUD,
backed by real file uploads, email reminders/notifications, server-side
scoring, transaction-safe booking, and the database — not placeholders.

Phase 6 (student dashboard depth, streaks/XP/badges, PWA, dark-mode polish,
analytics, audit log, accessibility pass, performance tuning, Docker
deployment) is what remains. `Prisma Client` is already generated against
the complete data model, so it plugs straight in without any schema changes.

---

## Build order

| Phase | Scope |
|---|---|
| 1 | Project setup, DB schema, auth, role-based routing, admin shell, design system, full home page |
| 2 | Lectures, Notes, Books, Motivational Stories (+ their admin CRUD) |
| 3 | Exam Dates with reminders, Career Roadmap, Olympiad |
| 4 | Quiz engine, results, Leaderboard |
| **5 (this phase)** | Class Request, Doubt Class Scheduler (+ email/.ics), Answer Copy Checking |
| 6 | Student dashboard depth, streaks/XP/badges, PWA, dark-mode polish, analytics, audit log, accessibility pass, performance tuning, Docker deployment |

---

## Deployment (private cloud VPS)

Deployment tooling (Dockerfile, docker-compose, Nginx + Certbot config,
backup cron) ships in Phase 6, once every module exists. Until then:

- `DATABASE_URL`, `STORAGE_DRIVER`, `EMAIL_DRIVER` and friends are all env
  vars (see `.env.example`) — no code changes needed to point at a managed
  Postgres, S3-compatible bucket, or SMTP relay.
- `GET /api/health` returns `{ status: "ok" }` when the app can reach the
  database — wire it into your uptime monitor / load balancer health check.

## Environment variables

See `.env.example` for the full, documented list (database, auth secret,
storage driver, email driver, district identity strings used in the
header/footer).
