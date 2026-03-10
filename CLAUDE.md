# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint

npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:migrate   # Run pending migrations
npm run db:seed      # Seed database with sample data
npm run db:reset     # Drop and recreate database
```

No test suite is configured.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma 7 + PostgreSQL

**No authentication** — single-user personal finance app.

## Shared Agent Skills

Shared skills live in `.agents/skills`.

When a task matches one of these domains, read the corresponding `SKILL.md` before proceeding:

- React/Next.js performance: `.agents/skills/vercel-react-best-practices/SKILL.md`
- PostgreSQL/database work: `.agents/skills/postgres/SKILL.md`
- GitHub CLI tasks: `.agents/skills/gh-cli/SKILL.md`
- Frontend/UI work: `.agents/skills/frontend-design/SKILL.md`
- UI/UX reviews: `.agents/skills/web-design-guidelines/SKILL.md`

Cursor compatibility is maintained by keeping `.cursor/skills` pointed at `.agents/skills`.

### Directory conventions

- `app/` — Pages and route-scoped components (co-located in `_components/` subdirectories)
- `lib/` — Business logic organized by domain (`accounts/`, `transactions/`, `categories/`)
  - `queries.ts` — Read operations using `cache()` for deduplication
  - `actions.ts` — Server actions (`"use server"`) for mutations
  - `validation/` — Zod schemas for each domain

### Data layer

Prisma with the `@prisma/adapter-pg` driver. Config lives in `prisma.config.ts` (not `prisma.schema` default location). Run `db:generate` after any schema change.

**Key convention:** All monetary amounts are stored as integers in **cents** to avoid floating-point issues. Use `lib/format.ts` for display formatting.

### Data flow pattern

1. Server components call `lib/*/queries.ts` functions directly
2. Client components submit forms to `lib/*/actions.ts` server actions
3. Validation uses Zod schemas from `lib/validation/`
4. Forms use React Hook Form with FormData API

## Plans
- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise. Sacrifice grammar for the sake of concision.