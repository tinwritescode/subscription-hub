import { createAuthClient } from 'better-auth/react';

// Same origin: requests reach the API through routes/api/auth/$.ts.
export const authClient = createAuthClient();
