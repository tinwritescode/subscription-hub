import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import { authClient } from './auth-client';
import { PunchCard } from './PunchCard';
import { Wordmark } from './Wordmark';

const credentials = {
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
};

const FALLBACK_ERROR = 'Could not reach the server. Try again.';

const googleErrors: Record<string, string> = {
  PROVIDER_NOT_FOUND: 'Google sign-in is not set up yet. Use your email.',
  account_not_linked:
    'This email already has a password. Sign in with your email instead.',
};
export const googleErrorMessage = (code: string) =>
  googleErrors[code] ?? 'Google sign-in failed. Try again or use your email.';

const modes = {
  'sign-in': {
    title: 'Sign in',
    submit: 'Sign in',
    google: 'Sign in with Google',
    schema: z.object({ ...credentials, name: z.string() }),
    switchPrompt: 'New here?',
    switchLabel: 'Create an account',
    switchTo: '/sign-up',
    send: ({ email, password }: Values) =>
      authClient.signIn.email({ email, password }),
  },
  'sign-up': {
    title: 'Create your account',
    submit: 'Create account',
    google: 'Sign up with Google',
    schema: z.object({
      ...credentials,
      name: z.string().trim().min(1, 'Enter your name.'),
    }),
    switchPrompt: 'Already have an account?',
    switchLabel: 'Sign in',
    switchTo: '/sign-in',
    send: (values: Values) => authClient.signUp.email(values),
  },
} as const;

type Values = { name: string; email: string; password: string };

function Field({
  label,
  type,
  autoComplete,
  value,
  errors,
  onChange,
  onBlur,
}: {
  label: string;
  type: 'text' | 'email' | 'password';
  autoComplete: string;
  value: string;
  errors: (string | undefined)[];
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const id = `field-${label.toLowerCase()}`;
  const error = errors[0];
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="mt-1.5 w-full rounded-md border border-muted bg-white px-3 py-2.5 aria-invalid:border-coral-deep"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-coral-deep">
          {error}
        </p>
      )}
    </div>
  );
}

const GoogleMark = () => (
  <svg aria-hidden viewBox="0 0 18 18" className="size-[18px]">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
    />
    <path
      fill="#FBBC05"
      d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
    />
  </svg>
);

export function AuthPage({
  mode,
  initialError,
}: {
  mode: keyof typeof modes;
  initialError?: string;
}) {
  const copy = modes[mode];
  const router = useRouter();
  const [error, setError] = useState(initialError);

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' } satisfies Values,
    validators: { onSubmit: copy.schema },
    onSubmit: async ({ value }) => {
      setError(undefined);
      const result = await copy.send(value);
      if (result.error) {
        setError(result.error.message ?? FALLBACK_ERROR);
        return;
      }
      await router.navigate({ to: '/plans' });
    },
  });

  const signInWithGoogle = async () => {
    setError(undefined);
    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/plans',
      errorCallbackURL: '/sign-in',
    });
    if (result.error) {
      setError(googleErrorMessage(result.error.code ?? ''));
    }
  };

  const errorText = (errors: unknown[]) =>
    errors.map(
      (issue) =>
        z.object({ message: z.string() }).safeParse(issue).data?.message,
    );

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(26rem,2fr)_3fr]">
      <section className="flex flex-col px-6 py-8 sm:px-12">
        <Wordmark />
        <div className="my-auto w-full max-w-sm py-10">
          <h1 className="font-display text-4xl font-extrabold text-ink [font-stretch:125%]">
            {copy.title}
          </h1>

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="mt-8 flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-muted bg-white px-4 py-2.5 font-medium hover:border-ink"
          >
            <GoogleMark />
            {copy.google}
          </button>

          <p className="my-5 text-center text-sm text-muted">
            or use your email
          </p>

          <form
            noValidate
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            {mode === 'sign-up' && (
              <form.Field name="name">
                {(field) => (
                  <Field
                    label="Name"
                    type="text"
                    autoComplete="name"
                    value={field.state.value}
                    errors={errorText(field.state.meta.errors)}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
            )}
            <form.Field name="email">
              {(field) => (
                <Field
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={field.state.value}
                  errors={errorText(field.state.meta.errors)}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                />
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <Field
                  label="Password"
                  type="password"
                  autoComplete={
                    mode === 'sign-up' ? 'new-password' : 'current-password'
                  }
                  value={field.state.value}
                  errors={errorText(field.state.meta.errors)}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                />
              )}
            </form.Field>

            {error && (
              <p role="alert" className="text-sm text-coral-deep">
                {error}
              </p>
            )}

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer rounded-md bg-ink px-4 py-2.5 font-medium text-paper hover:bg-ink-deep disabled:cursor-wait disabled:opacity-70"
                >
                  {copy.submit}
                </button>
              )}
            </form.Subscribe>
          </form>

          <p className="mt-6 text-sm">
            {copy.switchPrompt}{' '}
            <Link to={copy.switchTo} className="font-medium text-ink underline">
              {copy.switchLabel}
            </Link>
          </p>
        </div>
      </section>
      <aside className="p-0 lg:py-6 lg:pr-6">
        <PunchCard />
      </aside>
    </main>
  );
}
