# Glossary

| Term                 | Meaning                                                                                                | Code                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Plan                 | A sellable offer: code, name, price, billing interval, trial length. Its price never changes in place. | `packages/domain/src/plan.ts`         |
| Price / Money        | Integer amount in minor units (cents) plus an ISO 4217 currency code.                                  | `moneySchema`                         |
| Billing interval     | How often a subscription renews: `month` or `year`.                                                    | `billingIntervals`                    |
| Customer             | The party that holds subscriptions. Identified by our UUID and an `externalRef` from the caller.       | `customers` table                     |
| Subscription         | A customer's enrollment in one plan, with a status and a current period.                               | `subscriptions` table                 |
| Status               | `trialing`, `active`, `past_due`, `canceled`. Changes only through `transition()`.                     | `packages/domain/src/subscription.ts` |
| Event                | Something that moves a status: `payment_succeeded`, `payment_failed`, `cancel`.                        | `subscriptionEvents`                  |
| Current period       | `[currentPeriodStart, currentPeriodEnd)`: the span already paid for (or in trial).                     | `subscriptions` table                 |
| Cancel at period end | The customer canceled, but access lasts until `currentPeriodEnd`; then status becomes `canceled`.      | `cancelAtPeriodEnd`                   |
| Dunning              | Retrying a failed renewal payment while the subscription is `past_due`.                                | planned, `docs/PLAN.md` phase 4       |
| Entitlement          | A feature or limit a plan grants, checked by the product at runtime.                                   | planned, `docs/PLAN.md` phase 5       |
