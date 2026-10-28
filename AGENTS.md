# Subscription Hub — agent rules

Nx + pnpm monorepo for a subscription management platform. Roadmap and open
decisions: [`docs/PLAN.md`](docs/PLAN.md). Domain terms:
[`docs/GLOSSARY.md`](docs/GLOSSARY.md).

## Always

- **ub-mode for every implementing task.** Before writing or changing code
  (feature, fix, behavior change), load the `ub-mode` skill
  ([`.claude/skills/ub-mode/SKILL.md`](.claude/skills/ub-mode/SKILL.md); agents
  without skill support read that file) and follow it for the whole task:
  failing test first, then make it work, then make it right. Its "dryer" step
  is `pnpm dup` here.
- **DRY: search before you add.** One rule, schema, constant, or query key
  lives in one place. Before adding logic, `rg` for an existing owner and reuse
  or extend it. Shared by api and web means it belongs in `packages/domain`.
  Abstract only what is the same rule, not code that merely looks alike.
  `pnpm dup` must report 0 clones; explain any duplication you keep.
- **Done** means `pnpm check` passes (format, dup, lint, typecheck, test,
  build).

## Layout

| Path              | What                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `packages/domain` | Pure TS: zod schemas, types, lifecycle rules, `Result` helpers. No I/O, no framework imports. |
| `apps/api`        | NestJS 12 + Drizzle (Postgres). Owns the database.                                            |
| `apps/web`        | TanStack Start (Router, Query, Form, Table). Talks to the API only from the server.           |

Nx infers targets from each `package.json` script; `nx.json` sets caching and
`^build` ordering. Run one project with `pnpm nx <target> @subhub/<name>`.

## Conventions

- **Boundaries parse, insides trust.** Request bodies, API responses, and env
  vars are parsed once with a zod schema where they enter (api:
  `ZodValidationPipe`, `config/env.ts`; web: `lib/api.server.ts`). Reuse the
  domain schema; never redeclare a DTO shape.
- **Errors are values.** Domain and service code return `Result<T, E>` built
  with `ok`/`err`/`some`/`none` from `@subhub/domain`. Only `result.ts` imports
  `ts-rust` (its constructors are typed `any`). Controllers turn `Err` into an
  HTTP exception with `result.match`.
- **Money** is `{ amountMinor: integer, currency: ISO-4217 }`. Time is UTC
  `timestamptz`.
- **Enums** come from `packages/domain` const arrays; Drizzle `pgEnum` and zod
  `z.enum` both read the same array.
- **Lifecycle** (status changes) goes through `transition()` in
  `packages/domain/src/subscription.ts`; never write `status` directly.
- **Mutations are idempotent**: unique constraints plus
  `onConflictDoNothing`, idempotency keys on webhooks and jobs.
- **Web data access**: a feature's `createServerFn` fetchers and its
  `queryOptions` live in `apps/web/src/features/<feature>/<feature>.queries.ts`.
  Routes preload with `context.queryClient.ensureQueryData(...)` and read with
  `useSuspenseQuery(...)`. Files named `*.server.ts` are server-only.
- **Schema changes**: edit `apps/api/src/db/schema.ts`, then
  `pnpm --filter @subhub/api db:generate` and commit the SQL in
  `apps/api/drizzle/`. Never edit an applied migration.
- Imports in api and domain use the `.js` suffix (NodeNext ESM).
- Prettier owns formatting (`pnpm format`); oxlint owns lint (root
  `.oxlintrc.json`).

## Local setup

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm --filter @subhub/api db:migrate
pnpm dev            # api :3001, web :3000
```

API e2e tests (`pnpm --filter @subhub/api test:e2e`) need the database up.

## Library docs

Before using a library API you are unsure of, fetch its docs instead of
guessing. TanStack packages ship version-matched skills:
`pnpm exec intent list`, then `pnpm exec intent load <package>#<skill>`. Every
other library: [`docs/references.md`](docs/references.md).
