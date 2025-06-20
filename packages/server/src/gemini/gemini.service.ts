import { GoogleGenAI, Modality } from '@google/genai';
import { Injectable } from '@nestjs/common';
import AiInterface from 'src/ai/ai.interface';

@Injectable()
export default class GeminiService implements AiInterface {
  constructor(private readonly Ai: GoogleGenAI) {}

  async generateImageFromTextAndImage(
    file: Express.Multer.File,
    prompt: string,
  ) {
    const inlineData = {
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype,
    };
    const contents = [
      { text: prompt },
      {
        inlineData,
      },
    ];

    const response = await this.Ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const parts =
      response.candidates &&
      response.candidates[0].content &&
      response.candidates[0].content.parts
        ? response.candidates[0].content.parts
        : [];

    for (const part of parts) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        return imageData;
      }
    }
  }
}
