export function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function fileToBlob(file: File | Blob, fn: (result: string) => void) {
  const reader = new FileReader();
  reader.onloadend = () => {
    fn(reader.result as string);
  };
  reader.readAsDataURL(file);
}

export function base64toBlob(base64: string, fn: (result: string) => void) {
  const reader = new FileReader();
  reader.onloadend = () => {
    fn(reader.result as string);
  };
  const buffer = Buffer.from(base64, "base64");
  reader.readAsDataURL(new Blob([buffer]));
}
