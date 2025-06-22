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

export interface State {
  userPhoto: Express.Multer.File | null;
  selectedPhoto: string | null;
  generatedPhotos: { id: string; data: string }[];
  error: string | null;
  generationRequests: { id: string; actor: AnyActorRef }[];
  parameters: {
    noToGenerate?: number;
    country?: string;
    size?: string;
    headHeight?: string;
    eyePosition?: string;
    backgroundColor: string[];
  };
}

export interface UserState extends State {
  value: string;
}

export type UserStatePreview = Omit<
  UserState,
  'userPhoto | generatedPhotos'
> & {
  userPhoto: string;
  generatedPhotos: { id: string; data: string }[];
};
