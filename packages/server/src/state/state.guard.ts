/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import StateService from './state.service';
import { AuthUser } from 'src/types/users';

@Injectable()
export default class StateGuard implements CanActivate {
  constructor(private readonly stateService: StateService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    const user: AuthUser = request['user'];

    if (user && user.role !== 'admin') {
      this.stateService.initUser(user.sub);
    }

    return true;
  }
}
