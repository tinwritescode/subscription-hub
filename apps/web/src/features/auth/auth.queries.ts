import { redirect } from '@tanstack/react-router';
import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { readSession } from './auth.server';

export const getSession = createServerFn({ method: 'GET' }).handler(
  readSession,
);

// Route guards are only UX: server functions are callable directly, so every
// one that reads private data takes this middleware too.
export const requireSession = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    if (!(await readSession())) throw redirect({ to: '/sign-in' });
    return next();
  },
);

export const redirectIfSignedIn = async () => {
  if (await getSession()) throw redirect({ to: '/plans' });
};
