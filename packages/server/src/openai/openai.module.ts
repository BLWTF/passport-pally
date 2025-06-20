import { Module } from '@nestjs/common';
import OpenaiService from './openai.service';
import OpenAI from 'openai';

@Module({
  providers: [
    OpenaiService,
    {
      provide: OpenAI,
      useFactory: () => {
        return new OpenAI();
      },
    },
  ],
  exports: [OpenaiService],
})
export default class OpenaiModule {}
