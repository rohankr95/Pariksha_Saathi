# परीक्षा साथी | Pariksha Saathi

**हर विद्यार्थी का साथी — तैयारी से सफलता तक**

The official exam-preparation portal for the District Education Department,
Surajpur, Chhattisgarh. A fully dynamic, database-driven platform — every
lecture, note, book, story, exam date, roadmap and quiz question is managed
from an admin panel by teachers, with no coding required.

This repo is being built **phase by phase** (see [Build Order](#build-order)
below). This README reflects **Phase 1**: project setup, database schema,
authentication, role-based routing, the design system, and the full home
page.

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

## What's stubbed vs. built in Phase 1

Phase 1 delivers the schema, auth, design system and home page in full.
Every public module route (`/lectures`, `/notes`, `/books`, …) and every
admin module page already exists and is reachable through real navigation —
but shows a "coming soon" placeholder until its phase (see below) adds the
actual CRUD, listings, and filters. This is intentional: `Prisma
Client is already generated against the complete data model, so later
phases plug straight in without any schema changes.

---

## Build order

| Phase | Scope |
|---|---|
| **1 (this phase)** | Project setup, DB schema, auth, role-based routing, admin shell, design system, full home page |
| 2 | Lectures, Notes, Books, Motivational Stories (+ their admin CRUD) |
| 3 | Exam Dates with reminders, Career Roadmap, Olympiad |
| 4 | Quiz engine, results, Leaderboard |
| 5 | Class Request, Doubt Class Scheduler (+ email/.ics), Answer Copy Checking |
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
