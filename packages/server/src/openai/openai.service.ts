import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import AiInterface from 'src/ai/ai.interface';

@Injectable()
export default class OpenaiService implements AiInterface {
  constructor(private readonly Ai: OpenAI) {}

  async generateImageFromTextAndImage(
    file: Express.Multer.File,
    prompt: string,
  ) {
    const response = await this.Ai.responses.create({
      model: 'gpt-4.1',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${file.buffer.toString('base64')}`,
              detail: 'auto',
            },
          ],
        },
      ],
      tools: [{ type: 'image_generation' }],
    });

    const imageData = response.output
      .filter((output) => output.type === 'image_generation_call')
      .map((output) => output.result);

    if (imageData.length > 0) {
      const imageBase64 = imageData[0];
      return imageBase64!;
    } else {
      return undefined;
    }
  }
}
