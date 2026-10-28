import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  API_PORT: z.coerce.number().int().positive().default(3001),
});
export type Env = z.infer<typeof envSchema>;

// Env is outside data: parse once at boot, trust it everywhere after.
export const parseEnv = (raw: Record<string, unknown>): Env =>
  envSchema.parse(raw);
