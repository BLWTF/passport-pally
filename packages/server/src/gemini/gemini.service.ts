import { GenerateContentResponse, GoogleGenAI, Modality } from '@google/genai';
import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';

@Injectable()
export default class GeminiService {
  constructor(private readonly Ai: GoogleGenAI) {}

  private getPrompt() {
    return `Hi, can you create a 3d rendered image 
    of a pig with wings and a top hat flying over a 
    happy futuristic scifi city with lots of greenery?`;
  }

  private getPassportPrompt() {
    return `Create a realistic, studio-quality passport photograph using the provided face. Use the following exact specifications and constraints:

      1. Composition & Layout:

      The subject’s face must be centered and occupy 70–80% of the photo height.

      Head is facing forward with a neutral expression and closed mouth.

      Eyes are open, clearly visible, and horizontally aligned.

      Entire head and the top of shoulders must be visible.

      2. Background:

      Use a plain, uniform white or very light gray background.

      Ensure no patterns, shadows, textures, or objects are present.

      3. Lighting:

      Use even, diffused lighting with no harsh shadows or reflections.

      Avoid red-eye or overexposure. The skin tone must appear natural.

      4. Quality:

      High resolution, crisp image with no blurring, noise, or filters.

      No digital enhancements or cosmetic retouching on the face.

      5. Attire:

      Subject should appear in simple, dark-colored clothing (e.g., shirt or blouse) with no uniform, hat, scarf, or accessories (unless for religious or medical reasons).

      Neck and shoulder area should be subtly visible—no cropping at the neck.

      6. Realism Constraints:

      Do not alter facial structure, symmetry, skin tone, or hair.

      Do not stylize or cartoonify.

      Match natural head proportions, spacing, and placement as captured in the original photo.

      Ensure the final result looks exactly like a real studio passport photograph, as accepted by government authorities.

      7. Output Format:

      Portrait orientation, 35mm x 45mm framing.

      Head positioned at 32–36mm from chin to crown.

      Neutral white balance and flat lighting for consistent tone.

      Final image must be indistinguishable from a real photograph taken in a passport photo studio.`;
  }

  async generateImageFromText() {
    const response = await this.Ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: this.getPrompt(),
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    this.processResponse(response);
  }

  async generateImageFromTextAndImage(file: Express.Multer.File) {
    const inlineData = {
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype,
    };
    const contents = [
      { text: this.getPassportPrompt() },
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

  private processResponse(response: GenerateContentResponse) {
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

  save(imageData: string) {
    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync('gemini-native-image.png', buffer);
    console.log('Image saved as gemini-native-image.png');
  }
}
