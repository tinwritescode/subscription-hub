import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { DB, type Db } from '../db/db.module.js';
import { AuthController } from './auth.controller.js';
import { AUTH, createAuth } from './auth.js';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH,
      inject: [DB, ConfigService],
      useFactory: (db: Db, config: ConfigService<Env, true>) =>
        createAuth({ db, config }),
    },
  ],
})
export class AuthModule {}
