import { z } from 'zod';
import { err, ok, type Result } from './result.js';

export const subscriptionStatuses = [
  'trialing',
  'active',
  'past_due',
  'canceled',
] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export const subscriptionEvents = [
  'payment_succeeded',
  'payment_failed',
  'cancel',
] as const;
export type SubscriptionEvent = (typeof subscriptionEvents)[number];

export type TransitionError = {
  kind: 'invalid_transition';
  from: SubscriptionStatus;
  event: SubscriptionEvent;
};

// The lifecycle lives here and nowhere else. A missing entry is a refused move.
const lifecycle: Record<
  SubscriptionStatus,
  Partial<Record<SubscriptionEvent, SubscriptionStatus>>
> = {
  trialing: {
    payment_succeeded: 'active',
    payment_failed: 'past_due',
    cancel: 'canceled',
  },
  active: {
    payment_succeeded: 'active',
    payment_failed: 'past_due',
    cancel: 'canceled',
  },
  past_due: { payment_succeeded: 'active', cancel: 'canceled' },
  canceled: {},
};

export function transition(
  from: SubscriptionStatus,
  event: SubscriptionEvent,
): Result<SubscriptionStatus, TransitionError> {
  const to = lifecycle[from][event];
  return to ? ok(to) : err({ kind: 'invalid_transition', from, event });
}

export const subscriptionStatusSchema = z.enum(subscriptionStatuses);
export const subscriptionEventSchema = z.enum(subscriptionEvents);
