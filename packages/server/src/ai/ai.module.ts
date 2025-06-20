import { Module } from '@nestjs/common';
import GeminiModule from 'src/gemini/gemini.module';
import OpenaiModule from 'src/openai/openai.module';
import AiService from './ai.service';

@Module({
  imports: [GeminiModule, OpenaiModule],
  providers: [AiService],
  exports: [AiService],
})
export default class AiModule {}
