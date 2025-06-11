/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AuthService from './auth.service';
import { Request } from 'express';

@Injectable()
export default class JwtToPayloadMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: any, next: (error?: any) => void) {
    const accessTokenCookieName = this.configService.get<string>(
      'ACCESS_TOKEN_COOKIE_NAME',
    );
    const accessTokenCookieSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );

    const token =
      this.authService.extractTokenFromCookie(req, accessTokenCookieName!) ??
      this.authService.extractTokenFromHeader(req);

    try {
      const payload = await this.authService.extractPayload(
        token!,
        accessTokenCookieSecret!,
      );
      req['user'] = payload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // console.log(error);
    }
    next();
  }
}
