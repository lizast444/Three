# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Three Bearings — SDT Socratic Tracker web application.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Frontend packages**: framer-motion, recharts, date-fns, clsx, tailwind-merge, wouter

## Product: Three Bearings

A daily self-reflection app based on Self-Determination Theory (SDT) and the Socratic method.

**Three Bearings (Автономия, Компетентность, Связанность)** help the user navigate daily life.

### App Screens (bottom nav):
1. **Сегодня** (`/`) — Daily check-in with 3 need sliders + Socratic questions
2. **Библиотека** (`/library`) — Socratic Library for deep dives
3. **Аналитика** (`/insights`) — Analytics with charts and patterns

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── three-bearings/     # React + Vite frontend (previewPath: /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── checkins.ts        # Daily check-in table
│           └── library-notes.ts   # Library notes table
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Endpoints (all under /api)

- `GET /api/healthz` — health check
- `GET /api/checkins` — list past check-ins
- `GET /api/checkins/today` — today's check-in or null
- `POST /api/checkins` — create/update today's check-in
- `GET /api/checkins/:id` — get check-in by id
- `GET /api/library/notes` — list library notes (filterable by category)
- `POST /api/library/notes` — save library note
- `GET /api/insights/stats` — stats for insights (7/14/30 days)

## Database Tables

- `checkins` — daily check-ins with autonomy/competence/relatedness scores, note, tags, micro-action
- `library_notes` — saved reflections from the Socratic Library

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server. Routes in `src/routes/`.

### `artifacts/three-bearings` (`@workspace/three-bearings`)
React + Vite frontend. previewPath: `/`. Bottom navigation with 3 pages.

### `lib/db` (`@workspace/db`)
Database layer. Run `pnpm --filter @workspace/db run push` to push schema changes.

### `lib/api-spec` (`@workspace/api-spec`)
OpenAPI spec. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate.
