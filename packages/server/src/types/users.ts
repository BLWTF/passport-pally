import { AnyActorRef } from 'xstate';

export interface User {
  id: string;
  googleProviderAccountId?: string;
  email?: string;
  role: 'admin' | 'user';
  password?: string;
  lastName?: string;
  firstName?: string;
  username?: string;
  createdAt: Date;
}

export interface AuthUser extends User {
  accessToken?: string;
  blocked?: boolean;
  sub: string;
}

export interface State {
  userPhoto: Express.Multer.File | null;
  generatedPhotos: { id: string; data: string }[];
  generationRequests: { id: string; actor: AnyActorRef; error?: any }[];
  noToGenerate: number;
  limit: number;
  parameters: {
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
