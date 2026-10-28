import { Body, ConflictException, Controller, Get, Post } from '@nestjs/common';
import {
  createPlanInputSchema,
  type CreatePlanInput,
  type Plan,
} from '@subhub/domain';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { PlansService } from './plans.service.js';

@Controller('plans')
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Get()
  list(): Promise<Plan[]> {
    return this.plans.list();
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createPlanInputSchema)) input: CreatePlanInput,
  ): Promise<Plan> {
    const result = await this.plans.create(input);
    return result.match({
      Ok: (plan) => plan,
      Err: (error) => {
        throw new ConflictException(error);
      },
    });
  }
}
