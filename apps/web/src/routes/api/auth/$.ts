import { createFileRoute } from '@tanstack/react-router';
import { apiProxy } from '#/lib/api.server';

const forward = ({ request }: { request: Request }) => apiProxy(request);

export const Route = createFileRoute('/api/auth/$')({
  server: { handlers: { GET: forward, POST: forward } },
});
