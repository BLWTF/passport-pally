/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  const buffer = Buffer.from(base64, 'base64');
  reader.readAsDataURL(new Blob([buffer]));
}

export function parseStateValue(stateValue: string | object) {
  if (typeof stateValue === 'object') {
    return Object.keys(stateValue)[0];
  }
  return stateValue;
}

export function parseAdminState(state: any) {
  return {
    prompt: state.context.prompt,
    users: Object.values(state.children as object),
  };
}
