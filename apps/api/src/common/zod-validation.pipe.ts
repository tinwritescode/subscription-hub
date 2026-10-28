import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

// Request bodies are outside data: parse them with the shared domain schema.
export class ZodValidationPipe<S extends z.ZodType> implements PipeTransform<
  unknown,
  z.infer<S>
> {
  constructor(private readonly schema: S) {}

  transform(value: unknown): z.infer<S> {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException({ issues: parsed.error.issues });
    }
    return parsed.data;
  }
}
