export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: string;
  googleProviderAccountId?: string;
  email?: string;
  role: UserRole;
  password?: string;
  lastName?: string;
  firstName?: string;
  username?: string;
  createdAt: Date;
}

export interface AuthUser extends User {
  accessToken?: string;
  blocked?: boolean;
}

export interface State {
  userPhoto: Express.Multer.File | null;
  selectedPhoto: string | null;
  generatedPhotos: { id: string; data: string }[];
  generationRequests: { id: string; actor: object; error?: object }[];
  noToGenerate: number;
  parameters: {
    country?: string;
    size?: string;
    headHeight?: string;
    eyePosition?: string;
    backgroundColor: string[];
  };
}

export interface AdminState {
  prompt: string;
  users: { id: string }[];
}

export interface UserState extends State {
  value: string;
}

export type UserStatePreview = Omit<
  UserState,
  "userPhoto | generatedPhotos"
> & {
  userPhoto: string;
  generatedPhotos: { id: string; data: string }[];
};
