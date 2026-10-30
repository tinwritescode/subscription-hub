import { useQueryClient } from '@tanstack/react-query';
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouter,
} from '@tanstack/react-router';
import { authClient } from '#/features/auth/auth-client';
import { getSession } from '#/features/auth/auth.queries';
import { Wordmark } from '#/features/auth/Wordmark';

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) throw redirect({ to: '/sign-in' });
    return { user: session.user };
  },
  component: AppShell,
});

function AppShell() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    await router.navigate({ to: '/sign-in' });
  };

  return (
    <div className="min-h-dvh">
      <header className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-ink/15 px-6 py-4 sm:px-10">
        <Link to="/plans" aria-label="Subscription Hub home">
          <Wordmark />
        </Link>
        <nav>
          <Link
            to="/plans"
            activeProps={{ className: 'text-ink underline underline-offset-4' }}
            className="font-medium"
          >
            Plans
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-muted">{user.email}</span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="cursor-pointer font-medium text-ink underline"
          >
            Sign out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
