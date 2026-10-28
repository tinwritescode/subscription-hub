import { z } from 'zod';

export const billingIntervals = ['month', 'year'] as const;
export type BillingInterval = (typeof billingIntervals)[number];

// Money is integer minor units (cents) plus an ISO 4217 code; never a float.
export const moneySchema = z.object({
  amountMinor: z.number().int().nonnegative(),
  currency: z.string().length(3).toUpperCase(),
});
export type Money = z.infer<typeof moneySchema>;

export const createPlanInputSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(120),
  price: moneySchema,
  interval: z.enum(billingIntervals),
  trialDays: z.number().int().min(0).max(365).default(0),
});
export type CreatePlanInput = z.infer<typeof createPlanInputSchema>;

export const planSchema = createPlanInputSchema.extend({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
});
export type Plan = z.infer<typeof planSchema>;
