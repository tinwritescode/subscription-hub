import { billingIntervals, subscriptionStatuses } from '@subhub/domain';
import {
  boolean,
  char,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const billingInterval = pgEnum('billing_interval', billingIntervals);
export const subscriptionStatus = pgEnum(
  'subscription_status',
  subscriptionStatuses,
);

const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  amountMinor: integer('amount_minor').notNull(),
  currency: char('currency', { length: 3 }).notNull(),
  interval: billingInterval('interval').notNull(),
  trialDays: integer('trial_days').notNull().default(0),
  createdAt: createdAt(),
});

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  externalRef: text('external_ref').notNull().unique(),
  createdAt: createdAt(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id),
  planId: uuid('plan_id')
    .notNull()
    .references(() => plans.id),
  status: subscriptionStatus('status').notNull(),
  currentPeriodStart: timestamp('current_period_start', {
    withTimezone: true,
  }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', {
    withTimezone: true,
  }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  createdAt: createdAt(),
});
