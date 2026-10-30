import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { Money } from '@subhub/domain';
import { planQueries } from '#/features/plans/plans.queries';

export const Route = createFileRoute('/_app/plans')({
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
    <main className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
      <h1 className="font-display text-4xl font-extrabold text-ink [font-stretch:125%]">
        Plans
      </h1>
      {plans.length === 0 ? (
        <p className="mt-6 max-w-prose text-muted">
          No plans yet. Plans appear here once they are added through the API.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="text-sm text-muted">
              <tr className="border-b-2 border-ink">
                <th className="py-2 pr-6 font-medium">Name</th>
                <th className="py-2 pr-6 font-medium">Code</th>
                <th className="py-2 pr-6 text-right font-medium">Price</th>
                <th className="py-2 pr-6 font-medium">Billed</th>
                <th className="py-2 font-medium">Trial</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-ink/15">
                  <td className="py-3 pr-6 font-medium">{plan.name}</td>
                  <td className="py-3 pr-6 text-muted">{plan.code}</td>
                  <td className="py-3 pr-6 text-right tabular-nums">
                    {formatMoney(plan.price)}
                  </td>
                  <td className="py-3 pr-6">Every {plan.interval}</td>
                  <td className="py-3 tabular-nums">
                    {plan.trialDays > 0 ? `${plan.trialDays} days` : 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
