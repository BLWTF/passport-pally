import { Module } from '@nestjs/common';
import StateService from './state.service';
import UserModule from 'src/user/user.module';
import StateController from './state.controller';
import StateGuard from './state.guard';
import { APP_GUARD } from '@nestjs/core';
import AiModule from 'src/ai/ai.module';

@Module({
  imports: [AiModule, UserModule],
  providers: [StateService, { provide: APP_GUARD, useClass: StateGuard }],
  controllers: [StateController],
  exports: [StateService],
})
export default class StateModule {}
