/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import StateService from './state.service';

@Injectable()
export default class StateGuard implements CanActivate {
  constructor(private readonly stateService: StateService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    // const response: Response = context.switchToHttp().getResponse();

    const user = request['user'];

    if (user) {
      this.stateService.initUser(user.sub);
    }

    return true;
  }
}
