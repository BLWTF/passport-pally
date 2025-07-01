/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from 'src/types/users';

@Injectable()
export default class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    const user: User = request['user'];

    if (user.role !== 'admin') {
      return false;
    }

    return true;
  }
}
