import { Inject, Injectable } from '@nestjs/common';
import {
  err,
  ok,
  type CreatePlanInput,
  type Plan,
  type Result,
} from '@subhub/domain';
import { asc } from 'drizzle-orm';
import { DB, type Db } from '../db/db.module.js';
import { plans } from '../db/schema.js';

type PlanRow = typeof plans.$inferSelect;
export type CreatePlanError = { kind: 'duplicate_code'; code: string };

const toPlan = ({
  amountMinor,
  currency,
  createdAt,
  ...row
}: PlanRow): Plan => ({
  ...row,
  price: { amountMinor, currency },
  createdAt: createdAt.toISOString(),
});

@Injectable()
export class PlansService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async list(): Promise<Plan[]> {
    const rows = await this.db
      .select()
      .from(plans)
      .orderBy(asc(plans.createdAt));
    return rows.map(toPlan);
  }

  async create({
    price,
    ...input
  }: CreatePlanInput): Promise<Result<Plan, CreatePlanError>> {
    const [row] = await this.db
      .insert(plans)
      .values({ ...input, ...price })
      .onConflictDoNothing({ target: plans.code })
      .returning();
    return row
      ? ok(toPlan(row))
      : err({ kind: 'duplicate_code', code: input.code });
  }
}
