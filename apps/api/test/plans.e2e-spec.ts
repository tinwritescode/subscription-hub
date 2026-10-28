import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('/plans (e2e, needs Postgres from `pnpm db:up`)', () => {
  let app: INestApplication<App>;
  const code = `pro-${randomUUID().slice(0, 8)}`;
  const input = {
    code,
    name: 'Pro',
    price: { amountMinor: 900, currency: 'usd' },
    interval: 'month',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('creates a plan and lists it', async () => {
    const created = await request(app.getHttpServer())
      .post('/plans')
      .send(input)
      .expect(201);
    expect(created.body).toMatchObject({
      code,
      price: { amountMinor: 900, currency: 'USD' },
      trialDays: 0,
    });

    const listed = await request(app.getHttpServer()).get('/plans').expect(200);
    expect(listed.body).toContainEqual(created.body);
  });

  it('answers 409 when the plan code is taken', async () => {
    const res = await request(app.getHttpServer())
      .post('/plans')
      .send(input)
      .expect(409);
    expect(res.body).toMatchObject({ kind: 'duplicate_code', code });
  });

  it('answers 400 when the price is a float', async () => {
    await request(app.getHttpServer())
      .post('/plans')
      .send({
        ...input,
        code: `${code}-x`,
        price: { amountMinor: 9.5, currency: 'USD' },
      })
      .expect(400);
  });
});
