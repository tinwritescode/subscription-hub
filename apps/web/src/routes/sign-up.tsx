import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '#/features/auth/AuthPage';
import { redirectIfSignedIn } from '#/features/auth/auth.queries';

export const Route = createFileRoute('/sign-up')({
  beforeLoad: redirectIfSignedIn,
  component: () => <AuthPage mode="sign-up" />,
});
