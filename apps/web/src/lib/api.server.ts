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
): Promise<z.infer<S>> {
  const res = await fetch(new URL(path, apiUrl));
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return schema.parse(await res.json());
}
