import { GoogleGenAI } from '@google/genai';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import GeminiService from './gemini.service';

@Module({
  providers: [
    GeminiService,
    {
      provide: GoogleGenAI,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ai = new GoogleGenAI({
          apiKey: configService.get('GEMINI_API_KEY'),
        });
        return ai;
      },
    },
  ],
  exports: [GeminiService],
})
export default class GeminiModule {}
