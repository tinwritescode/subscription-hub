import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AuthPage, googleErrorMessage } from '#/features/auth/AuthPage';
import { redirectIfSignedIn } from '#/features/auth/auth.queries';

export const Route = createFileRoute('/sign-in')({
  validateSearch: z.object({ error: z.string().optional() }),
  beforeLoad: redirectIfSignedIn,
  component: SignInPage,
});

function SignInPage() {
  const { error } = Route.useSearch();
  return (
    <AuthPage
      mode="sign-in"
      initialError={error && googleErrorMessage(error)}
    />
  );
}
