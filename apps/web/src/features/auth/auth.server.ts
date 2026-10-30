import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { apiGet } from '#/lib/api.server';

const sessionSchema = z
  .object({ user: z.object({ email: z.string(), name: z.string() }) })
  .nullable();

export const readSession = () =>
  apiGet('/api/auth/get-session', sessionSchema, {
    headers: { cookie: getRequest().headers.get('cookie') ?? '' },
  });
