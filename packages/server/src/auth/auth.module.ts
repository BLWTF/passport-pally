import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import AuthService from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import AuthGuard from './auth.guard';

@Module({
  imports: [JwtModule.register({ global: true })],
  providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [AuthService],
})
export default class AuthModule {}
