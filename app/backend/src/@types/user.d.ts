import type { UserRole } from '../validations/UserValidation';

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
