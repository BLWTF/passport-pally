/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import UserService from './user.service';
import { Response } from 'express';
import { User } from 'src/types/users';

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

  @Public()
  @Post('/login')
  async login(
    @Res() res: Response,
    @Body() body: { identifier: string; password: string },
  ) {
    const user = await this.userService.login(res, body);
    res.json(user);
  }

  @Public()
  @Post('/google/signIn')
  async googleSignIn(@Res() res: Response, @Body() body: Partial<User>) {
    try {
      const user = await this.userService.googleLogin(res, body);
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
