export default interface AiInterface {
  generateImageFromTextAndImage: (
    file: Express.Multer.File,
    prompt: string,
  ) => Promise<string | undefined>;
}
