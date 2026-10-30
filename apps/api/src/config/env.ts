import { z } from 'zod';

const envSchema = z
  .object({
    DATABASE_URL: z.url(),
    API_PORT: z.coerce.number().int().positive().default(3001),
    BETTER_AUTH_SECRET: z.string().min(32),
    // The origin browsers see: auth is reached through the web app's proxy.
    BETTER_AUTH_URL: z.url(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  })
  .refine((env) => !env.GOOGLE_CLIENT_ID === !env.GOOGLE_CLIENT_SECRET, {
    message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET together',
  });
export type Env = z.infer<typeof envSchema>;

// Env is outside data: parse once at boot, trust it everywhere after.
export const parseEnv = (raw: Record<string, unknown>): Env =>
  envSchema.parse(raw);
