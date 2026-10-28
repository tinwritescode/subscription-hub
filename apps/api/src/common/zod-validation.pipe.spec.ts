import { BadRequestException } from '@nestjs/common';
import { createPlanInputSchema } from '@subhub/domain';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(createPlanInputSchema);

  it('returns the parsed body with defaults applied', () => {
    const body = {
      code: 'pro',
      name: 'Pro',
      price: { amountMinor: 900, currency: 'eur' },
      interval: 'year',
    };

    expect(pipe.transform(body)).toEqual({
      ...body,
      price: { amountMinor: 900, currency: 'EUR' },
      trialDays: 0,
    });
  });

  it('rejects a body that breaks the schema with a 400', () => {
    expect(() => pipe.transform({ code: 'Not Valid' })).toThrow(
      BadRequestException,
    );
  });
});
