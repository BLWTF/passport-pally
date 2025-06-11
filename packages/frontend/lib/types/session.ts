import { AuthUser } from "./users";

export interface AuthSession {
  expires: string;
  user: AuthUser;
}
