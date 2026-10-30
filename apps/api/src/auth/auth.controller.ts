import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import type { Request, Response } from 'express';
import { AUTH, type Auth } from './auth.js';

// A controller, not middleware: a wildcard middleware mount rewrites req.url,
// and better-auth then loses the query string (the OAuth state and code).
@Controller('api/auth')
export class AuthController {
  private readonly handle: ReturnType<typeof toNodeHandler>;

  constructor(@Inject(AUTH) auth: Auth) {
    this.handle = toNodeHandler(auth);
  }

  @All('*path')
  forward(@Req() req: Request, @Res() res: Response) {
    return this.handle(req, res);
  }
}
