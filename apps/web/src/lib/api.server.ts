import { z } from 'zod';

const apiUrl = z
  .url()
  .default('http://localhost:3001')
  .parse(process.env.API_URL);

// Server-only: the browser never talks to the API directly. Every response is
// parsed with the shared domain schema before it enters the app.
export async function apiGet<S extends z.ZodType>(
  path: string,
  schema: S,
  init?: { headers: HeadersInit },
): Promise<z.infer<S>> {
  const res = await fetch(new URL(path, apiUrl), init);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return schema.parse(await res.json());
}

// Passes a browser request through unchanged, for API routes whose contract
// belongs to a library the browser client speaks (better-auth).
export async function apiProxy(request: Request): Promise<Response> {
  const { pathname, search } = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');
  return fetch(new URL(pathname + search, apiUrl), {
    method: request.method,
    headers,
    body: request.method === 'GET' ? undefined : await request.arrayBuffer(),
    redirect: 'manual',
  });
}
