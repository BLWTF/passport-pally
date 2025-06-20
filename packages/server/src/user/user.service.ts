import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from './user.entity';
import { Repository } from 'typeorm';
import AuthService from 'src/auth/auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async internalLogin(res: any, userId: string) {
    const user = await this.findUser(userId);
    const loggedInUser = await this.authService.signIn(
      res as Response,
      user,
      this.configService.get('ACCESS_TOKEN_COOKIE_NAME') as string,
    );
    return loggedInUser;
  }

  async tempLogin(res: Response) {
    const user = await this.createUser();
    const loggedInUser = await this.authService.signIn(
      res,
      user,
      this.configService.get('ACCESS_TOKEN_COOKIE_NAME') as string,
      false,
    );
    return loggedInUser;
  }

  async findUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    return user!;
  }

  async createUser() {
    const user = this.userRepository.create();
    return await this.userRepository.save(user);
  }
}
