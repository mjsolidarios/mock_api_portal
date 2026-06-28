# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js full-stack MVP for a public Region 6 game portal and artifact unlock API.

- `app/` contains the App Router pages, layouts, styles, and API routes.
- `app/api/` contains REST endpoints, including the achievement unlock handshake.
- `lib/` contains shared server utilities such as Prisma access, validation, and unlock logic.
- `prisma/` contains the PostgreSQL schema (via Neon in production), the seed script, and a local SQLite dev DB for offline work.
- `tests/` contains executable integration-style tests.
- `vercel.json` and `.vercelignore` configure the Vercel deployment.
- `Answer-questions.pdf` is the source clarification document that informed the portal/API flow.

## Build, Test, and Development Commands

- `npm run dev` starts the local Next.js server at `http://localhost:3000`.
- `npm run build` regenerates the Prisma client and creates a production build.
- `npm run lint` runs Next.js ESLint rules.
- `npm run test` runs the API handshake test in `tests/api-handshake.test.ts`.
- `npm run db:push` syncs the Prisma schema to the configured database.
- `npm run db:seed` resets and seeds demo users, games, sessions, artifacts, and feedback.
- `npm run vercel-build` is the command Vercel runs on every deploy: regenerate Prisma client, push schema, then `next build`.

## Vercel Deployment

The app is configured to deploy on Vercel with Neon Postgres. SQLite is not used in production because Vercel's serverless runtime has a read-only filesystem.

### One-time setup

1. Create a Neon project at <https://neon.tech> and copy the **pooled** connection string (it starts with `postgresql://...` and includes `?sslmode=require`).
2. In the Vercel dashboard, import this repository.
3. In **Project Settings -> Environment Variables**, add `DATABASE_URL` for the Production environment using the Neon pooled connection string.
4. Leave the Framework Preset as **Next.js**; `vercel.json` overrides the build command to `npm run vercel-build`.

### First deploy and seeding

The first deployment runs `prisma db push` against Neon, creating all tables. To populate demo content, POST to the admin seed endpoint after the deploy is live:

```bash
curl -X POST https://YOUR-VERCEL-DOMAIN.vercel.app/api/admin/seed
```

Subsequent deploys re-run `prisma db push` (idempotent) and never overwrite existing data.

### Local development against Neon

Point your local `.env` `DATABASE_URL` at Neon to mirror production:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
npm run db:push
npm run db:seed
npm run dev
```

### Local development against SQLite (optional)

If you want to work offline without hitting Neon, swap `provider = "postgresql"` for `provider = "sqlite"` in `prisma/schema.prisma` and `DATABASE_URL="file:./dev.db"` in `.env`. Remember to revert both before pushing or deploying.

## Coding Style & Naming Conventions

Use TypeScript for application code. Keep shared business logic in `lib/` and keep route handlers thin. Use two-space indentation, descriptive camelCase names for variables/functions, and PascalCase for React components. API route folders should match URL segments, for example `app/api/achievements/unlock/route.ts`.

Linting is handled by `next lint`. The current UI uses plain CSS in `app/globals.css`; keep class names descriptive and scoped by purpose.

## Testing Guidelines

Tests currently use Node `assert` and `tsx`, with files named `*.test.ts` under `tests/`. Focus tests on portal-critical behavior: artifact unlock success, duplicate idempotency, invalid sessions, unauthorized developer keys, and artifact/game mismatches. Run `npm run test` before submitting changes that affect API behavior or Prisma models.

## Commit & Pull Request Guidelines

This repository has no existing commit history, so no prior convention is established. Use clear imperative commit messages such as `Add artifact unlock endpoint` or `Fix feedback validation`.

Pull requests should include a short summary, testing performed, affected pages or API routes, and screenshots for visible UI changes. Mention any Prisma schema changes and whether `npm run db:push` or reseeding is required.

## Security & Configuration Tips

Local configuration lives in `.env`; use `.env.example` as the template. Do not commit production secrets or real developer API keys. The seeded keys are demo-only and should be replaced before any deployed environment.
