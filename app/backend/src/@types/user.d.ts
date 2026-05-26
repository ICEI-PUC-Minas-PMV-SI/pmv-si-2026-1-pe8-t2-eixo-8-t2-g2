import type { UserRole } from '../validations/UserValidation';
import type { UserFilter, UserSort } from './page-metadata';
import type { Request } from './server';

export type UserCreatePayload = {
  email: string;
  phone: string | null;
  name: string;
  password: string | null;
  address: {
    postalCode: string;
    street: string;
    number: string;
    complement?: string;
    state: string;
    city: string;
    neighborhood: string;
    isPrimary?: boolean;
  } | null;
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
