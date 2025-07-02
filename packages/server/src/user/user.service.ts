import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from './user.entity';
import { Repository } from 'typeorm';
import AuthService from 'src/auth/auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from 'src/types/users';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async login(res: Response, body: { identifier: string; password: string }) {
    const user = (await this.filterUsers({ username: body.identifier }))[0];

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPassword = await this.authService.comparePassword(
      body.password,
      user.password!,
    );

    if (!isPassword) {
      throw new UnauthorizedException();
    }

    const loggedInUser = await this.authService.signIn(
      res,
      user,
      this.configService.get('ACCESS_TOKEN_COOKIE_NAME') as string,
      false,
    );
    return loggedInUser;
  }

  async googleLogin(res: Response, body: Partial<User>) {
    const user = (
      await this.filterUsers({
        email: body.email,
      })
    )[0];

    if (user) {
      const loggedInUser = await this.authService.signIn(
        res,
        user,
        this.configService.get('ACCESS_TOKEN_COOKIE_NAME') as string,
        false,
      );
      return loggedInUser;
    }

    const newUser = await this.createUser({
      email: body.email,
      googleProviderAccountId: body.googleProviderAccountId,
    });

    const loggedInUser = await this.authService.signIn(
      res,
      newUser,
      this.configService.get('ACCESS_TOKEN_COOKIE_NAME') as string,
      false,
    );
    return loggedInUser;
  }

  async internalLogin(res: Response, userId: string) {
    const user = await this.findUser(userId);
    const loggedInUser = await this.authService.signIn(
      res,
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

  async createUser(user?: Partial<User>) {
    const newUser = this.userRepository.create();
    return await this.userRepository.save(user ?? newUser);
  }

  async filterUsers(filter: Partial<User>) {
    const users = await this.userRepository.find({
      where: filter,
    });

    return users;
  }

  async getUserIds() {
    const ids = await this.userRepository
      .createQueryBuilder('user')
      .select('user.id')
      .where('user.role != :role', { role: UserRole.ADMIN })
      .getMany();
    const idValues = ids.map((item) => item.id);
    return idValues;
  }
}
