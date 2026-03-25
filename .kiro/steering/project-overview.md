---
inclusion: always
---

# Project Overview — Dodgeball Tracker

A Next.js 16 app for tracking dodgeball throw accuracy across sessions. Italian-language UI.

## Tech Stack

- Next.js 16.2.1 (App Router) with React 19
- TypeScript (strict mode)
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- Prisma 7.5 with Neon Postgres (`@prisma/adapter-neon`)
- NextAuth v5 beta (credentials provider, JWT strategy)
- bcryptjs for password hashing

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/auth/           # NextAuth route handler
│   ├── login/              # Login/register page (client component)
│   ├── session/[id]/       # Session detail + tracker
│   │   └── stats/          # Per-session stats
│   ├── stats/              # Global stats with SVG charts
│   ├── dashboard-forms.tsx # Create/join session forms (client)
│   ├── page.tsx            # Dashboard (server component)
│   └── layout.tsx          # Root layout (Italian lang, dark theme)
├── generated/prisma/       # Prisma generated client (do NOT edit)
├── lib/
│   ├── actions/            # Server actions (auth.ts, session.ts)
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma client singleton
│   └── statuses.ts         # Status parsing, accuracy calc, color map
└── proxy.ts                # Middleware for auth-gated routes
```

## Key Patterns

- Server components fetch data directly via Prisma; client components call server actions
- Server actions live in `src/lib/actions/` and use `"use server"` directive
- Auth check pattern: `const session = await auth(); if (!session?.user?.id) redirect("/login");`
- `params` in dynamic routes is a `Promise` (Next.js 16 convention): `const { id } = await params;`
- Prisma client is generated to `src/generated/prisma/` — never edit these files
- Path alias: `@/*` maps to `./src/*`

## Data Model

- User: email/password auth, owns sessions
- Session: has a name, shareCode (8-char UUID prefix), configurable statuses string (`"Name:color:weight,..."`)
- SessionMember: join table for users in a session
- Throw: records a single throw with status string, tied to session + user

## Statuses System

Statuses are stored as a comma-separated string on Session: `"Hit:green:1,Miss:red:0"`
- Format: `name:color:weight` where weight 1 = success, 0.5 = partial, 0 = failure
- Parsed via `parseStatuses()` in `src/lib/statuses.ts`
- Accuracy = (throws with weight=1) / total throws × 100

## Environment

- `POSTGRES_URL` — Neon Postgres connection string (loaded from `.env.local`)
- `AUTH_SECRET` — NextAuth secret
- Prisma config in `prisma.config.ts` loads `.env.local` via dotenv

## Commands

- `npm run dev` — start dev server
- `npm run build` — generate Prisma client + build
- `npm run lint` — ESLint
- `npx prisma migrate dev` — run migrations
- `npx prisma generate` — regenerate Prisma client
