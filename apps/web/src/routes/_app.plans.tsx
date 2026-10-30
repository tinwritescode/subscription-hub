import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { Money } from '@subhub/domain';
import { planQueries } from '#/features/plans/plans.queries';

export const Route = createFileRoute('/plans')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(planQueries.list()),
  component: PlansPage,
});

const formatMoney = ({ amountMinor, currency }: Money) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
    amountMinor / 100,
  );

function PlansPage() {
  const { data: plans } = useSuspenseQuery(planQueries.list());

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Plans</h1>
      {plans.length === 0 ? (
        <p className="mt-4">No plans yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {plans.map((plan) => (
            <li key={plan.id}>
              <strong>{plan.name}</strong> · {formatMoney(plan.price)} /{' '}
              {plan.interval}
              {plan.trialDays > 0 && ` · ${plan.trialDays}-day trial`}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
