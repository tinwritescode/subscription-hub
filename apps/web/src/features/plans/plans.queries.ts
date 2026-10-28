import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { planSchema } from '@subhub/domain';
import { z } from 'zod';
import { apiGet } from '#/lib/api.server';

const listPlans = createServerFn({ method: 'GET' }).handler(() =>
  apiGet('/plans', z.array(planSchema)),
);

// Query keys and fetchers for plans live here only; routes and components
// import these instead of writing their own keys.
export const planQueries = {
  all: () => ['plans'] as const,
  list: () =>
    queryOptions({
      queryKey: [...planQueries.all(), 'list'],
      queryFn: () => listPlans(),
    }),
};
