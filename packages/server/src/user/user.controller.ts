/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import UserService from './user.service';
import { Response } from 'express';

@Controller()
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get('/login/temp')
  async tempLogin(@Res() res: Response) {
    try {
      const user = await this.userService.tempLogin(res);
      res.json(user);
    } catch (error) {
      res.end();
      console.log(error);
    }
  }

  @Get('/login/internal')
  async internalLogin(@Req() req: any, @Res() res: Response) {
    try {
      await this.userService.internalLogin(res, req.user.sub as string);
      res.json({});
    } catch (error) {
      console.log(error);
      res.end();
    }
  }
}
