/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import * as cookieParser from 'cookie-parser';
import { User } from 'src/types/users';

@Injectable()
export default class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(res: Response, user: User, accessTokenCookieName: string) {
    const { payload, accessToken } = await this.createAccessToken(user);
    this.saveToCookie(res, accessTokenCookieName, accessToken);

    return { ...payload, accessToken };
  }

  async createAccessToken(user: User) {
    const payload = {
      ...user,
      sub: user.id,
      id: undefined,
      password: undefined,
    };
    const accessToken = await this.createJWT({
      expiresIn: '1y',
      secret: this.configService.get('ACCESS_TOKEN_SECRET') as string,
      payload,
    });
    return { payload, accessToken };
  }

  async createJWT({
    expiresIn,
    secret,
    payload,
  }: {
    expiresIn: string;
    secret: string;
    payload: any;
  }) {
    const token = await this.jwtService.signAsync(payload as object, {
      expiresIn,
      secret,
    });
    return token;
  }

  saveToCookie(res: Response, cookieName: string, content: string) {
    res.cookie(cookieName, content, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      maxAge: 365 * 24 * 60 * 60 * 1_000,
    });
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async extractPayload(
    token: string,
    secret: string,
    ignoreExpiration = false,
  ) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret,
      ignoreExpiration,
    });

    return payload;
  }

  extractTokenFromCookie(req: Request, cookieName: string) {
    const token = cookieParser.signedCookie(
      req.signedCookies[cookieName] as string,
      this.configService.get('COOKIE_SECRET') as string,
    );
    if (token) {
      return token;
    }
    return undefined;
  }

  async hashPassword(plainPassword: string) {
    const hashPassword = await bcrypt.hash(plainPassword, 10);
    return hashPassword;
  }

  async comparePassword(plainPassword: string, hashPassword: string) {
    const isPassword = await bcrypt.compare(plainPassword, hashPassword);
    return isPassword;
  }
}
