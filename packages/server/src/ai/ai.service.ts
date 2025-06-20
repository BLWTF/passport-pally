import { Injectable } from '@nestjs/common';
import AiInterface from './ai.interface';
import OpenaiService from 'src/openai/openai.service';
import GeminiService from 'src/gemini/gemini.service';
import { writeFileSync } from 'fs';

@Injectable()
export default class AiService implements AiInterface {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly openaiService: OpenaiService,
  ) {}

  use(service = 'gemini') {
    return {
      gemini: this.geminiService,
      openai: this.openaiService,
    }[service];
  }

  generateImageFromTextAndImage(file: Express.Multer.File, prompt: string) {
    return this.use()!.generateImageFromTextAndImage(file, prompt);
  }

  save(imageData: string) {
    const buffer = Buffer.from(imageData, 'base64');
    writeFileSync('gemini-native-image.png', buffer);
    console.log('Image saved as gemini-native-image.png');
  }
}
