import type { UserRole } from '../validations/UserValidation';
import type { UserFilter, UserSort } from './page-metadata';
import type { Request } from './server';

export type UserCreatePayload = {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  googleId?: string;
};

export type UserTokenInfo = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  enabledTwoFactor: boolean;
};

export type UserRequest = Request<UserFilter, UserSort>;
