import type { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { createTestApp } from './create-test-app.js';

describe('/api/auth (e2e, needs Postgres from `pnpm db:up`)', () => {
  let app: INestApplication<App>;
  const credentials = {
    email: `admin-${randomUUID().slice(0, 8)}@example.com`,
    password: 'correct horse battery',
  };
  const signUp = { ...credentials, name: 'Ada' };

  const post = (path: string, body: object) =>
    request(app.getHttpServer())
      .post(`/api/auth${path}`)
      .set('Origin', 'http://localhost:3000')
      .send(body);

  const sessionCookie = (headers: Record<string, unknown>) => {
    const cookies = headers['set-cookie'];
    if (!Array.isArray(cookies)) throw new Error('no session cookie set');
    return cookies.map(String).join('; ');
  };

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app.close());

  it('signs up with email, then reads the session from the cookie', async () => {
    const res = await post('/sign-up/email', signUp).expect(200);

    const session = await request(app.getHttpServer())
      .get('/api/auth/get-session')
      .set('Cookie', sessionCookie(res.headers))
      .expect(200);
    expect(session.body).toMatchObject({
      user: { email: credentials.email, name: 'Ada' },
    });
  });

  it('refuses a second sign-up with the same email', async () => {
    await post('/sign-up/email', signUp).expect(422);
  });

  it('signs in with the right password', async () => {
    await post('/sign-in/email', credentials).expect(200);
  });

  it('answers 401 for the wrong password', async () => {
    await post('/sign-in/email', {
      ...credentials,
      password: 'wrong horse battery',
    }).expect(401);
  });

  it('passes the query string to the OAuth callback', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/callback/google?state=abc&code=xyz')
      .expect(302);
    expect(res.headers.location).not.toContain('state_not_found');
  });

  it('has no session without a cookie', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/get-session')
      .expect(200);
    expect(res.body).toBeNull();
  });
});
