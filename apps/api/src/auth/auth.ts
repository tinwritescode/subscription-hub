import type { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Env } from '../config/env.js';
import type { Db } from '../db/db.module.js';
import * as schema from '../db/schema.js';

export const AUTH = Symbol('AUTH');

export const createAuth = ({
  db,
  config,
}: {
  db: Db;
  config: ConfigService<Env, true>;
}) => {
  const clientId = config.get('GOOGLE_CLIENT_ID', { infer: true });
  const clientSecret = config.get('GOOGLE_CLIENT_SECRET', { infer: true });

  return betterAuth({
    secret: config.get('BETTER_AUTH_SECRET', { infer: true }),
    baseURL: config.get('BETTER_AUTH_URL', { infer: true }),
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    emailAndPassword: { enabled: true },
    socialProviders:
      clientId && clientSecret ? { google: { clientId, clientSecret } } : {},
    // Emails are unverified, so merging a Google sign-in into an existing
    // password account would let whoever registered that email keep access.
    account: { accountLinking: { enabled: false } },
  });
};

export type Auth = ReturnType<typeof createAuth>;
