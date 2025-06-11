import { AnyActorRef } from 'xstate';

export interface User {
  id: string;
  googleProviderAccountId?: string;
  email?: string;
}

export interface AuthUser extends User {
  accessToken?: string;
  blocked?: boolean;
}

export interface UserState {
  userPhoto: Express.Multer.File | null;
  selectedPhoto: string | null;
  generatedPhotos: { id: string; data: string }[];
  error: string | null;
  generationRequests: { id: string; actor: AnyActorRef }[];
  parameters: {
    backgroundColor: string;
    facePosition: string;
    photoSize: string;
    countryFormat: string;
  };
}
