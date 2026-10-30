# Subscription Hub — plan

Goal: one place to define plans, enroll customers, renew and bill them on
schedule, recover failed payments, and tell the product what each customer is
entitled to.

Each phase ends in something you can check: a passing e2e test against real
Postgres, plus a page or endpoint you can hit.

## Architecture

```
browser ──► apps/web (TanStack Start, SSR + server functions = BFF)
                │  server-only fetch, parsed with domain schemas
                ▼
            apps/api (NestJS) ──► Postgres (Drizzle)
                │                    ▲
                ├─ jobs (pg-boss) ───┘   renewals, dunning, outbox delivery
                └─ payment adapter ──► Stripe (or any processor)
                         ▲
                     webhooks (idempotent, by provider event id)

packages/domain: schemas, lifecycle, period and proration math. Pure, shared.
```

Choices and why:

- **Postgres is the only stateful dependency.** pg-boss keeps the job queue in
  the same database, so a renewal and its job commit in one transaction. Add
  Redis only when measured load demands it.
- **We own the subscription state; the processor only moves money.** Status,
  periods, and entitlements live in our tables. The payment processor sits
  behind a port (`PaymentGateway`), so it can be swapped and faked in tests.
- **The web app is a BFF.** The browser never calls the API. Server functions
  hold the API URL and, later, the service credential.
- **Domain logic is pure.** Period math, proration, and status transitions are
  functions in `packages/domain`, tested without a database.

## Phases

### 0. Foundation — done

Nx workspace, `packages/domain` (plan schema, status lifecycle, `Result`
helpers), API `GET/POST /plans`, web `/plans` page via server function and
TanStack Query. Proof: `pnpm check`, `test/plans.e2e-spec.ts`.

### 1. Catalog

- Products group plans. Prices are versioned: changing a price creates a new
  version; existing subscriptions keep theirs.
- Archive instead of delete once a plan has subscribers.
- Admin UI: plan list (TanStack Table), create/edit form (TanStack Form with the
  domain zod schema).
- Done: create, re-price, and archive a plan from the UI; existing
  subscriptions keep their price.

### 2. Identity and tenancy

- Admin sign-in with Google or email (better-auth in `apps/api`, reached only
  through the `apps/web` proxy at `/api/auth/*`, session cookie) and a service
  credential from web to API.
- Customers created by `externalRef` (idempotent upsert).
- Decide tenancy first (see open questions); if multi-tenant, every table gets
  `tenant_id` and every query is scoped by it.
- Done: unauthenticated API calls get 401; customer upsert twice yields one row.

### 3. Subscription lifecycle

- `POST /subscriptions` starts `trialing` or `active` and sets the first period
  (pure `nextPeriod(start, interval)` in domain).
- Cancel now or at period end; change plan with proration
  (pure `prorate(...)`); pause/resume later if needed.
- Every status write goes through `transition()`; illegal moves return `Err`
  and become 409.
- Done: the full lifecycle table is covered by domain unit tests, and each API
  action has an e2e test.

### 4. Billing and renewals

- Invoices and invoice lines; a `PaymentGateway` port with Stripe and in-memory
  fakes.
- Renewal job per subscription, keyed by `(subscription_id, period_start)` so
  a retry or crash cannot charge twice.
- Webhook endpoint stores provider event ids; duplicates are no-ops.
- Dunning: `past_due` retries on a schedule (for example day 1, 3, 7), then
  `canceled`.
- Done: kill the worker mid-renewal, restart, and see exactly one charge and
  one invoice.

### 5. Entitlements and outbound events

- Plans grant entitlements (features, limits). `GET /customers/:id/entitlements`.
- Transactional outbox: state changes write an event row in the same
  transaction; a job delivers signed webhooks to subscribers with retries.
- Done: a plan change shows new entitlements and emits one webhook.

### 6. Customer portal and reporting

- Portal: view plan, change plan, cancel, update payment method (processor's
  hosted page), download invoices.
- Metrics: MRR, active subscribers, churn, trial conversion, from SQL views.
- Done: numbers on the dashboard match a hand-checked fixture dataset.

### 7. Production readiness

- Structured logs, request ids, health/readiness, OpenTelemetry traces.
- Audit log of admin actions.
- CI: `pnpm check` with `nx affected`, Postgres service container, migrations
  applied before e2e.
- Containers for api and web; migrations run as a release step.

## Open questions

1. **Who are the subscribers?** Your own product's users (single tenant), or
   merchants who each sell their own plans (multi-tenant)? This changes the
   schema in phase 2.
2. **Payment processor:** Stripe, Paddle, or a local provider? Paddle acts as
   merchant of record and handles tax; Stripe needs Stripe Tax or similar.
3. **Billing model:** flat recurring only, or also seats and usage-based
   metering? Metering adds a usage ingestion table and invoice-time
   aggregation.
4. **Deploy target** for web and api (affects the Nitro preset and job
   worker).
