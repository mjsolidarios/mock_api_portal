# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js full-stack MVP for a public Region 6 game portal and artifact unlock API.

- `app/` contains the App Router pages, layouts, styles, and API routes.
- `app/api/` contains REST endpoints, including the achievement unlock handshake.
- `lib/` contains shared server utilities such as Prisma access, validation, and unlock logic.
- `prisma/` contains the SQLite schema, local database, and seed script.
- `tests/` contains executable integration-style tests.
- `Answer-questions.pdf` is the source clarification document that informed the portal/API flow.

## Build, Test, and Development Commands

- `npm run dev` starts the local Next.js server at `http://localhost:3000`.
- `npm run build` creates a production build and runs type/lint checks.
- `npm run lint` runs Next.js ESLint rules.
- `npm run test` runs the API handshake test in `tests/api-handshake.test.ts`.
- `npm run db:push` syncs the Prisma schema to the local SQLite database.
- `npm run db:seed` resets and seeds demo users, games, sessions, artifacts, and feedback.

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
