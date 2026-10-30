import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { parseEnv } from './config/env.js';
import { DbModule } from './db/db.module.js';
import { HealthController } from './health/health.controller.js';
import { PlansModule } from './plans/plans.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: parseEnv,
    }),
    DbModule,
    AuthModule,
    PlansModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
